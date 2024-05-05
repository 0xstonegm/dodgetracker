import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  description: "Dodge statistics",
};

export default function Stats() {
  return (
    <div className="flex h-[90vh] items-center justify-center">
      <p>Dodge statistics will be available soon.</p>
    </div>
  );
}
