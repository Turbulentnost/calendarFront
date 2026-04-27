/**
 * @param {HTMLElement} outlet
 */
export function mountHome(outlet) {
  outlet.className = "app__outlet home";
  outlet.innerHTML = `
    <section class="home">
      <div class="home__hero">
        <div>
          <p class="home__kicker">TurboTasks</p>
          <h2 class="home__h1">Ставьте задачи и доводите их до результата</h2>
          <p class="home__lead">
            Десктопное пространство для команды: постановка задач, контроль статусов,
            управление пользователями и ролями в одном окне.
          </p>
          <div class="home__actions">
            <a class="btn btn--primary" href="#/admin">Открыть панель</a>
            <button type="button" class="btn btn--ghost" id="home-scroll-info">Возможности</button>
          </div>
        </div>
        <div class="home__art" aria-hidden="true">
          <div class="home__glow"></div>
        </div>
      </div>
      <div class="home__grid">
        <article class="home__card">
          <h3>Управление доступом</h3>
          <p>Роли и права для безопасной работы команды в TurboTasks.</p>
        </article>
        <article class="home__card">
          <h3>Командная админка</h3>
          <p>Создавайте участников, назначайте должности и контролируйте доступ.</p>
        </article>
        <article class="home__card">
          <h3>Фокус на задачах</h3>
          <p>Чистый интерфейс без лишнего шума, чтобы быстрее работать по процессу.</p>
        </article>
      </div>
    </section>
  `;

  outlet.querySelector("#home-scroll-info")?.addEventListener("click", () => {
    document.querySelector(".home__grid")?.scrollIntoView({ behavior: "smooth" });
  });
}
