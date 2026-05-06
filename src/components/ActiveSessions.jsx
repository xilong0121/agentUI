import React from 'react'

/**
 * 活跃会话列表组件
 * 显示当前连接的用户/代理会话信息
 */
export default function ActiveSessions({ sessions, loading }) {
  // 如果没有会话数据，显示占位
  if (!sessions || sessions.sessionsCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xl">👥</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-700">活跃会话</h3>
            <p className="text-sm text-gray-500">暂无会话数据</p>
          </div>
        </div>
        
        {/* 接口未开放提示 */}
        {sessions?.note === '接口未开放' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ 会话列表接口未开放，无法获取会话信息
            </p>
          </div>
        )}
      </div>
    )
  }

  // 格式化日期时间函数
  function formatDate(date) {
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return '刚刚'
    }
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}分钟前`
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}小时前`
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}天前`
    }
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">活跃会话</h3>
            <p className="text-sm text-gray-500">
              共 {sessions.sessionsCount} 个会话
            </p>
          </div>
        </div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="text-sm text-blue-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>刷新中...</span>
            </div>
          </div>
        )}
      </div>

      {/* 会话列表 */}
      <div className="space-y-2">
        {sessions.sessions.map((session, index) => (
          <SessionCard key={index} session={session} />
        ))}
      </div>

      {/* 空列表提示 */}
      {sessions.sessionsCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">暂无活跃会话</p>
        </div>
      )}
    </div>
  )
}

/**
 * 会话卡片组件
 */
function SessionCard({ session }) {
  const createdAt = new Date(session.created_at || Date.now())
  const lastActive = new Date(session.last_active_at || Date.now())
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm text-blue-600">🔹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                会话 ID: {session.id || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                创建时间：{formatDate(createdAt)}
              </p>
            </div>
          </div>
          
          {/* 最后活跃时间 */}
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs text-green-600">🕐</span>
            </div>
            <p className="text-xs text-gray-600">
              最后活跃：{formatDate(lastActive)}
              <span className="text-green-600 font-medium"> (在线)</span>
            </p>
          </div>
        </div>
        
        {/* 会话状态指示器 */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">活跃</span>
        </div>
      </div>
    </div>
  )
}


