import { endpoints } from '../constants/apiEndpoints.js'

/**
 * API 请求封装函数
 * @param {string} endpoint - API 端点
 * @param {object} options - fetch 选项
 * @returns {Promise<Response|object>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : endpoints[endpoint] || endpoint
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    })
    
    const duration = Date.now() - startTime
    
    // 记录请求时间 (用于调试)
    console.log(`[API] ${endpoint} ${response.status} ${duration}ms`)
    
    if (!response.ok) {
      // 尝试解析错误信息
      let errorBody = '未知错误'
      try {
        const errorText = await response.text()
        errorBody = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText
      } catch {
        errorBody = `HTTP ${response.status}`
      }
      
      throw new ApiError(response.status, endpoint, errorBody)
    }
    
    // 返回 JSON 响应
    const data = await response.json()
    return data
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // 网络错误或其他异常
    throw new ApiError(0, endpoint, `网络错误：${error.message}`)
  }
}

/**
 * 健康检查 API (简化版)
 */
export async function checkHealth() {
  try {
    const response = await fetch(endpoints.root, {
      headers: {
        'Accept': 'text/html,application/json',
      },
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, endpoints.root, '健康检查失败')
    }
    
    // 网关可能返回 HTML 或 JSON
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      // 如果是 HTML，尝试解析
      const htmlText = await response.text()
      data = {
        status: 'healthy',
        uptime: '未知',
        timestamp: new Date().toISOString(),
      }
    }
    
    return {
      status: 'healthy',
      message: '网关运行正常',
      uptime: data.uptime || '未知',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message || '无法连接到网关',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * 获取模型列表
 * 处理两种响应格式：OpenAI 格式和网关 HTML 格式
 */
export async function getModels() {
  try {
    const response = await fetch(endpoints.models, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    // 检查响应状态
    if (!response.ok) {
      throw new ApiError(response.status, endpoints.models, '模型列表请求失败')
    }
    
    // 检查响应类型
    const contentType = response.headers.get('content-type')
    
    // 如果是 HTML 响应（网关返回 HTML），显示占位
    if (contentType && contentType.includes('text/html')) {
      console.warn('[getModels] 检测到 HTML 响应，网关 API 可能未正确配置')
      return {
        success: true,
        models: [],
        modelsCount: 0,
        note: '网关 API 返回 HTML 格式',
      }
    }
    
    // 正常 JSON 响应
    const data = await response.json()
    
    // 处理不同的响应格式
    // 格式 1: { data: [{ id: '...', object: '...', status: '...', ... }] }
    // 格式 2: [{ id: '...', object: '...', status: '...', ... }]
    const models = data.data || data || []
    
    return {
      success: true,
      models: models,
      modelsCount: models.length,
    }
    
  } catch (error) {
    // 如果接口不存在或其他错误
    if (error.status === 404) {
      console.warn('[getModels] 接口 404，返回占位数据')
      return {
        success: true,
        models: [],
        modelsCount: 0,
        note: '接口未开放',
      }
    }
    
    return {
      success: false,
      error: error.message,
      status: error.status || 'unknown',
    }
  }
}

/**
 * 获取会话列表
 */
export async function getSessions() {
  try {
    const response = await fetch(endpoints.sessions, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, endpoints.sessions, '会话列表请求失败')
    }
    
    // 接口可能 404
    if (response.status === 404) {
      console.info('[getSessions] 接口未开放，返回空列表')
      return {
        success: true,
        sessions: [],
        sessionsCount: 0,
        note: '接口未开放',
      }
    }
    
    const data = await response.json()
    
    // 处理不同的响应格式
    const sessions = data.sessions || data || []
    
    return {
      success: true,
      sessions: sessions,
      sessionsCount: sessions.length,
    }
    
  } catch (error) {
    // 如果接口不存在 (404)，返回空列表而非错误
    if (error.status === 404) {
      return {
        success: true,
        sessions: [],
        sessionsCount: 0,
        note: '接口未开放',
      }
    }
    
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 获取日志
 */
export async function getLogs() {
  try {
    const response = await fetch(endpoints.logs, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, endpoints.logs, '日志请求失败')
    }
    
    // 接口可能 404
    if (response.status === 404) {
      console.info('[getLogs] 接口未开放，返回空列表')
      return {
        success: true,
        logs: [],
        logsCount: 0,
        note: '接口未开放',
      }
    }
    
    const data = await response.json()
    
    // 处理不同的响应格式
    const logs = data.logs || data || []
    
    return {
      success: true,
      logs: logs,
      logsCount: logs.length,
    }
    
  } catch (error) {
    // 如果接口不存在 (404)，返回空列表而非错误
    if (error.status === 404) {
      return {
        success: true,
        logs: [],
        logsCount: 0,
        note: '接口未开放',
      }
    }
    
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(status, endpoint, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

/**
 * 格式化错误信息
 */
export function formatError(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status || 'unknown',
      endpoint: error.endpoint,
      message: error.message,
      type: 'api',
    }
  }
  
  return {
    status: 'network',
    endpoint: 'N/A',
    message: error.message,
    type: 'network',
  }
}
