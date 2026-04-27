import { defineComponent } from "../vue.js";

export const ToastStack = defineComponent({
  name: "ToastStack",
  props: {
    items: { type: Array, default: () => [] },
  },
  template: `
    <div class="tt-toast-stack">
      <div v-for="item in items" :key="item.id" :class="['tt-toast', 'tt-toast--' + item.type]">
        {{ item.text }}
      </div>
    </div>
  `,
});
