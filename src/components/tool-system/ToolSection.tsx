import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function ToolSection({ title, children }: Props) {
  return (
    <section className="space-y-4 rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
