
export interface DataPoint {
  date: Date;
  value: number;
}

export interface DecompositionResult {
  original: (number | null)[];
  trend: (number | null)[];
  seasonal: (number | null)[];
  residual: (number | null)[];
  dates: Date[];
  slope: number;
  rSquared: number;
}

export interface ACFResult {
  lag: number;
  correlation: number;
}

export interface AnalysisSummary {
  interpretation: string;
  insights: string[];
  recommendations: string[];
}
