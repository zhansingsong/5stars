# 5stars

:star::star::star::star::star:

一个基于 SVG 技术快速生成 **5星好评** 的实用工具

[ENGLISH DOC](./README.md)

[WHY](./docs/why.md)

## 特征

- 支持 `display` 和 `click` 模式
- 通过 [sogo](https://github.com/svg/svgo) 优化 SVG 文件
- 支持远程 URL SVG 文件和本地 SVG 文件
- 快速生成
- 支持 `configuration` 和 `click` 使用方式

## 注意 :warning:

- **normal svg 文件和 active svg 文件的大小必须一致，同时两个文件是必须的。**
- **为了确保 `click` 模式能工作，normal svg 文件和 active svg 文件需要被填充。**

## 尝试

- **`display` 模式**

```bash
npx 5stars -a https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-a.svg -b https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-b.svg -o output-emoji.svg -s 20
```
[output-emoji.svg](./medias/output-emoji.svg)

![](./medias/output-emoji.svg)

- **`click` 模式**

```bash
npx 5stars -a https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-a.svg -b https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-b.svg -o output-emoji-click.svg -m click -s 20
```
[output-emoji-click.svg](./medias/output-emoji-click.svg)

![](./medias/click-mode-emoji.gif)


## 快速入门

- 假如有如下目标结构: **examples**

  ```bash
  examples
  ├── config.json
  ├── star-active.svg
  └── star-normal.svg
  ```

- config.json

  ```json
  {
    "normal": "star-normal.svg",
    "active": "star-active.svg",
    "space": 0,
    "width": "auto",
    "height": "auto",
    "computeSpace": true,
    "mode": "display",
    "output": "output.svg"
  }
  ```
- 在当前目录下 **examples** 执行如下命令：

  ```bash
  ➜  examples git:(master) ✗ npx 5stars
  5stars  start generating ...
          complete reading star-active.svg
          complete reading star-normal.svg
          complete creating new symbol element star-a
          complete creating new symbol element star-b
          start to output output.svg
          done!
  ```

- `output.svg`

  ![output](examples/output.svg)


## 使用

```
npx 5stars # use default config.json
npx 5stars -c yourConfigFile
npx 5stars --a star-normal.svg --b star-active.svg
```

- `display` 模式

  ```html
  <!-- output.svg -->
  <svg class="5stars-svg" data-width="0.5" id="5stars-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"
  viewBox="0 0 309.335 53.867">
    <!-- Generator: 5stars. https://github.com/zhansingsong/5stars -->
    <!-- content -->
  </svg>
  ```
  可以通过操作输出的 svg 上的 `data-width="0.5"` 特性来控制 `output.svg` 如何显示。

  如下是 `data-width="0.7"` 的输出：

  ![](./medias/output.svg)

- `click` 模式

  ```html
  <svg class="5stars-svg" id="5stars-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"
  viewBox="0 0 309.335 53.867">
    <!-- Generator: 5stars. https://github.com/zhansingsong/5stars -->
    <!-- content -->
  </svg>
  ```
  如果你想要控制 click 操作何时结束，可以重写 `window._5stars_click_cb_(n)`：

  ```js
  window._5stars_click_cb_ = function (n) {
    // end click operation when returning true
    return n == 5;
  }
  ```
  **[Example](./examples/click-preview.html)**

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>5stars click mode</title>
  </head>
  <body>
    <script>
    window._5stars_click_cb_ = function (n) {
      // 当返回 true 时，click 结束
      return n == 5;
    }
    </script>

    <svg class="5stars-svg" id="5stars-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="100%" height="100%"
    viewBox="0 0 269.335 53.867">
      <!-- Generator: 5stars. https://github.com/zhansingsong/5stars -->
      <!-- content -->
    </svg>
  </body>
  </html>
  ```

  ![](./medias/click-mode.gif)

## config 选项

```js
// defaults
const config = {
  // normal svg file
  normal: undefined,
  // active svg file
  active: undefined,
  // space between stars
  space: 0,
  // width of normal and active svg files
  width: 'auto',
  // height of normal and active svg files
  height: 'auto',
  // output path
  output: './output.svg',
  // if space isn't included on computing svg width.
  computeSpace: false,
  // generation mode: display | click
  mode: 'display'
};
```
- **normal**：normal svg 文件，必填字段。
- **active**：active svg 文件，必填字段。
- **space**：stars 之间的间距。
- **width**：normal svg 文件 和 active svg 文件的宽。
- **height**：normal svg 文件 和 active svg 文件的高。
- **output**：相对于当前目录输出路径。
- **compute**Space：是否计算 `space` 在总宽度中。默认为：`false`。
- **mode**：生成模式
  - **display**：用于显示。
  - **click**：可 click 交互。

## CLI

```
Usage: 5stars [options]

Options:
  -v, --version           output the version number
  -c, --config [config]   config file
  -a, --normal [normal]   normal svg file
  -b, --active [active]   active svg file
  -s, --space [space]     space between stars
  --width [width]         width of normal and active svg files
  --height [height]       height of normal and active svg files
  -o, --output [output]   output path
  -m, --mode [mode]       generation mode
  -M, --no-compute-space  if space is not included on computing svg width.
  -h, --help              output usage information

Examples:

  $ 5stars # use default config.json
  $ 5stars -c yourConfig.json
  $ 5stars -a star-normal.svg -b star-active.svg
```

## License

[MIT](LICENSE).