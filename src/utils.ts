/** @jsxImportSource preact */

import type { Domain, PluginConfig, ShareOption } from './types';

/**
 * 插件名称常量
 */
export const PLUGIN_NAME = 'custom-share-domain-plugin';

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 验证 URL 格式
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // 允许 HTTP 和 HTTPS 协议
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * 确保URL有协议，如果没有则添加HTTPS
 */
export function ensureProtocol(url: string): string {
  try {
    // 如果已经有协议，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果没有协议，添加 https://
    return `https://${url}`;
  } catch {
    return url;
  }
}

/**
 * 从旧版本配置迁移
 */
function migrateFromLegacyConfig(config: any): PluginConfig {
  // 如果存在旧版本的单域名配置，迁移到新格式
  if (config.customDomain && typeof config.customDomain === 'string') {
    const legacyDomain: Domain = {
      id: generateId(),
      name: '迁移的域名',
      url: ensureProtocol(config.customDomain),
      enabled: true
    };

    return {
      domains: [legacyDomain],
      defaultDomainId: legacyDomain.id
    };
  }

  return {
    domains: config.domains || [],
    defaultDomainId: config.defaultDomainId || null
  };
}

/**
 * 获取插件配置
 */
export async function getPluginConfig(): Promise<PluginConfig> {
  try {
    const config = await window.Blinko.api.config.getPluginConfig.query({
      pluginName: PLUGIN_NAME
    });

    // 执行配置迁移
    const migratedConfig = migrateFromLegacyConfig(config);

    // 确保所有域名有协议
    const protocolConfig = {
      ...migratedConfig,
      domains: migratedConfig.domains.map(domain => ({
        ...domain,
        url: ensureProtocol(domain.url)
      }))
    };

    return protocolConfig;
  } catch (error) {
    console.error('Failed to get plugin config:', error);
    return {
      domains: [],
      defaultDomainId: null
    };
  }
}

/**
 * 保存插件配置
 */
export async function savePluginConfig(config: PluginConfig): Promise<void> {
  try {
    // 确保所有域名有协议
    const protocolConfig = {
      ...config,
      domains: config.domains.map(domain => ({
        ...domain,
        url: ensureProtocol(domain.url)
      }))
    };

    await window.Blinko.api.config.setPluginConfig.mutate({
      pluginName: PLUGIN_NAME,
      key: 'domains',
      value: protocolConfig.domains
    });

    await window.Blinko.api.config.setPluginConfig.mutate({
      pluginName: PLUGIN_NAME,
      key: 'defaultDomainId',
      value: protocolConfig.defaultDomainId
    });
  } catch (error) {
    console.error('Failed to save plugin config:', error);
    throw error;
  }
}

/**
 * 获取启用的域名列表
 */
export function getEnabledDomains(domains: Domain[]): Domain[] {
  return domains.filter(domain => domain.enabled);
}

/**
 * 获取默认域名
 */
export function getDefaultDomain(domains: Domain[], defaultDomainId: string | null): Domain | null {
  if (!defaultDomainId) return null;
  return domains.find(domain => domain.id === defaultDomainId) || null;
}

/**
 * 生成分享链接
 */
export function generateShareLink(originalUrl: string, customDomain: string): string {
  try {
    const url = new URL(originalUrl);
    const customUrl = new URL(customDomain);

    // 完全替换协议、主机名和端口
    url.protocol = customUrl.protocol;
    url.hostname = customUrl.hostname;
    url.port = customUrl.port;

    return url.toString();
  } catch (error) {
    console.error('Failed to generate share link:', error);
    return originalUrl;
  }
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 降级到传统方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);

    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);

    // 最后的降级方案：尝试使用 Blinko 的内置复制功能（如果存在）
    try {
      if (window.Blinko && window.Blinko.copyToClipboard) {
        await window.Blinko.copyToClipboard(text);
        return true;
      }
    } catch (blinkoError) {
      console.error('Blinko copy method also failed:', blinkoError);
    }

    return false;
  }
}

/**
 * 获取分享选项列表
 */
export function getShareOptions(domains: Domain[], originalUrl: string, defaultDomainId: string | null): ShareOption[] {
  const options: ShareOption[] = [];

  // 添加原始 Blinko 分享链接
  options.push({
    id: 'original',
    name: 'Blinko 原始链接',
    url: originalUrl,
    isDefault: !defaultDomainId
  });

  // 添加启用的自定义域名
  const enabledDomains = getEnabledDomains(domains);
  enabledDomains.forEach(domain => {
    options.push({
      id: domain.id,
      name: domain.name,
      url: generateShareLink(originalUrl, domain.url),
      isDefault: domain.id === defaultDomainId
    });
  });

  return options;
}

/**
 * 创建官方分享链接
 * 调用 Blinko 官方分享 API 来创建真实的分享链接
 */
export async function createOfficialShare(note: any, options?: { password?: string; expireAt?: string | null }): Promise<{ url: string; id: string; password?: string } | null> {
  try {
    console.log('Creating official share for note:', note.id);
    console.log('Share options:', options);
    
    // 准备 API 参数
    const apiParams: any = {
      id: note.id,
      isCancel: false,
      password: options?.password || ""
    };
    
    // 只有在有有效的过期时间时才添加 expireAt 字段
    if (options?.expireAt && options.expireAt !== null) {
      apiParams.expireAt = new Date(options.expireAt);
    }
    
    console.log('API params:', apiParams);
    
    // 调用官方分享 API
    const shareResult = await window.Blinko.api.notes.shareNote.mutate(apiParams);
    
    console.log('Share creation result:', shareResult);
    
    if (shareResult && shareResult.shareEncryptedUrl) {
      // 构建基础分享链接
      let shareUrl = `${window.location.origin}/share/${shareResult.shareEncryptedUrl}`;
      
      // 如果有密码，添加密码参数
      if (shareResult.sharePassword) {
        shareUrl += `?password=${shareResult.sharePassword}`;
      }
      
      console.log('Generated official share URL:', shareUrl);
      
      return {
        url: shareUrl,
        id: shareResult.shareEncryptedUrl,
        password: shareResult.sharePassword
      };
    }
    
    // 如果 API 调用失败，使用备用方法
    console.log('API call failed or no shareEncryptedUrl, using fallback');
    const fallbackUrl = `${window.location.origin}/share/${note.id}`;
    
    return {
      url: fallbackUrl,
      id: note.id
    };

  } catch (error) {
    console.error('Failed to create official share:', error);
    
    // 最终备用方法
    const fallbackUrl = `${window.location.origin}/share/${note.id}`;
    console.log('Using fallback share URL:', fallbackUrl);
    
    return {
      url: fallbackUrl,
      id: note.id
    };
  }
}



/**
 * 取消分享
 * 调用 Blinko 官方 API 来取消分享
 */
export async function cancelShare(note: any): Promise<boolean> {
  try {
    console.log('Canceling share for note:', note.id);
    
    // 调用取消分享 API
    const result = await window.Blinko.api.notes.shareNote.mutate({
      id: note.id,
      isCancel: true
    });
    
    console.log('Cancel share result:', result);
    
    if (result) {
      // 更新note对象的状态
      note.isShare = false;
      note.shareEncryptedUrl = null;
      note.sharePassword = '';
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to cancel share:', error);
    return false;
  }
}

/**
 * 获取本地化文本
 */
export function getI18nText(key: string, params?: Record<string, string>): string {
  try {
    // 使用插件命名空间获取翻译文本
    let text = window.Blinko.i18n.t(`${PLUGIN_NAME}:${key}`);

    // 如果没有找到翻译，尝试直接使用 key
    if (text === `${PLUGIN_NAME}:${key}`) {
      text = window.Blinko.i18n.t(key);
    }

    // 简单的参数替换
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, value);
      });
    }

    return text;
  } catch (error) {
    console.error('Failed to get i18n text:', error);
    return key;
  }
}

