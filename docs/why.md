# 5星合成新方案

随着移动互联网的飞速发展，硬件设备的不断升级，高清屏幕越来越普及。在开发时，对高清图的要求也越来越高。

在制作5星评级效果时，一般会使用如下技术方案：

- 方案1

  将所有的评级情况都制作出来：
  > 来源于大众点评

  ![](./imgs/enum.png)

  在通过 `background-position`、`width`、`height` 来显示不同的评级。

  **实例**

  ![](./imgs/enum_demo.png)
  ![](./imgs/enum_code.png)

  该方案如何解决高清屏显示问题？
  首先需要准备不同的尺寸 icons，来适配不同的分辨率
  
  ![](./imgs/enum_res.png)
  
  可以通过 [@media](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) 或 [image-set()](https://developer.mozilla.org/en-US/docs/Web/CSS/image-set) 来使用对应的 icons。如下是豆瓣基于 `image-set()` 实践效果图：

  ![](./imgs/enum_resp.gif)

- 方案2
  
  


