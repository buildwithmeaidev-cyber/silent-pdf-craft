interface Props {
  title: string;
  description: string;
}

export default function EmptyState({
  title,
  description,
}: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
      <h3 className="text-xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-slate-600">
        {description}
      </p>
    </div>
  );
}