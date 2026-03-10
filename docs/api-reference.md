# Task Tracker API 参考文档

> 基础 URL: `http://<服务器地址>:3000`  
> 认证方式: JWT Bearer Token  
> 内容类型: `application/json`  
> API 规范: OpenAPI 3.0 (`/api/openapi.json`)  
> 交互式文档: Swagger UI (`/api-docs`)

---

## 目录

1. [认证 (Auth)](#1-认证-auth)
2. [任务 (Tasks)](#2-任务-tasks)
3. [标签 (Tags)](#3-标签-tags)
4. [系统 (System)](#4-系统-system)
5. [通用说明](#5-通用说明)

---

## 1. 认证 (Auth)

所有 `/api/tasks` 和 `/api/tags` 接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

### 1.1 用户注册

```
POST /api/auth/register
```

**请求体:**

| 字段       | 类型   | 必填 | 说明                |
|-----------|--------|------|---------------------|
| username  | string | ✅   | 用户名（唯一）        |
| email     | string | ✅   | 邮箱（唯一）          |
| password  | string | ✅   | 密码（至少6位）        |

**请求示例:**

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "mypassword123"
}
```

**成功响应:** `201 Created`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**错误响应:**
- `400` — 缺少字段或密码太短
- `409` — 用户名或邮箱已存在

---

### 1.2 用户登录

```
POST /api/auth/login
```

**请求体:**

| 字段       | 类型   | 必填 | 说明     |
|-----------|--------|------|----------|
| username  | string | ✅   | 用户名    |
| password  | string | ✅   | 密码      |

**请求示例:**

```json
{
  "username": "admin",
  "password": "mypassword123"
}
```

**成功响应:** `200 OK`

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**错误响应:**
- `400` — 缺少字段
- `401` — 用户名或密码错误

---

## 2. 任务 (Tasks)

> ⚠️ 以下所有接口需要 JWT 认证

### 2.1 获取任务列表

```
GET /api/tasks
```

**查询参数:**

| 参数        | 类型   | 默认值      | 说明                                    |
|------------|--------|------------|----------------------------------------|
| status     | string | —          | 按状态筛选，多个用逗号分隔：`todo,in_progress,done` |
| priority   | string | —          | 按优先级筛选：`low,medium,high,urgent`       |
| tag        | string | —          | 按标签 ID 筛选，多个用逗号分隔：`1,2,3`          |
| search     | string | —          | 搜索关键词（匹配标题和描述）                      |
| due_before | string | —          | 截止日期早于（格式：`YYYY-MM-DD`）              |
| due_after  | string | —          | 截止日期晚于（格式：`YYYY-MM-DD`）              |
| sort       | string | created_at | 排序字段：`created_at`, `updated_at`, `due_date`, `priority`, `title`, `status` |
| order      | string | desc       | 排序方向：`asc` / `desc`                     |
| page       | int    | 1          | 页码                                      |
| limit      | int    | 20         | 每页条数（最大100）                            |

**请求示例:**

```bash
GET /api/tasks?status=todo,in_progress&priority=high&search=部署&sort=due_date&order=asc&page=1&limit=10
```

**成功响应:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "学习 Docker 部署",
      "description": "了解 Docker 容器化部署流程",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-03-15",
      "created_at": "2026-03-09T14:30:00.000Z",
      "updated_at": "2026-03-09T14:30:00.000Z",
      "tags": [
        { "id": 1, "name": "工作", "color": "#3b82f6" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2.2 创建任务

```
POST /api/tasks
```

**请求体:**

| 字段         | 类型     | 必填 | 默认值   | 说明                                        |
|-------------|----------|------|---------|---------------------------------------------|
| title       | string   | ✅   | —       | 任务标题（最大255字符）                          |
| description | string   | ❌   | `""`    | 任务描述                                      |
| status      | string   | ❌   | `todo`  | 状态：`todo` / `in_progress` / `done`         |
| priority    | string   | ❌   | `medium`| 优先级：`low` / `medium` / `high` / `urgent`  |
| due_date    | string   | ❌   | `null`  | 截止日期（格式：`YYYY-MM-DD`）                   |
| tags        | int[]    | ❌   | `[]`    | 标签 ID 数组                                  |

**请求示例:**

```json
{
  "title": "完成项目报告",
  "description": "Q1 季度总结报告",
  "status": "in_progress",
  "priority": "urgent",
  "due_date": "2026-03-15",
  "tags": [1, 3]
}
```

**成功响应:** `201 Created`

```json
{
  "id": 2,
  "user_id": 1,
  "title": "完成项目报告",
  "description": "Q1 季度总结报告",
  "status": "in_progress",
  "priority": "urgent",
  "due_date": "2026-03-15",
  "created_at": "2026-03-09T15:00:00.000Z",
  "updated_at": "2026-03-09T15:00:00.000Z",
  "tags": [
    { "id": 1, "name": "工作", "color": "#3b82f6" },
    { "id": 3, "name": "紧急", "color": "#ef4444" }
  ]
}
```

**错误响应:**
- `400` — 标题为空或字段格式错误

---

### 2.3 获取单个任务

```
GET /api/tasks/:id
```

**成功响应:** `200 OK` — 返回完整任务对象（同上格式）

**错误响应:**
- `404` — 任务不存在或不属于当前用户

---

### 2.4 更新任务

```
PUT /api/tasks/:id
```

**请求体:** 只需传需要修改的字段

| 字段         | 类型     | 说明            |
|-------------|----------|----------------|
| title       | string   | 新标题           |
| description | string   | 新描述           |
| status      | string   | 新状态           |
| priority    | string   | 新优先级         |
| due_date    | string   | 新截止日期        |
| tags        | int[]    | 新标签ID列表（替换原有标签） |

**请求示例（仅改状态）:**

```json
{
  "status": "done"
}
```

**成功响应:** `200 OK` — 返回更新后的完整任务对象

**错误响应:**
- `400` — 字段格式错误
- `404` — 任务不存在

---

### 2.5 删除任务

```
DELETE /api/tasks/:id
```

**成功响应:** `200 OK`

```json
{
  "message": "Task deleted successfully"
}
```

**错误响应:**
- `404` — 任务不存在

---

### 2.6 批量操作

```
POST /api/tasks/batch
```

**请求体:**

| 字段    | 类型   | 必填 | 说明                                        |
|--------|--------|------|---------------------------------------------|
| action | string | ✅   | 操作类型：`update_status` / `update_priority` / `delete` |
| ids    | int[]  | ✅   | 任务 ID 数组（非空）                            |
| value  | string | 条件 | 新的状态/优先级值（`delete` 时不需要）              |

**请求示例:**

```json
// 批量标记完成
{
  "action": "update_status",
  "ids": [1, 2, 3],
  "value": "done"
}

// 批量设为紧急
{
  "action": "update_priority",
  "ids": [4, 5],
  "value": "urgent"
}

// 批量删除
{
  "action": "delete",
  "ids": [6, 7, 8]
}
```

**成功响应:** `200 OK`

```json
{
  "message": "Batch update_status completed",
  "affected": 3
}
```

**错误响应:**
- `400` — 操作类型无效或 ids 为空
- `404` — 没有找到匹配的任务

---

## 3. 标签 (Tags)

> ⚠️ 以下所有接口需要 JWT 认证

### 3.1 获取标签列表

```
GET /api/tags
```

**成功响应:** `200 OK`

```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "工作",
    "color": "#3b82f6",
    "task_count": 5
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "学习",
    "color": "#22c55e",
    "task_count": 3
  }
]
```

---

### 3.2 创建标签

```
POST /api/tags
```

**请求体:**

| 字段   | 类型   | 必填 | 默认值     | 说明                    |
|-------|--------|------|-----------|------------------------|
| name  | string | ✅   | —         | 标签名称（最大50字符）      |
| color | string | ❌   | `#6366f1` | 颜色代码（HEX格式）        |

**请求示例:**

```json
{
  "name": "工作",
  "color": "#3b82f6"
}
```

**成功响应:** `201 Created`

```json
{
  "id": 1,
  "user_id": 1,
  "name": "工作",
  "color": "#3b82f6"
}
```

**错误响应:**
- `400` — 名称为空
- `409` — 同名标签已存在

---

### 3.3 更新标签

```
PUT /api/tags/:id
```

**请求体:**

```json
{
  "name": "新名称",
  "color": "#ef4444"
}
```

**成功响应:** `200 OK` — 返回更新后的标签对象

---

### 3.4 删除标签

```
DELETE /api/tags/:id
```

**成功响应:** `200 OK`

```json
{
  "message": "Tag deleted successfully"
}
```

> 删除标签时，所有关联的任务-标签关系会自动清除（不会删除任务）。

---

## 4. 系统 (System)

### 4.1 健康检查

```
GET /api/health
```

> 无需认证

**成功响应:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-03-10T03:30:00.000Z"
}
```

### 4.2 OpenAPI 规范

```
GET /api/openapi.json
```

> 无需认证。返回完整的 OpenAPI 3.0 JSON 规范文件，可用于代码生成或工具导入。

### 4.3 Swagger UI

```
GET /api-docs
```

> 无需认证。浏览器访问可查看交互式 API 文档。

---

## 5. 通用说明

### 5.1 认证流程

```
1. POST /api/auth/register 或 POST /api/auth/login
2. 从响应中获取 token
3. 后续请求在 Header 中携带: Authorization: Bearer <token>
4. Token 默认 7 天有效
```

### 5.2 错误响应格式

所有错误返回统一格式：

```json
// 单个错误
{ "error": "Error message" }

// 多个验证错误
{ "errors": ["Error 1", "Error 2"] }
```

### 5.3 HTTP 状态码

| 状态码 | 含义                |
|-------|---------------------|
| 200   | 成功                 |
| 201   | 创建成功              |
| 400   | 请求参数错误           |
| 401   | 未认证/Token无效或过期  |
| 404   | 资源不存在             |
| 409   | 资源冲突（重复）        |
| 500   | 服务器内部错误          |

### 5.4 cURL 快速上手

```bash
# 1. 注册用户
curl -X POST http://localhost:3300/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bot","email":"bot@example.com","password":"botpass123"}'

# 2. 保存 Token
TOKEN="<从上面响应中复制 token>"

# 3. 创建任务
curl -X POST http://localhost:3300/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"自动创建的任务","priority":"high","due_date":"2026-03-20"}'

# 4. 查询待办任务
curl "http://localhost:3300/api/tasks?status=todo&sort=priority&order=desc" \
  -H "Authorization: Bearer $TOKEN"

# 5. 批量完成
curl -X POST http://localhost:3300/api/tasks/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"update_status","ids":[1,2,3],"value":"done"}'
```

### 5.5 Python 调用示例

```python
import requests

BASE_URL = "http://localhost:3300/api"

# 登录
resp = requests.post(f"{BASE_URL}/auth/login", json={
    "username": "admin",
    "password": "password123"
})
token = resp.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# 创建任务
task = requests.post(f"{BASE_URL}/tasks", headers=headers, json={
    "title": "由 Python 脚本创建",
    "priority": "high",
    "status": "todo",
    "due_date": "2026-03-20"
}).json()
print(f"Created task: {task['id']} - {task['title']}")

# 获取所有任务
tasks = requests.get(f"{BASE_URL}/tasks", headers=headers).json()
for t in tasks["data"]:
    print(f"  [{t['status']}] {t['title']} (priority: {t['priority']})")
```

### 5.6 数据模型

#### Task 对象

```json
{
  "id": 1,
  "user_id": 1,
  "title": "string (max 255)",
  "description": "string",
  "status": "todo | in_progress | done",
  "priority": "low | medium | high | urgent",
  "due_date": "YYYY-MM-DD | null",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601",
  "tags": [
    { "id": 1, "name": "string", "color": "#hex" }
  ]
}
```

#### Tag 对象

```json
{
  "id": 1,
  "user_id": 1,
  "name": "string (max 50)",
  "color": "#hex (default: #6366f1)",
  "task_count": 0
}
```
