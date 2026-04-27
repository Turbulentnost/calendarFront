import { defineComponent } from "../vue.js";

export const Sidebar = defineComponent({
  name: "Sidebar",
  props: {
    open: { type: Boolean, default: true },
    mobile: { type: Boolean, default: false },
  },
  emits: ["close"],
  template: `
    <aside :class="['tt-sidebar', { 'tt-sidebar--mobile': mobile, 'tt-sidebar--open': open }]">
      <div class="tt-sidebar__brand">
        <div class="tt-logo">TT</div>
        <div class="tt-brand-text">
          <h1>TurboTasks</h1>
          <p>Corporate Task Desk</p>
        </div>
        <button v-if="mobile" class="tt-sidebar__close" type="button" @click="$emit('close')">✕</button>
      </div>
      <nav class="tt-sidebar__menu">
        <a class="tt-menu-item tt-menu-item--active" href="#" @click.prevent>Пользователи</a>
      </nav>
    </aside>
    <div v-if="mobile && open" class="tt-sidebar-backdrop" @click="$emit('close')"></div>
  `,
});
