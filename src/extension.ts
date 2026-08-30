import * as path from 'node:path';
import * as vscode from 'vscode';

type ThemeId = 'notion' | 'paper' | 'dark';

const managedStyleKey = 'townsMarkdown.managedStyle';

const themeItems: ReadonlyArray<vscode.QuickPickItem & { id: ThemeId }> = [
  { id: 'notion', label: 'Notion', description: 'Clean and modern' },
  { id: 'paper', label: 'Paper', description: 'Warm and book-like' },
  { id: 'dark', label: 'Dark', description: 'Restrained dark theme' },
];

export function activate(context: vscode.ExtensionContext): void {
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
      }
    }),
  );

  void applySelectedTheme(context, false, false);
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
        (style) =>
          !isTownsThemeStyle(style, context) &&
          !samePath(style, previouslyManagedStyle),
      )
      .concat(selectedStyle);

    if (!sameStringArray(globalStyles, nextStyles)) {
      // markdown.previewStyles is static. The built-in preview's supported
      // markdown.styles setting supplies the one dynamic, user-selected file.
      await markdownConfiguration.update(
        'styles',
        nextStyles,
        vscode.ConfigurationTarget.Global,
      );
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
): boolean {
  const normalizedStyle = normalizePath(style);

  return (['notion', 'paper', 'dark'] as const).some(
    (theme) =>
      normalizedStyle ===
      normalizePath(context.asAbsolutePath(path.join('styles', `${theme}.css`))),
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
