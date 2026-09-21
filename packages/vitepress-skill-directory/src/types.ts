export interface SkillLink {
  text: string
  href: string
}

/**
 * Skill 目录的通用数据模型。
 *
 * 组件只负责展示与交互；数据由调用方的 VitePress data loader
 * 或任意构建期脚本注入，不绑定具体目录/catalog 实现。
 */
export interface SkillItem {
  /** 唯一标识，用作列表渲染的 key */
  id: string
  /** Agent 触发名，如 `web-app-dev` */
  name: string
  /** 展示名，缺省回退到 name */
  title?: string
  /** 卡片图标，通常是一个 emoji */
  icon?: string
  /** 分类，用于筛选 pill 与卡片角标 */
  category?: string
  /** 一句话描述，卡片两行截断 */
  description?: string
  /** 技术标签，卡片最多展示前 3 个 */
  tags?: string[]
  /** 安装命令，展示在卡片底部命令区并提供复制 */
  install?: string
  /** 源码或原文链接，展示在卡片操作区 */
  source?: SkillLink
  /** 详情区底部附加链接 */
  links?: SkillLink[]
}
