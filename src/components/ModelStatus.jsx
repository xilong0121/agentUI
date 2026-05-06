import React from 'react'

/**
 * 模型状态卡片组件
 * 显示当前加载的模型信息
 */
export default function ModelStatus({ model, loading }) {
  // 如果没有模型数据，显示占位
  if (!model) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xl">📦</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-700">模型状态</h3>
            <p className="text-sm text-gray-500">暂无数据</p>
          </div>
        </div>
      </div>
    )
  }

  const modelInfo = model
  const statusColor = getStatusColor()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            modelInfo.status === 'not_loaded' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <span className="text-2xl">
              {modelInfo.status === 'not_loaded' ? '⏳' : '🧠'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">模型信息</h3>
            <p className="text-xs text-gray-500">当前加载模型</p>
          </div>
        </div>
        
        {/* 加载状态指示 */}
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>加载中...</span>
          </div>
        )}
      </div>

      {/* 模型详情卡片 */}
      <div className="space-y-3">
        <ModelDetailRow label="模型 ID" value={modelInfo.id || 'N/A'} />
        <ModelDetailRow label="模型状态" value={
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            modelInfo.status === 'not_loaded' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {modelInfo.status === 'not_loaded' ? '未加载' : '已加载'}
          </span>
        } />
        <ModelDetailRow label="量化方式" value={modelInfo.details?.quantization || '未知'} />
        <ModelDetailRow label="上下文窗口" value={modelInfo.details?.context_window_size || '未知'} />
        <ModelDetailRow label="供应商" value={modelInfo.details?.vendor || modelInfo.owned_by || '未知'} />
        <ModelDetailRow label="创建时间" value={formatTimestamp(modelInfo.created)} />
      </div>

      {/* 模型元数据 */}
      {modelInfo.details && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">模型元数据</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {modelInfo.details.parameters && (
              <DetailItem label="参数量" value={modelInfo.details.parameters} />
            )}
            {modelInfo.details.family && (
              <DetailItem label="模型系列" value={modelInfo.details.family} />
            )}
            {modelInfo.details.huggingface && (
              <DetailItem label="HuggingFace" value={modelInfo.details.huggingface} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 模型详情行组件
 */
function ModelDetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900 text-right flex-1 ml-2">
        {value}
      </span>
    </div>
  )
}

/**
 * 详情项组件
 */
function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700 truncate" title={value}>{value}</span>
    </div>
  )
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '未知'
  
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
