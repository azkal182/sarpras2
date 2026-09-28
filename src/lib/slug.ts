export function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
