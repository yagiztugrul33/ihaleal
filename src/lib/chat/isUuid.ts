/** RFC 4122 sürüm 4 (Supabase `gen_random_uuid` ile uyumlu desen). */
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_V4.test(value.trim());
}
