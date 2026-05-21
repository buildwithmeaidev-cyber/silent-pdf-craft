import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_SCHEMES = {
  violet: {
    iconBg: 'bg-violet-50 text-violet-600 border-violet-100',
    titleGradient: 'from-violet-600 to-indigo-600',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    titleGradient: 'from-emerald-600 to-teal-600',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    titleGradient: 'from-amber-600 to-orange-500',
  },
  cyan: {
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    titleGradient: 'from-cyan-600 to-blue-600',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    titleGradient: 'from-indigo-600 to-violet-600',
  },
  orange: {
    iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
    titleGradient: 'from-orange-600 to-red-500',
  },
  red: {
    iconBg: 'bg-red-50 text-red-600 border-red-100',
    titleGradient: 'from-red-600 to-rose-600',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    titleGradient: 'from-blue-600 to-indigo-600',
  },
};

export default function ToolPageLayout({ icon: Icon, title, description, color = 'blue', children }) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.blue;

  return (
    <div className="container-px mx-auto max-w-5xl py-12 md:py-16">
      {/* Back Button */}
      <Link 
        to="/tools" 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
        Back to Tools
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5 mb-10">
        {Icon && (
          <div className={cn(
            "grid place-items-center w-14 h-14 rounded-2xl border shadow-sm shrink-0",
            scheme.iconBg
          )}>
            <Icon className="w-7 h-7" strokeWidth={1.8} />
          </div>
        )}
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 max-w-2xl text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
