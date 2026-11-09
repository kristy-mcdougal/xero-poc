import { chainAttrs, fieldAttrs, into, root } from "@/lib/preview";
import type { ComparisonTable, FeatureStatus, FeatureSupport } from "@/lib/types";

/**
 * Renders a product comparison as a styled table, from normalized data
 * (products as columns, feature groups/features as rows, one FeatureSupport
 * cell per product). Adding another competitor is a content change only.
 *
 * Click-to-edit is rooted at each Feature entry: the cell opens that feature's
 * Support component, the row label opens the feature name.
 */
export function ComparisonTableView({
  table,
  heading,
}: {
  table: ComparisonTable;
  heading?: string | null;
}) {
  const products = table.products ?? [];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {(heading || table.title) && (
        <h2 className="mb-8 text-center text-3xl font-extrabold text-navy">
          {heading || table.title}
        </h2>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/10 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[38%] bg-white p-4" />
              {products.map((p) => (
                <th
                  key={p.id}
                  className={`p-4 text-center align-middle ${
                    p.isPrimary ? "bg-xero/10" : "bg-white"
                  }`}
                >
                  <span
                    className={`inline-block rounded-lg px-4 py-1.5 text-lg font-extrabold ${
                      p.isPrimary ? "bg-xero text-navy" : "text-navy"
                    }`}
                  >
                    {p.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.featureGroups?.flatMap((group) =>
              (group.features ?? []).map((feature, i) => (
                <tr
                  key={feature.id}
                  className={i % 2 === 0 ? "bg-black/[0.02]" : "bg-white"}
                >
                  <th
                    scope="row"
                    className="p-4 align-middle text-sm font-semibold text-navy"
                    {...fieldAttrs(root(feature.id), "name")}
                  >
                    {feature.name}
                  </th>
                  {products.map((p) => {
                    const cell =
                      feature.support?.find((s) => s.product?.id === p.id) ?? null;
                    const target = cell
                      ? into(root(feature.id), "support", cell.id)
                      : null;
                    return (
                      <td
                        key={p.id}
                        className={`p-4 text-center align-middle ${
                          p.isPrimary ? "bg-xero/5" : ""
                        }`}
                        {...chainAttrs(target)}
                      >
                        <Cell cell={cell} editTarget={target} />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.note && (
        <p className="mt-4 text-center text-xs text-black/50">{table.note}</p>
      )}
    </section>
  );
}

function Cell({
  cell,
  editTarget,
}: {
  cell: FeatureSupport | null;
  editTarget: ReturnType<typeof into>;
}) {
  if (!cell) return <span className="text-black/30">—</span>;

  const hasStatus = Boolean(cell.supportStatus);
  return (
    <div className="flex flex-col items-center gap-1">
      {hasStatus && <StatusIcon status={cell.supportStatus as FeatureStatus} />}
      {cell.note && (
        <span
          className={`${hasStatus ? "text-xs text-black/55" : "text-sm font-medium text-navy"} max-w-[18rem] whitespace-pre-line leading-snug`}
          {...fieldAttrs(editTarget, "note")}
        >
          {cell.note}
        </span>
      )}
    </div>
  );
}

/** The Xero brand tick, matching the hand-drawn checkmark on the live site. */
function Tick({ className, title }: { className: string; title: string }) {
  return (
    <svg viewBox="0 0 18 18" className={`h-[18px] w-[18px] ${className}`} fill="none" stroke="currentColor" strokeWidth={2} role="img" aria-label={title}>
      <title>{title}</title>
      <path
        d="M3 10.5C4.33115 11.5286 5.37037 12.7132 6.59722 13.8333C7.27501 14.4522 7.40203 14.5441 7.65278 13.7083C8.83956 9.7524 12.3985 6.0745 15 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusIcon({ status }: { status: FeatureStatus }) {
  // Like the live site: supported capabilities show a tick and the caption
  // carries any nuance. Partial uses a muted tick so it stays distinguishable
  // without a loud warning sign.
  if (status === "INCLUDED") return <Tick className="text-[#17a86a]" title="Included" />;
  if (status === "PARTIAL") return <Tick className="text-black/35" title="Partial / conditional" />;
  if (status === "ADD_ON") {
    return (
      <span className="rounded-full border border-navy/20 px-2.5 py-0.5 text-xs font-semibold text-navy" title="Add-on">
        Add-on
      </span>
    );
  }
  // NOT_INCLUDED — subtle, no loud cross.
  return <span className="text-lg leading-none text-black/25" title="Not included">–</span>;
}
