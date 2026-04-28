import { cn } from "../../utils/cn.js";

const VARIANT_CLASS = {
  default: "tt-btn",
  primary: "tt-btn tt-btn--primary",
  danger: "tt-btn tt-btn--danger",
  filter: "tt-btn tt-btn--filter",
  apply: "tt-btn tt-btn--apply",
};

/**
 * @param {{
 *  variant?: keyof typeof VARIANT_CLASS;
 *  filterActive?: boolean;
 *  className?: string;
 * } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  variant = "default",
  filterActive = false,
  className,
  type = "button",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cn(
        variant === "filter" && filterActive && "tt-btn--filter-active",
        VARIANT_CLASS[variant] || VARIANT_CLASS.default,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
