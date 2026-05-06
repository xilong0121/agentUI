/**
 * OpenClaw 网关 API 端点常量
 * 所有 API 调用都使用这些常量，便于统一管理和维护
 */
export const GATEWAY_BASE_URL = 'http://127.0.0.1:18789'

export const endpoints = {
  // 模型状态接口
  models: `${GATEWAY_BASE_URL}/v1/models`,
  
  // 会话列表接口 (可能 404)
  sessions: `${GATEWAY_BASE_URL}/sessions`,
  
  // 日志接口 (可能 404)
  logs: `${GATEWAY_BASE_URL}/logs`,
  
  // 网关健康检查
  health: `${GATEWAY_BASE_URL}/health`,
  root: `${GATEWAY_BASE_URL}/`,
}

export const apiKeys = {
  // API 响应字段映射
  modelInfo: ['id', 'object', 'created', 'owned_by', 'status'],
  sessionInfo: ['id', 'created_at', 'last_active_at'],
  logEntry: ['timestamp', 'level', 'message', 'error'],
}
