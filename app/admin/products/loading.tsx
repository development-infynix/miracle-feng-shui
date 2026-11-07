export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-gray-200" />
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-100" />
        <div className="h-10 w-44 rounded-lg bg-gray-100" />
      </div>

      {/* Card skeleton grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
          >
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-6 w-20 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
