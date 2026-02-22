
import React, { useState, useCallback, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';
import { 
  Upload, FileSpreadsheet, TrendingUp, Calendar, 
  Activity, BarChart2, Brain, ChevronRight, 
  Download, Loader2, Info, AlertCircle, Briefcase, DollarSign, 
  PieChart, Shield, Users, Globe, Mail, Phone, MapPin, ExternalLink,
  ChevronDown, ArrowRight, CheckCircle2, Lock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TimeSeriesProcessor } from './services/timeSeriesProcessor';
import { getAIInsights } from './services/geminiService';
import { DataPoint, DecompositionResult, ACFResult, AnalysisSummary } from './types';

// --- Shared Components ---

const Navbar = ({ activeView, setView }: { activeView: string, setView: (v: string) => void }) => (
  <nav className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50 px-8 py-4">
    <div className="max-w-[1440px] mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-emerald-600 p-1.5 rounded rotate-3 shadow-lg shadow-emerald-900/20">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white brand-font tracking-tight">
            Capura Analytics
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-semibold">Investment Research Group</p>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-10">
        {['home', 'services', 'about', 'contact'].map((item) => (
          <button 
            key={item}
            onClick={() => setView('home')} // These anchor to home sections
            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeView === item ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            {item}
          </button>
        ))}
        <button 
          onClick={() => setView('portal')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border font-bold text-xs uppercase tracking-widest transition-all ${activeView === 'portal' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-700 text-white hover:border-emerald-500'}`}
        >
          <Lock className="w-3 h-3" />
          Client Portal
        </button>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-[#0f172a] text-slate-400 pt-20 pb-10 px-8 border-t border-slate-800">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-600 p-1.5 rounded rotate-3">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white brand-font tracking-tight">Capura Analytics</h1>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Institutional-grade quantitative research and portfolio management for sophisticated investors. Empowering decisions through advanced temporal analysis.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"><Globe className="w-4 h-4 text-white"/></div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"><Mail className="w-4 h-4 text-white"/></div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Expertise</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Quantitative Strategy</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Temporal Forecasting</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Asset Decomposition</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Risk Mitigation</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Our Team</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Institutional Access</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-emerald-400 cursor-pointer transition-colors">Legal Disclaimer</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Global HQ</h4>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
              <span>1200 Avenue of the Americas<br/>New York, NY 10036</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>+1 (212) 555-0198</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-10 border-t border-slate-800 text-[10px] font-medium leading-relaxed tracking-wider uppercase text-center md:text-left">
        <p className="mb-4">
          DISCLAIMER: CAPURA ANALYTICS GROUP IS A REGISTERED INVESTMENT ADVISOR. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS. THE ANALYSIS TOOLS PROVIDED IN THE CLIENT PORTAL ARE FOR RESEARCH PURPOSES ONLY.
        </p>
        <p>&copy; 2024 CAPURA ANALYTICS GROUP LLC. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  </footer>
);

// --- Home Components ---

const Hero = ({ onEnterPortal }: { onEnterPortal: () => void }) => (
  <section className="relative min-h-[90vh] flex items-center bg-[#0f172a] overflow-hidden px-8">
    <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/30 blur-[120px] rounded-full"></div>
    </div>
    
    <div className="max-w-[1440px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/30 border border-emerald-500/30 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Q4 Market Insight Terminal Active</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-white brand-font leading-[1.1] mb-8">
          Precision Alpha <br/>Through <span className="text-emerald-500">Temporal Data.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-lg mb-12 leading-relaxed">
          Boutique investment research leveraging proprietary time-series decomposition and AI-driven pattern recognition for high-net-worth institutional clients.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            onClick={onEnterPortal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 transition-all transform active:scale-95 group"
          >
            Launch Client Portal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all">
            Institutional Services
          </button>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative">
          <div className="absolute -top-4 -right-4 bg-emerald-600 p-4 rounded-2xl shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold brand-font text-lg">Market Structural Flow</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Real-time Model</span>
            </div>
            <div className="h-48 w-full bg-slate-800/50 rounded-xl flex items-end p-4 gap-2">
              {[40, 60, 45, 80, 55, 90, 70, 85, 95, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Portfolio Drift</p>
                <p className="text-xl font-bold text-white">-0.042%</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cycle Confidence</p>
                <p className="text-xl font-bold text-emerald-400">98.4%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Services = () => (
  <section className="py-32 px-8 bg-white" id="services">
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4">Core Competencies</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 brand-font leading-[1.2]">
            Advanced Quant Tools for the Modern Committee
          </h2>
        </div>
        <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
          Bridging the gap between raw data and actionable investment mandates using proprietary mathematical models.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: PieChart, title: 'Asset Decomposition', desc: 'Isolating long-term growth trends from cyclical noise to reveal true capital trajectory.' },
          { icon: Shield, title: 'Risk Neutralization', desc: 'Measuring residual variance to quantify specific risk exposure and hedge against volatility.' },
          { icon: Activity, title: 'Temporal Analysis', desc: 'Highly granular frequency analysis to identify daily, weekly, and seasonal market inefficiencies.' }
        ].map((s, i) => (
          <div key={i} className="p-10 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 transition-colors">
              <s.icon className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 brand-font">{s.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-8">{s.desc}</p>
            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors">
              Read Methodology <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Portal Components ---

const StatCard = ({ title, value, icon: Icon, color, subValue }: { title: string, value: string | number, icon: any, color: string, subValue?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4 transition-all hover:border-slate-300">
    <div className={`p-2.5 rounded-lg ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
      {subValue && <p className="text-[10px] text-slate-500 mt-2 font-medium">{subValue}</p>}
    </div>
  </div>
);

const ChartWrapper = ({ title, children, description, icon: Icon }: { title: string, children?: React.ReactNode, description?: string, icon?: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          {title}
        </h3>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
    <div className="h-72 w-full">
      {children}
    </div>
  </div>
);

// --- Main Application Logic ---

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'portal'
  
  // Analysis State (Portal only)
  const [data, setData] = useState<DataPoint[]>([]);
  const [analysis, setAnalysis] = useState<DecompositionResult | null>(null);
  const [acf, setAcf] = useState<ACFResult[]>([]);
  const [insights, setInsights] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(12);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawJson.length < 5) {
          setError("Insufficient data points for meaningful structural analysis.");
          setLoading(false);
          return;
        }

        const keys = Object.keys(rawJson[0]);
        const parsedData: DataPoint[] = rawJson.map(row => ({
          date: new Date(row[keys[0]]),
          value: parseFloat(row[keys[1]])
        })).filter(d => !isNaN(d.date.getTime()) && !isNaN(d.value));

        setData(parsedData);
        performAnalysis(parsedData, period);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError("Data ingestion failed. Ensure asset ledger follows date/value standard.");
      setLoading(false);
    }
  };

  const performAnalysis = useCallback(async (currentData: DataPoint[], p: number) => {
    setLoading(true);
    const result = TimeSeriesProcessor.decompose(currentData, p);
    const acfResult = TimeSeriesProcessor.calculateACF(currentData.map(d => d.value));
    
    setAnalysis(result);
    setAcf(acfResult);

    const aiData = await getAIInsights(result);
    setInsights(aiData);
    setLoading(false);
  }, []);

  const handlePeriodChange = (val: number) => {
    setPeriod(val);
    if (data.length > 0) performAnalysis(data, val);
  };

  const chartData = analysis ? analysis.dates.map((d, i) => ({
    time: d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
    original: analysis.original[i],
    trend: analysis.trend[i],
    seasonal: analysis.seasonal[i],
    residual: analysis.residual[i],
  })) : [];

  // Smooth scroll for nav
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 flex flex-col">
      <Navbar activeView={view} setView={setView} />

      {view === 'home' ? (
        <main className="flex-1">
          <Hero onEnterPortal={() => setView('portal')} />
          <Services />
          
          {/* About Section */}
          <section className="py-32 px-8 bg-slate-50" id="about">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="bg-slate-200 rounded-3xl aspect-square overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] to-emerald-900/50 mix-blend-multiply"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
                    alt="Corporate" 
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                  <p className="text-4xl font-bold text-emerald-600 mb-1 brand-font">18+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Quant Analysts</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4">Our Heritage</h4>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 brand-font leading-[1.2] mb-8">
                  Built for the Next Era of Capital Allocation.
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Founded in New York, Capura Analytics represents a synthesis of traditional fund management and bleeding-edge data science. We serve a exclusive group of family offices and institutional endowments.
                </p>
                <div className="space-y-4">
                  {[
                    'Proprietary Alpha Decomposition Engines',
                    'Zero-Latency Temporal Monitoring',
                    'Institutional-Grade Security & Discretion',
                    'Direct Partner-Level Advisory'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-slate-800 font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-32 px-8 bg-[#0f172a]" id="contact">
            <div className="max-w-[1440px] mx-auto text-center">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em] mb-4">Institutional Onboarding</h4>
              <h2 className="text-4xl md:text-5xl font-bold text-white brand-font mb-12">
                Inquire About Allocation Access.
              </h2>
              <div className="max-w-xl mx-auto bg-slate-900/50 border border-slate-800 p-10 rounded-3xl backdrop-blur-sm">
                <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                      <input type="text" className="w-full bg-slate-800 border-none rounded-xl px-5 py-4 text-white text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Alexander Morgan" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Organization</label>
                      <input type="text" className="w-full bg-slate-800 border-none rounded-xl px-5 py-4 text-white text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Morgan Capital" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Business Email</label>
                    <input type="email" className="w-full bg-slate-800 border-none rounded-xl px-5 py-4 text-white text-sm focus:ring-2 focus:ring-emerald-500" placeholder="alex@morgan.capital" />
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-xl transition-all shadow-lg shadow-emerald-900/20">
                    Request Partner Consultation
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-8 py-10">
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Client Workspace</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 brand-font">Portfolio Insights Terminal</h2>
            </div>
            {analysis && (
              <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Frequency Filter:</span>
                <select 
                  className="bg-slate-50 border-none rounded-lg px-4 py-2 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500"
                  value={period}
                  onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
                >
                  <option value={7}>7 Day Lag (Weekly)</option>
                  <option value={12}>12 Month Lag (Fiscal)</option>
                  <option value={4}>4 Quarter Lag (Annual)</option>
                  <option value={30}>30 Day Lag (Granular)</option>
                </select>
              </div>
            )}
          </div>

          {!analysis && !loading && (
            <div className="max-w-3xl mx-auto py-12">
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 z-0 group-hover:bg-emerald-100 transition-colors"></div>
                 <div className="relative z-10">
                  <div className="mb-8 flex">
                    <div className="bg-slate-900 p-4 rounded-2xl shadow-lg">
                      <PieChart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight brand-font leading-[1.1]">
                    Structural Asset <br/>Decomposition Engine
                  </h3>
                  <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-xl">
                    Our terminal allows clients to perform autonomous time-series analysis on custom asset ledgers. Separates the 'Signal' (Trend/Cycle) from 'Noise' (Residuals).
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <label className="group cursor-pointer">
                      <div className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-12 rounded-xl shadow-xl shadow-emerald-100 flex items-center gap-3 transition-all transform active:scale-95">
                        <Upload className="w-5 h-5" />
                        Upload Asset Report
                      </div>
                      <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={processFile} />
                    </label>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Encrypted Ingestion
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="py-40 flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                <Activity className="w-6 h-6 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[22px]" />
              </div>
              <p className="text-xl font-bold text-slate-900 brand-font">Computing Structural Models...</p>
              <p className="text-slate-400 text-[10px] mt-4 font-bold tracking-[0.3em] uppercase">Authorized Gemini Analyst Synthesizing Report</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="xl:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Trend Velocity" value={`${analysis.slope > 0 ? '+' : ''}${analysis.slope.toFixed(4)}`} subValue="Linear regression slope" icon={TrendingUp} color="bg-[#0f172a]" />
                <StatCard title="Model Reliability" value={`${(analysis.rSquared * 100).toFixed(1)}%`} subValue="Coefficient of determination" icon={Shield} color="bg-emerald-600" />
                <StatCard title="Projected Delta" value={(analysis.slope * analysis.original.length).toFixed(2)} subValue="Aggregate trend gain/loss" icon={DollarSign} color="bg-indigo-600" />
                <StatCard title="Sample Size" value={analysis.original.length} subValue="Reporting intervals found" icon={Activity} color="bg-slate-400" />
              </div>

              <div className="xl:col-span-4 space-y-6">
                <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden group border border-slate-800">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Brain className="w-32 h-32 text-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Terminal Output</h3>
                    </div>
                    {insights ? (
                      <div className="space-y-8">
                        <p className="text-xl font-medium leading-relaxed italic text-slate-200 brand-font">
                          "{insights.interpretation}"
                        </p>
                        <div className="pt-8 border-t border-slate-800">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-6">Key Directives</h4>
                          <ul className="space-y-5">
                            {insights.insights.map((item, idx) => (
                              <li key={idx} className="text-sm flex gap-4 text-slate-300 leading-relaxed">
                                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
                        <div className="h-24 bg-slate-800 rounded w-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {insights?.recommendations && (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-900 font-bold mb-8 flex items-center gap-2 brand-font text-xl">
                      <PieChart className="w-5 h-5 text-emerald-600" />
                      Executive Actions
                    </h4>
                    <div className="space-y-5">
                      {insights.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-8 space-y-6">
                <ChartWrapper title="Primary Asset Trajectory" icon={TrendingUp} description="Observed performance mapped against structural trend EMA.">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="portalColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                      <Legend verticalAlign="top" height={36} iconType="square" />
                      <Area type="monotone" dataKey="original" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#portalColor)" name="NAV Price" />
                      <Line type="monotone" dataKey="trend" stroke="#0f172a" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Trend" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartWrapper title="Fiscal Cycles" icon={Calendar} description="Seasonal fluctuations isolated from core growth.">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="seasonal" stroke="#6366f1" strokeWidth={2} dot={false} name="Cycle" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartWrapper>

                  <ChartWrapper title="Market Variance (Alpha)" icon={Activity} description="Residual noise indicating asset-specific volatility.">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <ReferenceLine y={0} stroke="#cbd5e1" />
                        <Tooltip />
                        <Bar dataKey="residual" fill="#94a3b8" name="Variance" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartWrapper>
                </div>

                <ChartWrapper title="Persistence Profile (ACF)" icon={BarChart2} description="Autocorrelation metrics determining momentum sustainability.">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={acf}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="lag" stroke="#94a3b8" fontSize={10} />
                      <YAxis domain={[-1, 1]} stroke="#94a3b8" fontSize={10} />
                      <ReferenceLine y={0} stroke="#94a3b8" />
                      <ReferenceLine y={0.25} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'Sig', position: 'right', fill: '#f43f5e', fontSize: 10 }} />
                      <ReferenceLine y={-0.25} stroke="#f43f5e" strokeDasharray="5 5" />
                      <Tooltip />
                      <Bar dataKey="correlation" fill="#0f172a" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartWrapper>
                
                <div className="flex justify-between items-center mt-12 py-10 border-t border-slate-200">
                  <button onClick={() => {setAnalysis(null); setData([]); setInsights(null);}} className="text-xs font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Reset Terminal
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-10 py-4 bg-[#0f172a] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                    <Download className="w-4 h-4" /> Export Regulatory Dossier (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}
