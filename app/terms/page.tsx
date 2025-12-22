// app/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noteikumi | Lucera',
  description: 'Lucera vietnes un pakalpojumu lietošanas noteikumi.',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-900 mt-10 mb-3">{children}</h2>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <li className="ml-5 list-disc text-slate-800">{children}</li>;
}

export default function TermsPage() {
  const PROVIDER = {
    legalName: 'xx',
    regNo: 'xx',
    address: 'xx',
    email: 'go@lucera.site',
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Noteikumi</h1>
        <p className="mt-3 text-slate-600">
          Šie noteikumi regulē Lucera vietnes, mini-check, AI testa un audita pieprasījumu izmantošanu.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Pakalpojuma sniedzējs</div>
            <div className="mt-2 space-y-1">
              <div>{PROVIDER.legalName}</div>
              <div>Reģ. Nr.: {PROVIDER.regNo}</div>
              <div>Adrese: {PROVIDER.address}</div>
              <div>E-pasts: {PROVIDER.email}</div>
            </div>
          </div>
        </div>

        <SectionTitle>1. Pakalpojuma būtība</SectionTitle>
        <div className="space-y-3 text-slate-800">
          <p>
            Lucera sniedz informācijas strukturēšanas un redzamības novērtēšanas pakalpojumu, lai palīdzētu saprast,
            kā AI rīki var interpretēt publiski pieejamu informāciju par klīniku/ārstiem.
          </p>
          <ul className="space-y-2">
            <Bullet>
              <span className="font-semibold">Mini-check</span> — ātra publiskā satura un tehnisko signālu pārbaude.
            </Bullet>
            <Bullet>
              <span className="font-semibold">AI tests</span> — demonstrācija ar tipisku vaicājumu un AI atbildes piemēru (atbilde var mainīties).
            </Bullet>
            <Bullet>
              <span className="font-semibold">Audits</span> — padziļināta analīze un ieteikumi (ja pieprasīts/pasūtīts).
            </Bullet>
          </ul>
        </div>

        <SectionTitle>2. Svarīgs atrunājums: nav medicīnisks padoms</SectionTitle>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-800">
          <p className="font-semibold text-amber-900">Lucera nav medicīnisko konsultāciju pakalpojums.</p>
          <p className="mt-2 text-amber-900/90">
            Vietnē sniegtā informācija un AI testa rezultāti ir informatīvi un paredzēti redzamības/komunikācijas izvērtēšanai, nevis diagnozei vai ārstēšanas izvēlei.
          </p>
        </div>

        <SectionTitle>3. Neievadiet sensitīvus personas datus</SectionTitle>
        <div className="space-y-3 text-slate-800">
          <p className="font-semibold">Jūs apņematies AI jautājumu laukos neievadīt personas vai pacienta datus.</p>
          <ul className="space-y-2">
            <Bullet>nevajag ievadīt vārdu, uzvārdu, personas kodu, e-pastu, tālruni, adresi;</Bullet>
            <Bullet>nevajag ievadīt medicīnisku informāciju par konkrētu pacientu (diagnozes, analīzes, simptomi u.tml.).</Bullet>
          </ul>
          <p className="text-sm text-slate-600">
            Ja tomēr ievadāt sensitīvu informāciju, jūs to darāt pēc savas iniciatīvas un uz savu atbildību.
          </p>
        </div>

        <SectionTitle>4. AI rezultātu mainīgums</SectionTitle>
        <div className="space-y-3 text-slate-800">
          <p>
            AI sistēmas neveido stabilus “reitingus”. Atbildes var atšķirties atkarībā no jautājuma formulējuma, modeļa,
            lietotāja konteksta un publiski pieejamajiem datiem.
          </p>
          <ul className="space-y-2">
            <Bullet>Mēs negarantējam konkrētu “pozīciju” vai to, ka klīnika vienmēr tiks minēta.</Bullet>
            <Bullet>Mēs nodrošinām metodisku pieeju: auditējam signālus un dodam rīcības soļus, kas palielina iespēju tikt korekti saprastiem.</Bullet>
          </ul>
        </div>

        <SectionTitle>5. Lietojuma notikumu fiksēšana un iekšēji paziņojumi</SectionTitle>
        <div className="space-y-3 text-slate-800">
          <p>
            Lai uzlabotu pakalpojumu un operatīvi reaģētu uz pieprasījumiem, mēs varam fiksēt lietojuma notikumus (piem., veikts mini-check/AI tests)
            un nosūtīt iekšēju kopsavilkumu uz Lucera e-pastu.
          </p>
          <ul className="space-y-2">
            <Bullet>kopsavilkums var ietvert veikto darbību tipu, laiku, ievadīto URL/vaicājumu (ja ievadīts) un tehniskos metadatus;</Bullet>
            <Bullet>mēs necenšamies identificēt personu, ja vien lietotājs pats nav norādījis e-pastu (piem., audita formā).</Bullet>
          </ul>
          <p className="text-sm text-slate-600">
            Detalizēta informācija par datu apstrādi ir aprakstīta Privātuma politikā.
          </p>
        </div>

        <SectionTitle>6. Lietotāja atbildība</SectionTitle>
        <ul className="space-y-2">
          <Bullet>Jūs apstiprināt, ka ievadītā informācija (piem., klīnikas nosaukums, mājaslapa, e-pasts) ir korekta un jums ir tiesības to izmantot.</Bullet>
          <Bullet>Jūs neizmantosiet pakalpojumu ļaunprātīgi (spams, kaitniecīgi pieprasījumi, mēģinājumi apiet ierobežojumus).</Bullet>
        </ul>

        <SectionTitle>7. Intelektuālais īpašums</SectionTitle>
        <p className="text-slate-800">
          Vietnes saturs, dizains, metodika un audita struktūra ir Lucera (vai partneru) intelektuālais īpašums. Bez rakstiskas atļaujas tos nedrīkst masveidā kopēt vai izplatīt.
        </p>

        <SectionTitle>8. Atbildības ierobežojums</SectionTitle>
        <p className="text-slate-800">
          Pakalpojums tiek nodrošināts “kā ir”. Ciktāl to pieļauj piemērojamie tiesību akti, Lucera neatbild par netiešiem zaudējumiem vai trešo pušu rīcību,
          kas balstīta uz AI atbildēm.
        </p>

        <SectionTitle>9. Privātums</SectionTitle>
        <p className="text-slate-800">
          Personas datu apstrāde tiek veikta saskaņā ar Privātuma politiku.
        </p>

        <SectionTitle>10. Piemērojamie tiesību akti un strīdi</SectionTitle>
        <p className="text-slate-800">
          Noteikumiem piemērojami Latvijas Republikas tiesību akti. Strīdi vispirms risināmi sarunu ceļā; ja vienošanās nav iespējama — Latvijas tiesā.
        </p>

        <SectionTitle>11. Kontakti</SectionTitle>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
          <p>Jautājumiem par noteikumiem: <span className="font-semibold">{PROVIDER.email}</span></p>
        </div>

        <div className="mt-10 text-sm text-slate-500">Pēdējo reizi atjaunināts: {new Date().toISOString().slice(0, 10)}</div>
      </div>
    </main>
  );
}
