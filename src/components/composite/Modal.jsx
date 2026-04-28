import { cn } from "../../utils/cn.js";

/**
 * Составной блок: оверлей + окно. Закрытие по клику на фон.
 * @param {{ open: boolean; onClose: () => void; size?: 'md' | 'sm'; className?: string; backdropClassName?: string; children: import('react').ReactNode }} props
 */
export function Modal({
  open,
  onClose,
  size = "md",
  className,
  backdropClassName,
  children,
}) {
  if (!open) return null;
  return (
    <div
      className={cn("tt-modal-backdrop", backdropClassName)}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn("tt-modal", size === "sm" && "tt-modal--small", className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
