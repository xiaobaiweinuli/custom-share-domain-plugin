// Blinko 插件 API 类型定义

export interface BasePlugin {
  name: string;
  author: string;
  url: string;
  version: string;
  minAppVersion?: string;
  displayName?: {
    default?: string;
    [key: string]: string | undefined;
  };
  description?: {
    default?: string;
    [key: string]: string | undefined;
  };
  readme?: {
    default?: string;
    [key: string]: string | undefined;
  };
  withSettingPanel?: boolean;
  renderSettingPanel?: () => HTMLElement;
  init?: () => Promise<void>;
}

// Blinko 全局对象类型声明
declare global {
  interface Window {
    Blinko: {
      api: {
        config: {
          getPluginConfig: {
            query: <T = any>(params: { pluginName: string }) => Promise<T>;
          };
          setPluginConfig: {
            mutate: (params: {
              pluginName: string;
              key: string;
              value: any;
            }) => Promise<void>;
          };
        };
        // 其他 API 方法可以在这里添加
      };
      i18n: {
        t: (key: string, params?: any) => string;
        locale: string;
      };
      eventBus: any;
      version: string;
      toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
        warning: (message: string) => void;
      };
      store: any;
      addToolBarIcon: (icon: any) => void;
      addRightClickMenu: (menu: any) => void;
      showDialog: (options: any) => void;
      closeDialog: () => void;
      addAiWritePrompt: (name: string, prompt: string, icon?: string) => void;
      globalRefresh: () => void;
    };
  }
}

// 导出默认值以支持 CommonJS 导入
export default {};