# Blinko API 文档

本文档提供了Blinko系统的API调用示例，方便开发者集成和自动化操作。

## 目录

- [使用说明](#使用说明)
- [API调用示例](#api调用示例)
  - [获取闪念内容](#获取闪念内容)
  - [获取归档内容](#获取归档内容)
  - [获取笔记内容](#获取笔记内容)
  - [获取待办内容](#获取待办内容)
  - [获取资源](#获取资源)
- [参数说明](#参数说明)
- [认证说明](#认证说明)

## 使用说明

所有API调用都使用HTTP请求，建议使用curl工具或其他HTTP客户端进行测试和集成。请确保替换`<服务IP>`和`<token>`为您实际的服务地址和认证令牌。

## API调用示例

### 获取闪念内容

获取用户的闪念内容列表：

```bash
curl '<服务IP>/api/trpc/notes.list?batch=1' \
  -H 'Accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Referer: <服务IP>/' \
  -H 'content-type: application/json' \
  --data-raw '{"0":{"json":{"isArchived":false,"isRecycle":false,"isShare":null,"type":0,"tagId":null,"withoutTag":false,"withFile":false,"withLink":false,"isUseAiQuery":false,"startDate":null,"endDate":null,"hasTodo":false,"searchText":"","page":1,"size":30}}}'
```

### 获取归档内容

获取用户的归档内容列表：

```bash
curl '<服务IP>/api/trpc/notes.list?batch=1' \
  -H 'Accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Referer: <服务IP>/?path=archived' \
  -H 'content-type: application/json' \
  --data-raw '{"0":{"json":{"isArchived":true,"isRecycle":false,"isShare":null,"type":-1,"tagId":null,"withoutTag":false,"withFile":false,"withLink":false,"isUseAiQuery":false,"startDate":null,"endDate":null,"hasTodo":false,"searchText":"","page":1,"size":30}}}'
```

### 获取笔记内容

获取用户的笔记内容列表：

```bash
curl '<服务IP>/api/trpc/notes.list?batch=1' \
  -H 'Accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Referer: <服务IP>/?path=notes' \
  -H 'content-type: application/json' \
  --data-raw '{"0":{"json":{"isArchived":false,"isRecycle":false,"isShare":null,"type":1,"tagId":null,"withoutTag":false,"withFile":false,"withLink":false,"isUseAiQuery":false,"startDate":null,"endDate":null,"hasTodo":false,"searchText":"","page":1,"size":30}}}'
```

### 获取待办内容

获取用户的待办内容列表：

```bash
curl '<服务IP>/api/trpc/notes.list?batch=1' \
  -H 'Accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Referer: <服务IP>/?path=todo' \
  -H 'content-type: application/json' \
  --data-raw '{"0":{"json":{"isArchived":false,"isRecycle":false,"isShare":null,"type":2,"tagId":null,"withoutTag":false,"withFile":false,"withLink":false,"isUseAiQuery":false,"startDate":null,"endDate":null,"hasTodo":false,"searchText":"","page":1,"size":30}}}'
```

### 获取资源

获取用户的资源列表：

```bash
curl '<服务IP>/api/trpc/attachments.list?batch=1&input={"0":{"json":{"page":1,"size":30,"searchText":null,"folder":null},"meta":{"values":{"searchText":["undefined"],"folder":["undefined"]}}}}' \
  -H 'Accept: */*' \
  -H 'Authorization: Bearer <token>' \
  -H 'Referer: <服务IP>/resources' \
  -H 'content-type: application/json'
```

## 参数说明

### 通用请求参数

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `<服务IP>` | Blinko服务的IP地址或域名 | `http://localhost:8080` |
| `<token>` | 认证令牌，用于验证用户身份 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `page` | 请求的页码，从1开始 | `1` |
| `size` | 每页返回的记录数 | `30` |
| `searchText` | 搜索关键词 | `project` |

### 内容类型参数

| 参数 | 说明 | 可能的取值 |
|------|------|------------|
| `type` | 内容类型 | `0`(闪念), `1`(笔记), `2`(待办), `-1`(全部) |
| `isArchived` | 是否归档 | `true` 或 `false` |
| `isRecycle` | 是否在回收站 | `true` 或 `false` |
| `isShare` | 是否共享 | `true`, `false` 或 `null` |
| `hasTodo` | 是否包含待办 | `true` 或 `false` |
| `withFile` | 是否包含文件 | `true` 或 `false` |
| `withLink` | 是否包含链接 | `true` 或 `false` |

## 认证说明

所有API调用都需要提供有效的认证令牌，通过`Authorization`请求头传递，格式为`Bearer <token>`。请确保您的令牌是有效的，并且具有足够的权限执行请求的操作。


## 注意事项

1. 请妥善保管您的认证令牌，不要在公共场合泄露
2. 对于大量数据的请求，建议使用分页参数控制返回数据量
3. 如果需要自定义查询条件，可以修改请求体中的JSON参数
4. 如有API变更，请以最新的文档为准
