import { Button } from "../ui/Button.jsx";
import { Modal } from "./Modal.jsx";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Подтвердить",
  onClose,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <h3>{title}</h3>
      <p className="tt-confirm-text">{message}</p>
      <div className="tt-modal-actions">
        <Button variant="default" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
