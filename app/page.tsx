import Link from "next/link";

function LoginButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={`inline-flex items-center justify-center rounded-xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-red-500 ${className}`}>
      Log ind
    </Link>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-6 sm:p-8">
      {label && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-400/80">
          {label}
        </p>
      )}
      {title && (
        <h2 className="mb-3 text-lg font-bold text-white sm:text-xl">{title}</h2>
      )}
      <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{children}</p>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
        <div className="mt-[-10%] h-[500px] w-[500px] rounded-full bg-red-600/5 blur-[150px]" />
      </div>

      <main className="relative mx-auto max-w-lg px-5 pb-12 pt-10 sm:max-w-xl sm:pt-16">
        <header className="mb-10 text-center sm:mb-14">
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="text-3xl">🚕</span>
            <span className="text-xl font-black tracking-wide text-red-500">Byens Taxi</span>
          </div>

          <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
            Vid hvor turen er, før den sker.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            Byens Taxi viser din chauffør hvor der er gang i byen lige nu — efter tidspunkt, zoner og
            events — så han kører hen hvor turene er, i stedet for at lede. Mindre tomkørsel. Flere
            ture.
          </p>

          <div className="mt-8">
            <LoginButton />
          </div>
        </header>

        <div className="space-y-4 sm:space-y-5">
          <Section label="For chaufføren" title="Find den næste tur hurtigere">
            Åbn appen og se med det samme hvor der er størst sandsynlighed for ture — banegården om
            morgenen, centrum fredag nat, stadion når koncerten slutter. Færre tomme kilometer, flere
            ture pr. vagt.
          </Section>

          <Section label="For vognmanden" title="Se hvor din flåde tjener mest">
            Upload dine egne taxameter-data og se præcis hvilke dage, tidspunkter og zoner der giver
            mest. Planlæg vagter efter hvor pengene faktisk er — bygget på dine egne tal, ikke en stor
            platform.
          </Section>

          <Section title="Hvad Byens Taxi ikke er">
            Ikke et bookingsystem. Ikke en dispatch-central. Det rører ikke ved hvordan I fordeler
            ture. Det er et beslutnings-værktøj oven på det system I allerede har.
          </Section>
        </div>

        <footer className="mt-12 text-center sm:mt-16">
          <LoginButton />
          <p className="mt-6 text-xs text-slate-600">Byens Taxi</p>
        </footer>
      </main>
    </div>
  );
}
