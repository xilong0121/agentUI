import React, { useState } from 'react'
import { useGateway } from './hooks/useGateway'
import ModelStatus from './components/ModelStatus'
import ActiveSessions from './components/ActiveSessions'
import TaskQueue from './components/TaskQueue'
import HealthIndicator from './components/HealthIndicator'
import LogStream from './components/LogStream'
import { GATEWAY_BASE_URL } from './constants/apiEndpoints.js'

/**
 * 主应用组件
 * OpenClaw 状态可视化面板
 */
function App() {
  // 使用网关状态 Hook
  const {
    health,
    models,
    sessions,
    logs,
    lastError,
    loading,
    refresh,
    getCurrentModel,
    getStatusColor,
    getErrorMessage,
  } = useGateway(enabled = true, interval = 5000)

  // 获取当前模型信息
  const currentModel = getCurrentModel()

  // 页面标题
  const pageTitle = health?.status === 'healthy' ? '状态面板' : '系统异常'

  // 性能优化：防抖函数
  const debouncedRefresh = React.useCallback(
    debounce(refresh, 1000),
    [refresh]
  )

  // 处理页面错误
  const [error, setError] = useState(null)

  React.useEffect(() => {
    if (lastError) {
      setError(getErrorMessage(lastError))
    } else {
      setError(null)
    }
  }, [lastError, getErrorMessage])

  // 错误处理
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ 系统错误</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={debouncedRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 主界面
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500">OpenClaw 状态面板</p>
          </div>
          <div className="text-sm text-gray-500">
            网关地址：{GATEWAY_BASE_URL}
          </div>
        </div>

        {/* 网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-2">
            <ModelStatus models={models} loading={loading} />
          </div>
          <div>
            <HealthIndicator health={health} loading={loading} />
          </div>
          <div>
            <ActiveSessions sessions={sessions} loading={loading} />
          </div>
          <div>
            <TaskQueue models={models} loading={loading} />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <LogStream enabled={true} autoRefresh={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
