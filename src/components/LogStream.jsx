import React, { useState, useEffect } from 'react'
import { getLogs } from '../utils/api.js'

/**
 * 日志流组件
 * 展示最近 20 条关键日志（模型调用、错误、警告）
 */
export default function LogStream({ enabled = true, autoRefresh = true }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, error, warn, info
  const [maxLines, setMaxLines] = useState(20)

  /**
   * 获取日志
   */
  const fetchLogs = async () => {
    setLoading(true)
    
    try {
      const data = await getLogs()
      
      if (data.success && data.logs) {
        // 过滤日志级别
        let filteredLogs = data.logs
        
        if (filter === 'error') {
          filteredLogs = data.logs.filter(log => 
            log.level?.toLowerCase().includes('error') ||
            log.message?.toLowerCase().includes('error')
          )
        } else if (filter === 'warn') {
          filteredLogs = data.logs.filter(log => 
            log.level?.toLowerCase().includes('warn') ||
            log.message?.toLowerCase().includes('warn')
          )
        } else if (filter === 'info') {
          filteredLogs = data.logs.filter(log => 
            log.level?.toLowerCase().includes('info')
          )
        }
        
        // 限制行数
        setLogs(filteredLogs.slice(-maxLines))
      }
      
    } catch (error) {
      console.error('[LogStream] fetch error:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * 初始化加载
   */
  useEffect(() => {
    fetchLogs()
  }, [])

  /**
   * 自动刷新
   */
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  /**
   * 日志级别颜色映射
   */
  const logLevelColors = {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'gray',
  }

  /**
   * 日志级别图标
   */
  const logLevelIcons = {
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🔍',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📜</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800">系统日志</h3>
            <p className="text-sm text-gray-500">
              最近 {maxLines} 条日志记录
            </p>
          </div>
        </div>
        
        {/* 过滤器 */}
        <div className="flex items-center space-x-2">
          <select 
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">全部日志</option>
            <option value="error">错误</option>
            <option value="warn">警告</option>
            <option value="info">信息</option>
          </select>
          
          {/* 加载状态 */}
          {loading && (
            <div className="text-sm text-blue-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>加载中...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="mb-2">暂无日志记录</p>
            <p className="text-xs">日志将在获取到数据后显示</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <LogEntry key={index} log={log} />
            ))}
          </div>
        )}
        
        {/* 接口未开放提示 */}
        {!logs.length && !loading && (
          <div className="text-center text-gray-400 py-8">
            <p className="mb-2">🔌 接口未开放</p>
            <p className="text-xs">日志接口暂时不可用</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 flex items-center space-x-2">
        <button 
          onClick={fetchLogs}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          刷新日志
        </button>
        
        <button 
          onClick={() => setMaxLines(Math.max(10, maxLines - 10))}
          disabled={maxLines <= 10}
          className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          减少行数
        </button>
        
        <button 
          onClick={() => setMaxLines(Math.min(100, maxLines + 10))}
          disabled={maxLines >= 100}
          className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          增加行数
        </button>
      </div>
    </div>
  )
}

/**
 * 日志条目组件
 */
function LogEntry({ log }) {
  const level = log.level || 'info'
  const color = logLevelColors[level] || 'gray'
  const icon = logLevelIcons[level] || 'ℹ️'
  
  return (
    <div className={`flex items-start space-x-2 ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'blue' ? 'text-blue-400' : 'text-gray-300'}`}>
      <span className="text-xs whitespace-nowrap">{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
      <span className="text-xs">{icon}</span>
      <span className="flex-1">{log.message || log.text || 'N/A'}</span>
    </div>
  )
}
