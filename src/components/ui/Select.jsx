import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

export const Select = forwardRef(function Select(
  { className, children, ...rest },
  ref
) {
  return (
    <select ref={ref} className={cn(className)} {...rest}>
      {children}
    </select>
  );
});
