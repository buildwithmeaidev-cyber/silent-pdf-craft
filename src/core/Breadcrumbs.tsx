import { Link } from "react-router-dom";

interface Props {
  current: string;
}

export default function Breadcrumbs({
  current,
}: Props) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
      <Link
        to="/"
        className="hover:text-slate-700"
      >
        Home
      </Link>

      <span>/</span>

      <Link
        to="/tools"
        className="hover:text-slate-700"
      >
        PDF Tools
      </Link>

      <span>/</span>

      <span className="font-medium text-slate-700">
        {current}
      </span>
    </div>
  );
}