import * as React from "react";

import { cn } from "@/src/lib/utils";
import { type LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
      <div className="relative w-full">
        {StartIcon && (
          <div className="absolute top-1/2 -translate-y-1/2 transform pl-[8px] pr-[8px]">
            <StartIcon size={18} className="text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400",
            startIcon ? "pl-[31px]" : "",
            endIcon ? "pr-8" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
            <EndIcon className="text-muted-foreground" size={18} />
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
