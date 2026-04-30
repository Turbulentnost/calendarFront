import { createPortal } from "react-dom";
import { useMemo, useRef, useState } from "react";
import { Button } from "../ui/Button.jsx";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";

const emptyForm = {
  title: "",
  deadline: "",
  description: "",
  assignee: "",
  files: [],
};

const STEP_COUNT = 5;
const SCALE_RADIUS = 280;
const SCALE_LABEL_OFFSET = 48;
const SCALE_START_ANGLE = -72;
const SCALE_END_ANGLE = 72;

function getScalePoint(progress) {
  const angle =
    (SCALE_START_ANGLE + (SCALE_END_ANGLE - SCALE_START_ANGLE) * progress) *
    (Math.PI / 180);
  const x = SCALE_RADIUS * Math.cos(angle);
  const y = SCALE_RADIUS + SCALE_RADIUS * Math.sin(angle);
  return {
    x,
    y,
    labelX: x + Math.cos(angle) * SCALE_LABEL_OFFSET,
    labelY: y + Math.sin(angle) * SCALE_LABEL_OFFSET,
  };
}

const scaleDots = Array.from({ length: STEP_COUNT }, (_, index) =>
  getScalePoint(index / (STEP_COUNT - 1))
);
const scalePath = `M${scaleDots[0].x} ${scaleDots[0].y} A${SCALE_RADIUS} ${SCALE_RADIUS} 0 0 1 ${
  scaleDots[scaleDots.length - 1].x
} ${scaleDots[scaleDots.length - 1].y}`;

const MONTH_LABELS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => new Date(year, month, index + 1));
}

function getFileExtension(fileName) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().slice(0, 5).toUpperCase() : "FILE";
}

function getFileKind(fileName) {
  const ext = getFileExtension(fileName).toLowerCase();
  if (["doc", "docx", "rtf"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (ext === "pdf") return "pdf";
  if (["html", "htm", "xml"].includes(ext)) return "code";
  if (["vsd", "vsdx"].includes(ext)) return "diagram";
  return "file";
}

export function TaskComposer({
  users,
  currentUser,
  onCreated,
}) {
  const [form, setForm] = useState(emptyForm);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [calendarMode, setCalendarMode] = useState("week");
  const [calendarAnchor, setCalendarAnchor] = useState(
    () => new Date(2026, 3, 21)
  );
  const [weekAnimation, setWeekAnimation] = useState("");
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assigneeMenuRect, setAssigneeMenuRect] = useState(null);
  const [removingFiles, setRemovingFiles] = useState({});
  const flowRef = useRef(null);
  const assigneeId = useMemo(() => {
    if (form.assignee) return form.assignee;
    const currentUserRow = users.find((u) => u.id === currentUser?.id);
    return currentUserRow?.id || users[0]?.id || currentUser?.id || "";
  }, [currentUser?.id, form.assignee, users]);
  const selectedAssignee = useMemo(
    () => users.find((user) => String(user.id) === String(assigneeId)),
    [assigneeId, users]
  );

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addFiles(e) {
    const nextFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (!nextFiles.length) return;
    setForm((f) => ({
      ...f,
      files: [
        ...f.files,
        ...nextFiles.map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
        })),
      ],
    }));
  }

  function removeFile(fileId) {
    const variant = Math.floor(Math.random() * 5) + 1;
    setRemovingFiles((prev) => ({ ...prev, [fileId]: variant }));
    window.setTimeout(() => {
      setForm((f) => ({
        ...f,
        files: f.files.filter((item) => item.id !== fileId),
      }));
      setRemovingFiles((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    }, 420);
  }

  function submit() {
    if (!form.title.trim() || !assigneeId) return;
    onCreated({
      title: form.title.trim(),
      assignee: assigneeId,
      priority: "medium",
      deadline: form.deadline,
      description: form.description.trim(),
    });
    setForm(emptyForm);
    setRemovingFiles({});
  }

  function handleFlowScroll(e) {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    const progress = maxScroll > 0 ? target.scrollTop / maxScroll : 0;
    const nextStep = Math.min(
      STEP_COUNT - 1,
      Math.max(0, Math.round(progress * (STEP_COUNT - 1)))
    );
    setScrollProgress(progress);
    setActiveStep(nextStep);
  }

  function handleShellWheel(e) {
    const target = flowRef.current;
    if (!target) return;
    e.preventDefault();
    target.scrollBy({
      top: e.deltaY,
      behavior: "auto",
    });
  }

  function scrollToStep(index) {
    const target = flowRef.current;
    if (!target) return;
    target.scrollTo({
      top: index * target.clientHeight,
      behavior: "smooth",
    });
  }

  const activeScalePoint = getScalePoint(scrollProgress);
  const weekDays = useMemo(() => {
    const start = getStartOfWeek(calendarAnchor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [calendarAnchor]);
  const monthDays = useMemo(
    () => getMonthDays(calendarAnchor),
    [calendarAnchor]
  );
  const calendarDays = calendarMode === "week" ? weekDays : monthDays;
  const selectedDay = form.deadline
    ? new Date(`${form.deadline}T00:00:00`)
    : calendarAnchor;

  function selectCalendarDate(date) {
    setCalendarAnchor(date);
    setField("deadline", toDateValue(date));
  }

  function handleCalendarWheel(e) {
    if (!e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    const direction = e.deltaY > 0 ? 1 : -1;
    shiftCalendarWeek(direction);
  }

  function shiftCalendarWeek(direction) {
    setCalendarMode("week");
    setWeekAnimation(direction > 0 ? "next" : "prev");
    setCalendarAnchor((current) =>
      addWeeks(current, direction)
    );
    window.setTimeout(() => setWeekAnimation(""), 220);
  }

  function handleMonthDaysWheel(e) {
    if (calendarMode !== "month" || e.shiftKey) return;
    e.stopPropagation();
  }

  function toggleAssigneeMenu(e) {
    if (assigneeOpen) {
      setAssigneeOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setAssigneeMenuRect({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
    });
    setAssigneeOpen(true);
  }

  const assigneeMenu =
    assigneeOpen && assigneeMenuRect
      ? createPortal(
          <div
            className="tt-task-assignee__menu"
            role="listbox"
            style={{
              left: `${assigneeMenuRect.left}px`,
              top: `${assigneeMenuRect.top}px`,
              width: `${assigneeMenuRect.width}px`,
            }}
          >
            <button
              className={`tt-task-assignee__option ${
                !form.assignee ? "tt-task-assignee__option--active" : ""
              }`}
              type="button"
              onClick={() => {
                setField("assignee", "");
                setAssigneeOpen(false);
              }}
            >
              <span>Автоматически выбрать исполнителя</span>
              <small>Текущий пользователь или первый в списке</small>
            </button>
            {users.map((user) => (
              <button
                className={`tt-task-assignee__option ${
                  String(form.assignee) === String(user.id)
                    ? "tt-task-assignee__option--active"
                    : ""
                }`}
                key={user.id}
                type="button"
                onClick={() => {
                  setField("assignee", user.id);
                  setAssigneeOpen(false);
                }}
              >
                <span>{user.nickname}</span>
                {user.department && <small>{user.department}</small>}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <section className="tt-task-flow-page">
      <div className="tt-task-flow-orb tt-task-flow-orb--left" />
      <div className="tt-task-flow-orb tt-task-flow-orb--right" />

      <div className="tt-task-flow-shell" onWheel={handleShellWheel}>
        <aside
          className={`tt-task-flow-map tt-task-flow-map--step-${activeStep + 1}`}
          aria-label="Шаги создания задачи"
          style={{
            "--task-flow-progress": `${scrollProgress * 100}%`,
            "--task-flow-active-x": `${activeScalePoint.labelX}px`,
            "--task-flow-active-y": `${activeScalePoint.labelY}px`,
          }}
        >
          <div className="tt-task-flow-scale">
            <svg
              className="tt-task-flow-scale__curve"
              viewBox="0 0 280 560"
              aria-hidden="true"
            >
              <path d={scalePath} />
            </svg>
            {scaleDots.map((dot, index) => (
              <button
                className={`tt-task-flow-scale__dot ${
                  activeStep === index ? "tt-task-flow-scale__dot--active" : ""
                }`}
                key={index}
                type="button"
                onClick={() => scrollToStep(index)}
                aria-label={`Перейти к шагу ${index + 1}`}
                style={{
                  left: `${dot.x}px`,
                  top: `${dot.y}px`,
                }}
              />
            ))}
            <div className="tt-task-flow-scale__progress" />
            <div className="tt-task-flow-scale__active">
              {String(activeStep + 1).padStart(2, "0")}
            </div>
          </div>
        </aside>

        <div
          className="tt-task-flow"
          ref={flowRef}
          onScroll={handleFlowScroll}
        >
          <section className="tt-task-step">
            <div className="tt-task-step__content">
              <div className="tt-task-step__number">01</div>
              <p className="tt-task-step__eyebrow">Название</p>
              <h2>С чего начинается задача?</h2>
              <p>
                Дайте задаче короткое и понятное имя. Оно будет первым, что
                увидит команда.
              </p>
              <Input
                className="tt-task-step__input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Например: Подготовить отчёт по спринту"
              />
            </div>
          </section>

          <section className="tt-task-step">
            <div className="tt-task-step__content">
              <div className="tt-task-step__number">02</div>
              <p className="tt-task-step__eyebrow">Описание</p>
              <h2>Что нужно сделать?</h2>
              <p>
                Опишите контекст, критерии готовности и важные детали, чтобы
                задача была понятна без дополнительных уточнений.
              </p>
              <Textarea
                className="tt-task-step__textarea"
                rows={7}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Опишите задачу, критерии готовности и детали"
              />
            </div>
          </section>

          <section className="tt-task-step">
            <div className="tt-task-step__content">
              <div className="tt-task-step__number">03</div>
              <p className="tt-task-step__eyebrow">Сроки</p>
              <h2>Когда нужен результат?</h2>
              <p>
                Укажите дедлайн. Задача будет создана со средним приоритетом.
              </p>
              <div className="tt-task-calendar" onWheel={handleCalendarWheel}>
                <div className="tt-task-calendar__switch">
                  <button
                    className={`tt-task-calendar__tab ${
                      calendarMode === "week"
                        ? "tt-task-calendar__tab--active"
                        : ""
                    }`}
                    type="button"
                    onClick={() => setCalendarMode("week")}
                  >
                    Неделя
                  </button>
                  <button
                    className={`tt-task-calendar__tab ${
                      calendarMode === "month"
                        ? "tt-task-calendar__tab--active"
                        : ""
                    }`}
                    type="button"
                    onClick={() => setCalendarMode("month")}
                  >
                    Месяц
                  </button>
                </div>
                <div className="tt-task-calendar__head">
                  <div>
                    <span>{MONTH_LABELS[calendarAnchor.getMonth()]}</span>
                    <small>
                      {calendarMode === "week"
                        ? "Shift + scroll листает недели"
                        : "Выберите день месяца"}
                    </small>
                  </div>
                  <strong>{String(selectedDay.getDate()).padStart(2, "0")}</strong>
                </div>
                <div className="tt-task-calendar__days-shell">
                  {calendarMode === "week" && (
                    <button
                      className="tt-task-calendar__arrow tt-task-calendar__arrow--prev"
                      type="button"
                      onClick={() => shiftCalendarWeek(-1)}
                      aria-label="Предыдущая неделя"
                    >
                      ‹
                    </button>
                  )}
                  <div
                    className={`tt-task-calendar__days ${
                      calendarMode === "month"
                        ? "tt-task-calendar__days--month"
                        : ""
                    } ${
                      weekAnimation
                        ? `tt-task-calendar__days--week-${weekAnimation}`
                        : ""
                    }`}
                    onWheel={handleMonthDaysWheel}
                  >
                    {calendarDays.map((date) => {
                      const value = toDateValue(date);
                      return (
                        <button
                          className={`tt-task-calendar__day ${
                            form.deadline === value
                              ? "tt-task-calendar__day--active"
                              : ""
                          }`}
                          key={value}
                          type="button"
                          onClick={() => selectCalendarDate(date)}
                        >
                          <span>{WEEKDAY_LABELS[(date.getDay() + 6) % 7]}</span>
                          <strong>{date.getDate()}</strong>
                        </button>
                      );
                    })}
                  </div>
                  {calendarMode === "week" && (
                    <button
                      className="tt-task-calendar__arrow tt-task-calendar__arrow--next"
                      type="button"
                      onClick={() => shiftCalendarWeek(1)}
                      aria-label="Следующая неделя"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="tt-task-step">
            <div className="tt-task-step__content">
              <div className="tt-task-step__number">04</div>
              <p className="tt-task-step__eyebrow">Участники</p>
              <h2>Кто будет выполнять задачу?</h2>
              <p>
                Выберите ответственного исполнителя. Позже здесь можно будет
                расширить сценарий до нескольких участников.
              </p>
              <div className={`tt-task-assignee ${assigneeOpen ? "tt-task-assignee--open" : ""}`}>
                <button
                  className="tt-task-assignee__trigger"
                  type="button"
                  onClick={toggleAssigneeMenu}
                  aria-expanded={assigneeOpen}
                >
                  <span>
                    {selectedAssignee
                      ? selectedAssignee.nickname
                      : "Автоматически выбрать исполнителя"}
                  </span>
                  {selectedAssignee?.department && (
                    <small>{selectedAssignee.department}</small>
                  )}
                  <b aria-hidden="true">⌄</b>
                </button>
              </div>
            </div>
          </section>

          <section className="tt-task-step">
            <div className="tt-task-step__content">
              <div className="tt-task-step__number">05</div>
              <p className="tt-task-step__eyebrow">Файлы</p>
              <h2>Что понадобится для выполнения?</h2>
              <p>
                Добавьте материалы, которые помогут выполнить задачу. Сейчас
                файлы сохраняются локально в форме.
              </p>
              <label className="tt-task-file-drop">
                <input type="file" multiple onChange={addFiles} />
                <span className="tt-task-file-drop__icon">+</span>
                <span>Выберите файлы</span>
              </label>
              {form.files.length > 0 && (
                <div className="tt-task-file-list">
                  {form.files.map((item) => (
                    <div
                      className={`tt-task-file ${
                        removingFiles[item.id]
                          ? `tt-task-file--removing tt-task-file--removing-${removingFiles[item.id]}`
                          : ""
                      }`}
                      key={item.id}
                    >
                      <div
                        className={`tt-task-file__icon tt-task-file__icon--${getFileKind(item.file.name)}`}
                      >
                        <i aria-hidden="true" />
                        <span>{getFileExtension(item.file.name)}</span>
                      </div>
                      <div className="tt-task-file__meta">
                        <span>{item.file.name}</span>
                        <small>
                          {item.file.size
                            ? `${Math.max(1, Math.round(item.file.size / 1024))} KB`
                            : "Локальный файл"}
                        </small>
                      </div>
                      <button type="button" onClick={() => removeFile(item.id)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="tt-task-step__actions">
                <Button
                  variant="primary"
                  type="button"
                  disabled={!form.title.trim() || !assigneeId}
                  onClick={submit}
                >
                  Создать задачу
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {assigneeMenu}
    </section>
  );
}
