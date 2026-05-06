import React from 'react'

/**
 * 活跃会话列表组件
 * 显示当前连接的用户/代理会话信息
 */
export default function ActiveSessions({ sessions, loading }) {
  // 会话过滤器状态
  const [filter, setFilter] = React.useState('all') // all, online, recent
  const [showCreatedTime, setShowCreatedTime] = React.useState(false)

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

      {/* 过滤器 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          {/* 状态过滤器 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">状态:</span>
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="online">在线</option>
              <option value="recent">最近</option>
            </select>
          </div>
          
          {/* 显示创建时间切换 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCreatedTime}
              onChange={(e) => setShowCreatedTime(e.target.value)}
              className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">显示创建时间</span>
          </label>
        </div>
        
        {/* 过滤器说明 */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {filter === 'online' && '筛选在线会话（1 小时内活跃）'}
            {filter === 'recent' && '筛选最近会话（24 小时内活跃）'}
            {filter === 'all' && '显示所有会话'}
          </p>
        </div>
      </div>

      {/* 会话列表 */}
      <div className="space-y-2">
        {sessions.sessions
          .filter((session) => {
            // 状态过滤
            if (filter === 'all') return true
            if (filter === 'online') {
              const lastActive = new Date(session.last_active_at || Date.now())
              const now = new Date()
              const diffHours = (now - lastActive) / (1000 * 60 * 60)
              return diffHours < 1
            }
            if (filter === 'recent') {
              const lastActive = new Date(session.last_active_at || Date.now())
              const now = new Date()
              const diffHours = (now - lastActive) / (1000 * 60 * 60)
              return diffHours < 24
            }
            return true
          })
          .map((session, index) => (
          <SessionCard key={index} session={session} showCreatedTime={showCreatedTime} />
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
function SessionCard({ session, showCreatedTime = false }) {
  const createdAt = new Date(session.created_at || Date.now())
  const lastActive = new Date(session.last_active_at || Date.now())
  
  // 根据最后活跃时间判断状态
  const diffHours = (Date.now() - lastActive) / (1000 * 60 * 60)
  const isOnline = diffHours < 1
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <span className="text-sm text-blue-600">🔹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                会话 ID: {session.id || 'N/A'}
              </p>
              {showCreatedTime && (
                <p className="text-xs text-gray-500">
                  创建时间：{formatDate(createdAt)}
                </p>
              )}
            </div>
          </div>
          
          {/* 最后活跃时间 */}
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <span className={`text-xs ${
                isOnline ? 'text-green-600' : 'text-blue-600'
              }`}>
                {isOnline ? '🕐' : '🕐'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              最后活跃：{formatDate(lastActive)}
              <span className={`${isOnline ? 'text-green-600' : 'text-blue-600'} font-medium`}>
                {isOnline ? ' (在线)' : ' (离线)'}
              </span>
            </p>
          </div>
        </div>
        
        {/* 会话状态指示器 */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className={`text-xs ${
            isOnline ? 'text-green-600' : 'text-gray-600'
          }`}>
            {isOnline ? '活跃' : '离线'}
          </span>
        </div>
      </div>
    </div>
  )
}


