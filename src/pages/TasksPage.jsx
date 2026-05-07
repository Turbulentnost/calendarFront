const mockStats = [
  {
    label: "Всего задач",
    value: 25,
    hint: "Все время",
    icon: "clipboard",
    tone: "violet",
  },
  {
    label: "В работе",
    value: 7,
    hint: "Сейчас",
    icon: "activity",
    tone: "blue",
  },
  {
    label: "Завершено",
    value: 18,
    hint: "Все время",
    icon: "check",
    tone: "green",
  },
  {
    label: "Просрочено",
    value: 2,
    hint: "Требуют внимания",
    icon: "clock",
    tone: "red",
  },
];

const mockTasks = [
  {
    time: "09:30",
    title: "Обновить документацию API",
    tag: "Документация",
    tagTone: "violet",
    priority: "high",
    done: false,
  },
  {
    time: "11:00",
    title: "Проверить отчёт по проекту",
    tag: "Отчёты",
    tagTone: "blue",
    priority: "medium",
    done: false,
  },
  {
    time: "14:00",
    title: "Созвон с командой дизайна",
    tag: "Встречи",
    tagTone: "green",
    priority: "high",
    done: false,
    active: true,
  },
  {
    time: "16:30",
    title: "Подготовить презентацию",
    tag: "Презентации",
    tagTone: "violet",
    priority: "medium",
    done: false,
  },
];

const priorityLabels = {
  medium: "Средний",
  high: "Высокий",
};

const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);
const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const eventDays = new Set([2, 4, 6, 10, 12, 14, 18, 19, 21, 22, 23, 25, 26, 28, 29, 30]);
const mockEvents = [
  { time: "14:00", title: "Созвон с командой дизайна", tag: "Встречи", tagTone: "green" },
  { time: "16:30", title: "Подготовить презентацию", tag: "Презентации", tagTone: "violet" },
  { time: "18:00", title: "Проверить отчёт по проекту", tag: "Отчёты", tagTone: "blue" },
];

function StatIcon({ name }) {
  const icons = {
    clipboard: (
      <>
        <rect x="8" y="7" width="8" height="10" rx="1.5" />
        <path d="M10 5.5h4" />
        <path d="M10 10h4" />
        <path d="M10 13h3" />
      </>
    ),
    activity: (
      <>
        <path d="M4 12h3l2-5 4 10 2-5h5" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4 10-10" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export function TasksPage() {
  return (
    <section className="tt-tasks-dashboard">
      <div className="tt-tasks-dashboard__hero">
        <div>
          <h2>Добрый вечер, Алексей!</h2>
          <p>У вас 7 задач на сегодня</p>
        </div>
        <div className="tt-week-progress">
          <div className="tt-week-progress__ring">
            <span>72%</span>
          </div>
          <div>
            <h3>Прогресс недели</h3>
            <p>Выполнено 18 из 25 задач</p>
          </div>
        </div>
      </div>

      <div className="tt-task-stat-grid">
        {mockStats.map((stat) => (
          <article className={`tt-task-stat tt-task-stat--${stat.tone}`} key={stat.label}>
            <div className="tt-task-stat__icon">
              <StatIcon name={stat.icon} />
            </div>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.hint}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="tt-task-board">
        <article className="tt-today-panel">
          <div className="tt-task-board__head">
            <h3>
              Сегодня <span>7</span>
            </h3>
            <span className="tt-task-board__menu" aria-hidden="true">☷</span>
          </div>

          <div className="tt-timeline-list">
            {mockTasks.map((task) => (
              <div
                className={`tt-timeline-task ${
                  task.active ? "tt-timeline-task--active" : ""
                }`}
                key={task.title}
              >
                <span className="tt-timeline-task__check" aria-hidden="true" />
                <div className="tt-timeline-task__body">
                  <time>{task.time}</time>
                  <h4>{task.title}</h4>
                  <span className={`tt-task-tag tt-task-tag--${task.tagTone}`}>
                    {task.tag}
                  </span>
                </div>
                <div className={`tt-task-priority tt-task-priority--${task.priority}`}>
                  <span aria-hidden="true">⚑</span>
                  {priorityLabels[task.priority]}
                </div>
              </div>
            ))}
          </div>

          <div className="tt-task-board__see-all">
            Смотреть все задачи <span aria-hidden="true">›</span>
          </div>
        </article>

        <article className="tt-calendar-panel">
          <div className="tt-calendar-panel__head">
            <h3>Апрель 2024</h3>
            <div>
              <span aria-hidden="true">‹</span>
              <span aria-hidden="true">›</span>
            </div>
          </div>

          <div className="tt-calendar-month">
            {weekdays.map((day) => (
              <span className="tt-calendar-month__weekday" key={day}>
                {day}
              </span>
            ))}
            {calendarDays.map((day) => (
              <span
                className={`tt-calendar-month__day ${
                  day === 21 ? "tt-calendar-month__day--active" : ""
                } ${eventDays.has(day) ? "tt-calendar-month__day--event" : ""}`}
                key={day}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="tt-calendar-events">
            <h4>
              События на 21 апреля <span>3</span>
            </h4>
            {mockEvents.map((event) => (
              <div className="tt-calendar-event" key={event.title}>
                <time>{event.time}</time>
                <span>{event.title}</span>
                <b className={`tt-task-tag tt-task-tag--${event.tagTone}`}>
                  {event.tag}
                </b>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
