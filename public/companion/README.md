# Live2D companion

本目录为聚合站与 Astro 博客共用的独立 Web Component。

## 配置

当前 `config.json` 的 `enabled` 为 false，页面不显示占位角色，也不加载第三方渲染库。

拿到允许公开网页使用、托管和分发的模型后：

1. 把模型完整文件夹放入本目录 `model/`，保留相对路径和文件名大小写。
2. 配置 `model` 为 `./model/角色.model3.json`，`attributionUrl` 为作者来源页，调整 `name`、`greeting` 和 `messages`。
3. 设置 `enabled: true`。
4. 用 HTTP 服务检查模型、纹理、物理文件和表情全部加载，测试交互与手机收起。

不支持 Cubism 2 的 `.model.json`。当前适配层为 pixi-live2d-display 0.4.0 的 Cubism 3/4 适配器；较新模型需要实际验证，不保证 Cubism 5 专属特性。

## 依赖和来源

- [PixiJS 6.5.10](https://github.com/pixijs/pixijs/tree/v6.5.10)：MIT，通过固定版本 jsDelivr 加载。
- [pixi-live2d-display 0.4.0](https://github.com/guansss/pixi-live2d-display)：MIT，通过固定版本 jsDelivr 加载；本组件调用其接口，不复制其他挂件的 UI 源码。
- [Live2D Cubism Core](https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js)：从 Live2D 官方提供的运行库地址加载。Core 按其专有许可提供，不属于上述 MIT 许可；使用者需遵守 [Live2D 许可](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_cn.html)。官方 URL 不含版本，更新后应复测。
- 角色模型的授权独立于渲染库；代码仓库的 MIT 许可不自动覆盖三方模型。

没有模型下载脚本，也不会热链已知禁止再分发的转载模型。

## 行为

桌面首次展开；手机与减少动态效果偏好默认收起。点击模型或“打招呼”显示本地预设短句；“换表情”调用模型现有表情，未提供表情时按钮不可用。不使用 AI 接口、麦克风、摄像头、音频或聊天服务。

拖动名字可调整位置；聚焦名字后方向键移动、Home 复位；Escape 收起。动画上限 30 FPS，在后台和收起时暂停。仅在当前站点的 localStorage 保存收起偏好。

Astro 使用 `transition:persist="march-companion"` 保留实例。组件延迟销毁，兼容页面切换时的临时断开；真正移除时释放 WebGL 和事件监听器。
