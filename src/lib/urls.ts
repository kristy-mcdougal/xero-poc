const REGION_PREFIXES = new Set(["au", "nz", "uk"]);

export function parsePath(segments: string[] = []) {
  if (segments[0] === "how-it-works") {
    return { kind: "docs" as const, prefix: "", path: "how-it-works" };
  }
  if (!segments.length) return { kind: "page" as const, prefix: "", path: "home" };
  if (REGION_PREFIXES.has(segments[0])) {
    const rest = segments.slice(1);
    return { kind: "page" as const, prefix: segments[0], path: rest.length ? rest.join("/") : "home" };
  }
  return { kind: "page" as const, prefix: "", path: segments.join("/") };
}

export function publicPath(prefix: string, path: string) {
  const base = prefix ? `/${prefix}` : "";
  if (path === "home" || path === "") return base || "/";
  return `${base}/${path}`;
}

export function blogPath(prefix: string, slug: string) {
  return publicPath(prefix, `blog/${slug}`);
}

export function pathnameForMatch(path: string) {
  return path === "home" ? "/" : `/${path}`;
}

export function matchPattern(pattern: string, pathname: string) {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1);
    return pathname.startsWith(prefix) && pathname.length > prefix.length;
  }
  return pathname === pattern;
}
