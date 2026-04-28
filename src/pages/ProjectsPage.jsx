import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectLoginModal } from "../components/composite/ProjectLoginModal.jsx";
import { ProjectModal } from "../components/composite/ProjectModal.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Panel } from "../components/ui/Panel.jsx";
import {
  createProject,
  getProjects,
  loginProject,
} from "../services/projectApi.js";

function normalizeProjects(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function ProjectsPage({ onNotify, onProjectLogin }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLoginLoading, setProjectLoginLoading] = useState(false);
  const [fabBreaking, setFabBreaking] = useState(false);
  const fabTimerRef = useRef(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(normalizeProjects(data));
    } catch (e) {
      onNotify?.(`Ошибка загрузки проектов: ${e.message}`, "error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    return () => {
      if (fabTimerRef.current) {
        window.clearTimeout(fabTimerRef.current);
      }
    };
  }, []);

  async function handleCreateProject(payload) {
    setSaving(true);
    try {
      const created = await createProject(payload);
      const project = created && typeof created === "object" ? created : payload;
      setProjects((prev) => [project, ...prev]);
      setModalOpen(false);
      onNotify?.("Проект создан", "success");
    } catch (e) {
      onNotify?.(`Ошибка создания проекта: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleProjectLogin(payload) {
    setProjectLoginLoading(true);
    try {
      const data = await loginProject(payload);
      onProjectLogin?.(data);
      setSelectedProject(null);
      onNotify?.(
        `Вход в проект "${data.project?.title || payload.login}" выполнен`,
        "success"
      );
    } catch (e) {
      onNotify?.(`Ошибка входа в проект: ${e.message}`, "error");
    } finally {
      setProjectLoginLoading(false);
    }
  }

  function openProject(project) {
    setSelectedProject(project);
  }

  function handleProjectKeyDown(e, project) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProject(project);
    }
  }

  function handleFabClick() {
    if (fabBreaking) return;
    setFabBreaking(true);
    fabTimerRef.current = window.setTimeout(() => {
      setFabBreaking(false);
      setModalOpen(true);
      fabTimerRef.current = null;
    }, 360);
  }

  return (
    <Panel>
      <div className="tt-section-head">
        <div>
          <h2 className="tt-section-title">Проекты</h2>
          <p className="tt-section-subtitle">
            Рабочие пространства для календаря и задач команды.
          </p>
        </div>
        {loading || projects.length === 0 ? (
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Добавить проект
          </Button>
        ) : null}
      </div>

      {loading && (
        <div className="tt-project-empty">
          <div className="tt-project-empty__title">Загружаем проекты...</div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="tt-project-empty">
          <div className="tt-project-empty__icon">+</div>
          <div className="tt-project-empty__title">
            Пока нет активных проектов
          </div>
          <p>
            Создайте новый проект, чтобы собрать задачи и календарь команды в
            одном рабочем пространстве.
          </p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Создать новый проект
          </Button>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <>
          <div className="tt-project-grid">
            {projects.map((project) => (
              <article
                className="tt-project-card"
                key={project.id || project.login || project.title}
                onClick={() => openProject(project)}
                onKeyDown={(e) => handleProjectKeyDown(e, project)}
                role="button"
                tabIndex={0}
              >
                <div className="tt-project-card__title">
                  {project.title || "Без названия"}
                </div>
                <div className="tt-project-card__meta">
                  {project.name || project.login || "Рабочее пространство"}
                </div>
                {project.description && (
                  <p className="tt-project-card__description">
                    {project.description}
                  </p>
                )}
              </article>
            ))}
          </div>
          <button
            className={`tt-project-fab ${
              fabBreaking ? "tt-project-fab--breaking" : ""
            }`.trim()}
            type="button"
            aria-label="Добавить проект"
            title="Добавить проект"
            disabled={fabBreaking}
            onClick={handleFabClick}
          >
            <span>+</span>
          </button>
        </>
      )}

      <ProjectModal
        open={modalOpen}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateProject}
      />
      <ProjectLoginModal
        open={Boolean(selectedProject)}
        project={selectedProject}
        loading={projectLoginLoading}
        onClose={() => setSelectedProject(null)}
        onLogin={handleProjectLogin}
      />
    </Panel>
  );
}
