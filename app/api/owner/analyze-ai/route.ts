import { NextResponse } from "next/server";
import type { TaxameterAnalysis } from "@/lib/owner/types";
import { formatKr } from "@/lib/owner/taxameter-analysis";

function buildFallbackReport(analysis: TaxameterAnalysis): string {
  const weakDays = [...analysis.bestDays].reverse().slice(0, 2);
  const weakTimes = [...analysis.bestTimes].reverse().slice(0, 2);

  return `# Taxameter-analyse for ${analysis.companyName}

1. Kort konklusion
Perioden viser ${analysis.tripCount} ture med samlet omsætning på ${formatKr(analysis.totalRevenue)}. Gennemsnitlig turpris er ${formatKr(analysis.avgTripPrice)}. Der er tydelige peak-perioder omkring ${analysis.bestTimes[0]?.label ?? "morgen/aften"} og ${analysis.bestDays[0]?.label ?? "ugedage"}, som bør prioriteres i vagtplanlægningen.

2. Nøgletal
- Samlet omsætning: ${formatKr(analysis.totalRevenue)}
- Antal ture: ${analysis.tripCount}
- Gennemsnitlig pris pr. tur: ${formatKr(analysis.avgTripPrice)}
- Aktive zoner: ${analysis.topZones.length}
- Gentagne adresser: ${analysis.repeatAddresses.length}

3. Bedste indtjeningsperioder
${analysis.bestDays.map((d) => `- ${d.label}: ${formatKr(d.revenue)} (${d.trips} ture)`).join("\n")}

Tidspunkter:
${analysis.bestTimes.map((t) => `- Kl. ${t.label}: ${formatKr(t.revenue)} (${t.trips} ture)`).join("\n")}

4. Svage perioder
${weakDays.map((d) => `- ${d.label}: ${formatKr(d.revenue)} — overvej færre vogne eller B2B-kørsel`).join("\n")}
${weakTimes.map((t) => `- Kl. ${t.label}: lavere aktivitet — brug tiden til vedligehold/administration`).join("\n")}

5. Gentagne kunder/adresser
${analysis.repeatAddresses.length > 0 ? analysis.repeatAddresses.map((a) => `- ${a.address} (${a.count} ture, ${formatKr(a.totalRevenue)})`).join("\n") : "- Ingen tydelige gentagne adresser i datasættet."}

6. Anbefalinger til drift
- Planlæg vagter tæt på Banegården og Sygehus i Horsens om morgenen.
- Hold standby ved Centrum/Natteliv fredag-lørdag aften.
- Brug Byens Taxi til at flytte vogne før peak, ikke efter.

7. Muligheder for mere omsætning
${analysis.earningsTips.map((t) => `- ${t}`).join("\n")}

8. Næste konkrete handlinger
- Kontakt top 3 gentagne adresser med tilbud om faste aftaler.
- Justér vagtplan efter bedste dage/tidspunkter næste uge.
- Upload ny taxameter-fil ugentligt for løbende tracking.
- Gennemgå chauffør-performance med teamet hver mandag.`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { analysis?: TaxameterAnalysis };
  const analysis = body.analysis;

  if (!analysis) {
    return NextResponse.json({ error: "Analyse-data mangler" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ report: buildFallbackReport(analysis), source: "template" });
  }

  const prompt = `Du er en erfaren forretningskonsulent for danske taxa-vognmænd.
Skriv en professionel rapport på dansk baseret på disse taxameter-data (JSON):
${JSON.stringify({
  companyName: analysis.companyName,
  totalRevenue: analysis.totalRevenue,
  tripCount: analysis.tripCount,
  avgTripPrice: analysis.avgTripPrice,
  bestDays: analysis.bestDays,
  bestTimes: analysis.bestTimes,
  topZones: analysis.topZones,
  driverPerformance: analysis.driverPerformance,
  repeatAddresses: analysis.repeatAddresses,
  earningsTips: analysis.earningsTips,
})}

Rapporten skal have præcis disse sektioner:
Overskrift: "Taxameter-analyse for ${analysis.companyName}"
1. Kort konklusion
2. Nøgletal
3. Bedste indtjeningsperioder
4. Svage perioder
5. Gentagne kunder/adresser
6. Anbefalinger til drift
7. Muligheder for mere omsætning
8. Næste konkrete handlinger

Skriv konkret og handlingsorienteret for en vognmand i Horsens. Brug kr.-beløb. Ingen markdown-kodeblokke.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic error:", errText);
      return NextResponse.json({ report: buildFallbackReport(analysis), source: "template" });
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text;

    if (!text) {
      return NextResponse.json({ report: buildFallbackReport(analysis), source: "template" });
    }

    return NextResponse.json({ report: text, source: "ai" });
  } catch (err) {
    console.error("AI analyse fejl:", err);
    return NextResponse.json({ report: buildFallbackReport(analysis), source: "template" });
  }
}
