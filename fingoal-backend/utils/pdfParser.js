import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function parsePDFTransactions(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);
    let text = data.text.replace(/\r/g, "").trim();

    text = text
      .replace(/([a-zA-Z])(-?\d)/g, "$1 $2") // add space before numbers (handles negatives)
      .replace(/(\d)([A-Za-z])/g, "$1 $2")   // add space after numbers
      .replace(/[ ]{2,}/g, " ")              // collapse multiple spaces
      .trim();

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    console.log("🔍 First few lines from PDF:", lines.slice(0, 10));

    const startIndex = lines.findIndex(l =>
      /Date\s*Category\s*Amount\s*Description/i.test(l.replace(/\s+/g, ""))
    );

    // Start right after header if found, otherwise assume first line of data
    const rows = lines.slice(startIndex >= 0 ? startIndex + 1 : 0);

    // Supports YYYY-MM-DD and both positive/negative amounts
    const regex =
      /(\d{4}-\d{2}-\d{2})\s+([A-Za-z]+)\s+(-?\d+(?:\.\d+)?)\s+(.+)/;

    const transactions = [];

    // Parse every line
    for (let i = 0; i < rows.length; i++) {
      const line = rows[i];
      const combined = line + " " + (rows[i + 1] || "");
      const match = combined.match(regex);

      if (match) {
        const [, date, category, amountStr, description] = match;
        const amount = parseFloat(amountStr);

        if (!isNaN(amount)) {
          transactions.push({
            date,
            category: category.trim(),
            amount,
            description: description.trim(),
          });
        }
      }
    }

    console.log(`✅ Parsed ${transactions.length} transactions from PDF`);
    if (transactions.length === 0) {
      console.warn("⚠️ No transactions matched. Check text spacing or regex.");
    }

    return transactions;
  } catch (err) {
    console.error("❌ PDF parsing error:", err);
    throw err;
  }
}
