"use client";

import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // You can still add custom props if needed, for example:
  disabled?: boolean;
  customClassName?: string; // Example custom prop, if you need one
}

export const Button = (props: ButtonProps) => {
  const enabledClass = !props.disabled
    ? "hover:bg-zinc-600 cursor-pointer"
    : "cursor-not-allowed";

  let className = "rounded-md bg-zinc-800 p-1 align-middle";

  let customClasses = twMerge(
    twMerge(className, enabledClass),
    props.className,
  );

  return (
    <button {...props} className={customClasses}>
      {props.children}
    </button>
  );
};
