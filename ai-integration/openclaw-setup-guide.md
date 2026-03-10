# 🤖 OpenClaw 助手接入指南 (零基础版)

如果你是零代码基础的用户，想要让 **OpenClaw**（或其他支持插件的 AI 助手）变身成为你的专属“执行力教练”，请按照以下简单的「复制+粘贴」步骤操作即可！

---

## 阶段一：给 AI 注入“教练灵魂” 🧠

为了让 OpenClaw 不仅仅是一个陪聊机器人，而是成为一个严厉、高效、能帮你追踪任务的私人助理，我们需要给它设定一个特殊的“人格”。

1. 打开配置中的 **角色设定 (System Prompt / Persona)** 区域。
2. 将以下内容 **完整复制并粘贴** 进去：

> 你是一个名叫 OpenClaw 的“高净值执行力教练”兼私人日程助理。你的目标是不择手段地帮助用户消除拖延、拆解复杂的个人目标，并完美追踪每一项待办。你有权访问并管控用户的「AgentTODO」任务知识库。
> 
> 【工作原则】
> 1. 每天第一次对话时，静默调用 `get_daily_summary` 查询今日任务概况。如果有逾期任务，你必须立刻严厉提醒我处理。
> 2. 当我口头提出一个庞大的目标（例如：“我要准备一次长途旅行”）时，不要只建一个任务。你必须在心中将它拆解成具体的、可立即执行的多个子步骤，询问我是否同意，同意后调用 `create_task` 把这些步骤写入 `subtasks`。
> 3. 只要我的话语中透露出任何任务进度（例如：“刚完成第一步了”或“遇到卡点了”），你需要立刻调用 `add_task_progress_note` 帮我记录一条笔记，并自动勾选对应的子任务。
> 4. 你的回答要像硅谷精英高管一样干脆利落，少废话多行动。直接告诉我你执行了什么操作（如：“已为您记录了进度并标记第二步完成。”）。

---

## 阶段二：给 AI 安装“机械手臂”（添加技能插件） 🦾

AI 需要你的授权才能读写你的任务列表。在 OpenClaw 中，这通常叫做 **工具 (Tools)**、**技能 (Skills)** 或 **功能调用 (Function Calling)**。

请在 OpenClaw 的 **工具配置 / 插件管理** 界面，添加以下 5 个技能。
*注意：如果你的 OpenClaw 支持直接导入 JSON 描述文件，你可以直接复制底下代码块的内容。对于不需要代码配置的界面，只需照着下方的描述填空即可。*

### 技能 1：获取每日概览 (get_daily_summary)
*   **名称 (Name)**: `get_daily_summary`
*   **描述 (Description)**: 获取当前任务的完整统计大盘（总数、今日待办数、逾期数）。AI 每天初次交谈或需要了解全局时调用。
*   **API 地址 (URL)**: `http://localhost:3300/api/tasks/summary`
*   **请求方式 (Method)**: `GET`

### 技能 2：获取今日详情 (get_today_agenda)
*   **名称 (Name)**: `get_today_agenda`
*   **描述 (Description)**: 获取今日确切要做的任务详情，包括子任务的步骤和完成进度。
*   **API 地址 (URL)**: `http://localhost:3300/api/tasks/today`
*   **请求方式 (Method)**: `GET`

### 技能 3：创建新任务 (create_task)
*   **名称 (Name)**: `create_task`
*   **描述 (Description)**: 把用户的话变成具体的待办事项。可以包含分步的子任务。
*   **API 地址 (URL)**: `http://localhost:3300/api/tasks`
*   **请求方式 (Method)**: `POST`
*   **参数配置 (JSON Schema)**:
    ```json
    {
      "type": "object",
      "properties": {
        "title": {"type": "string", "description": "任务的标题"},
        "priority": {"type": "string", "description": "low, medium, high, urgent 选一个"},
        "due_date": {"type": "string", "description": "截止日期 YYYY-MM-DD"},
        "recurrence": {"type": "string", "description": "none, daily, weekly, monthly 选一个"},
        "subtasks": {"type": "array", "items": {"type": "string"}, "description": "细分的执行步骤列表"}
      },
      "required": ["title"]
    }
    ```

### 技能 4：记录进度与勾选步骤 (add_task_progress_note)
*   **名称 (Name)**: `add_task_progress_note`
*   **描述 (Description)**: 记录执行进展日志，或标记某个子任务状态为完成。
*   **API 地址 (URL)**: `http://localhost:3300/api/tasks/{{task_id}}/notes` 以及 `/subtasks/{{subtask_id}}` (如果你的客户端支持组合 API 调用，请参考项目提供的 Python 脚本逻辑，或者让 AI 直接请求后端的单一对应端点)。
*   *(如果你使用的是支持 Python 脚本的复杂版 OpenClaw 插件系统，请直接将本目录下的 `openclaw_tools.py` 导入系统即可)*

---

## 阶段三：测试你的 AI 教练！🎯

配置完毕后，保存设置。现在你可以用自然语言和你的 OpenClaw 对话了。
试着对它说以下几句话，看看奇迹是否发生：

1. **“早上好，帮我看看今天有哪些必须完成的事情？”**
   *(它应该会自动调用 `get_today_agenda`，然后严厉地把任务列给你看。)*

2. **“我要开始筹备下个月的家庭旅游了，大概要去一周。”**
   *(它应该不会只建一个“旅游”任务，而是自动拆分出“订机票”、“订酒店”、“做攻略”等几步，并调用 `create_task` 存进你的系统。)*

3. **“旅游的机票我刚才买好了。”**
   *(它应该会自动找到刚刚那个旅游任务，调用工具为你打上勾，并回复你“已记录进展，机票预订步骤已完成，接下来请抓紧预订酒店。”)*
