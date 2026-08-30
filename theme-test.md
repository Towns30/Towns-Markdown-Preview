# Towns Markdown Preview 主题验收

这是一份用于检查 **Towns Markdown Preview** 三套主题的测试文档。请分别切换到 Notion、Paper 和 Dark，观察正文宽度、字体层级、颜色、间距以及中文与 English 混排效果。

> 建议同时测试 `Ctrl+Shift+V` 和 `Ctrl+K V`，并尝试调整预览窗口宽度。

---

## 1. 中文与英文混排

Markdown 是一种轻量级标记语言，适合编写日常笔记、技术文档和演讲提纲。A good preview theme should make Chinese and English feel like parts of the same paragraph, instead of two unrelated typographic systems.

这是一个较长的中文段落，用来检查行高、段落间距和每行长度。阅读长文时，文字不应该挤在一起，也不应该因为行距过大而失去连贯性。理想的排版应当让视线自然地从一行移动到下一行，并让标题、正文、引用和代码之间形成稳定而克制的层级关系。

混排示例：在 VS Code 中配置 `townsMarkdown.theme`，然后选择 **Notion**、**Paper** 或 **Dark**。API、TypeScript、Markdown Preview、中文标点，以及数字 1234567890 应该协调自然。

## 2. 文本强调

普通正文、**粗体文字**、*斜体文字*、***粗斜体文字***、~~删除文字~~ 和 `inline code` 应该容易区分，但不能出现过多颜色。

这里还有一个 [VS Code 官方网站链接](https://code.visualstudio.com/)，用于检查链接颜色、下划线和悬停状态。

### 三级标题

三级标题适合文章内部的小节。它应当比正文明显，但不能和一级、二级标题争夺注意力。

#### 四级标题

四级标题通常用于较细的内容分组。

##### 五级标题

五级标题仍应保持可识别性。

###### 六级标题

六级标题不应比正文显得更弱。

---

## 3. 列表

### 无序列表

- 中文列表项目
- English list item
- 包含 **粗体**、*斜体* 和 `code` 的列表项目
  - 二级嵌套项目
  - 第二个嵌套项目
    - 三级嵌套项目
- 最后一个列表项目

### 有序列表

1. 安装扩展
2. 打开 Markdown 文件
3. 打开原生 Markdown Preview
4. 运行 `Towns Markdown: Select Theme`
5. 依次检查三个主题

### 任务列表

- [x] 扩展可以成功安装
- [x] Notion 主题可以显示
- [x] Paper 主题可以显示
- [x] Dark 主题可以显示
- [ ] 检查窄窗口布局
- [ ] 检查 Windows 和 macOS
- [ ] 准备 Marketplace 截图

---

## 4. 引用

> 好的排版不会抢走内容的注意力。
>
> 它通过字体、行距、留白和有限的颜色建立阅读秩序。This second sentence checks how English behaves inside a Chinese blockquote.

> **书摘示例**
>
> 阅读不是被动接收信息，而是在文本、经验与思考之间建立联系。Paper 主题中的引用应当具有明显的书摘感，但不能像一个悬浮卡片。
>
> > 这是一个嵌套引用，用于检查边框和缩进。

---

## 5. 代码

行内代码示例：`npm run compile`、`townsMarkdown.theme`、`Ctrl+Shift+V`、`const theme = "dark"`。

### TypeScript

```typescript
type Theme = "notion" | "paper" | "dark";

function selectTheme(theme: Theme): string {
  const message = `Current Markdown preview theme: ${theme}`;
  console.log(message);
  return message;
}

selectTheme("dark");
```

### JSON

```json
{
  "townsMarkdown.theme": "notion",
  "markdown.preview.breaks": false,
  "markdown.preview.typographer": true
}
```

### 长代码行

下面的代码行用于检查代码块的横向滚动行为：

```text
This is an intentionally long line for testing horizontal overflow in fenced code blocks: 0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 中文长代码行不应该把整个预览页面撑宽。
```

---

## 6. 表格

| 主题 | 主要用途 | 背景 | 字体倾向 | 代码表现 |
| :--- | :--- | :---: | :--- | ---: |
| Notion | 日常笔记、演讲提纲 | 暖白 | Sans Serif | 简洁 |
| Paper | 中文长文、阅读笔记、书摘 | 米白 | Serif / 宋体 | 柔和 |
| Dark | CS、数学、技术笔记 | 深灰 | Sans + Mono | 清晰 |

### 较宽表格

| Package | Command | Platform | Expected result | Status |
| --- | --- | --- | --- | --- |
| Towns Markdown Preview | `npm run compile` | Windows / Linux / macOS | TypeScript compilation succeeds without errors | Pass |
| Towns Markdown Preview | `npx @vscode/vsce package` | Linux | Generates an installable `.vsix` package | Pass |
| Towns Markdown Preview | `Towns Markdown: Select Theme` | VS Code | Refreshes the active Markdown preview | Check manually |

---

## 7. 数学公式

行内公式用于检查它和中文基线的协调性：质能方程 $E = mc^2$，勾股定理 $a^2 + b^2 = c^2$，以及求和符号 $\sum_{i=1}^{n} i$。

独立公式：

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

矩阵与分式：

$$
\mathbf{A} =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix},
\qquad
f(x) = \frac{x^2 + 1}{x - 1}
$$

---

## 8. 图片

下面使用远程图片检查最大宽度、居中和上下留白。首次显示需要网络连接。

![Visual Studio Code](https://code.visualstudio.com/assets/branding/code-stable.png)

*图片说明文字：图片不应该超出正文宽度。*

---

## 9. 特殊内容

HTML 键盘标签：按下 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> 打开预览。

高亮文本示例：<mark>这段内容用于检查 mark 元素的背景和可读性。</mark>

需要正确换行的长链接：<https://code.visualstudio.com/api/extension-guides/markdown-extension>

特殊字符：`< > & " '`、中文引号“你好”、书名号《Markdown 指南》、破折号——以及省略号……。

---

## 10. 最终检查清单

- [ ] 正文在宽窗口中没有过宽
- [ ] 中文标点和英文单词混排自然
- [ ] h1、h2、h3 层级清楚
- [ ] 列表缩进与 marker 对齐
- [ ] Checkbox 大小和位置正常
- [ ] Blockquote 有辨识度但不过度装饰
- [ ] Inline code 不会破坏行高
- [ ] Code block 可以横向滚动
- [ ] Table 边框和表头清晰
- [ ] Dark 主题不是纯黑背景
- [ ] Paper 主题适合长时间阅读
- [ ] 数学公式没有被截断
- [ ] 图片不会超出正文区域
- [ ] 窄窗口没有页面级横向滚动

如果以上项目在三套主题中都没有明显问题，v0.1.0 的基础视觉验收就完成了。
