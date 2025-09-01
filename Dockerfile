# 精简版Dockerfile - 专为Blinko插件优化
FROM node:18-alpine

WORKDIR /app  # ← 这里已经设置了工作目录

# 安装必要的系统工具（解决文件监视问题）
RUN apk add --no-cache inotify-tools

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建项目
RUN npx vite build --mode production

EXPOSE 8080
CMD ["npx", "blinko-cli", "dev", "server"]
