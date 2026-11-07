export default function Loading() {
  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-4 sm:gap-5 max-w-7xl mx-auto antialiased animate-pulse"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="h-9 w-32 rounded bg-white/10" />
      </div>
      {/* Action panel */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="h-5 w-40 rounded bg-gray-200 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
      {/* Sales panel */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="h-5 w-32 rounded bg-gray-200 mb-3" />
        <div className="h-40 rounded-xl bg-gray-100" />
      </div>
      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="h-5 w-36 rounded bg-gray-200 mb-3" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Recent orders table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="h-5 w-32 rounded bg-gray-200 mb-3" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
