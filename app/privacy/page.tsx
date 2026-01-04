// app/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privātuma politika | Lucera',
  description: 'Privātuma politika par personas datu apstrādi, izmantojot Lucera vietni un audita pieprasījumus.',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-900 mt-10 mb-3">{children}</h2>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <li className="ml-5 list-disc text-slate-800">{children}</li>;
}

export default function PrivacyPage() {
  // Rekvizīti vēl nav — ieliekam placeholder
  const CONTROLLER = {
    //legalName: 'xx',
    //regNo: 'xx',
    //address: 'xx',
    email: 'go@lucera.site',
    phone: '+371 29 229 686',
  };

  // Pielāgo pēc realitātes (īpaši e-pasts / DB / AI)
  const PROCESSORS = [
    'Vercel (hostings / servera infrastruktūra)',
    //'E-pasta pakalpojumu sniedzējs (iekšēji paziņojumi + audita nosūtīšana) — xx',
    //'Datubāze / CRM (ja glabā leadus vai notikumus) — xx',
    'AI modeļu nodrošinātāji (AI testam / interpretācijai), ja izmanto — ChatGPT un Claude',
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Privātuma politika</h1>
        <p className="mt-3 text-slate-600">
          Šī privātuma politika skaidro, kā Lucera vietnē tiek apstrādāti personas dati, kad jūs pieprasāt auditu, izmantojat mini-check vai AI testu.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Datu pārzinis</div>
            <div className="mt-2 space-y-1">

              <div>E-pasts: {CONTROLLER.email}</div>
              <div>Tālrunis: {CONTROLLER.phone}</div>
            </div>
          </div>
        </div>

        <SectionTitle>Svarīgi: neievadiet sensitīvus personas datus</SectionTitle>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-800">
          <p className="font-semibold text-amber-900">Lūdzu, AI jautājuma laukos neievadiet pacienta/personas datus.</p>
          <ul className="mt-2 space-y-2">
            <Bullet>neievadiet vārdu, uzvārdu, personas kodu, tālruni, e-pastu, adresi;</Bullet>
            <Bullet>neievadiet medicīnisku informāciju par konkrētu pacientu (diagnozes, analīzes, simptomi u.tml.).</Bullet>
          </ul>
          <p className="mt-3 text-sm text-amber-900/90">
            Šis rīks ir paredzēts klīnikas publiskās informācijas un redzamības izvērtēšanai, nevis pacienta gadījumu analīzei.
          </p>
        </div>

        <SectionTitle>Kādus datus mēs apstrādājam</SectionTitle>
        <ul className="space-y-2">
          <Bullet>
            <span className="font-semibold">Kontaktdati:</span> e-pasts, (ja norādīts), ārsta vārds un uzvārds, klīnikas nosaukums.
          </Bullet>
          <Bullet>
            <span className="font-semibold">Auditam:</span> mājaslapas adrese/domēns, izvēlētā specializācija, avots (piem., “free-audit-form”).
          </Bullet>
          <Bullet>
            <span className="font-semibold">AI testam:</span> ievadītais jautājums AI un (ja norādīts) klīnikas nosaukums.
          </Bullet>
          <Bullet>
            <span className="font-semibold">Lietojuma notikumi (event logs):</span> darbības kā “mini-check veikts”, “AI tests veikts”, ievades laiks,
            pārbaudītais URL (ja ievadīts), izvēlētā specialitāte (ja izvēlēta), kā arī tehniskie metadati (piem., pārlūka tips/ierīce).
          </Bullet>
          <Bullet>
            <span className="font-semibold">Tehniskie dati:</span> piekļuves žurnāli (piem., IP adrese, datums/laiks, pieprasījuma metadati) drošībai un kļūdu diagnostikai.
          </Bullet>
        </ul>

        <SectionTitle>Kāpēc mēs apstrādājam datus un uz kāda pamata</SectionTitle>
        <div className="space-y-4 text-slate-800">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-900">1) Audita pieprasījuma apstrāde un nosūtīšana</div>
            <ul className="mt-2 space-y-2">
              <Bullet>
                <span className="font-semibold">Mērķis:</span> sagatavot un nosūtīt audita rezultātus uz norādīto e-pastu.
              </Bullet>
              <Bullet>
                <span className="font-semibold">Tiesiskais pamats:</span> līguma noslēgšanas darbības / leģitīmās intereses (pakalpojuma nodrošināšana pēc pieprasījuma).
              </Bullet>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-900">2) Mini-check un AI tests</div>
            <ul className="mt-2 space-y-2">
              <Bullet>
                <span className="font-semibold">Mērķis:</span> nodrošināt rīka funkcionalitāti un parādīt redzamības signālus / atbildes piemēru.
              </Bullet>
              <Bullet>
                <span className="font-semibold">Tiesiskais pamats:</span> leģitīmās intereses (rīka nodrošināšana un kvalitātes uzlabošana) / līguma noslēgšanas darbības.
              </Bullet>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-900">3) Iekšēji paziņojumi par aktivitātēm (uz e-pastu)</div>
            <ul className="mt-2 space-y-2">
              <Bullet>
                <span className="font-semibold">Mērķis:</span> operatīvi saprast, kas lietotājiem interesē (piem., vai veikts mini-check/AI tests),
                uzlabot produktu un atbildēt uz pieprasījumiem.
              </Bullet>
              <Bullet>
                <span className="font-semibold">Ko tieši sūtām:</span> kopsavilkumu par darbībām (piem., “veikts mini-check”, “AI tests”, ievadītais URL/vaicājums,
                laiks, ierīces tips). Mēs necenšamies identificēt personu, ja vien lietotājs pats nav norādījis e-pastu.
              </Bullet>
              <Bullet>
                <span className="font-semibold">Tiesiskais pamats:</span> leģitīmās intereses (pakalpojuma kvalitāte un operatīvā apkalpošana).
              </Bullet>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-900">4) Drošība un krāpšanas novēršana</div>
            <ul className="mt-2 space-y-2">
              <Bullet>
                <span className="font-semibold">Mērķis:</span> aizsargāt sistēmu pret ļaunprātīgiem pieprasījumiem, uzturēt stabilitāti.
              </Bullet>
              <Bullet>
                <span className="font-semibold">Tiesiskais pamats:</span> leģitīmās intereses.
              </Bullet>
            </ul>
          </div>
        </div>

        <SectionTitle>Kam mēs varam nodot datus</SectionTitle>
        <p className="text-slate-800">
          Mēs varam nodot datus tikai tik, cik nepieciešams pakalpojuma nodrošināšanai (piem., hostings, e-pasts, datubāze, AI apstrāde).
        </p>
        <ul className="mt-3 space-y-2">
          {PROCESSORS.map((p) => (
            <Bullet key={p}>{p}</Bullet>
          ))}
        </ul>

        <SectionTitle>Datu glabāšanas termiņš</SectionTitle>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
          <ul className="space-y-2">
            <Bullet>
              Audita pieprasījuma dati (lead forma) tiek glabāti līdz <span className="font-semibold">30 dienām</span>, lai nodrošinātu nosūtīšanu un saziņu (ja vien nav citas vienošanās).
            </Bullet>
            <Bullet>
              Lietojuma notikumi (event logs) un iekšējo paziņojumu dati tiek glabāti līdz <span className="font-semibold">90 dienām</span> produkta uzlabošanai un diagnostikai.
            </Bullet>
            <Bullet>
              Tehniskie žurnāli drošībai/diagnostikai — saprātīgu laiku (piem., līdz <span className="font-semibold">90 dienām</span>).
            </Bullet>
          </ul>

        </div>

        <SectionTitle>Jūsu tiesības</SectionTitle>
        <p className="text-slate-800">
          Jums ir tiesības pieprasīt piekļuvi saviem datiem, labošanu, dzēšanu, apstrādes ierobežošanu, iebilst pret apstrādi un saņemt datu kopiju,
          kā arī iesniegt sūdzību uzraudzības iestādei (Datu valsts inspekcija).
        </p>

        <SectionTitle>Datu drošība</SectionTitle>
        <p className="text-slate-800">
          Mēs izmantojam saprātīgus tehniskus un organizatoriskus pasākumus, lai aizsargātu datus pret nesankcionētu piekļuvi, izpaušanu vai zudumu.
        </p>

        <SectionTitle>Izmaiņas politikā</SectionTitle>
        <p className="text-slate-800">Mēs varam atjaunināt šo politiku. Aktuālā versija vienmēr ir pieejama šajā lapā.</p>

        <div className="mt-10 text-sm text-slate-500">Pēdējo reizi atjaunināts: {new Date().toISOString().slice(0, 10)}</div>
      </div>
    </main>
  );
}
