# A quickly generating 5 stars for rating SVG utility tool——5stars

Generating quickly 5 stars for rating SVG based on SVG technique :star::star::star::star::star:

## Try it out

- **`display` mode**

  ```bash
  npx 5stars -a https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-a.svg -b https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-b.svg -o output-emoji.svg -s 20
  ```
  [output-emoji.svg](https://raw.githubusercontent.com/zhansingsong/5stars/master/medias/output-emoji.svg)

  ![](https://raw.githubusercontent.com/zhansingsong/5stars/master/medias/output-emoji.png)

- **`click` mode**

  ```bash
  npx 5stars -a https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-a.svg -b https://raw.githubusercontent.com/zhansingsong/5stars/master/svgs/emoji-b.svg -o output-emoji-click.svg -m click -s 20
  ```
  [output-emoji-click.svg](https://raw.githubusercontent.com/zhansingsong/5stars/master/medias/output-emoji-click.svg)

  ![](https://raw.githubusercontent.com/zhansingsong/5stars/master/medias/click-mode-emoji.gif)


## Usage

[demo](https://raw.githubusercontent.com/zhansingsong/5stars/master/examples/demo.html)

```
npx 5stars # use default config.json
npx 5stars -c yourConfigFile
npx 5stars --a star-normal.svg --b star-active.svg
```

[------> More about 5stars ----->](https://github.com/zhansingsong/5stars)