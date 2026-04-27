import { defineComponent } from "../vue.js";

export const ConfirmDialog = defineComponent({
  name: "ConfirmDialog",
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    confirmText: { type: String, default: "Подтвердить" },
  },
  emits: ["confirm", "close"],
  template: `
    <div v-if="open" class="tt-modal-backdrop" @click.self="$emit('close')">
      <div class="tt-modal tt-modal--small">
        <h3>{{ title }}</h3>
        <p class="tt-confirm-text">{{ message }}</p>
        <div class="tt-modal-actions">
          <button type="button" class="tt-btn" @click="$emit('close')">Отмена</button>
          <button type="button" class="tt-btn tt-btn--danger" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
});
