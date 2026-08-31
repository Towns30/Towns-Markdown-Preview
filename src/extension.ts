import * as vscode from 'vscode';

import { removeLegacyTownsStyles } from './styleMigration';
import {
  addThemeContainer,
  type MarkdownItWithCore,
  type ThemeId,
} from './themePlugin';

interface MarkdownItLike extends MarkdownItWithCore {
  use(plugin: MarkdownItPlugin, options?: TaskListOptions): MarkdownItLike;
}

interface TaskListOptions {
  enabled?: boolean;
}

type MarkdownItPlugin = (
  markdownIt: MarkdownItLike,
  options?: TaskListOptions,
) => void;

interface MarkdownExtensionApi {
  extendMarkdownIt(markdownIt: MarkdownItLike): MarkdownItLike;
}

const taskLists = require('markdown-it-task-lists') as MarkdownItPlugin;
const legacyExtensionIds = ['replace-before-publishing.towns-markdown-preview'];

const themeItems: ReadonlyArray<vscode.QuickPickItem & { id: ThemeId }> = [
  { id: 'notion', label: 'Notion', description: 'Clean and modern' },
  { id: 'paper', label: 'Paper', description: 'Warm and book-like' },
  { id: 'dark', label: 'Dark', description: 'Restrained dark theme' },
  { id: 'sage', label: 'Sage', description: 'Calm and softly green' },
];

export async function activate(
  context: vscode.ExtensionContext,
): Promise<MarkdownExtensionApi> {
  if (legacyExtensionIds.some((id) => vscode.extensions.getExtension(id))) {
    void vscode.window.showWarningMessage(
      'An old Towns Markdown Preview test build is still installed. Uninstall replace-before-publishing.towns-markdown-preview, then reload VS Code.',
    );

    return {
      extendMarkdownIt(markdownIt) {
        return markdownIt;
      },
    };
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('townsMarkdown.selectTheme', async () => {
      const currentTheme = getSelectedTheme();
      const selection = await vscode.window.showQuickPick(
        themeItems.map((item) => ({ ...item, picked: item.id === currentTheme })),
        {
          title: 'Towns Markdown: Select Theme',
          placeHolder: 'Choose a Markdown preview theme',
        },
      );

      if (!selection) {
        return;
      }

      await vscode.workspace
        .getConfiguration('townsMarkdown')
        .update('theme', selection.id, vscode.ConfigurationTarget.Global);

      vscode.window.setStatusBarMessage(`Towns Markdown: ${selection.label}`, 2500);
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('townsMarkdown.theme')) {
        void refreshPreview();
      }

      if (event.affectsConfiguration('markdown.styles')) {
        void migrateLegacyMarkdownStyles();
      }
    }),
  );

  await migrateLegacyMarkdownStyles();

  return {
    extendMarkdownIt(markdownIt) {
      addThemeContainer(markdownIt, getSelectedTheme);
      return markdownIt.use(taskLists, { enabled: false });
    },
  };
}

function getSelectedTheme(): ThemeId {
  const value = vscode.workspace
    .getConfiguration('townsMarkdown')
    .get<string>('theme', 'notion');

  return isThemeId(value) ? value : 'notion';
}

function isThemeId(value: string): value is ThemeId {
  return (
    value === 'notion' ||
    value === 'paper' ||
    value === 'dark' ||
    value === 'sage'
  );
}

async function migrateLegacyMarkdownStyles(): Promise<void> {
  try {
    const markdownConfiguration = vscode.workspace.getConfiguration('markdown');
    const globalStyles = markdownConfiguration.inspect<string[]>('styles')?.globalValue;

    if (!globalStyles) {
      return;
    }

    const nextStyles = removeLegacyTownsStyles(globalStyles);

    if (nextStyles.length === globalStyles.length) {
      return;
    }

    await markdownConfiguration.update(
      'styles',
      nextStyles.length > 0 ? nextStyles : undefined,
      vscode.ConfigurationTarget.Global,
    );
  } catch (error) {
    showError('clean up old Markdown stylesheet paths', error);
  }
}

async function refreshPreview(): Promise<void> {
  try {
    await vscode.commands.executeCommand('markdown.preview.refresh');
  } catch (error) {
    showError('refresh the Markdown preview', error);
  }
}

function showError(action: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  void vscode.window.showErrorMessage(
    `Towns Markdown could not ${action}: ${message}`,
  );
}

export function deactivate(): void {}
