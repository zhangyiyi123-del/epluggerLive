# EPlugger 设计系统 (Master)

企业正向激励社区移动端 Web 的全局设计规范。页面级覆盖见 `pages/*.md`。

## 1. 色彩系统

| 用途 | 变量 | 值 | 说明 |
|------|------|-----|------|
| 主色 | `--primary-color` | #4F46E5 | 按钮、CTA、选中态 |
| 主色浅 | `--primary-light` | #818CF8 | 渐变、高亮 |
| 次要/完成 | `--secondary-color` | #10B981 | 打卡成功、正向 |
| 强调/进度 | `--accent-color` | #F59E0B | 进度、提醒 |
| 危险 | `--danger-color` | #EF4444 | 删除、错误 |
| 信息 | `--info-color` | #3B82F6 | 公告、系统提示 |
| 主文字 | `--text-primary` | #1F2937 | 正文 |
| 次要文字 | `--text-secondary` | #6B7280 | 说明 |
| 弱化文字 | `--text-light` | #9CA3AF | 辅助 |
| 页面背景 | `--bg-primary` | #F9FAFB | 页面底 |
| 卡片背景 | `--bg-card` | #FFFFFF | 卡片、浮层 |
| 边框 | `--border-color` | #E5E7EB | 分割线、输入框 |

## 2. 排版

- 页面主标题：16–18px，font-weight 700
- 卡片标题：15–16px，font-weight 600
- 次级说明：13–14px，color: var(--text-secondary)
- 行高：1.5；段落间距与 section 统一 16–20px

## 3. 圆角与阴影

- `--radius-sm`: 8px  
- `--radius-md`: 12px  
- `--radius-lg`: 16px  
- `--shadow-sm` / `--shadow-md`：卡片与浮层

## 4. 组件模式

- **顶栏**：关键页使用浮动/半透明顶栏或 hero 渐变区
- **卡片**：圆角 + 轻阴影 + 内边距，减少硬边框
- **按钮/可点击**：统一 hover/active/focus-visible，150–300ms 过渡，无布局位移的 scale

## 5. 反例（避免）

- 用 emoji 当功能图标 → 使用 Lucide SVG
- 可点击元素无 cursor-pointer 或无焦点环
- 玻璃态在浅色模式下透明度过低（如 bg-white/10）
