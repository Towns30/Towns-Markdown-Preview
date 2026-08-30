import * as path from 'node:path';
import * as vscode from 'vscode';

interface MarkdownItLike {
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

type ThemeId = 'notion' | 'paper' | 'dark';

const managedStyleKey = 'townsMarkdown.managedStyle';
const themeStyleFiles = new Set(['notion.css', 'paper.css', 'dark.css']);
const legacyExtensionIds = ['replace-before-publishing.towns-markdown-preview'];

let updatingMarkdownStyles = false;

const themeItems: ReadonlyArray<vscode.QuickPickItem & { id: ThemeId }> = [
  { id: 'notion', label: 'Notion', description: 'Clean and modern' },
  { id: 'paper', label: 'Paper', description: 'Warm and book-like' },
  { id: 'dark', label: 'Dark', description: 'Restrained dark theme' },
];

export function activate(context: vscode.ExtensionContext): MarkdownExtensionApi {
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

      await applySelectedTheme(context, true, true);
      vscode.window.setStatusBarMessage(`Towns Markdown: ${selection.label}`, 2500);
    }),
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (event.affectsConfiguration('townsMarkdown.theme')) {
        await applySelectedTheme(context, false, true);
      } else if (
        event.affectsConfiguration('markdown.styles') &&
        !updatingMarkdownStyles
      ) {
        // Settings Sync can replace markdown.styles after activation. Normalize
        // synced paths immediately instead of waiting for the next restart.
        await applySelectedTheme(context, false, true);
      }
    }),
  );

  void applySelectedTheme(context, false, false);

  return {
    extendMarkdownIt(markdownIt) {
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
  return value === 'notion' || value === 'paper' || value === 'dark';
}

async function applySelectedTheme(
  context: vscode.ExtensionContext,
  warnAboutOverrides: boolean,
  refreshPreview: boolean,
): Promise<void> {
  try {
    const markdownConfiguration = vscode.workspace.getConfiguration('markdown');
    const inspection = markdownConfiguration.inspect<string[]>('styles');
    const globalStyles = inspection?.globalValue ?? [];
    const previouslyManagedStyle = context.globalState.get<string>(managedStyleKey);
    const selectedTheme = getSelectedTheme();
    const selectedStyle = context.asAbsolutePath(
      path.join('styles', `${selectedTheme}.css`),
    );

    const nextStyles = globalStyles
      .filter(
        (style) => !isTownsThemeStyle(style, context, previouslyManagedStyle),
      )
      .concat(selectedStyle);

    if (!sameStringArray(globalStyles, nextStyles)) {
      // markdown.previewStyles is static. The built-in preview's supported
      // markdown.styles setting supplies the one dynamic, user-selected file.
      updatingMarkdownStyles = true;
      try {
        await markdownConfiguration.update(
          'styles',
          nextStyles,
          vscode.ConfigurationTarget.Global,
        );
      } finally {
        updatingMarkdownStyles = false;
      }
    }

    await context.globalState.update(managedStyleKey, selectedStyle);

    if (
      warnAboutOverrides &&
      (inspection?.workspaceValue !== undefined ||
        inspection?.workspaceFolderValue !== undefined)
    ) {
      void vscode.window.showWarningMessage(
        'A workspace markdown.styles setting overrides the selected Towns Markdown theme.',
      );
    }

    if (refreshPreview) {
      await vscode.commands.executeCommand('markdown.preview.refresh');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(
      `Towns Markdown could not apply the selected theme: ${message}`,
    );
  }
}

function isTownsThemeStyle(
  style: string,
  context: vscode.ExtensionContext,
  previouslyManagedStyle: string | undefined,
): boolean {
  const normalizedStyle = normalizePath(style);
  const isCurrentThemeStyle = (['notion', 'paper', 'dark'] as const).some(
    (theme) => {
      const currentStyle = context.asAbsolutePath(
        path.join('styles', `${theme}.css`),
      );
      return normalizedStyle === normalizePath(currentStyle);
    },
  );

  if (samePath(style, previouslyManagedStyle) || isCurrentThemeStyle) {
    return true;
  }

  // Global settings can be synced between operating systems. Match an
  // installed copy by extension id using portable separators, independent of
  // drive letters, home directories, remote hosts, or extension versions.
  const portableParts = style.replace(/\\/g, '/').split('/').filter(Boolean);
  const fileName = portableParts.at(-1)?.toLowerCase();
  const stylesDirectory = portableParts.at(-2)?.toLowerCase();
  const extensionDirectory = portableParts.at(-3)?.toLowerCase();
  const extensionPrefixes = [context.extension.id, ...legacyExtensionIds].map(
    (extensionId) => `${extensionId.toLowerCase()}-`,
  );

  return (
    fileName !== undefined &&
    themeStyleFiles.has(fileName) &&
    stylesDirectory === 'styles' &&
    extensionDirectory !== undefined &&
    extensionPrefixes.some((prefix) => extensionDirectory.startsWith(prefix))
  );
}

function normalizePath(value: string): string {
  const normalized = path.normalize(value);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function samePath(left: string, right: string | undefined): boolean {
  return right !== undefined && normalizePath(left) === normalizePath(right);
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function deactivate(): void {}
