import { cn } from "../../utils/cn.js";

/**
 * Подпись + поле (label оборачивает children).
 */
export function Field({ className, label, children }) {
  return (
    <label className={cn(className)}>
      {label} {children}
    </label>
  );
}
