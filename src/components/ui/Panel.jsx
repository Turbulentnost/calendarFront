import { cn } from "../../utils/cn.js";

export function Panel({ className, children, ...rest }) {
  return (
    <section className={cn("tt-panel", className)} {...rest}>
      {children}
    </section>
  );
}
