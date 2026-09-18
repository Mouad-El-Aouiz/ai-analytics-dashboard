export function getFullName(
  fullName?: string | null
): string {
  return fullName?.trim() || "User";
}

export function getFirstName(
  fullName?: string | null
): string {
  const name = getFullName(fullName);

  return name.split(" ")[0];
}

export function getInitials(
  fullName?: string | null
): string {
  const name = getFullName(fullName);

  const parts = name
    .split(" ")
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}