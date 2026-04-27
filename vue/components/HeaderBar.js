import { computed, defineComponent, ref } from "../vue.js";

export const HeaderBar = defineComponent({
  name: "HeaderBar",
  props: {
    user: { type: Object, default: null },
    title: { type: String, default: "Управление пользователями" },
  },
  emits: ["logout", "toggle-sidebar"],
  setup(props, { emit }) {
    const open = ref(false);
    const initials = computed(() => {
      const src = props.user?.nickname || "TT";
      return src.slice(0, 2).toUpperCase();
    });
    function toggle() {
      open.value = !open.value;
    }
    function doLogout() {
      open.value = false;
      emit("logout");
    }
    return { open, initials, toggle, doLogout };
  },
  template: `
    <header class="tt-header">
      <div class="tt-header__left">
        <button class="tt-header__burger" type="button" @click="$emit('toggle-sidebar')">☰</button>
        <div class="tt-header__title">{{ title }}</div>
      </div>
      <div class="tt-header__right">
        <button class="tt-quick-logout" type="button" @click.stop="doLogout">Выйти</button>
        <div class="tt-user-menu" @click.stop="toggle">
          <div class="tt-user-menu__avatar">{{ initials }}</div>
          <div class="tt-user-menu__meta">
            <div class="tt-user-menu__name">{{ user?.nickname || 'admin' }}</div>
            <div class="tt-user-menu__role">{{ user?.role === 0 ? 'Суперадмин' : 'Админ' }}</div>
          </div>
          <div class="tt-user-menu__caret">▾</div>
          <div v-if="open" class="tt-user-menu__dropdown">
            <button type="button" @click.stop>Мой профиль</button>
            <button type="button" class="danger" @click.stop="doLogout">Выйти</button>
          </div>
        </div>
      </div>
    </header>
  `,
});
