"use client";

import { cn } from "../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-md bg-zinc-800 p-1 align-middle transition-colors ease-in-out enabled:cursor-pointer enabled:hover:bg-zinc-600 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {props.children}
    </button>
  );
};
