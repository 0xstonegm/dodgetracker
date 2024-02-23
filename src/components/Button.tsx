"use client";

export interface ButtonProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export const Button = ({
    label,
    onClick,
    disabled,
    className,
}: ButtonProps) => {
    const enabledClass = !disabled
        ? "hover:bg-zinc-600 cursor-pointer"
        : "cursor-not-allowed";

    return (
        <button
            className={`rounded-md bg-zinc-800 p-1 align-middle ${enabledClass} ${className}`}
            disabled={disabled}
            onClick={onClick ?? (() => {})}
        >
            {label}
        </button>
    );
};
