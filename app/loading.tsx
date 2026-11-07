export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100]">
      <div className="h-1 w-full bg-[#E1E3DF]">
        <div className="h-full w-1/3 animate-pulse bg-[#222222]" />
      </div>
    </div>
  );
}
