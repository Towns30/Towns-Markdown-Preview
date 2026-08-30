# Towns Markdown Preview

一个使用 VS Code 原生 Markdown Preview 的主题扩展，面向中文与英文混排。它只调整预览样式，不替换 Markdown 渲染器。

## 主题

- **Notion**：简洁的暖白页面，适合笔记和提纲。
- **Paper**：米白、偏宋体的阅读排版，适合中文长文和书摘。
- **Dark**：克制的深灰主题，重点优化代码、表格和技术笔记。

所有字体均使用系统字体及合理的跨平台 fallback；扩展不包含字体文件。

## 安装

可在 VS Code Extensions 中搜索 `Towns Markdown Preview`。开发阶段也可安装项目生成的 `.vsix`：

1. 打开命令面板。
2. 运行 `Extensions: Install from VSIX...`。
3. 选择 `towns-markdown-preview-0.1.2.vsix`。

## 使用

正常打开 Markdown 文件，然后使用 VS Code 原生预览：

- `Ctrl+Shift+V`：打开预览。
- `Ctrl+K V`：在侧边打开预览。

扩展安装后无需为项目创建 `.vscode/settings.json`，也无需复制 CSS。

## 切换主题

在命令面板运行：

```text
Towns Markdown: Select Theme
```

选择 `Notion`、`Paper` 或 `Dark`。已打开的 Markdown Preview 会立即请求刷新。

## 配置

设置项 `townsMarkdown.theme` 支持：

```text
notion
paper
dark
```

默认值为 `notion`。命令面板切换会同步更新该设置。

## 本地开发

```bash
npm install
npm run compile
```

在 VS Code 中打开本项目并按 `F5`，即可启动 Extension Development Host。修改 TypeScript 时可运行：

```bash
npm run watch
```

## 打包 VSIX

```bash
npm run package
```

也可以直接运行：

```bash
npx @vscode/vsce package
```

本项目没有运行时依赖，`npm run package` 会使用等价的 `--no-dependencies` 选项跳过不必要的依赖扫描。

输出文件为 `towns-markdown-preview-0.1.2.vsix`。

## Marketplace 发布前

发布前必须完成以下事项：

- 确认 Marketplace Publisher ID 为 `towns`。
- 确认 `repository`、`bugs` 和 `homepage` 指向正式 GitHub 仓库。
- 补充 Marketplace 图标与主题截图（后续单独处理）。
- 登录 `vsce`、确认版本号和变更日志后再手动发布。本项目不会自动 publish。

## 实现说明与限制

全部主题样式通过官方 `markdown.previewStyles` contribution 注入。扩展使用官方 Markdown-It 插件接口为预览内容添加当前主题标识，切换主题后请求刷新原生 Markdown Preview。

扩展不会向 `markdown.styles` 添加内容。升级时只会移除旧版本曾写入的 Towns 主题绝对路径，并保留用户自己的样式条目。用户设置的 `markdown.styles` 仍会按 VS Code 默认规则加载在扩展样式之后。

## License

[MIT](LICENSE)
