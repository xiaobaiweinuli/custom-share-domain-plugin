# 使用Node.js官方镜像作为基础镜像（使用非Alpine版本避免递归监视问题）
FROM node:18-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖，因为需要blinko-cli）
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npx vite build --mode production

# 使用更小的基础镜像用于运行时（使用非Alpine版本避免递归监视问题）
FROM node:18-slim AS runtime

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建结果
COPY --from=builder /app/release ./release
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/plugin.json ./

# 安装所有依赖（运行时也需要blinko-cli来运行dev命令）
RUN npm ci

# 暴露端口（如果需要）
EXPOSE 8080

# 设置环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["npm", "run", "dev"]
