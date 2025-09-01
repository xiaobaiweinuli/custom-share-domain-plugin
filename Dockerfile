# 构建阶段使用Alpine基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的系统工具（解决文件监视问题）
RUN apk add --no-cache inotify-tools

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，因为需要blinko-cli和vite）
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npx vite build --mode production

# 运行时阶段使用Alpine基础镜像
FROM node:18-alpine AS runtime

# 设置工作目录
WORKDIR /app

# 安装必要的系统工具（解决文件监视问题）
RUN apk add --no-cache inotify-tools

# 从构建阶段复制构建结果
COPY --from=builder /app/release ./release
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/plugin.json ./

# 安装生产依赖
RUN npm ci --only=production

# 暴露端口（如果需要）
EXPOSE 8080

# 启动命令
CMD ["npx", "blinko-cli", "dev", "server"]
