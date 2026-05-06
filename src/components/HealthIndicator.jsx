import React from 'react'

/**
 * 网关健康指示组件
 * 用绿/黄/红灯表示网关连通性、模型是否就绪、最近一次错误日志
 */
export default function HealthIndicator({ health, models, lastError }) {
  // 判断整体健康状态
  const overallStatus = getOverallStatus(health, models)
  const statusColor = getStatusColor(overallStatus)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            statusColor === 'green' ? 'bg-green-100' :
            statusColor === 'yellow' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <span className="text-2xl">
              {statusColor === 'green' ? '🟢' :
               statusColor === 'yellow' ? '🟡' : '🔴'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">网关健康状态</h3>
            <p className="text-sm text-gray-500">
              {overallStatus === 'healthy' ? '系统运行正常' :
               overallStatus === 'warning' ? '存在潜在问题' : '系统异常'}
            </p>
          </div>
        </div>
      </div>

      {/* 状态指示器网格 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <HealthItem 
          label="网关连通性"
          status={health?.status || 'unknown'}
          color={health?.status === 'healthy' ? 'green' : health?.status === 'unhealthy' ? 'red' : 'gray'}
          icon={health?.status === 'healthy' ? '🌐' : health?.status === 'unhealthy' ? '🚫' : '❓'}
        />
        
        <HealthItem 
          label="模型就绪"
          status={models?.modelsCount > 0 ? 'ready' : 'unready'}
          color={models?.modelsCount > 0 ? 'green' : 'red'}
          icon={models?.modelsCount > 0 ? '🧠' : '⏳'}
        />
        
        <HealthItem 
          label="错误日志"
          status={lastError?.status || 'none'}
          color={lastError?.status ? 'red' : 'gray'}
          icon={lastError?.status ? '⚠️' : '✓'}
        />
        
        <HealthItem 
          label="自动刷新"
          status="enabled"
          color="green"
          icon="🔄"
        />
      </div>

      {/* 状态详情 */}
      <div className="space-y-2 text-sm">
        <HealthDetailRow label="网关状态" value={health?.status || '未知'} />
        <HealthDetailRow label="网关消息" value={health?.message || 'N/A'} />
        <HealthDetailRow label="运行时间" value={health?.uptime || '未知'} />
        <HealthDetailRow label="最后检查" value={formatTimestamp(health?.timestamp)} />
      </div>

      {/* 错误信息 */}
      {lastError && (
        <div className={`mt-4 p-3 rounded-lg border ${
          lastError.status === 404 ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 mb-1">
                {lastError.status === 404 ? '接口未开放' : '检测到错误'}
              </p>
              <p className="text-xs text-gray-600">{lastError.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 健康状态图例 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">状态图例</h4>
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <LegendItem color="green" icon="🟢" label="正常" />
          <LegendItem color="yellow" icon="🟡" label="警告" />
          <LegendItem color="red" icon="🔴" label="异常" />
          <LegendItem color="gray" icon="⚪" label="未知" />
        </div>
      </div>
    </div>
  )
}

/**
 * 获取整体状态
 */
function getOverallStatus(health, models) {
  // 如果网关不健康，直接返回异常
  if (health?.status === 'unhealthy') {
    return 'error'
  }
  
  // 如果模型未就绪且存在错误
  if (models?.modelsCount === 0 && lastError) {
    return 'error'
  }
  
  // 如果有错误日志
  if (lastError) {
    if (lastError.status === 404) {
      return 'warning'
    }
    return 'error'
  }
  
  // 全部正常
  return 'healthy'
}

/**
 * 获取状态颜色
 */
function getStatusColor(status) {
  switch (status) {
    case 'healthy':
    case 'ready':
      return 'green'
    case 'warning':
    case 'unhealthy':
    case 'unready':
      return 'yellow'
    case 'error':
      return 'red'
    default:
      return 'gray'
  }
}

/**
 * 健康项组件
 */
function HealthItem({ label, status, color, icon }) {
  const colorMap = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${colorMap[color] || 'bg-gray-400'}`}></div>
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <span className="text-sm text-gray-500">{icon}</span>
    </div>
  )
}

/**
 * 健康详情行
 */
function HealthDetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">
        {value || 'N/A'}
      </span>
    </div>
  )
}

/**
 * 图例项
 */
function LegendItem({ color, icon, label }) {
  const colorMap = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${colorMap[color]}`}></div>
      <span>{icon}</span>
      <span className="ml-1">{label}</span>
    </div>
  )
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '未知'
  
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
