// Petits utilitaires pour générer et télécharger des fichiers CSV côté
// navigateur. Aucune dépendance externe : suffisant pour un export simple.

// Échappe une valeur CSV : entoure de guillemets et double les guillemets
// internes si la valeur contient une virgule, un guillemet ou un saut de ligne.
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

// Construit une chaîne CSV à partir d'un en-tête et de lignes.
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const headerLine = headers.map(escapeCell).join(",");
  const bodyLines = rows.map((row) => row.map(escapeCell).join(","));

  return [headerLine, ...bodyLines].join("\n");
}

// Déclenche le téléchargement d'un fichier texte dans le navigateur.
export function downloadFile(
  filename: string,
  content: string,
  mimeType = "text/csv;charset=utf-8;"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Raccourci : construit le CSV puis le télécharge.
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  downloadFile(filename, toCsv(headers, rows));
}