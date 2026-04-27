export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Подтвердить",
  onClose,
  onConfirm,
}) {
  if (!open) return null;
  return (
    <div className="tt-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="tt-modal tt-modal--small"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3>{title}</h3>
        <p className="tt-confirm-text">{message}</p>
        <div className="tt-modal-actions">
          <button type="button" className="tt-btn" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className="tt-btn tt-btn--danger"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
