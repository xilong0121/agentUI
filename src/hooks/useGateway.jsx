import { useState, useEffect, useCallback } from 'react'
import {
  checkHealth,
  getModels,
  getSessions,
  getLogs,
  formatError,
} from '../utils/api.js'
import { endpoints } from '../constants/apiEndpoints.js'

/**
 * useGateway Hook
 * 封装所有网关 API 调用和状态管理
 */
export function useGateway(enabled = true, interval = 5000) {
  // 状态初始化
  const [health, setHealth] = useState(null)
  const [models, setModels] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [logs, setLogs] = useState([])
  const [lastError, setLastError] = useState(null)
  const [loading, setLoading] = useState(true)

  // 刷新数据
  const refresh = useCallback(async () => {
    if (!enabled) return
    
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
      
      // 更新健康状态
      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value)
      } else {
        setLastError(formatError(new Error(healthData.reason)))
      }
      
      // 更新模型数据
      if (modelsData.status === 'fulfilled') {
        setModels(modelsData.value)
      }
      
      // 更新会话数据
      if (sessionsData.status === 'fulfilled') {
        setSessions(sessionsData.value)
      }
      
      // 更新日志
      if (logsData.status === 'fulfilled') {
        setLogs(logsData.value.logs || [])
      }
      
    } catch (error) {
      setLastError(formatError(error))
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // 初始化加载
  useEffect(() => {
    if (!enabled) return
    
    refresh()
    
    // 设置自动刷新间隔
    const intervalId = setInterval(refresh, interval)
    
    return () => clearInterval(intervalId)
  }, [refresh, interval, enabled])

  // 获取当前模型信息
  const getCurrentModel = useCallback(() => {
    if (!models || !models.models || models.models.length === 0) {
      return null
    }
    
    // 返回第一个已加载的模型
    const loadedModel = models.models.find(m => m.status === 'not_loaded') || models.models[0]
    return loadedModel
  }, [models])

  // 获取状态颜色
  const getStatusColor = useCallback((status) => {
    if (!status) return 'gray'
    
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ready':
        return 'green'
      case 'unhealthy':
      case 'unready':
        return 'red'
      case 'warning':
        return 'yellow'
      default:
        return 'gray'
    }
  }, [])

  // 获取网关状态
  const getGatewayStatus = useCallback(() => {
    if (!health) return 'unknown'
    
    return health.status === 'healthy' ? 'online' : 'offline'
  }, [health])

  // 获取模型状态颜色
  const getModelStatusColor = useCallback((model) => {
    if (!model) return 'gray'
    
    switch (model.status?.toLowerCase()) {
      case 'not_loaded':
      case 'loading':
        return 'yellow'
      case 'loaded':
        return 'green'
      default:
        return 'gray'
    }
  }, [])

  // 获取错误消息
  const getErrorMessage = useCallback((error) => {
    if (!error) return '无错误'
    
    if (error.status === 404) {
      return '接口未开放'
    }
    
    if (error.message) {
      return error.message.substring(0, 100) + (error.message.length > 100 ? '...' : '')
    }
    
    return '未知错误'
  }, [])

  // 获取会话状态颜色
  const getSessionStatusColor = useCallback((session) => {
    if (!session) return 'gray'
    
    // 根据最后活跃时间判断
    const lastActive = new Date(session.last_active_at || Date.now())
    const now = new Date()
    const diffHours = (now - lastActive) / (1000 * 60 * 60)
    
    if (diffHours < 1) return 'green' // 1 小时内
    if (diffHours < 24) return 'blue' // 24 小时内
    return 'gray'
  }, [])

  return {
    // 基础状态
    health,
    models,
    sessions,
    logs,
    lastError,
    loading,
    
    // 操作方法
    refresh,
    
    // 辅助函数
    getCurrentModel,
    getStatusColor,
    getModelStatusColor,
    getSessionStatusColor,
    getGatewayStatus,
    formatError,
  }
}
