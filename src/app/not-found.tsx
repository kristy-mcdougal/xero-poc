import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-xero">404</p>
      <h1 className="mt-4 text-4xl font-extrabold">This page is not in this region</h1>
      <p className="mt-3 max-w-md text-center text-white/60">
        The path exists only where a page or blog post is assigned to the region.
      </p>
      <Link href="/" className="mt-8 rounded-full bg-xero px-5 py-2 text-sm font-semibold text-navy">
        Global home
      </Link>
    </main>
  );
}
