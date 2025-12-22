'use client';

import React from 'react';

type Point = { year: string; value: number; index: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// “Nice ticks” (1/2/5 * 10^k) – lai ass izskatās saprotami
function niceStep(range: number, ticks: number) {
  const rough = range / Math.max(1, ticks);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const scaled = rough / pow;

  let nice = 1;
  if (scaled >= 5) nice = 5;
  else if (scaled >= 2) nice = 2;
  else nice = 1;

  return nice * pow;
}

function niceDomain(min: number, max: number, ticks: number) {
  if (min === max) return { min: min - 1, max: max + 1, step: 1, ticks: [min] };

  const range = max - min;
  const step = niceStep(range, ticks);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const out: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) out.push(Number(v.toFixed(6)));

  return { min: niceMin, max: niceMax, step, ticks: out };
}

function pctChange(from: number, to: number) {
  if (!from) return 0;
  return Math.round(((to - from) / from) * 100);
}

export default function AICostComparison() {
  // ✅ Ilustratīvi EUR (nevis “indekss”), lai var interpretēt
  // Pielāgo skaitļus, ja tev ir cits stāsts/niša.
  const withoutAI: Point[] = [
    { year: '2025', value: 12, index: 0 },
    { year: '2026', value: 14.5, index: 1 },
    { year: '2027', value: 17.5, index: 2 },
    { year: '2028', value: 20.5, index: 3 },
  ];

  const withAI: Point[] = [
    { year: '2025', value: 12, index: 0 },
    { year: '2026', value: 12.8, index: 1 },
    { year: '2027', value: 13.4, index: 2 },
    { year: '2028', value: 13.6, index: 3 },
  ];

  const ChartCard = ({
    title,
    subtitle,
    data,
    color,
  }: {
    title: string;
    subtitle: string;
    data: Point[];
    color: 'red' | 'cyan';
  }) => {
    const chartHeight = 320;
    const chartWidth = 560;
    const padding = 54;

    const stroke = color === 'red' ? '#ef4444' : '#06b6d4';

    // Domain (nice)
    const values = data.map((d) => d.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);

    // Mazs “breathing room”
    const pad = (rawMax - rawMin) * 0.18 || 1.2;
    const domain = niceDomain(rawMin - pad, rawMax + pad, 5);

    const yFor = (v: number) => {
      const t = (v - domain.min) / (domain.max - domain.min);
      return chartHeight - padding - t * (chartHeight - padding * 2);
    };

    const xFor = (i: number) =>
      padding + (i * (chartWidth - padding * 2)) / Math.max(1, data.length - 1);

    const points = data.map((p, i) => ({
      ...p,
      x: xFor(i),
      y: yFor(p.value),
    }));

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaPath = `
      M ${points[0].x} ${chartHeight - padding}
      L ${points[0].x} ${points[0].y}
      ${points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')}
      L ${points[points.length - 1].x} ${chartHeight - padding}
      Z
    `;

    const base = data[0].value;
    const last = data[data.length - 1].value;
    const change = pctChange(base, last);

    const labelColor = 'rgba(15,23,42,0.62)'; // slate-ish uz balta fona
    const gridColor = 'rgba(15,23,42,0.10)';
    const axisColor = 'rgba(15,23,42,0.22)';

    return (
      <div className="relative rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl p-7 md:p-8 shadow-[0_18px_60px_rgba(2,6,23,0.10)]">
        <div className="mb-6">
          <h3 className="text-slate-900 text-xl md:text-2xl font-bold mb-2">{title}</h3>
          <p className="text-slate-600 text-sm">{subtitle}</p>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" style={{ minHeight: 300 }}>
            {/* Grid + Y ticks */}
            {domain.ticks.map((v) => {
              const y = yFor(v);
              return (
                <g key={v}>
                  <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke={gridColor} strokeWidth="1" />
                  <text
                    x={padding - 12}
                    y={y + 4}
                    fill={labelColor}
                    fontSize="12"
                    textAnchor="end"
                    style={{ fontWeight: 600 }}
                  >
                    {v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}€
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={axisColor} />
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke={axisColor} />

            {/* X labels (years) */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={chartHeight - padding + 26}
                fill={labelColor}
                fontSize="13"
                textAnchor="middle"
                style={{ fontWeight: 700 }}
              >
                {p.year}
              </text>
            ))}

            {/* Y-axis label */}
            <text
              x={18}
              y={chartHeight / 2}
              fill={labelColor}
              fontSize="12"
              textAnchor="middle"
              transform={`rotate(-90, 18, ${chartHeight / 2})`}
              style={{ fontWeight: 700 }}
            >
              Izmaksas uz pacientu (€/pacients)
            </text>

            {/* Area */}
            <path d={areaPath} fill={`url(#gradient-${color})`} opacity="0.22" />

            {/* Line */}
            <path
              d={linePath}
              stroke={stroke}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points + value labels */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="7" fill={stroke} opacity="0.95" />
                <circle cx={p.x} cy={p.y} r="3.2" fill="white" />
                <text
                  x={p.x}
                  y={p.y - 14}
                  fill="rgba(15,23,42,0.78)"
                  fontSize="12"
                  textAnchor="middle"
                  style={{ fontWeight: 800 }}
                >
                  {p.value % 1 === 0 ? p.value.toFixed(0) : p.value.toFixed(1)}€
                </text>
              </g>
            ))}

            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Footer stats (kā tavos screenos) */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className={color === 'red' ? 'bg-red-500' : 'bg-cyan-500'} style={{ width: 10, height: 10, borderRadius: 9999 }} />
            <span className="text-slate-600 text-sm">
              {data[0].year} bāze: <span className="font-semibold text-slate-800">{base % 1 === 0 ? base.toFixed(0) : base.toFixed(1)}€</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:justify-end">
            <span className="text-slate-600 text-sm">
              {data[data.length - 1].year} prognoze:{' '}
              <span className="font-semibold text-slate-800">{last % 1 === 0 ? last.toFixed(0) : last.toFixed(1)}€</span>
            </span>

            <span
              className={[
                'px-3 py-1 rounded-full text-xs font-extrabold border',
                color === 'red'
                  ? 'bg-red-500/10 text-red-700 border-red-200'
                  : 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
              ].join(' ')}
            >
              {change >= 0 ? `+${change}%` : `${change}%`}
            </span>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          *Piezīme: ilustratīvs modelis. Reālās izmaksas atkarīgas no nozares, konkurences un konversijas.
        </div>
      </div>
    );
  };

  // Header + 2 chart layout (kā tavā light landing screenshot)
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Pacienta iegūšanas izmaksu dinamika (2025–2028)
          </h2>
          <p className="text-slate-600 mt-2">
            Ilustratīvs modelis: bez AI redzamības spiediens uz Ads izmaksām pieaug straujāk.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard
            title="Pieaugošas pacienta iegūšanas izmaksas (bez AI)"
            subtitle="Tradicionālā pieeja: konkurence un klikšķu cenas spiež izmaksas augšā."
            data={withoutAI}
            color="red"
          />

          <ChartCard
            title="Stabilākas izmaksas ar AI redzamību"
            subtitle="AI redzamība + fokusētas reklāmas: lielāka daļa pieprasījumu nāk no ieteikumiem."
            data={withAI}
            color="cyan"
          />
        </div>

        {/* Bottom insight row (ātri saprotams kopsavilkums) */}
        <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl p-8 shadow-[0_18px_60px_rgba(2,6,23,0.08)]">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-red-700">+{pctChange(withoutAI[0].value, withoutAI[3].value)}%</div>
              <div className="text-sm text-slate-600">Izmaksu pieaugums bez AI</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-cyan-700">+{pctChange(withAI[0].value, withAI[3].value)}%</div>
              <div className="text-sm text-slate-600">Izmaksu pieaugums ar AI</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-700">
                {Math.max(
                  0,
                  pctChange(withoutAI[0].value, withoutAI[3].value) - pctChange(withAI[0].value, withAI[3].value)
                )}
                %
              </div>
              <div className="text-sm text-slate-600">Efektivitātes starpība</div>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-700 font-semibold">
            AI optimizācija palīdz kontrolēt izmaksas pat pieaugošā konkurencē.
          </div>
        </div>
      </div>
    </section>
  );
}
