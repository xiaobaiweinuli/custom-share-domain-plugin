/** @jsxImportSource preact */
/// <reference types="systemjs" />

import { render } from 'preact/compat';
import type { BasePlugin } from 'blinko';
import { Setting } from './setting';
import { ShareSelector } from './share-selector';
import plugin from '../plugin.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import { PLUGIN_NAME, getPluginConfig, getShareOptions, generateShareLink, getDefaultDomain, copyToClipboard, getI18nText, createOfficialShare } from './utils';

/**
 * Main plugin entry point registered with SystemJS
 * Exports the plugin class implementing BasePlugin interface
 */
System.register([], (exports) => ({
  execute: () => {
    exports('default', class Plugin implements BasePlugin {
      constructor() {
        // Initialize plugin with metadata from plugin.json
        Object.assign(this, plugin);
      }

      // Flag indicating this plugin has a settings panel
      withSettingPanel = true;

      /**
       * Renders the settings panel UI
       * @returns {HTMLElement} Container element with rendered settings component
       */
      renderSettingPanel = () => {
        const container = document.createElement('div');
        render(<Setting />, container);
        return container;
      }

      /**
       * Initializes the plugin
       * Sets up right-click menus for custom share functionality
       */
      async init() {
        try {
          // Initialize internationalization first
          this.initI18n();
          
          // Add custom right-click menu item for sharing with custom domains
          window.Blinko.addRightClickMenu({
            name: 'custom-share-domain',
            label: getI18nText('share.shareToCustomDomain'),
            icon: 'tabler:share', 
            onClick: async (note) => {
              await this.showShareSelector(note);
            }
          });

          console.log(`${PLUGIN_NAME} initialized successfully`);
        } catch (error) {
          console.error('Failed to initialize plugin:', error);
        }
      }

      /**
       * 显示分享选择器
       */
      async showShareSelector(note: any) {
        try {
          console.log('Creating share for note:', note);
          
          // 创建分享选择器容器
          const container = document.createElement('div');
          document.body.appendChild(container);

          let isClosed = false;
          const handleClose = () => {
            if (!isClosed && document.body.contains(container)) {
              isClosed = true;
              document.body.removeChild(container);
            }
          };

          // 渲染分享选择器，传入 note 对象而不是预生成的 URL
          render(
            <ShareSelector 
              note={note}
              onClose={handleClose} 
            />, 
            container
          );
        } catch (error) {
          console.error('Failed to show share selector:', error);
          window.Blinko.toast.error(getI18nText('messages.showShareSelectorFailed'));
        }
      }

      /**
       * 获取默认分享链接（用于自动分享）
       */
      async getDefaultShareLink(note: any): Promise<string> {
        try {
          const config = await getPluginConfig();
          
          // 创建官方分享链接
          const shareData = await createOfficialShare(note);
          if (!shareData) {
            throw new Error('Failed to create official share');
          }
          
          // 如果没有设置默认域名，返回官方分享链接
          if (!config.defaultDomainId) {
            return shareData.url;
          }
          
          // 获取默认域名
          const defaultDomain = getDefaultDomain(config.domains, config.defaultDomainId);
          if (!defaultDomain || !defaultDomain.enabled) {
            return shareData.url;
          }
          
          // 生成自定义域名分享链接
          return generateShareLink(shareData.url, defaultDomain.url);
        } catch (error) {
          console.error('Failed to get default share link:', error);
          // 出错时返回基础链接
          return `${window.location.origin}/share/${note.id}`;
        }
      }

      /**
       * 快速复制默认分享链接
       */
      async quickShare(note: any): Promise<void> {
        try {
          const shareLink = await this.getDefaultShareLink(note);
          const success = await copyToClipboard(shareLink);
          
          if (success) {
            const config = await getPluginConfig();
            const defaultDomain = getDefaultDomain(config.domains, config.defaultDomainId);
            const domainName = defaultDomain ? defaultDomain.name : getI18nText('settings.useOriginalLink');
            
            window.Blinko.toast.success(getI18nText('share.linkCopied', { domainName }));
          } else {
            window.Blinko.toast.error(getI18nText('share.copyFailed'));
          }
        } catch (error) {
          console.error('Failed to quick share:', error);
          window.Blinko.toast.error(getI18nText('share.copyFailed'));
        }
      }

      /**
       * Initializes internationalization resources
       */
      initI18n() {
        // Register language resources with Blinko's i18n system
        window.Blinko.i18n.addResourceBundle('en', PLUGIN_NAME, en);
        window.Blinko.i18n.addResourceBundle('zh', PLUGIN_NAME, zh);
      }

      /**
       * Cleanup function called when plugin is disabled
       */
      destroy() {
        console.log(`${PLUGIN_NAME} destroyed`);
      }
    });
  }
}));

