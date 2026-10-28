const ENDPOINT = process.env.HYGRAPH_ENDPOINT!;
const TOKEN = process.env.HYGRAPH_TOKEN!;

export async function hygraphFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error(json.errors[0]?.message ?? "Hygraph error");
  }
  return json.data as T;
}
