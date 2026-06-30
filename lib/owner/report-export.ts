import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import type { TaxameterAnalysis } from "./types";
import { formatKr } from "./taxameter-analysis";

export function downloadReportExcel(analysis: TaxameterAnalysis, aiReport?: string): void {
  const wb = XLSX.utils.book_new();

  const summary = [
    ["Nøgletal", ""],
    ["Firma", analysis.companyName],
    ["Samlet omsætning", analysis.totalRevenue],
    ["Antal ture", analysis.tripCount],
    ["Gns. pris pr. tur", analysis.avgTripPrice],
    ["Kilde", analysis.fileName || "Upload"],
    ["Analyseret", new Date(analysis.parsedAt).toLocaleString("da-DK")],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Nøgletal");

  const tripsSheet = [
    ["Dato", "Tid", "Beløb", "Chauffør", "Fra", "Til", "By", "Zone"],
    ...analysis.trips.map((t) => [
      t.date,
      t.time || "",
      t.amount,
      t.driver || "",
      t.from || "",
      t.to || "",
      t.city || "",
      t.zone || "",
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tripsSheet), "Ture");

  if (analysis.driverPerformance.length > 0) {
    const drivers = [
      ["Chauffør", "Ture", "Omsætning", "Gns. pris"],
      ...analysis.driverPerformance.map((d) => [d.name, d.trips, d.revenue, d.avgPrice]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(drivers), "Chauffører");
  }

  if (analysis.repeatAddresses.length > 0) {
    const repeats = [
      ["Adresse", "Antal", "Omsætning"],
      ...analysis.repeatAddresses.map((a) => [a.address, a.count, a.totalRevenue]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(repeats), "Gentagne adresser");
  }

  if (aiReport) {
    const lines = aiReport.split("\n").map((line) => [line]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lines), "AI-rapport");
  }

  const filename = `byens-taxi-taxameter-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function downloadReportPdf(analysis: TaxameterAnalysis, aiReport?: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  function addLine(text: string, size = 10, bold = false) {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += size * 0.45 + 2;
    }
  }

  const title = aiReport
    ? `Taxameter-analyse for ${analysis.companyName}`
    : `Taxameter-rapport · ${analysis.companyName}`;

  addLine(title, 16, true);
  y += 4;
  addLine(`Genereret: ${new Date().toLocaleString("da-DK")}`, 9);
  y += 6;

  if (aiReport) {
    for (const paragraph of aiReport.split("\n")) {
      if (!paragraph.trim()) {
        y += 3;
        continue;
      }
      const isHeading = /^\d+\.\s/.test(paragraph) || paragraph.startsWith("#");
      addLine(paragraph.replace(/^#+\s*/, ""), isHeading ? 12 : 10, isHeading);
      y += 2;
    }
  } else {
    addLine("Nøgletal", 12, true);
    addLine(`Samlet omsætning: ${formatKr(analysis.totalRevenue)}`);
    addLine(`Antal ture: ${analysis.tripCount}`);
    addLine(`Gennemsnitlig pris pr. tur: ${formatKr(analysis.avgTripPrice)}`);
    y += 4;

    addLine("Bedste dage", 12, true);
    for (const d of analysis.bestDays) {
      addLine(`${d.label}: ${formatKr(d.revenue)} (${d.trips} ture)`);
    }
    y += 4;

    addLine("Bedste tidspunkter", 12, true);
    for (const t of analysis.bestTimes) {
      addLine(`Kl. ${t.label}: ${formatKr(t.revenue)} (${t.trips} ture)`);
    }
    y += 4;

    addLine("Anbefalinger", 12, true);
    for (const tip of analysis.earningsTips) {
      addLine(`• ${tip}`);
    }
  }

  const filename = `byens-taxi-taxameter-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
