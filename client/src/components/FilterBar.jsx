const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: '全部优先级' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: '创建时间' },
  { value: 'updated_at', label: '更新时间' },
  { value: 'due_date', label: '截止日期' },
  { value: 'priority', label: '优先级' },
  { value: 'title', label: '标题' },
];

export default function FilterBar({ filters, onFilterChange, tags }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="filter-bar">
      <div className="search-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          id="search-input"
          type="text"
          placeholder="搜索任务..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-selects">
        <select
          id="filter-status"
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          id="filter-priority"
          value={filters.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {tags && tags.length > 0 && (
          <select
            id="filter-tag"
            value={filters.tag || ''}
            onChange={(e) => handleChange('tag', e.target.value)}
          >
            <option value="">全部标签</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        )}

        <select
          id="filter-sort"
          value={filters.sort || 'created_at'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          className={`btn-icon sort-order ${filters.order === 'asc' ? 'asc' : ''}`}
          onClick={() => handleChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
          title={filters.order === 'asc' ? '升序' : '降序'}
        >
          {filters.order === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}
