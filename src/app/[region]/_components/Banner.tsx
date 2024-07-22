import { Rocket } from "lucide-react";

export default function Banner() {
  return (
    <div className="flex w-full items-center justify-center border-b border-zinc-900 bg-green-600 px-2 py-1">
      <div className="flex items-center gap-1 text-sm text-zinc-900 md:text-base">
        <Rocket className="size-14 sm:size-6" />
        <p>
          <b>Real-Time Updates!</b> Dodges will now automatically be sent from
          the server once they are detected. No need to manually fetch (or
          refresh the page).
        </p>
      </div>
    </div>
  );
}
