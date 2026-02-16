
export type Cycle = 'CI' | 'CM' | 'CS';

export interface RubricCategory {
  name: string;
  expert: string;
  avancat: string;
  novell: string;
}

export interface EvaluationResult {
  notaTotal: number;
  puntuacionPorCategorias: { category: string; level: 'Expert' | 'Avançat' | 'Novell'; justification: string }[];
  puntosFuertes: string[];
  propuestasMejora: string[];
  textoCorregido: string;
}
