import { useState, useEffect, useCallback } from 'react'
import { checkHealth, getModels, getSessions, getLogs, formatError } from '../utils/api.js'

/**
 * 网关状态 Hook
 * 封装所有网关状态获取逻辑，包括自动重试和错误处理
 * @param {boolean} enabled - 是否启用自动刷新
 * @param {number} interval - 刷新间隔 (毫秒)
 * @returns {object} 包含所有状态数据和方法
 */
export function useGateway(enabled = true, interval = 5000) {
  const [health, setHealth] = useState(null)
  const [models, setModels] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [logs, setLogs] = useState(null)
  const [lastError, setLastError] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * 获取所有状态数据
   */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setLastError(null)
    
    try {
      // 并行获取所有数据
      const [healthData, modelsData, sessionsData, logsData] = await Promise.allSettled([
        checkHealth(),
        getModels(),
        getSessions(),
        getLogs(),
      ])
      
      // 处理健康检查
      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value)
      } else {
        setHealth({ status: 'unhealthy', message: healthData.reason?.message || '健康检查失败' })
        setLastError(formatError(healthData.reason))
      }
      
      // 处理模型数据
      if (modelsData.status === 'fulfilled') {
        setModels(modelsData.value)
      } else {
        setModels({ models: [], modelsCount: 0, error: modelsData.reason?.message || '获取模型失败' })
        setLastError(formatError(modelsData.reason))
      }
      
      // 处理会话数据
      if (sessionsData.status === 'fulfilled') {
        setSessions(sessionsData.value)
      } else {
        setSessions({ sessions: [], sessionsCount: 0, note: sessionsData.reason?.message || '获取会话失败' })
      }
      
      // 处理日志数据
      if (logsData.status === 'fulfilled') {
        setLogs(logsData.value)
      } else {
        setLogs({ logs: [], logsCount: 0, note: logsData.reason?.message || '获取日志失败' })
      }
      
    } catch (error) {
      console.error('[Gateway Hook] fetchAll error:', error)
      setLastError(formatError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 初始化获取
   */
  useEffect(() => {
    if (enabled) {
      fetchAll()
      
      // 设置自动刷新定时器
      const timer = setInterval(() => {
        fetchAll()
      }, interval)
      
      return () => {
        clearInterval(timer)
      }
    }
  }, [enabled, interval, fetchAll])

  /**
   * 手动刷新
   */
  const refresh = useCallback(() => {
    fetchAll()
  }, [fetchAll])

  /**
   * 获取当前模型信息
   */
  const getCurrentModel = useCallback(() => {
    if (!models || !models.models || models.models.length === 0) {
      return null
    }
    
    // 假设第一个模型是当前加载的模型
    return models.models[0]
  }, [models])

  /**
   * 获取网关状态颜色
   */
  const getStatusColor = useCallback(() => {
    if (!health) return 'gray'
    
    switch (health.status) {
      case 'healthy':
        return 'green'
      case 'unhealthy':
        return 'red'
      default:
        return 'gray'
    }
  }, [health])

  /**
   * 获取错误消息
   */
  const getErrorMessage = useCallback(() => {
    if (!lastError) return null
    
    // 根据错误状态返回不同的错误消息
    switch (lastError.status) {
      case 404:
        return '接口未开放'
      case 401:
        return '认证失败'
      case 403:
        return '权限不足'
      case 408:
        return '请求超时'
      case 422:
        return '请求无效'
      case 500:
        return '服务器内部错误'
      case 502:
        return '网关错误'
      case 503:
        return '服务不可用'
      case 504:
        return '网关超时'
      default:
        return lastError.message
    }
  }, [lastError])

  return {
    // 状态数据
    health,
    models,
    sessions,
    logs,
    lastError,
    loading,
    
    // 方法
    fetchAll,
    refresh,
    getCurrentModel,
    getStatusColor,
    getErrorMessage,
    getStatusColor,
  }
}
