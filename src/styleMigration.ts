const themeStyleFiles = new Set(['notion.css', 'paper.css', 'dark.css']);
const extensionIds = [
  'towns.towns-markdown-preview',
  'replace-before-publishing.towns-markdown-preview',
];

export function removeLegacyTownsStyles(styles: readonly string[]): string[] {
  return styles.filter((style) => !isLegacyTownsStyle(style));
}

export function isLegacyTownsStyle(style: string): boolean {
  const portablePath = style.replace(/\\/g, '/');

  if (!isAbsolutePortablePath(portablePath)) {
    return false;
  }

  const parts = portablePath.split('/').filter(Boolean);
  const fileName = parts.at(-1)?.toLowerCase();
  const stylesDirectory = parts.at(-2)?.toLowerCase();
  const extensionDirectory = parts.at(-3)?.toLowerCase();

  return (
    fileName !== undefined &&
    themeStyleFiles.has(fileName) &&
    stylesDirectory === 'styles' &&
    extensionDirectory !== undefined &&
    isTownsExtensionDirectory(extensionDirectory)
  );
}

function isTownsExtensionDirectory(value: string): boolean {
  return extensionIds.some((id) => {
    const prefix = `${id}-`;

    return (
      value.startsWith(prefix) &&
      /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/i.test(value.slice(prefix.length))
    );
  });
}

function isAbsolutePortablePath(value: string): boolean {
  return value.startsWith('/') || /^[a-z]:\//i.test(value);
}
