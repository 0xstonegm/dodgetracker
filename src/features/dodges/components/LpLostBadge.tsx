import { cn } from "@/src/lib/utils";

export default function LpLostBadge(props: { lpLost: number }) {
  return (
    <p
      className={cn(
        "text-nowrap rounded-xl bg-opacity-35 p-1 text-xs md:px-2 md:text-sm",
        {
          "border-2 border-yellow-400 border-opacity-30 bg-yellow-400":
            props.lpLost <= 5,
          "border-2 border-red-400 border-opacity-30 bg-red-400":
            props.lpLost > 5,
        },
      )}
    >
      -{props.lpLost} LP
    </p>
  );
}
