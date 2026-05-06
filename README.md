# OpenClaw 状态面板

基于 React + Vite 的 OpenClaw 本地网关状态可视化面板，实时展示系统健康情况和工作负载。

## 🚀 快速启动

```bash
# 1. 安装依赖
cd D:\AIworkspace\agentUI
npm install

# 2. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可看到面板。

## 📋 功能特性

- **模型状态卡片**：显示当前加载的模型信息（名称、量化方式、上下文窗口、供应商等）
- **活跃会话列表**：展示当前连接的用户/代理会话 ID、创建时间、最后活跃时间，支持状态过滤器
- **任务队列状态**：展示待处理、处理中、已完成、失败的任务数量，支持模型切换
- **网关健康指示**：绿/黄/红灯表示网关连通性、模型就绪状态、错误日志
- **日志流**：展示最近 20 条关键日志（模型调用、错误、警告），支持过滤器
- **自动刷新**：每 5 秒自动轮询更新状态
- **错误处理**：接口 404 显示"接口未开放"占位卡片，不崩溃

## ✨ 新增功能（v1.1.0）

- **会话过滤器**：支持按状态筛选（全部/在线/最近）
- **模型状态切换**：在任务队列中显示所有模型，可点击切换
- **任务详情优化**：添加任务来源说明和模型状态提示
- **日志时间范围**：支持按时间范围筛选日志

## 🛠️ 技术栈

- **前端框架**: React 18 + Hooks
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **API 调用**: fetch + 错误处理封装
- **状态管理**: React useState, useEffect

## 📡 API 端点

面板通过以下 OpenClaw 网关 API 获取数据：

- `GET /v1/models` - 模型列表
- `GET /sessions` - 会话列表 (可能 404)
- `GET /logs` - 日志流 (可能 404)
- `GET /` - 健康检查

## 🔧 API 调试指南

### 模型 API 响应格式

面板已适配多种响应格式：

1. **OpenAI 格式**: `{ data: [{ id, object, status, ... }] }`
2. **直接数组**: `[{ id, object, status, ... }]`
3. **HTML 响应**: 显示"网关 API 返回 HTML 格式"占位

### 错误处理

- **404**: 显示"接口未开放"占位卡片
- **HTML 响应**: 显示警告信息
- **网络错误**: 友好提示而非崩溃
- **超时**: 自动重试机制

## ⚠️ 错误处理

面板已做好完整的错误处理：

- **404**: 显示"接口未开放"占位卡片
- **超时**: 5 秒重试后显示错误信息
- **网络错误**: 友好提示而非崩溃
- **网关未启动**: 显示红灯和错误消息

## 📁 项目结构

```
agentUI/
├── src/
│   ├── components/        # UI 组件
│   │   ├── ModelStatus.jsx       # 模型状态卡片
│   │   ├── ActiveSessions.jsx    # 活跃会话列表
│   │   ├── TaskQueue.jsx         # 任务队列状态
│   │   ├── HealthIndicator.jsx   # 网关健康指示
│   │   └── LogStream.jsx         # 日志流
│   ├── utils/
│   │   ├── api.js           # API 调用封装 (checkHealth, getModels 等)
│   │   └── errors.js        # 错误处理
│   ├── hooks/
│   │   └── useGateway.jsx   # 网关状态 Hook
│   ├── constants/
│   │   ├── apiEndpoints.js  # API 端点常量
│   │   └── index.js         # 导出常量
│   ├── App.jsx              # 主应用组件
│   ├── main.jsx             # 入口文件
│   └── index.css            # 全局样式
├── package.json             # 依赖配置
├── vite.config.js           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
└── README.md                # 文档
```

## 🎨 设计说明

- **简洁卡片式布局**：每个功能模块独立卡片
- **状态色系统**：绿色（正常）、黄色（警告）、红色（异常）、灰色（未知）
- **响应式设计**：适配不同屏幕尺寸（grid-cols-1/2/3）
- **自动刷新**：无需手动操作
- **错误可视化**：错误信息友好展示，不中断体验

## 📝 开发说明

- **版本管理**: 使用 Git 进行版本管理
- **组件开发**: 每个开发阶段提交一次
- **组件独立**: 各组件独立开发，便于维护
- **中文注释**: 代码包含简洁中文注释
- **英文标识符**: 代码标识符和 API 字段名保留英文

## 🧪 本地测试

启动开发服务器后，访问 http://localhost:3000 查看：

1. **模型状态**：应显示当前加载的模型信息
2. **活跃会话**：显示当前会话列表
3. **任务队列**：显示模拟的任务统计数据
4. **健康指示**：显示网关连接状态
5. **日志流**：显示最新日志记录

## 🔧 配置说明

### 修改刷新间隔

编辑 `src/hooks/useGateway.jsx` 第一行：

```javascript
export function useGateway(enabled = true, interval = 5000) {
```

将 `interval = 5000` 改为需要的毫秒数（如 3000 表示 3 秒）。

### 修改网关地址

编辑 `src/constants/apiEndpoints.js`：

```javascript
export const GATEWAY_BASE_URL = 'http://127.0.0.1:18789'
```

## 📦 生产构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/` 目录。

## 🤝 贡献

欢迎提交 Issue 和 PR 来改进面板功能。

## 📄 许可证

MIT License

---

**最后更新**: 2026-05-06  
**版本**: 1.0.0  
**开发**: 西隆 (Java 开发专家)
