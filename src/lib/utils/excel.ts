import * as XLSX from "xlsx";

export function exportToExcel(rows: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportMultiSheetToExcel(
  sheets: { sheetName: string; rows: Record<string, unknown>[] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (const { sheetName, rows } of sheets) {
    // Excel 시트명: 최대 31자, 특수문자 제거
    let name = sheetName.replace(/[[\]:*?/\\]/g, "").slice(0, 31);
    // 중복 시트명 처리
    let unique = name;
    let suffix = 2;
    while (usedNames.has(unique)) {
      unique = name.slice(0, 28) + `(${suffix++})`;
    }
    usedNames.add(unique);

    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
    XLSX.utils.book_append_sheet(wb, ws, unique);
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
