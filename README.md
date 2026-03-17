# liuenyin's blog 🌸

liuenyin的个人博客 - 算法·竞赛·随笔

这是我的个人博客，记录了我的算法学习笔记、比赛游记、题解以及生活闲话。

🌍 **线上地址**: [blog.lg37.com](https://blog.lg37.com)

## ✨ 特性

- ✅ 简约清新、带有点春天般温暖的极简设计
- ✅ 分类系统（游记、题解、文化课、闲话、笔记）
- ✅ Markdown 与 LaTeX 完美支持
- ✅ 浅色/深色模式无缝切换
- ✅ 静态全文搜索优化
- ✅ 专为大陆网络环境定制的 C++ 一键发博神器（包含代理支持）

## 🚀 本地运行

安装依赖并启动开发服务器：

```bash
pnpm install
pnpm run dev
```

构建生产版本：

```bash
pnpm run build
```

## 🛠️ 管理工具 (blog.exe)

在源码目录中包含了我编写的一个 C++ 交互式管理工具 `blog.exe`。双击运行即可完成：
1. 一键生成文章开头模板并在 VS Code 打开
2. 修改文章分类/标签
3. 配置 Git 代理端口（修复 `git push` 卡住的问题）
4. 一键提交并推送到 GitHub (触发 Vercel 构建)

## 📌 技术栈

基于 [Astro](https://astro.build/) 构建，底层主题 Fork 自 [AstroPaper](https://github.com/satnaing/astro-paper)，经过大规模重写与中文化，采用 [LXGW WenKai (霞鹜文楷)](https://github.com/lxgw/LxgwWenKai) 作为主视觉中文字体。
