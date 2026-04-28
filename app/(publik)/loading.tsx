export default function PublikLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-80 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      <div className="h-36 rounded-2xl bg-slate-200 animate-pulse" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse mx-auto mb-3" />
            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse mx-auto mb-1.5" />
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
            <div className="h-3.5 flex-1 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
