// Specializāciju un to tipiskie AI vaicājumi

export const specialties = [
  { value: 'fleboloģija', label: 'Fleboloģija' },
  { value: 'traumatoloģija', label: 'Traumatoloģija' },
  { value: 'kardioloģija', label: 'Kardioloģija' },
  { value: 'dermatoloģija', label: 'Dermatoloģija' },
  { value: 'ginekoloģija', label: 'Ginekoloģija' },
  { value: 'kosmētiskā_ķirurģija', label: 'Kosmētiskā ķirurģija' },
  { value: 'weight_loss', label: 'Svara zudums / Bariatriskā ķirurģija' },
  { value: 'zobārstniecība', label: 'Zobārstniecība' },
  { value: 'fizioterapija', label: 'Fizioterapija' },
  { value: 'ortopēdija', label: 'Ortopēdija' },
  { value: 'oftalmoloģija', label: 'Oftalmoloģija' },
  { value: 'diagnostika_usg', label: 'Diagnostika (USG)' },
  { value: 'diagnostika_mr', label: 'Diagnostika (Magnētiskā rezonanse)' },
  { value: 'psiholoģija', label: 'Psiholoģija' },
  { value: 'psihoterapija', label: 'Psihoterapija' },
];

// Prēģenerēti vaicājumi katrai specialitātei
export const preGeneratedQueries: Record<string, string[]> = {
  fleboloģija: [
    'Kur Rīgā labākais flebologs?',
    'Kur ārstēt varikozi Latvijā?',
    'Labākā vēnu klīnika Rīgā',
    'Kur izņemt vēnu tīklus Rīgā?',
    'Flebologs Rīgā - kurš labākais?',
  ],
  
  traumatoloģija: [
    'Kurš labākais traumatologs ceļgala operācijai Rīgā?',
    'Sporta traumu ārstēšana Rīgā',
    'Kur ārstēt locītavu traumas Latvijā?',
    'Labākā traumatoloģijas klīnika Rīgā',
    'Kur operēt pleca locītavu Rīgā?',
  ],
  
  kardioloģija: [
    'Labākais kardiologs Rīgā',
    'Kur pārbaudīt sirdi Latvijā?',
    'Kardioloģijas klīnika Rīgā',
    'Sirds diagnostika Rīgā - kur labāk?',
    'Kurš labākais kardiologs hipertensijas ārstēšanai?',
  ],
  
  dermatoloģija: [
    'Labākais dermatologs Rīgā',
    'Kur ārstēt akni Latvijā?',
    'Dermatoloģijas klīnika Rīgā',
    'Ādas slimību ārstēšana Rīgā',
    'Kurš labākais dermatologs psoriāzes ārstēšanai?',
  ],
  
  ginekoloģija: [
    'Labākais ginekologs Rīgā',
    'Kur apmeklēt ginekologu Latvijā?',
    'Ginekoloģijas klīnika Rīgā',
    'Labākā sieviešu klīnika Rīgā',
    'Kur ārstēt endometriozi Rīgā?',
  ],
  
  kosmētiskā_ķirurģija: [
    'Labākā plastiskās ķirurģijas klīnika Rīgā',
    'Kur palielināt krūtis Latvijā?',
    'Sejas lifting Rīgā - kurš labākais?',
    'Kosmētiskā ķirurģija Rīgā',
    'Labākais plastiskais ķirurgs Latvijā',
  ],
  
  weight_loss: [
    'Kur veikt bariatrisko operāciju Rīgā?',
    'Svara zuduma programmas Latvijā',
    'Kuņģa bypass operācija Rīgā',
    'Labākā svara zuduma klīnika Rīgā',
    'Kur ārstēt aptaukošanos Latvijā?',
  ],
  
  zobārstniecība: [
    'Labākais zobārsts Rīgā',
    'Kur implantēt zobus Latvijā?',
    'Zobārstniecības klīnika Rīgā',
    'Zobu implanti Rīgā - kur labāk?',
    'Estētiskā zobārstniecība Rīgā',
  ],
  
  fizioterapija: [
    'Labākais fizioterapeits Rīgā',
    'Kur apmeklēt fizioterapiju Latvijā?',
    'Fizioterapijas klīnika Rīgā',
    'Muguras sāpju ārstēšana Rīgā',
    'Rehabilitācijas centrs Rīgā',
  ],
  
  ortopēdija: [
    'Labākais ortopēds Rīgā',
    'Kur operēt locītavas Latvijā?',
    'Ortopēdijas klīnika Rīgā',
    'Ceļa locītavas maiņa Rīgā',
    'Mugurkaula ķirurģija Rīgā',
  ],
  
  oftalmoloģija: [
    'Labākais acu ārsts Rīgā',
    'Kur operēt kataraktu Latvijā?',
    'Oftalmoloģijas klīnika Rīgā',
    'LASIK operācija Rīgā',
    'Redzes korekcija Rīgā - kur labāk?',
  ],
  
  diagnostika_usg: [
    'Kur veikt ultraskaņu Rīgā?',
    'Labākā diagnostikas klīnika Rīgā',
    'USG izmeklējumi Rīgā',
    'Kur veikt vēdera dobuma ultraskaņu?',
    '4D ultraskaņa grūtniecēm Rīgā',
  ],
  
  diagnostika_mr: [
    'Kur veikt MR Rīgā?',
    'Magnētiskā rezonanse Rīgā',
    'MR izmeklējums Rīgā - kur labāk?',
    'Galvas MR Rīgā',
    'Labākā MR diagnostika Latvijā',
  ],
  
  psiholoģija: [
    'Labākais psihologs Rīgā',
    'Kur apmeklēt psihologu Latvijā?',
    'Bērnu psihologs Rīgā',
    'Ģimenes psihologs Rīgā',
    'Online psihologs Latvijā',
  ],
  
  psihoterapija: [
    'Labākais psihoterapeits Rīgā',
    'Kur apmeklēt psihoterapiju Latvijā?',
    'Kognitīvi uzvedības terapija Rīgā',
    'Psihoterapija depresijai Rīgā',
    'Traumas terapija Rīgā',
  ],
};

// Helper funkcija lai iegūtu random query
export function getRandomQuery(specialty: string): string {
  const queries = preGeneratedQueries[specialty];
  if (!queries || queries.length === 0) {
    return `Kur Rīgā labākais ${specialty} speciālists?`;
  }
  return queries[Math.floor(Math.random() * queries.length)];
}

// Helper funkcija lai iegūtu visus queries
export function getAllQueries(specialty: string): string[] {
  return preGeneratedQueries[specialty] || [];
}