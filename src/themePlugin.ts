export type ThemeId = 'notion' | 'paper' | 'dark' | 'sage';

interface MarkdownToken {
  block: boolean;
  content: string;
}

interface MarkdownState {
  Token: new (type: string, tag: string, nesting: number) => MarkdownToken;
  tokens: MarkdownToken[];
}

interface MarkdownItCore {
  ruler: {
    push(name: string, rule: (state: MarkdownState) => void): void;
  };
}

export interface MarkdownItWithCore {
  core: MarkdownItCore;
}

export function addThemeContainer(
  markdownIt: MarkdownItWithCore,
  getTheme: () => ThemeId,
): void {
  markdownIt.core.ruler.push('towns_theme_container', (state) => {
    const open = new state.Token('html_block', '', 0);
    open.block = true;
    open.content = `<div class="towns-markdown-theme towns-theme-${getTheme()}">\n`;

    const close = new state.Token('html_block', '', 0);
    close.block = true;
    close.content = '</div>\n';

    state.tokens.unshift(open);
    state.tokens.push(close);
  });
}
