# LAFA Vape — 项目说明书

> 面向海外华人的高端电子烟品牌官网。唐宋风韵，现代工艺。
> 版本：v2.5.1 | 最后更新：2026-06-13

---

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| **名称** | LAFA Vape |
| **定位** | 高端电子烟品牌展示官网 |
| **目标用户** | 海外华人（中英双语） |
| **风格** | 唐宋美学 + Apple 极简设计 |
| **上线地址** | https://lafavape.onrender.com |

### 核心功能

- 🖼️ 全屏 Hero 轮播图
- 📦 产品展示 + 详情页
- 📝 博客系统（搜索 / 标签 / 分页 / 点赞 / 分享）
- 🔍 防伪码验证
- 📧 联系表单 + 邮件通知
- 📬 邮箱订阅 + 欢迎邮件
- 🔐 管理后台（Hero / 产品 / 防伪码 / 博客 / 设置 CRUD）
- 🎂 21+ 年龄验证
- 🌐 中英双语切换

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | Nuxt 3.21 | Vue 3 SSR/SSG 全栈框架 |
| **运行时** | Nitro 2.13 | Nuxt 内置服务端引擎 |
| **构建** | Vite 7.3 | 极速开发 + 生产构建 |
| **样式** | Tailwind CSS 3 + 自定义 CSS | Apple 风格暗色主题 |
| **语言** | TypeScript | 服务端类型安全 |
| **数据库** | better-sqlite3 | 防伪码 / 订阅者 |
| **内容存储** | JSON 文件 | Hero / 产品 / 博客 / 设置 |
| **图片处理** | sharp | WebP 转换 + 缩略图 |
| **邮件** | Resend | API
| **密码** | bcryptjs | 管理员登录哈希 |

### 对比旧版 (v1.0 Express + Vue CDN)

| | v1.0 | v2.0 Nuxt 3 |
|---|---|---|
| SEO | ❌ 空壳 HTML | ✅ SSR 完整内容 |
| 首屏 | 🟡 3-5 秒白屏 | ✅ 秒开 |
| 代码 | 1 个巨石 main.js | 8 组件 + 7 页面 |
| 分享 | ❌ 无 OG 标签 | ✅ 自动生成 |
| 构建 | ❌ 无 | ✅ Vite 压缩分割 |
| 部署 | VPS | Render(免费) |

---

## 3. 项目结构

```
lafavape-nuxt/
│
├── nuxt.config.ts          # Nuxt 配置
├── tailwind.config.js      # Tailwind 主题（颜色/字体/动画）
├── package.json            # 依赖管理
├── .env                    # 环境变量（密码/邮箱/密钥）
├── .gitignore
│
├── assets/
│   └── css/
│       └── main.css        # 全局样式系统（67KB，无 @apply）
│
├── composables/
│   └── useI18n.ts          # 中英双语（60+ 翻译键）
│
├── components/             # 可复用组件（8 个）
│   ├── NavHeader.vue       # 毛玻璃导航 + 语言切换
│   ├── HeroCarousel.vue    # 全屏轮播（纯图，无文字覆盖）
│   ├── ProductCard.vue     # 产品卡片（3:4 纵向图）
│   ├── BlogCard.vue        # 博客卡片
│   ├── ContactForm.vue     # 联系表单
│   ├── SubscribeForm.vue   # 订阅表单
│   ├── SiteFooter.vue      # 四栏页脚
│   └── ToastNotification.vue # 浮动提示
│
├── layouts/
│   └── default.vue         # 默认布局（含年龄验证弹窗）
│
├── pages/                  # 页面（自动路由）
│   ├── index.vue           # 首页
│   ├── product/
│   │   └── [id].vue        # 产品详情
│   ├── blog/
│   │   ├── index.vue       # 博客列表
│   │   └── [id].vue        # 博客详情
│   ├── verify.vue          # 防伪码验证
│   └── admin/
│       ├── index.vue       # 管理员登录
│       └── dashboard.vue   # 管理面板（CRUD + 编辑弹窗）
│
├── server/
│   ├── api/                # Nitro API 路由（23 个端点）
│   │   ├── data/[file].get.ts
│   │   ├── contact.post.ts
│   │   ├── subscribe.post.ts
│   │   ├── verify-code.post.ts
│   │   ├── like-blog.post.ts
│   │   ├── login.post.ts
│   │   ├── change-password.post.ts
│   │   ├── settings.post.ts
│   │   └── admin/
│   │       ├── upload-hero.post.ts
│   │       ├── upload-product.post.ts
│   │       ├── upload-blog.post.ts
│   │       ├── upload-code.post.ts
│   │       ├── delete-hero.post.ts
│   │       ├── delete-product.post.ts
│   │       ├── delete-blog.post.ts
│   │       ├── delete-code.post.ts
│   │       ├── edit-hero.post.ts
│   │       ├── edit-product.post.ts
│   │       ├── edit-blog.post.ts
│   │       ├── codes-stats.get.ts
│   │       └── codes.get.ts
│   │
│   ├── data/               # 数据文件
│   │   ├── hero.json        # Hero 轮播数据
│   │   ├── products.json    # 产品数据
│   │   ├── blog.json        # 博客数据
│   │   ├── settings.json    # 站点设置
│   │   ├── codes.db         # 防伪码数据库
│   │   └── subscribers.db   # 订阅者数据库
│   │
│   └── utils/
│       ├── database.ts      # SQLite 初始化
│       ├── fileUtils.ts     # JSON 读写工具
│       ├── imageUtils.ts    # 图片处理（WebP/缩略图）
│       └── mailer.ts        # 邮件发送
│
└── public/
    └── uploads/            # 上传的图片（WebP + 缩略图）
```

---

## 4. API 端点

### 公开 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/data/:file` | 读取 JSON 数据（hero/products/blog/settings） |
| POST | `/api/contact` | 提交联系表单 → 发邮件给管理员 |
| POST | `/api/subscribe` | 邮箱订阅 → 写入 SQLite + 发欢迎邮件 |
| POST | `/api/verify-code` | 验证防伪码 → 查询 SQLite |
| POST | `/api/like-blog` | 博客点赞 → 更新 JSON |

### 管理 API（需登录 `POST /api/login`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 管理员登录（bcrypt 密码比对） |
| POST | `/api/change-password` | 修改管理员密码 |
| POST | `/api/settings` | 保存站点设置 |
| POST | `/api/admin/upload-hero` | 上传 Hero（图片 → WebP + 缩略图） |
| POST | `/api/admin/upload-product` | 上传产品 |
| POST | `/api/admin/upload-blog` | 上传博客 |
| POST | `/api/admin/upload-code` | 上传 CSV 防伪码 → 批量插入 SQLite |
| POST | `/api/admin/edit-hero` | 编辑 Hero（文字 + 可选图片） |
| POST | `/api/admin/edit-product` | 编辑产品 |
| POST | `/api/admin/edit-blog` | 编辑博客 |
| POST | `/api/admin/delete-hero` | 删除 Hero（含关联图片文件） |
| POST | `/api/admin/delete-product` | 删除产品 |
| POST | `/api/admin/delete-blog` | 删除博客 |
| POST | `/api/admin/delete-code` | 删除防伪码 |
| GET | `/api/admin/codes-stats` | 防伪码统计（总数 / 查询次数） |
| GET | `/api/admin/codes` | 防伪码列表（Top 100） |

---

## 5. 数据模型

### Hero（hero.json）
```json
[
  {
    "id": 1,
    "title": "Hero 标题",
    "description": "描述文字",
    "image": "/uploads/uuid.webp"
  }
]
```

### 产品（products.json）
```json
[
  {
    "id": 1,
    "name": "产品名称",
    "description": "产品描述",
    "image": "/uploads/uuid.webp"
  }
]
```

### 博客（blog.json）
```json
[
  {
    "id": 1,
    "title": "文章标题",
    "content": "<p>HTML 内容</p>",
    "image": "/uploads/uuid.webp",
    "excerpt": "摘要前100字...",
    "date": "2025-05-10",
    "author": "作者",
    "tags": ["标签1", "标签2"],
    "likes": 0
  }
]
```

### 设置（settings.json）
```json
{
  "siteName": "LAFA WORLD",
  "siteDesc": "站点描述"
}
```

### 防伪码（codes.db）
| 字段 | 类型 | 说明 |
|------|------|------|
| code | TEXT PK | 防伪码 |
| flavor | TEXT | 口味 |
| date | TEXT | 生产日期 |
| query_count | INTEGER | 被查询次数 |

### 订阅者（subscribers.db）
| 字段 | 类型 | 说明 |
|------|------|------|
| email | TEXT PK | 邮箱 |
| subscribed_at | TEXT | 订阅时间 |

---

## 6. 设计系统

### 配色

| 名称 | 色值 | 用途 |
|------|------|------|
| 背景黑 | `#000` | 主背景 |
| 表面 | `#111` | 卡片 / 输入框 |
| 主文字 | `#f5f5f7` | 标题 / 正文 |
| 辅助文字 | `#a1a1a6` | 次要信息 |
| 弱文字 | `#6e6e73` | 标签 / 元信息 |
| 金色 | `#d4a853` | 标签 / 强调 / 链接 |
| 红色 | `#bf3a30` | 主按钮 |
| 边框 | `rgba(255,255,255,0.06)` | 分割线 |

### 字体层级

| 层级 | 大小 | 用途 |
|------|------|------|
| Hero 标题（桌面） | 6.5rem / 600 | 首页大标题 |
| Hero 标题（手机） | 4.5rem / 600 | |
| 页面标题（桌面） | 4.5rem / 600 | 产品/博客标题 |
| 页面标题（手机） | 2.5rem / 600 | |
| 卡片标题 | 1.25rem / 600 | 卡片标题 |
| 正文 | 1.125rem | 描述文字 |
| 辅助文字 | 0.875rem | 按钮 / 卡片描述 |
| 标签 | 0.75rem / 0.6875rem | 分类 / 元信息 |

### 统一组件类名

| 类名 | 说明 |
|------|------|
| `.section` | 统一页面区块（含响应式 padding） |
| `.section-eyebrow` | 区块小标签（大写 / 字间距） |
| `.section-heading` | 区块大标题（响应式字号） |
| `.section-subheading` | 区块副标题 |
| `.card` + `.card-media` + `.card-body` | 统一卡片（圆角 20px / 悬浮效果） |
| `.btn-filled` | 红色实心按钮 |
| `.btn-outline` | 半透明描边按钮 |
| `.form-input` | 统一输入框（含 focus 金色光环） |
| `.form-label` | 统一标签 |
| `.nav-glass` | 毛玻璃固定导航 |
| `.hero-section` | 全屏 Hero |
| `.tag` | 标签（含 active 状态） |
| `.toast` | 浮动通知 |

---

## 7. 部署指南

### 本地开发

```bash
cd lafavape-nuxt
npm install
npm run dev          # http://localhost:3000
```

### 生产部署（Render — 免费，当前方案）

网站已部署在 Render (https://lafavape.onrender.com)，通过 GitHub 自动部署。

**部署配置：**

| 配置项 | 值 |
|--------|-----|
| **Runtime** | Node |
| **Build Command** | `npm run build` |
| **Start Command** | `node .output/server/index.mjs` |
| **Node Version** | 20.x+ |

**环境变量（Render Dashboard → Environment）：**

| 变量 | 说明 | 示例 |
|------|------|------|
| `PASSWORD_HASH` | bcrypt 管理员密码哈希 | `$2b$10$...` |
| `COOKIE_SECRET` | Cookie 签名密钥 | `random-string` |
| `RESEND_API_KEY` | Resend API 密钥 | `re_xxxx...` |
| `MAIL_FROM` | 发件人 | `your-email@gmail.com` |
| `MAIL_TO` | 收件人 | `your-email@gmail.com` |

> **注意：** Render 免费实例在 15 分钟无访问后会休眠，下次访问需等待 30-50 秒冷启动。

### 生产部署（VPS）

```bash
npm run build
node .output/server/index.mjs    # 默认 3000 端口
# 建议配合 PM2: pm2 start .output/server/index.mjs --name lafavape
```

### 环境变量（.env）

| 变量 | 说明 | 示例 |
|------|------|------|
| `PASSWORD_HASH` | bcrypt 管理员密码哈希 | `$2b$10$...` |
| `COOKIE_SECRET` | Cookie 签名密钥 | `random-string` |
| `RESEND_API_KEY` | Resend API 密钥 | `re_xxxx...` |
| `MAIL_FROM` | 发件人 | `your-email@gmail.com` |
| `MAIL_TO` | 收件人 | `your-email@gmail.com` |

---

## 8. 管理后台使用

1. 访问 `/admin` → 输入密码登录
2. **Hero 管理**：上传图片（自动转 WebP + 生成缩略图），支持编辑和删除
3. **产品管理**：上传产品名称 / 描述 / 图片，支持编辑和删除
4. **防伪码管理**：上传 CSV 批量导入，查看热门查询，可删除
5. **博客管理**：上传标题 / 内容 / 作者 / 标签 / 图片，支持编辑和删除
6. **设置**：修改站点名称 / 描述 / 管理员密码

### CSV 防伪码格式

```csv
code,flavor,date
ABC123,荔枝,2025-01-01
DEF456,茉莉,2025-02-15
```

---

## 9. 技术细节

### 图片处理流程

```
用户上传 → multer 接收 → sharp 处理:
  1. 原图 → WebP (质量 80%)
  2. 原图 → 600px 宽缩略图 WebP
  3. 原图 → 150px 占位图 JPEG (质量 20%)
→ 保存到 public/uploads/
→ 更新 JSON 数据
```

### SSR 数据流

```
浏览器请求 → Nuxt SSR:
  1. 服务端 useFetch 调用内部 API
  2. 渲染完整 HTML（含产品/博客数据）
  3. 返回给浏览器（首屏秒开）
  4. 客户端 hydration 接管交互
```

### 语言切换

```
用户点击 中文/EN → useI18n().toggleLang()
→ localStorage.setItem('lang', 'zh')
→ 所有 t('key') 重新计算 → UI 即时切换
→ 刷新页面保持语言偏好
```

---

## 10. Git 版本历史

| 版本 | 提交 | 说明 |
|------|------|------|
| v2.0.0 | `44af091` | Nuxt 3 全栈重构（Express → Nuxt） |
| v2.1.0 | `497c235` | Apple 风格 UI 初版 |
| v2.2.0 | `cc72e39` | 统一设计系统（类名/间距/圆角） |
| v2.3.0 | `81e4ed3` | CSS 加载修复（纯 CSS，去 @apply） |
| v2.4.0 | `c397385` | 大字体 + 中英双语切换 |
| v2.5.0 | 最新 | 管理后台编辑功能 |
