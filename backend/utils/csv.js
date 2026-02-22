import { Parser } from "json2csv";

export function sendCsv(res, rows, fields, fileName) {
  const parser = new Parser({ fields });
  const csv = parser.parse(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  return res.status(200).send(csv);
}
