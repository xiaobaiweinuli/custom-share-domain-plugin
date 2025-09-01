/** @jsxImportSource preact */

/**
 * 自定义域名接口
 */
export interface Domain {
  id: string; // 唯一标识符
  name: string; // 域名名称，例如 '我的博客'
  url: string; // 域名 URL，例如 'https://myblog.com'
  enabled: boolean; // 是否启用
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  domains: Domain[]; // 自定义域名列表
  defaultDomainId: string | null; // 默认域名 ID
}

/**
 * 分享链接选项接口
 */
export interface ShareOption {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
}

/**
 * 笔记接口（基于 Blinko 的 Note 类型）
 */
export interface Note {
  id: string;
  content: string;
  // 其他 Blinko Note 属性...
}

