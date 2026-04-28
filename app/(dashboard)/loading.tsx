export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-3.5 w-56 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
          <div className="w-12 h-6 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse mb-3" />
              <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
