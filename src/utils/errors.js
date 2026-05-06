/**
 * 错误处理工具函数
 * 用于格式化、分类和显示错误信息
 */

/**
 * 错误类型枚举
 */
export const ErrorType = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  NOT_FOUND: 'not_found',
  SERVER_ERROR: 'server_error',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  UNKNOWN: 'unknown',
}

/**
 * 错误级别枚举
 */
export const ErrorLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
}

/**
 * 格式化错误信息
 * @param {Error|object} error - 错误对象
 * @returns {object} 格式化后的错误信息
 */
export function formatError(error) {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      level: ErrorLevel.INFO,
      message: '无错误',
      stack: '',
    }
  }

  const status = error.status || error.response?.status
  const message = error.message || error.message || '未知错误'

  // 根据状态码分类错误类型
  let type = ErrorType.UNKNOWN
  if (status === 404) {
    type = ErrorType.NOT_FOUND
  } else if (status === 401) {
    type = ErrorType.UNAUTHORIZED
  } else if (status === 403) {
    type = ErrorType.FORBIDDEN
  } else if (status >= 500) {
    type = ErrorType.SERVER_ERROR
  } else if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    type = ErrorType.TIMEOUT
  } else if (message.includes('network') || message.includes('fetch')) {
    type = ErrorType.NETWORK
  }

  // 截断长消息
  const shortMessage = message.length > 100 
    ? message.substring(0, 100) + '...' 
    : message

  return {
    type,
    level: status >= 500 ? ErrorLevel.ERROR : ErrorLevel.INFO,
    message: shortMessage,
    fullMessage: message,
    status,
    stack: error.stack || '',
    timestamp: new Date().toISOString(),
  }
}

/**
 * 判断错误是否可恢复
 * @param {Error|object} error - 错误对象
 * @returns {boolean} 是否可恢复
 */
export function isRetryableError(error) {
  const formatted = formatError(error)
  
  // 网络错误或超时可重试
  if (formatted.type === ErrorType.NETWORK || 
      formatted.type === ErrorType.TIMEOUT) {
    return true
  }
  
  // 404 不可重试（接口未开放）
  if (formatted.type === ErrorType.NOT_FOUND) {
    return false
  }
  
  // 其他错误不重试
  return false
}

/**
 * 获取错误提示文本
 * @param {Error|object} error - 错误对象
 * @returns {string} 用户友好的错误提示
 */
export function getErrorMessage(error) {
  const formatted = formatError(error)
  
  switch (formatted.type) {
    case ErrorType.NOT_FOUND:
      return '⚠️ 接口未开放'
    case ErrorType.UNAUTHORIZED:
      return '🔒 需要认证'
    case ErrorType.FORBIDDEN:
      return '🚫 权限不足'
    case ErrorType.TIMEOUT:
      return '⏱️ 请求超时，请检查网络连接'
    case ErrorType.NETWORK:
      return '🌐 网络连接错误'
    case ErrorType.SERVER_ERROR:
      return '🔴 服务器错误，请稍后重试'
    case ErrorType.UNKNOWN:
    default:
      return formatted.message || '未知错误'
  }
}

/**
 * 获取错误图标
 * @param {Error|object} error - 错误对象
 * @returns {string} 错误图标
 */
export function getErrorIcon(error) {
  const formatted = formatError(error)
  
  const iconMap = {
    [ErrorType.NETWORK]: '🌐',
    [ErrorType.TIMEOUT]: '⏱️',
    [ErrorType.NOT_FOUND]: '❓',
    [ErrorType.SERVER_ERROR]: '🔴',
    [ErrorType.UNAUTHORIZED]: '🔒',
    [ErrorType.FORBIDDEN]: '🚫',
    [ErrorType.UNKNOWN]: '⚠️',
  }
  
  return iconMap[formatted.type] || '⚠️'
}

/**
 * 错误日志记录器
 * @param {Error|object} error - 错误对象
 * @param {string} context - 错误上下文
 */
export function logError(error, context = '') {
  console.error(`[Error ${context}]:`, formatError(error))
}
