import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'todo', label: '待办', icon: '○', color: 'var(--text-secondary)' },
  { key: 'in_progress', label: '进行中', icon: '◐', color: 'var(--accent)' },
  { key: 'done', label: '已完成', icon: '●', color: 'var(--success)' },
];

export default function KanbanBoard({ tasks, onEdit, onStatusChange, onSelect, selectedIds }) {
  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => (
        <div key={col.key} className={`kanban-column kanban-col-${col.key}`}>
          <div className="kanban-column-header">
            <span className="kanban-col-icon" style={{ color: col.color }}>{col.icon}</span>
            <span className="kanban-col-title">{col.label}</span>
            <span className="kanban-col-count">{grouped[col.key].length}</span>
          </div>
          <div className="kanban-column-body">
            {grouped[col.key].length === 0 && (
              <div className="kanban-empty">暂无任务</div>
            )}
            {grouped[col.key].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                onSelect={onSelect}
                selected={selectedIds.includes(task.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
