import React, { useState, useEffect } from 'react'

/**
 * 任务队列状态组件
 * 展示待处理、正在处理、已完成的消息数量
 */
export default function TaskQueue({ models, loading }) {
  // 任务状态
  const [tasks, setTasks] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  })
  
  // 模拟任务数据生成
  useEffect(() => {
    if (loading) return
    
    // 根据模型数量生成模拟任务
    generateMockTasks(models?.models || [])
    
    // 每 3 秒更新一次模拟数据
    const interval = setInterval(() => {
      if (loading) return
      generateMockTasks(models?.models || [])
    }, 3000)
    
    return () => clearInterval(interval)
  }, [loading, models])

  /**
   * 生成模拟任务数据
   * 根据模型状态和数量生成合理的任务分布
   */
  function generateMockTasks(models) {
    // 根据模型数量生成合理的任务数量
    const basePending = models.length > 0 ? Math.floor(Math.random() * 5) : 0
    const baseProcessing = Math.floor(Math.random() * 2)
    const baseCompleted = Math.floor(Math.random() * 10)
    
    // 如果模型已加载，增加一些任务
    if (models.length > 0 && models[0]?.status === 'loaded') {
      baseCompleted += Math.floor(Math.random() * 3)
    }
    
    setTasks({
      pending: basePending,
      processing: baseProcessing,
      completed: baseCompleted,
      failed: Math.floor(Math.random() * 2),
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">任务队列</h3>
            <p className="text-sm text-gray-500">消息处理状态</p>
          </div>
        </div>
      </div>

      {/* 任务统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <TaskStatCard 
          label="待处理" 
          count={tasks.pending} 
          color="yellow"
          icon="⏳"
        />
        <TaskStatCard 
          label="处理中" 
          count={tasks.processing} 
          color="blue"
          icon="⚙️"
        />
        <TaskStatCard 
          label="已完成" 
          count={tasks.completed} 
          color="green"
          icon="✅"
        />
        <TaskStatCard 
          label="失败" 
          count={tasks.failed} 
          color="red"
          icon="❌"
        />
      </div>

      {/* 模型状态切换 */}
      {models && models.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800">当前模型:</span>
              <div className="flex items-center space-x-2">
                {models.map((model, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      model === models[0] 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    onClick={() => {
                      console.log(`切换到模型：${model.id || index}`)
                      // 这里可以添加实际的模型切换逻辑
                    }}
                  >
                    {model.id || `模型 ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-blue-600">
              模型状态：{models[0]?.status === 'loaded' ? '已加载' : models[0]?.status || '加载中'}
            </span>
          </div>
        </div>
      )}

      {/* 任务详情 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">队列统计</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">总任务数</span>
            <span className="text-sm font-medium text-gray-900">
              {tasks.pending + tasks.processing + tasks.completed + tasks.failed}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (tasks.processing / Math.max(1, tasks.pending + tasks.processing)) * 100)}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            当前处理进度
          </p>
        </div>
        
        {/* 任务来源说明 */}
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            💡 <strong>提示:</strong> 当前任务数据为模拟数据。如需对接真实 API，请更新后端任务队列接口。
          </p>
        </div>
      </div>

      {/* 模拟任务列表 */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">最近任务</h4>
        <div className="space-y-2">
          {/* 待处理任务 */}
          {Array.from({ length: Math.min(tasks.pending, 3) }).map((_, i) => (
            <TaskItem 
              key={`pending-${i}`}
              status="pending"
              type="message"
              index={i + 1}
            />
          ))}
          
          {/* 处理中任务 */}
          {Array.from({ length: Math.min(tasks.processing, 2) }).map((_, i) => (
            <TaskItem 
              key={`processing-${i}`}
              status="processing"
              type="message"
              index={i + 1}
            />
          ))}
          
          {/* 已完成任务 */}
          {Array.from({ length: Math.min(tasks.completed, 3) }).map((_, i) => (
            <TaskItem 
              key={`completed-${i}`}
              status="completed"
              type="message"
              index={i + 1}
            />
          ))}
          
          {/* 失败任务 */}
          {Array.from({ length: Math.min(tasks.failed, 2) }).map((_, i) => (
            <TaskItem 
              key={`failed-${i}`}
              status="failed"
              type="message"
              index={i + 1}
            />
          ))}
        </div>
        
        {/* 空状态提示 */}
        {tasks.pending === 0 && tasks.processing === 0 && tasks.completed === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            暂无任务
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 任务统计卡片
 */
function TaskStatCard({ label, count, color, icon }) {
  const colorMap = {
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  }
  
  const style = colorMap[color] || colorMap.yellow
  
  return (
    <div className={`${style.bg} rounded-lg p-3 border ${style.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={style.text}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {count}
      </div>
    </div>
  )
}

/**
 * 任务项组件
 */
function TaskItem({ status, type, index }) {
  const statusConfig = {
    pending: { 
      label: '待处理', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200',
      icon: '⏳',
      dot: 'bg-yellow-500',
    },
    processing: { 
      label: '处理中', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      icon: '⚙️',
      dot: 'bg-blue-500',
    },
    completed: { 
      label: '已完成', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      icon: '✅',
      dot: 'bg-green-500',
    },
    failed: { 
      label: '失败', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      icon: '❌',
      dot: 'bg-red-500',
    },
  }
  
  const config = statusConfig[status]
  
  return (
    <div className={`${config.bg} rounded-lg p-2 border ${config.border} flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{config.icon}</span>
        <span className="text-sm text-gray-700">
          任务 #{index}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full ${config.dot}"></div>
        <span className="text-xs text-gray-600">{config.label}</span>
      </div>
    </div>
  )
}
