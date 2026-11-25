export function staffReturnPath(value: unknown): string {
  if (typeof value === "string" && /^\/staff\/verify\/[A-Za-z0-9_-]{32,64}$/.test(value)) return value;
  return "/staff";
}
