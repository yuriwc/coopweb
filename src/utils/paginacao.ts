// Números de página com reticências quando a lista é longa: 1 … 4 5 6 … 12
export function janelaPaginas(atual: number, total: number): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const alvos = [1, total, atual, atual - 1, atual + 1].filter(
    (p) => p >= 1 && p <= total
  );
  const unicas = [...new Set(alvos)].sort((a, b) => a - b);

  return unicas.flatMap((pagina, i) =>
    i > 0 && pagina - unicas[i - 1] > 1
      ? (["...", pagina] as Array<number | "...">)
      : [pagina]
  );
}
