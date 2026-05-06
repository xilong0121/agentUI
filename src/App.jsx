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
  const pageTitle = health?.status === 'healthy' ? 'OpenClaw 状态面板 - 正常' : 'OpenClaw 状态面板 - 异常'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🐉</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OpenClaw 状态面板</h1>
                <p className="text-sm text-gray-500">
                  本地网关监控 · 实时任务队列 · 系统健康检查
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 状态指示器 */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                health?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                health?.status === 'unhealthy' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                <span className="text-lg">
                  {health?.status === 'healthy' ? '🟢' :
                   health?.status === 'unhealthy' ? '🔴' : '🟡'}
                </span>
                <span>
                  {health?.status === 'healthy' ? '运行正常' :
                   health?.status === 'unhealthy' ? '运行异常' : '检查中...'}
                </span>
              </div>
              
              {/* 刷新按钮 */}
              <button
                onClick={refresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="手动刷新"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 错误提示 */}
        {lastError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">检测到错误</p>
              <p className="text-sm text-red-700 mt-1">{lastError.message}</p>
            </div>
            <button 
              onClick={() => setLastError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 状态卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 第一列：模型状态 */}
          <div className="lg:col-span-1">
            <ModelStatus 
              model={currentModel}
              loading={loading}
            />
            
            {/* 网关健康指示 */}
            <div className="mt-6">
              <HealthIndicator 
                health={health}
                models={models}
                lastError={lastError}
              />
            </div>
          </div>
          
          {/* 第二列：活跃会话 */}
          <div className="lg:col-span-1">
            <ActiveSessions 
              sessions={sessions}
              loading={loading}
            />
          </div>
          
          {/* 第三列：任务队列 */}
          <div className="lg:col-span-1">
            <TaskQueue 
              models={models}
              loading={loading}
            />
          </div>
          
          {/* 第四列：日志流 (跨两列) */}
          <div className="lg:col-span-2">
            <LogStream 
              enabled={true}
              autoRefresh={true}
            />
          </div>
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <span className="font-medium">版本:</span> 1.0.0
              <span className="mx-2">|</span>
              <span>更新:</span> {health?.timestamp || '未知'}
            </div>
            <div>
              <span className="font-medium">网关:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{GATEWAY_BASE_URL}</code>
              <span className="mx-2">|</span>
              <span>刷新间隔:</span> 5 秒
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
