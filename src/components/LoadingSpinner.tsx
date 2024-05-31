import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

type LoadingSpinnerProps = React.HTMLAttributes<HTMLDivElement>;

function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div role="status">
      {" "}
      <Loader2
        className={cn("size-20 animate-spin md:size-24", className)}
      />{" "}
      <span className="sr-only">Loading...</span>{" "}
    </div>
  );
}
export default LoadingSpinner;
