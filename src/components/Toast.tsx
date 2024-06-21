import toast, { Toast } from "react-hot-toast";
import { cn } from "../lib/utils";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  t: Toast;
}

export default function Toast({
  t,
  className,
  children,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        "max-w-md rounded-md bg-zinc-900 p-2 shadow-lg",
        {
          "animate-enter": t.visible,
          "animate-leave": !t.visible,
        },
        className,
      )}
      onClick={() => toast.dismiss(t.id)}
      {...props}
    >
      {children}
    </div>
  );
}
