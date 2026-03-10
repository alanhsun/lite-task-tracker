# Task Tracker 部署指南

轻量级任务追踪系统，适合家庭服务器和低功耗设备（Raspberry Pi）部署。

## 前置条件

- Docker 20.10+ 和 Docker Compose V2
- 或 Node.js 20+ （本地开发）

## 🚀 快速部署（推荐）

### 1. 克隆/下载项目

```bash
cd /opt
git clone <repo-url> task-manager
cd task-manager
```

### 2. 一键启动

```bash
docker-compose up -d
```

访问 `http://<服务器IP>:3300` 即可使用。

## ⚙️ 配置说明

| 环境变量         | 默认值               | 说明                   |
|-----------------|----------------------|------------------------|
| `PORT`          | `3300`               | 服务端口                |
| `DB_PATH`       | `/data/tasks.db`     | SQLite 数据库文件路径    |
| `NODE_ENV`      | `production`         | 运行环境                |

### 自定义端口

修改 `docker-compose.yml` 中 `ports` 配置：

```yaml
ports:
  - "8080:3300"  # 映射到 8080 端口
```

## 🔧 本地开发

```bash
# 安装依赖
cd server && npm install
cd ../client && npm install

# 启动后端 (端口 3300)
cd server && npm run dev

# 启动前端 (端口 5173，自动代理 API)
cd client && npm run dev
```

## 💾 数据备份与恢复

### 备份

```bash
# Docker 部署
docker cp task-manager:/data/tasks.db ./backup-$(date +%Y%m%d).db

# 或直接复制 volume 中的文件
```

### 恢复

```bash
docker cp ./backup.db task-manager:/data/tasks.db
docker restart task-manager
```

## 🔄 更新升级

```bash
cd task-manager
git pull
docker-compose build
docker-compose up -d
```

## 🐛 常见问题

### Q: 忘记密码怎么办？

目前需手动操作数据库重置。进入容器：

```bash
docker exec -it task-manager sh
# 删除用户后重新注册
```

### Q: 如何在 Raspberry Pi 上部署？

Docker 镜像基于 Alpine + Node.js，原生支持 arm64 架构。直接执行 `docker-compose up -d` 即可。

### Q: 数据库文件在哪里？

Docker 部署时数据存储在 Docker volume `task-manager_task-data` 中。可通过 `docker volume inspect task-manager_task-data` 查看实际路径。

## 📡 API 集成

API 遵循 RESTful 规范，无需认证。详细文档见 `docs/ai-api-guide.md`。

### 快速示例

```bash
# 创建任务
curl -X POST http://localhost:3300/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"测试任务","priority":"high","recurrence":"daily"}'

# 获取任务列表
curl http://localhost:3300/api/tasks

# 今日待办
curl http://localhost:3300/api/tasks/today

# 任务概览
curl http://localhost:3300/api/tasks/summary
```
