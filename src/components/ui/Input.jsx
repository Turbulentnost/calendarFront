import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

export const Input = forwardRef(function Input(
  { className, ...rest },
  ref
) {
  return <input ref={ref} className={cn(className)} {...rest} />;
});
