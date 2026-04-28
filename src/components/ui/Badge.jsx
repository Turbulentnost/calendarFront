import { cn } from "../../utils/cn.js";

/** @param {{ variant: 'danger' | 'primary'; className?: string; children: import('react').ReactNode }} props */
export function Badge({ variant, className, children }) {
  return (
    <span
      className={cn(
        "tt-badge",
        variant === "danger" && "tt-badge--danger",
        variant === "primary" && "tt-badge--primary",
        className
      )}
    >
      {children}
    </span>
  );
}
