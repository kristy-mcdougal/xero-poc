export function DemoBar({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="border-b border-black/5 bg-[#f4f7fa]">
      <div className="mx-auto grid max-w-6xl gap-3 px-4 py-3 text-xs sm:grid-cols-4 sm:px-6">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/40">{item.label}</p>
            <p className="font-mono text-navy">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
