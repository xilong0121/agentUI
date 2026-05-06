import { endpoints } from '../constants/apiEndpoints.js'

/**
 * API 请求封装函数
 * @param {string} endpoint - API 端点
 * @param {object} options - fetch 选项
 * @returns {Promise<Response>}
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
    const response = await apiRequest(endpoints.root, {
      method: 'GET',
    })
    
    return {
      status: 'healthy',
      message: '网关运行正常',
      uptime: response.uptime || '未知',
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
 */
export async function getModels() {
  try {
    const data = await apiRequest(endpoints.models)
    return {
      success: true,
      models: data.data || [],
      modelsCount: data.data?.length || 0,
    }
  } catch (error) {
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
    const data = await apiRequest(endpoints.sessions)
    return {
      success: true,
      sessions: data.sessions || [],
      sessionsCount: data.sessions?.length || 0,
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
    const data = await apiRequest(endpoints.logs)
    return {
      success: true,
      logs: data.logs || [],
      logsCount: data.logs?.length || 0,
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
