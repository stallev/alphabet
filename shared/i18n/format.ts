export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in values)) {
      return match;
    }
    return String(values[key]);
  });
}
