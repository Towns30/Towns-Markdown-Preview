import assert from 'node:assert/strict';
import test from 'node:test';

import MarkdownIt from 'markdown-it';

import { removeLegacyTownsStyles } from '../src/styleMigration';
import { addThemeContainer } from '../src/themePlugin';

test('removes a stale Windows Towns theme path', () => {
  const styles = [
    'c:\\Users\\someone\\.vscode\\extensions\\towns.towns-markdown-preview-0.1.0\\styles\\notion.css',
  ];

  assert.deepEqual(removeLegacyTownsStyles(styles), []);
});

test('preserves a relative user stylesheet', () => {
  const styles = [
    'styles/my-custom.css',
    'c:\\Users\\someone\\.vscode\\extensions\\towns.towns-markdown-preview-0.1.0\\styles\\notion.css',
  ];

  assert.deepEqual(removeLegacyTownsStyles(styles), ['styles/my-custom.css']);
});

test('preserves a remote user stylesheet and removes a Linux Towns path', () => {
  const styles = [
    'https://example.com/custom.css',
    '/home/user/.vscode/extensions/towns.towns-markdown-preview-0.1.0/styles/dark.css',
  ];

  assert.deepEqual(removeLegacyTownsStyles(styles), [
    'https://example.com/custom.css',
  ]);
});

test('removes a path from the old placeholder publisher', () => {
  const styles = [
    '/home/user/.vscode/extensions/replace-before-publishing.towns-markdown-preview-0.1.0/styles/paper.css',
  ];

  assert.deepEqual(removeLegacyTownsStyles(styles), []);
});

test('does not remove unrelated absolute stylesheets', () => {
  const styles = [
    '/home/user/styles/notion.css',
    'c:\\Users\\someone\\.vscode\\extensions\\other.publisher-1.0.0\\styles\\dark.css',
    '/home/user/towns.towns-markdown-preview-backup/styles/paper.css',
  ];

  assert.deepEqual(removeLegacyTownsStyles(styles), styles);
});

test('wraps rendered Markdown with the selected theme class', () => {
  const markdownIt = new MarkdownIt();
  addThemeContainer(markdownIt, () => 'paper');

  const rendered = markdownIt.render('# Hello');

  assert.match(
    rendered,
    /^<div class="towns-markdown-theme towns-theme-paper">\n/,
  );
  assert.match(rendered, /<h1>Hello<\/h1>/);
  assert.match(rendered, /<\/div>\n$/);
});

test('wraps rendered Markdown with the Sage theme class', () => {
  const markdownIt = new MarkdownIt();
  addThemeContainer(markdownIt, () => 'sage');

  const rendered = markdownIt.render('# Sage');

  assert.match(rendered, /towns-theme-sage/);
  assert.match(rendered, /<h1>Sage<\/h1>/);
});
