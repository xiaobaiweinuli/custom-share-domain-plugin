

```bash
curl -X POST '<服务端地址>/api/trpc/plugin.installPlugin?batch=1' -H 'Content-Type: application/json' -H 'Authorization: Bearer <token>' -d '{
  "0": {
    "json": {
      "name": "custom-share-domain-plugin",
      "author": "xiaobaiweinuli",
      "url": "https://github.com/xiaobaiweinuli/custom-share-domain-plugin",
      "version": "1.0.0",
      "minAppVersion": "0.0.0",
      "displayName": {
        "default": "Custom Share Domain",
        "zh": "自定义分享域名"
      },
      "description": {
        "default": "A plugin to customize share domain.",
        "zh": "自定义分享域名插件"
      },
      "readme": {
        "default": "README.md",
        "zh": "README_zh.md"
      },
      "downloads": 0
    }
  }
}' -k

```
