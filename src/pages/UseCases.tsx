import { GraduationCap, Briefcase, Users, BookOpen, Building2 } from "lucide-react";

const items = [
  { i: GraduationCap, t: "Students", d: "Combine lecture notes, trim readings, and hand in clean PDFs without paying a subscription.", color: "bg-primary-soft text-primary" },
  { i: Briefcase, t: "Freelancers", d: "Send polished proposals and invoices. Compress before sending. Protect what matters.", color: "bg-accent-soft text-accent" },
  { i: Users, t: "HR Teams", d: "Process onboarding packets and offer letters without ever uploading sensitive PII to a third party.", color: "bg-primary-soft text-primary" },
  { i: BookOpen, t: "Teachers", d: "Bundle class material into single handouts and remove pages students don't need.", color: "bg-accent-soft text-accent" },
  { i: Building2, t: "Small businesses", d: "Compress, sign, and ship contracts in seconds — no enterprise software required.", color: "bg-primary-soft text-primary" },
];

const UseCases = () => (
  <div className="container-px mx-auto max-w-7xl py-16 md:py-20">
    <div className="max-w-2xl">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Use cases</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">Built for the people who do the work.</h1>
      <p className="mt-4 text-muted-foreground">Real teams using silentPDF every day.</p>
    </div>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((u) => (
        <div key={u.t} className="rounded-2xl border bg-card p-7 hover:shadow-lift transition-shadow">
          <div className={`grid place-items-center size-12 rounded-xl ${u.color}`}>
            <u.i className="size-6" strokeWidth={1.7} />
          </div>
          <h3 className="mt-6 font-serif text-2xl">{u.t}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{u.d}</p>
        </div>
      ))}
    </div>
  </div>
);

export default UseCases;
