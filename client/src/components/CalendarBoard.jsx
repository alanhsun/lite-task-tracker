import { useState } from 'react';

const DAYS_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarBoard({ tasks, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const isToday = (date) => {
    const todayDate = new Date();
    return date && 
      date.getDate() === todayDate.getDate() && 
      date.getMonth() === todayDate.getMonth() && 
      date.getFullYear() === todayDate.getFullYear();
  }

  const getTasksForDate = (date) => {
    if (!date) return [];
    // YYYY-MM-DD target string
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().split('T')[0];
    return tasks.filter(t => t.due_date && t.due_date.startsWith(localISOTime));
  };

  return (
    <div className="calendar-board">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="btn btn-sm btn-ghost" onClick={prevMonth}>&lt;</button>
          <button className="btn btn-sm btn-ghost" onClick={today}>今天</button>
          <button className="btn btn-sm btn-ghost" onClick={nextMonth}>&gt;</button>
        </div>
        <h2 className="calendar-title">{year}年 {month + 1}月</h2>
      </div>
      
      <div className="calendar-grid">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {days.map((date, idx) => {
          const dayTasks = getTasksForDate(date);
          return (
            <div key={idx} className={`calendar-cell ${date ? '' : 'empty'} ${isToday(date) ? 'today' : ''} ${date && date.getDay() === 0 || date && date.getDay() === 6 ? 'weekend' : ''}`}>
              {date && (
                <>
                  <div className="calendar-date-number">{date.getDate()}</div>
                  <div className="calendar-day-tasks">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`calendar-task status-${task.status} priority-${task.priority}`}
                        onClick={() => onEdit(task)}
                        title={task.title}
                      >
                        <span className="task-title-trunc">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
