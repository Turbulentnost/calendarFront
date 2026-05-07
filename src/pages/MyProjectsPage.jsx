import { useEffect, useRef, useState } from "react";

const ICONS = ["🚀", "📱", "🌐", "⚡", "✨"];
const ACCENTS = ["violet", "blue", "green", "cyan", "amber"];
const ACTION_MENU_ANIMATION_MS = 220;

function getProjectTitle(project) {
  return project.title || project.name || project.login || "Без названия";
}

function getProjectTaskCount(project) {
  if (typeof project.tasks_count === "number") return project.tasks_count;
  if (typeof project.task_count === "number") return project.task_count;
  if (Array.isArray(project.tasks)) return project.tasks.length;
  return 0;
}

function getProjectProgress(project) {
  const value =
    project.progress ??
    project.progress_percent ??
    project.completion_percent ??
    project.percent;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

function getTaskLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} задача`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} задачи`;
  }
  return `${count} задач`;
}

function ProjectIcon({ project, index }) {
  const imageUrl = project.image_url || project.image;
  if (imageUrl) {
    return <img src={imageUrl} alt="" />;
  }
  return <span>{project.icon || ICONS[index % ICONS.length]}</span>;
}

export function MyProjectsPage({
  projects = [],
  loading = false,
  title = "Мои проекты",
  subtitle = "Проекты, в которых состоит текущий пользователь.",
  emptyText = "Проектов пока нет",
  onCreate,
  onDelete,
}) {
  const [projectMenu, setProjectMenu] = useState({
    key: null,
    closing: false,
  });
  const menuTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        window.clearTimeout(menuTimerRef.current);
      }
    };
  }, []);

  const closeProjectMenu = () => {
    if (!projectMenu.key || projectMenu.closing) return;
    if (menuTimerRef.current) {
      window.clearTimeout(menuTimerRef.current);
    }
    setProjectMenu((current) => ({ ...current, closing: true }));
    menuTimerRef.current = window.setTimeout(() => {
      setProjectMenu({ key: null, closing: false });
      menuTimerRef.current = null;
    }, ACTION_MENU_ANIMATION_MS);
  };

  const toggleProjectMenu = (projectKey) => {
    if (menuTimerRef.current) {
      window.clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }

    if (projectMenu.key === projectKey && !projectMenu.closing) {
      setProjectMenu({ key: projectKey, closing: true });
      menuTimerRef.current = window.setTimeout(() => {
        setProjectMenu({ key: null, closing: false });
        menuTimerRef.current = null;
      }, ACTION_MENU_ANIMATION_MS);
      return;
    }

    setProjectMenu({ key: projectKey, closing: false });
  };

  return (
    <section className="tt-projects-page">
      <div className="tt-projects-page__orb tt-projects-page__orb--left" />
      <div className="tt-projects-page__orb tt-projects-page__orb--right" />

      <div className="tt-projects-shell">
        <div className="tt-section-head">
          <div>
            <h2 className="tt-section-title">{title}</h2>
            <p className="tt-section-subtitle">{subtitle}</p>
          </div>
        </div>

        {loading && <div className="tt-empty tt-projects-empty">Загрузка...</div>}

        {!loading && !projects.length && (
          <div className="tt-empty tt-projects-empty">{emptyText}</div>
        )}

        {!loading && projects.length > 0 && (
          <div className="tt-project-grid">
            {projects.map((project, index) => {
              const progress = getProjectProgress(project);
              const taskCount = getProjectTaskCount(project);
              const projectKey = project.id || project.login || getProjectTitle(project);
              const menuVisible = projectMenu.key === projectKey;
              const menuOpen = menuVisible && !projectMenu.closing;
              return (
                <article
                  className={`tt-project-card tt-project-card--${
                    ACCENTS[index % ACCENTS.length]
                  }`}
                  key={projectKey}
                >
                  <button
                    className={`tt-project-card__menu ${
                      menuOpen ? "tt-project-card__menu--active" : ""
                    }`}
                    type="button"
                    aria-label="Действия проекта"
                    aria-expanded={menuOpen}
                    onClick={() => toggleProjectMenu(projectKey)}
                  >
                    ...
                  </button>
                  {menuVisible && (
                    <div
                      className={`tt-project-card__actions ${
                        projectMenu.closing
                          ? "tt-project-card__actions--closing"
                          : ""
                      }`}
                      aria-label="Действия проекта"
                    >
                      <button
                        className="tt-project-card__action tt-project-card__action--edit"
                        type="button"
                        title="Редактировать"
                        aria-label="Редактировать проект"
                      >
                        ✎
                      </button>
                      <button
                        className="tt-project-card__action tt-project-card__action--members"
                        type="button"
                        title="Добавить участников"
                        aria-label="Добавить участников"
                      >
                        +
                      </button>
                      <button
                        className="tt-project-card__action tt-project-card__action--delete tt-project-card__action-danger"
                        type="button"
                        title="Удалить"
                        aria-label="Удалить проект"
                        onClick={() => {
                          closeProjectMenu();
                          onDelete?.(project);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="tt-project-card__icon">
                    <ProjectIcon project={project} index={index} />
                  </div>
                  <h3>{getProjectTitle(project)}</h3>
                  <p>{getTaskLabel(taskCount)}</p>
                  <div className="tt-project-card__progress-row">
                    <div className="tt-project-card__track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <strong>{progress}%</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <button
        className="tt-project-create-fab"
        type="button"
        aria-label="Добавить новый проект"
        onClick={onCreate}
      >
        <span className="tt-project-create-fab__icon">+</span>
        <span className="tt-project-create-fab__text">Новый проект</span>
      </button>
    </section>
  );
}
