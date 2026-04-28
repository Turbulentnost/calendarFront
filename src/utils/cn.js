/**
 * Склейка className для условных классов.
 * @param  {...(string|undefined|false|null|0)} parts
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
