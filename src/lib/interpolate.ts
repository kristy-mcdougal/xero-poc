export function interpolate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function discountedPrice(base: number, percentage: number) {
  return Math.round(base * (1 - percentage / 100) * 100) / 100;
}

export function money(value: number) {
  return `$${value.toFixed(value % 1 ? 2 : 0)}`;
}
