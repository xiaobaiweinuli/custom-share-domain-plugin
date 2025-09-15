

# 自定义分享域名插件 - API文档

## 直接安装插件（无需审核）

本插件支持通过API直接安装，无需等待审核流程。结合项目的GitHub Actions工作流（`.github/workflows/release.yml`），可以实现插件的自动构建、打包和发布，然后立即通过API安装到系统中。

## GitHub Actions工作流说明

项目配置了自动构建和发布的工作流，主要功能包括：
- 监听`main`分支推送（排除`.md`文件和工作流文件自身的变更）
- 自动从`package.json`提取版本号
- 构建插件并打包为`release.zip`
- 创建GitHub Release并上传构建产物

这确保了每次代码更新后，都能快速生成可安装的插件版本。

## 安装插件API

使用以下curl命令直接安装插件：

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

## 参数说明

- `<服务端地址>`: 替换为实际的Blinko服务端地址
- `<token>`: 替换为有效的认证令牌
- `version`: 插件版本号，应与GitHub Release中的版本号保持一致（可在`package.json`中查看）

## 使用说明

1. 确保GitHub Actions工作流已成功运行并创建了Release
2. 获取最新的插件版本号（可从`package.json`或GitHub Release页面获取）
3. 替换命令中的`<服务端地址>`和`<token>`为实际值
4. （可选）根据需要更新`version`字段为最新版本
5. 执行curl命令安装插件

## 注意事项

- 使用`-k`参数可跳过SSL证书验证（仅在测试环境中使用）
- 确保token具有足够的权限来安装插件
- 安装成功后，插件将立即生效，无需额外的审核步骤

## 版本更新

当项目代码更新并触发GitHub Actions工作流后：
1. 工作流会自动从`package.json`提取新版本号
2. 创建带有新版本号的GitHub Release
3. 此时可以通过更新API调用中的`version`字段来安装新版本

## 最佳实践

- 建议在正式环境中移除`-k`参数，使用有效的SSL证书
- 定期更新插件版本以获取最新功能和修复
- 结合CI/CD流程自动化插件的安装和更新
