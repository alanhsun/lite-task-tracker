import { useState, useCallback, useEffect } from 'react';
import { tasksApi } from '../api';
import { useTasks, useTags } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import TagManager from '../components/TagManager';
import KanbanBoard from '../components/KanbanBoard';

export default function Dashboard() {
  const [filters, setFilters] = useState({ sort: 'created_at', order: 'desc', page: 1, limit: 20 });
  const { tasks, pagination, loading, refetch } = useTasks(filters);
  const { tags, refetch: refetchTags } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // For kanban view, fetch more tasks with no status filter
  const kanbanFilters = { ...filters, limit: 100, status: '' };
  const { tasks: kanbanTasks, loading: kanbanLoading, refetch: kanbanRefetch } = useTasks(
    viewMode === 'kanban' ? kanbanFilters : null
  );

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, data);
      } else {
        await tasksApi.create(data);
      }
      setShowForm(false);
      setEditingTask(null);
      refetch();
      if (viewMode === 'kanban') kanbanRefetch();
      refetchTags();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tasksApi.update(id, { status });
      refetch();
      if (viewMode === 'kanban') kanbanRefetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (action, value) => {
    if (selectedIds.length === 0) return;
    setBatchLoading(true);
    try {
      await tasksApi.batch({ action, ids: selectedIds, value });
      setSelectedIds([]);
      refetch();
      if (viewMode === 'kanban') kanbanRefetch();
      refetchTags();
    } catch (err) {
      alert(err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Summary counts (use kanban tasks when in kanban mode for accurate totals)
  const activeTasks = viewMode === 'kanban' ? kanbanTasks : tasks;
  const todoCnt = activeTasks.filter((t) => t.status === 'todo').length;
  const inProgressCnt = activeTasks.filter((t) => t.status === 'in_progress').length;
  const doneCnt = activeTasks.filter((t) => t.status === 'done').length;

  return (
    <div className={`dashboard ${viewMode === 'kanban' ? 'kanban-mode' : ''}`}>
      {/* Sidebar — hidden in kanban mode via CSS */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>AgentTODO</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => setFilters({ ...filters, status: '', page: 1 })}>
            <span className="nav-icon">📋</span>
            <span>全部任务</span>
            <span className="nav-badge">{pagination.total}</span>
          </button>
          <button className="nav-item" onClick={() => setFilters({ ...filters, status: 'todo', page: 1 })}>
            <span className="nav-icon">○</span>
            <span>待办</span>
          </button>
          <button className="nav-item" onClick={() => setFilters({ ...filters, status: 'in_progress', page: 1 })}>
            <span className="nav-icon">◐</span>
            <span>进行中</span>
          </button>
          <button className="nav-item" onClick={() => setFilters({ ...filters, status: 'done', page: 1 })}>
            <span className="nav-icon">●</span>
            <span>已完成</span>
          </button>
        </nav>

        <div className="sidebar-section">
          <button className="nav-item" onClick={() => setShowTags(!showTags)}>
            <span className="nav-icon">🏷️</span>
            <span>标签管理</span>
            <span className="nav-arrow">{showTags ? '▾' : '▸'}</span>
          </button>
          {showTags && <TagManager tags={tags} onRefresh={() => { refetchTags(); refetch(); }} />}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">📋</div>
            <span className="user-name">本地用户</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-header">
          {/* Brand inline — only shows in kanban mode */}
          {viewMode === 'kanban' && (
            <div className="header-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
          )}
          <div>
            <h1>我的任务</h1>
            <div className="stats-row">
              <span className="stat"><span className="stat-dot todo"></span>待办 {todoCnt}</span>
              <span className="stat"><span className="stat-dot in-progress"></span>进行中 {inProgressCnt}</span>
              <span className="stat"><span className="stat-dot done"></span>已完成 {doneCnt}</span>
            </div>
          </div>
          <div className="header-actions">
            {/* Space holder for kanban mode */}
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {/* View mode toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="列表视图"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="3" x2="15" y2="3" />
                  <line x1="1" y1="8" x2="15" y2="8" />
                  <line x1="1" y1="13" x2="15" y2="13" />
                </svg>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="看板视图"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="3.5" height="14" rx="1" />
                  <rect x="6.25" y="1" width="3.5" height="10" rx="1" />
                  <rect x="11.5" y="1" width="3.5" height="7" rx="1" />
                </svg>
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
              + 新建任务
            </button>
          </div>
        </div>

        {/* Filter bar — only in list mode */}
        {viewMode === 'list' && (
          <FilterBar filters={filters} onFilterChange={setFilters} tags={tags} />
        )}

        {/* Batch actions */}
        {selectedIds.length > 0 && (
          <div className="batch-bar">
            <span>已选 {selectedIds.length} 项</span>
            <button className="btn btn-sm" onClick={() => handleBatchAction('update_status', 'done')} disabled={batchLoading}>✓ 标为完成</button>
            <button className="btn btn-sm" onClick={() => handleBatchAction('update_status', 'todo')} disabled={batchLoading}>↺ 标为待办</button>
            <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('确定删除所选任务？')) handleBatchAction('delete'); }} disabled={batchLoading}>✕ 删除</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setSelectedIds([])}>取消选择</button>
          </div>
        )}

        {/* Task views */}
        {viewMode === 'list' ? (
          <>
            <div className="task-list">
              {loading && tasks.length === 0 && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>加载中...</p>
                </div>
              )}

              {!loading && tasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>还没有任务</h3>
                  <p>点击「新建任务」按钮开始添加你的第一个任务吧！</p>
                  <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }}>
                    + 新建任务
                  </button>
                </div>
              )}

              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                  onSelect={handleSelect}
                  selected={selectedIds.includes(task.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  上一页
                </button>
                <span className="page-info">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="kanban-wrapper">
            {kanbanLoading && kanbanTasks.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>加载中...</p>
              </div>
            ) : (
              <KanbanBoard
                tasks={kanbanTasks}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onSelect={handleSelect}
                selectedIds={selectedIds}
              />
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          tags={tags}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
