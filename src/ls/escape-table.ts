import { NSDatabase } from "@sqltools/types";

const pgCheckEscape = (w: string) => {
  return /[^a-z0-9_]/.test(w) ? `"${w}"` : w;
};

function escapeTableName(table: Partial<NSDatabase.ITable> | string) {
  const items: string[] = [];
  const tableObj =
    typeof table === "string" ? <NSDatabase.ITable>{ label: table } : table;

  tableObj.database && items.push(pgCheckEscape(tableObj.database));
  tableObj.schema && items.push(pgCheckEscape(tableObj.schema));
  items.push(pgCheckEscape(tableObj.label));
  return items.join(".");
}

export default escapeTableName;
