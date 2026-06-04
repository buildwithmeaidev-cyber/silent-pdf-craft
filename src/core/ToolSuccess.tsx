interface Props {
  title: string;
  description: string;
  downloadUrl?: string;
}

export default function ToolSuccess({
  title,
  description,
  downloadUrl,
}: Props) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
      <h3 className="text-xl font-bold text-emerald-900">
        {title}
      </h3>

      <p className="mt-2 text-emerald-700">
        {description}
      </p>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download="merged.pdf"
          className="mt-5 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white"
        >
          Download PDF
        </a>
      )}
    </div>
  );
}