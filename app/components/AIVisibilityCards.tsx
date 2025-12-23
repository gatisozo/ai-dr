'use client';

import React from 'react';

export default function AIVisibilityCards() {
  return (
    <div className="relative overflow-hidden rounded-3xl px-6 py-12 md:px-10 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div
        className="absolute bottom-0 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-7xl w-full">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="group relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-white/80 tracking-wide">AI JAUTĀJUMS</div>
              </div>
              <p className="text-white text-lg font-medium leading-relaxed">
                &quot;Kurš ārsts piedāvā labāko vēnu ārstēšanu Rīgā?&quot;
              </p>
            </div>
          </div>

          <div className="group relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-white/80 tracking-wide">AI ATBILDE</div>
              </div>

              <div className="space-y-4">
                {['Veselības centrs 4', 'ARS', 'Dinsbergas klīnika'].map((name, i) => (
                  <div key={name} className="flex items-start gap-3">
                    <span className="text-white/90 font-bold text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="text-white/90 font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="group relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-red-300/30 shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-red-200 tracking-wide">JŪS</div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-white text-2xl font-bold">Jūs</span>
                <span className="text-4xl">❌</span>
              </div>

              <div className="text-red-100/90 text-sm italic">Neesat minēts AI atbildē</div>
            </div>
          </div>
        </div>

        <div className="relative backdrop-blur-2xl bg-white/15 rounded-3xl p-10 border border-white/25 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
          <div className="relative text-center">
            <p className="text-white text-2xl md:text-3xl font-bold leading-relaxed">
              Tas nav par kvalitāti.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Tas ir par publisku pierādāmu kompetenci.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
