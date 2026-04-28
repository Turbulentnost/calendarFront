import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

export const Textarea = forwardRef(function Textarea(
  { className, ...rest },
  ref
) {
  return <textarea ref={ref} className={cn(className)} {...rest} />;
});
