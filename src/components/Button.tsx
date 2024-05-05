"use client";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // You can still add custom props if needed, for example:
  disabled?: boolean;
  customClassName?: string; // Example custom prop, if you need one
}

export const Button = ({
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  const enabledClass = !disabled
    ? "hover:bg-zinc-600 cursor-pointer"
    : "cursor-not-allowed";

  return (
    <button
      {...props}
      className={`rounded-md bg-zinc-800 p-1 align-middle ${enabledClass} ${className}`}
    >
      {children}
    </button>
  );
};
