# LAFA Vape Nuxt 3 项目

## 项目概述
LAFA Vape - 面向海外华人的高端电子烟品牌网站（唐宋风味主题）
技术栈: Nuxt 3 (SSR/SSG) + Nitro API + Tailwind CSS + SQLite

## 启动方式
```bash
cd /Users/leomac/Desktop/lafavape-nuxt
npm run dev
# 访问 http://localhost:3000
```

## 生产构建
```bash
npm run build   # 构建 SSR 版本
node .output/server/index.mjs  # 启动生产服务器
```

## 项目结构
```
lafavape-nuxt/
├── pages/              # 页面（自动路由）
│   ├── index.vue       # 首页 (Hero+产品+博客+联系)
│   ├── product/[id].vue  # 产品详情
│   ├── blog/
│   │   ├── index.vue   # 博客列表+搜索+标签+分页
│   │   └── [id].vue    # 博客详情+点赞
│   ├── verify.vue      # 防伪码验证
│   └── admin/
│       ├── index.vue   # 管理员登录
│       └── dashboard.vue # 管理面板 (CRUD)
├── components/         # 可复用组件
│   ├── NavHeader.vue, SiteFooter.vue
│   ├── HeroCarousel.vue, ProductCard.vue, BlogCard.vue
│   ├── ContactForm.vue, SubscribeForm.vue
│   └── ToastNotification.vue
├── layouts/default.vue # 默认布局 (含年龄验证)
├── server/
│   ├── api/            # Nitro API 路由
│   ├── data/           # JSON + SQLite 数据
│   └── utils/          # 服务端工具
├── assets/css/         # 全局样式 + Tailwind
├── public/uploads/     # 静态资源（图片）
└── nuxt.config.ts      # Nuxt 配置
```

## 与旧版 (v1.0 Express+Vue CDN) 的对比

| 特性 | v1.0 | v2.0 (Nuxt) |
|------|------|------------|
| SEO | ❌ 客户端渲染 | ✅ SSR/SSG |
| 首屏速度 | 🟡 白屏加载 | ✅ 秒开 |
| 代码组织 | ❌ 巨石 main.js | ✅ 组件化 |
| 类型安全 | ❌ 无 | ✅ TypeScript |
| 构建优化 | ❌ 无打包 | ✅ Vite 构建 |
| 图片优化 | 🟡 手动 | ✅ @nuxt/image |
| 分享体验 | ❌ 无OG标签 | ✅ 完整OG标签 |
| 部署方式 | VPS | Vercel(免费)/VPS |
| 移动端 | 🟡 基础 | ✅ Tailwind |

## 环境要求
- Node.js v20+ (Apple Silicon arm64)
- 所有依赖为 JS 或预编译 native 模块

## API 端点（共 20 个）

### 公开 API
- GET  /api/data/:file     → JSON数据读取
- POST /api/contact        → 联系表单
- POST /api/subscribe      → 邮箱订阅
- POST /api/verify-code    → 防伪码验证
- POST /api/like-blog      → 博客点赞

### 管理 API
- POST /api/login          → 管理员登录
- POST /api/change-password → 修改密码
- POST /api/settings       → 保存设置
- POST /api/admin/upload-hero/product/blog → 内容上传
- POST /api/admin/upload-code → CSV防伪码上传
- POST /api/admin/delete-hero/product/blog/code → 内容删除
- GET  /api/admin/codes-stats → 防伪码统计
- GET  /api/admin/codes       → 防伪码列表

## Git 分支策略
main → 保持稳定，功能分支开发

## 版本
当前: v2.0.0 (Nuxt 3 重构)
