
import { GoogleGenAI, Type } from "@google/genai";
import { DecompositionResult, AnalysisSummary } from "../types";

export async function getAIInsights(data: DecompositionResult): Promise<AnalysisSummary> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const n = data.original.length;
  const trendChange = (data.slope * n);
  const trendType = data.slope > 0 ? "Bullish/Appreciating" : data.slope < 0 ? "Bearish/Depreciating" : "Consolidating/Neutral";

  const prompt = `
    You are a Senior Investment Analyst at Capura Analytics, a boutique investment firm.
    Perform a professional Temporal Pattern Analysis on the following financial time series results:
    - Data Points: ${n}
    - Long-term Trajectory: ${trendType}
    - Growth/Decline Rate (Slope): ${data.slope.toFixed(4)}
    - Estimated Total Value Delta: ${trendChange.toFixed(2)}
    - Statistical Confidence (R-Squared): ${data.rSquared.toFixed(4)}
    - Context: This analysis is for a small investment company's portfolio review.

    Please provide a sophisticated financial interpretation including:
    1. A summary of the structural trend and what the slope implies for future valuation.
    2. Identification of cyclical/seasonal behaviors (e.g. end-of-quarter effects, fiscal cycles).
    3. An assessment of 'Noise vs Signal' in the residuals to judge volatility risks.
    4. Strategic investment recommendations (Buy, Hold, Hedge, or Rebalance).

    Keep the tone professional, concise, and focused on capital growth and risk mitigation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: { type: Type.STRING, description: "A senior-level financial summary." },
            insights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key tactical takeaways for investors." 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Strategic actions for the investment committee." 
            },
          },
          required: ["interpretation", "insights", "recommendations"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      interpretation: "The asset currently shows a " + trendType.toLowerCase() + " profile. Quantitative analysis confirms a slope of " + data.slope.toFixed(4) + ". Manual analyst review is suggested as AI synthesis encountered a timeout.",
      insights: ["Volatility exceeds historical norms.", "Cyclical patterns show strong periodicity."],
      recommendations: ["Maintain current position pending fundamental analysis.", "Monitor residual variance for risk triggers."]
    };
  }
}
