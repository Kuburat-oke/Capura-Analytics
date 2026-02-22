
import { DataPoint, DecompositionResult, ACFResult } from '../types';

export class TimeSeriesProcessor {
  /**
   * Performs Classical Additive Decomposition: Y = Trend + Seasonal + Residual
   */
  static decompose(data: DataPoint[], period: number = 7): DecompositionResult {
    const n = data.length;
    const values = data.map(d => d.value);
    const dates = data.map(d => d.date);

    // 1. Calculate Trend using Moving Average
    const trend: (number | null)[] = new Array(n).fill(null);
    const halfWindow = Math.floor(period / 2);

    for (let i = halfWindow; i < n - halfWindow; i++) {
      let sum = 0;
      if (period % 2 === 0) {
        // Centered moving average for even periods
        for (let j = i - halfWindow; j <= i + halfWindow; j++) {
          const weight = (j === i - halfWindow || j === i + halfWindow) ? 0.5 : 1.0;
          sum += values[j] * weight;
        }
        trend[i] = sum / period;
      } else {
        for (let j = i - halfWindow; j <= i + halfWindow; j++) {
          sum += values[j];
        }
        trend[i] = sum / period;
      }
    }

    // 2. Detrend
    const detrended = values.map((v, i) => {
      const t = trend[i];
      return t !== null ? v - t : null;
    });

    // 3. Seasonal Component
    // Calculate average for each period index
    const seasonalIndices = new Array(period).fill(0).map(() => [] as number[]);
    detrended.forEach((val, i) => {
      if (val !== null) {
        seasonalIndices[i % period].push(val);
      }
    });

    const periodAverages = seasonalIndices.map(arr => 
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    );
    
    // Center the seasonal component (ensure they sum to 0)
    const seasonalMean = periodAverages.reduce((a, b) => a + b, 0) / period;
    const centeredSeasonal = periodAverages.map(v => v - seasonalMean);

    const fullSeasonal = values.map((_, i) => centeredSeasonal[i % period]);

    // 4. Residual Component
    const residual = values.map((v, i) => {
      const t = trend[i];
      const s = fullSeasonal[i];
      return t !== null ? v - t - s : null;
    });

    // 5. Slope (Linear Regression on Trend)
    const validTrendIdx = trend.map((v, i) => v !== null ? i : -1).filter(i => i !== -1);
    const trendX = validTrendIdx;
    const trendY = validTrendIdx.map(i => trend[i] as number);

    const slopeData = this.linearRegression(trendX, trendY);

    return {
      original: values,
      trend,
      seasonal: fullSeasonal,
      residual,
      dates,
      slope: slopeData.slope,
      rSquared: slopeData.r2
    };
  }

  private static linearRegression(x: number[], y: number[]) {
    const n = x.length;
    if (n === 0) return { slope: 0, r2: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
      sumYY += y[i] * y[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // R-squared
    const yMean = sumY / n;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i] + intercept;
      ssRes += Math.pow(y[i] - yPred, 2);
      ssTot += Math.pow(y[i] - yMean, 2);
    }
    const r2 = 1 - (ssRes / ssTot);

    return { slope, r2 };
  }

  static calculateACF(values: number[], maxLag: number = 30): ACFResult[] {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;

    const results: ACFResult[] = [];
    for (let lag = 0; lag <= Math.min(maxLag, n - 1); lag++) {
      let covariance = 0;
      for (let i = 0; i < n - lag; i++) {
        covariance += (values[i] - mean) * (values[i + lag] - mean);
      }
      covariance /= n;
      results.push({
        lag,
        correlation: variance === 0 ? 0 : covariance / variance
      });
    }
    return results;
  }
}
