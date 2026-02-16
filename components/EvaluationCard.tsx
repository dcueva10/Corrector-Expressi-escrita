
import React from 'react';
import { EvaluationResult } from '../types';

interface EvaluationCardProps {
  result: EvaluationResult;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ result }) => {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'avançat': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'novell': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 6.5) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Nota Total Header */}
      <section className={`p-8 rounded-3xl border-2 text-center shadow-sm ${getScoreColor(result.notaTotal)}`}>
        <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-2 block">Nota Global Competencial</span>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-black">{result.notaTotal.toFixed(1)}</span>
          <span className="text-2xl font-bold opacity-50">/ 10</span>
        </div>
        <p className="mt-3 text-sm font-medium opacity-80 max-w-md mx-auto">
          Aquesta nota és un resum ponderat dels diferents ítems de la rúbrica oficial aplicada.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">01</span>
          Puntuació per categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.puntuacionPorCategorias.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-700">{item.category}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getLevelColor(item.level)}`}>
                  {item.level}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.justification}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Punts forts
          </h3>
          <ul className="space-y-2">
            {result.puntosFuertes.map((point, idx) => (
              <li key={idx} className="flex items-start text-sm text-emerald-800">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Propostes de millora
          </h3>
          <ul className="space-y-2">
            {result.propuestasMejora.map((point, idx) => (
              <li key={idx} className="flex items-start text-sm text-indigo-800">
                <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center mr-3 text-sm">02</span>
          Proposta de text model
        </h3>
        <div className="bg-slate-900 rounded-2xl p-6 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-xl">
          {result.textoCorregido}
        </div>
      </section>
    </div>
  );
};
