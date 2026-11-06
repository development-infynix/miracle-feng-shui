/**
 * Two letters for a customer's avatar: the first and last words' initials ("Rishebs Kumar" is RK),
 * or, for a one-word name, its first and last letters ("rishebs" is RS).
 */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : first.length > 1 ? first[first.length - 1] : '';
  return (first[0] + last).toUpperCase();
}
