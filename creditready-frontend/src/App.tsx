import { mockTransactions } from './data/transactions';
import { useState, useRef, useEffect } from 'react';
import './App.css'
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  MessageSquare, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  Lock, 
  ChevronRight,
  Send,
  Loader2,
  RefreshCw,
  Download,
  Info,
  CheckCircle2,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
} from 'recharts';

// --- MOCK DATA ---
const MOCK_APPLICANTS = [
  { id: 'APP-2026-001', name: 'Rohan Sharma', status: 'Verified', income: 125000, expenses: 65000, score: 78, risk: 'Low', date: '2026-10-24' },
  { id: 'APP-2026-002', name: 'Priya Mehta', status: 'Pending', income: 85000, expenses: 75000, score: 62, risk: 'Moderate', date: '2026-10-25' },
  { id: 'APP-2026-003', name: 'Aman Kumar', status: 'Verified', income: 45000, expenses: 40000, score: 45, risk: 'High', date: '2026-10-23' },
  { id: 'APP-2026-004', name: 'Sneha Patil', status: 'Verified', income: 180000, expenses: 60000, score: 88, risk: 'Low', date: '2026-10-25' },
  { id: 'APP-2026-005', name: 'Vikram Singh', status: 'Consent Req', income: 0, expenses: 0, score: 0, risk: 'Insufficient Data', date: '2026-10-22' },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: '2026-10-24', desc: 'TechCorp Salary', ref: 'NEFT-10293847', type: 'Credit', category: 'Income', amount: 125000 },
  { id: 2, date: '2026-10-22', desc: 'Amazon Web Services', ref: 'CARD-4921', type: 'Debit', category: 'Utilities', amount: 4500 },
  { id: 3, date: '2026-10-20', desc: 'HDFC Home Loan EMI', ref: 'AUTO-9921', type: 'Debit', category: 'Loan', amount: 35000 },
  { id: 4, date: '2026-10-18', desc: 'FreshMart Supermarket', ref: 'UPI-18273645', type: 'Debit', category: 'Groceries', amount: 8400 },
  { id: 5, date: '2026-10-15', desc: 'Dividend Payment - ITC', ref: 'ACH-443322', type: 'Credit', category: 'Investment', amount: 12500 },
  { id: 6, date: '2026-10-12', desc: 'Apollo Hospitals', ref: 'CARD-4921', type: 'Debit', category: 'Healthcare', amount: 3200 },
  { id: 7, date: '2026-10-10', desc: 'Uber Rides', ref: 'UPI-99887766', type: 'Debit', category: 'Transport', amount: 850 },
];

const MOCK_CHART_DATA = [
  { month: 'May', income: 125000, expenses: 62000, cashflow: 63000 },
  { month: 'Jun', income: 125000, expenses: 68000, cashflow: 57000 },
  { month: 'Jul', income: 140000, expenses: 61000, cashflow: 79000 },
  { month: 'Aug', income: 125000, expenses: 85000, cashflow: 40000 },
  { month: 'Sep', income: 125000, expenses: 64000, cashflow: 61000 },
  { month: 'Oct', income: 125000, expenses: 65000, cashflow: 60000 },
];

// --- UTILS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// --- COMPONENTS ---
const CircularScore = ({ score }: { score: number }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#10B981'; // Green (Verified/Positive)
  if (score < 50) color = '#EF4444'; // Red (Error/Critical)
  else if (score < 70) color = '#F59E0B'; // Amber (Warning)
  if (score === 0) color = '#94A3B8'; // Slate for N/A

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="56" cy="56" r={radius} stroke="#E2E8F0" strokeWidth="10" fill="none" />
        <circle 
          cx="56" cy="56" r={radius} 
          stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score > 0 ? score : 'N/A'}</span>
        <span className="text-xs text-slate-500 font-medium">/100</span>
      </div>
    </div>
  );
};

export default function CreditReadyApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedApplicant, setSelectedApplicant] = useState(MOCK_APPLICANTS[0]);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hello! How can I help with your financial analysis today?\n\nAsk questions about authorized transactions, income and spending patterns, financial readiness scores, or applicant reports." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

const handleNavigate = (
  view: string,
  applicant: typeof MOCK_APPLICANTS[number] | null = null
) => {
  setCurrentView(view);
  if (applicant) setSelectedApplicant(applicant);
};

const generateAIResponse = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    const userMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAILoading(true);

    try {
      const applicantContext = selectedApplicant ? `
        Current Applicant Context:
        Name: ${selectedApplicant.name}
        ID: ${selectedApplicant.id}
        Average Income: ${formatCurrency(selectedApplicant.income)}
        Average Expenses: ${formatCurrency(selectedApplicant.expenses)}
        Net Cash Flow: ${formatCurrency(selectedApplicant.income - selectedApplicant.expenses)}
        Readiness Score: ${selectedApplicant.score}/100
        Risk Level: ${selectedApplicant.risk}
        Status: ${selectedApplicant.status}
      ` : 'No specific applicant selected. Answer generally.';

      const systemInstruction = `You are CreditReady AI, an enterprise financial analysis assistant for bank employees. 
      ${applicantContext}
      
      Instructions:
      - Explain financial data clearly and professionally.
      - Use ONLY the supplied verified financial context for applicant-specific claims. Do not invent data.
      - Distinguish observed facts from interpretations.
      - State when information is missing or insufficient.
      - Do not make official lending decisions.
      - Provide structured responses using headings, bullet points, and clear sections (e.g., Summary, Supporting Evidence, Interpretation, Limitations).
      - Maintain a professional, trustworthy banking tone.`;

      const response = await fetch("http://127.0.0.1:8000/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: prompt,
     applicant_context: applicantContext,
     system_instruction: systemInstruction,
     transactions: mockTransactions,
  }),
});

if (!response.ok) {
  throw new Error(`Backend error: ${response.status}`);
}

const result = await response.json();

if (result.reply) {
  setChatHistory((prev) => [
    ...prev,
    { role: "assistant", text: result.reply },
  ]);
} else {
  throw new Error("Invalid response from backend");
}

} catch (error) {
  console.error("AI Error:", error);
  setChatHistory((prev) => [
    ...prev,
    {
      role: "assistant",
      text: "Unable to connect to the backend. Please check that the FastAPI server is running.",
    },
  ]);
} finally {
  setIsAILoading(false);
}
};

  // --- SUB-RENDERERS ---

  const renderSidebar = () => (
    <div className="w-65 bg-[#0F172A] text-slate-300 flex flex-col h-screen fixed hidden md:flex z-20">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight leading-tight">CreditReady.AI</h2>
          <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Bank Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
          { id: 'applicants', icon: Users, label: 'Applicants' },
          { id: 'verification', icon: CheckCircle2, label: 'Account Verification' },
          { id: 'insights', icon: Activity, label: 'Transaction Insights' },
          { id: 'ai', icon: MessageSquare, label: 'AI Financial Assistant' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id === 'ai' ? 'ai' : (item.id === 'dashboard' ? 'dashboard' : (item.id === 'applicants' ? 'applicants' : currentView)))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              (currentView === item.id || (item.id === 'dashboard' && currentView === 'applicantDetails'))
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}

        <div className="mt-8 mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
        {[
          { id: 'reports', icon: FileText, label: 'Reports' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
            RS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Rohan Sharma</p>
            <p className="text-[11px] text-slate-400 truncate">Credit Analyst</p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </div>
      </div>
    </div>
  );

  const renderTopBar = () => (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-900 capitalize">
          {currentView.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        {currentView === 'applicantDetails' && (
          <>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-indigo-600 font-semibold">{selectedApplicant?.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Application ID..." 
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 transition-all"
          />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <Lock size={12} />
          Secure Session
        </div>
        <button className="relative text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Applicant Financial Intelligence</h2>
        <p className="text-slate-500 mt-1 text-sm">Consent-based transaction analysis for responsible credit assessment.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Applicants Reviewed', value: '124', trend: '+12% vs last month', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Verified Accounts', value: '98%', trend: 'Completion rate', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Avg Readiness Score', value: '74', trend: 'Portfolio average', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Review Required', value: '12', trend: 'Action needed', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-slate-600">{kpi.title}</h3>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
            </div>
            <div>
              <p className={`text-3xl font-bold text-slate-900`}>{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secure Account Lookup & Recent Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lookup Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Secure Account Lookup</h3>
          </div>
          <div className="p-5 flex-1 flex flex-col space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Account Number</label>
              <input type="text" placeholder="Enter account number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Application ID</label>
              <input type="text" placeholder="e.g. APP-2026-..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bank Selection</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                <option>HDFC Bank</option>
                <option>State Bank of India</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transaction Date Range</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
                <option>Last 12 Months</option>
              </select>
            </div>
            <div className="pt-2 mt-auto">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20">
                <RefreshCw size={16} />
                Verify & Fetch Data
              </button>
            </div>
          </div>
        </div>

        {/* Applicants Table Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Recent Applications</h3>
            <button 
              onClick={() => handleNavigate('applicants')}
              className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_APPLICANTS.slice(0, 4).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{app.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{app.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${app.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                          app.status.includes('Pending') ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 w-6">{app.score}</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${app.score > 70 ? 'bg-emerald-500' : app.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${app.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                       <span className={`flex items-center gap-1.5 text-xs font-semibold
                        ${app.risk === 'Low' ? 'text-emerald-600' : 
                          app.risk === 'Moderate' ? 'text-amber-600' : 
                          'text-rose-600'}`}>
                        <AlertTriangle size={14} />
                        {app.risk}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => handleNavigate('applicantDetails', app)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-end w-full gap-1"
                      >
                        Review <ChevronRight size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
       <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Applicants Directory</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage and review all consent-authorized applications.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
            <Download size={16} /> Export List
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="pl-9 pr-4 py-2 w-full bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
            <option>All Statuses</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">Applicant details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Monthly Net</th>
                  <th className="px-6 py-4">Readiness Score</th>
                  <th className="px-6 py-4">Risk Indicator</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_APPLICANTS.map((app) => (
                  <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{app.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${app.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                          app.status.includes('Pending') ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{formatCurrency(app.income - app.expenses)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">In: {app.income/1000}k | Out: {app.expenses/1000}k</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 w-6">{app.score}</span>
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${app.score > 70 ? 'bg-emerald-500' : app.score > 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                            style={{ width: `${app.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`flex items-center gap-1.5 text-xs font-semibold
                        ${app.risk === 'Low' ? 'text-emerald-600' : 
                          app.risk === 'Moderate' ? 'text-amber-600' : 
                          app.risk === 'High' ? 'text-rose-600' : 'text-slate-500'}`}>
                        <AlertTriangle size={14} />
                        {app.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleNavigate('applicantDetails', app)}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );

  const renderApplicantDetails = () => (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedApplicant.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{selectedApplicant.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Analyzed: {selectedApplicant.date}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleNavigate('ai', selectedApplicant)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-colors group"
          >
            <MessageSquare size={16} className="text-indigo-600 group-hover:text-white transition-colors" />
            Ask AI Assistant
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-lg">Account Verification Summary</h3>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={12}/> Consent Verified
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Bank Name</p>
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Banknote size={16} className="text-slate-400"/> HDFC Bank Ltd.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Account Number</p>
              <p className="text-sm font-medium text-slate-900 font-mono tracking-tight">XXXX-XXXX-4921</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Analysis Period</p>
              <p className="text-sm font-medium text-slate-900">Last 6 Months</p>
            </div>
             <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Review Status</p>
              <p className="text-sm font-medium text-amber-600">Pending Review</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Customer Consent</p>
              <p className="text-sm font-medium text-emerald-600">Active (Expires in 45 days)</p>
            </div>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
          <h3 className="font-bold text-slate-900 mb-4 w-full text-left">Financial Readiness</h3>
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <CircularScore score={selectedApplicant.score} />
            <div className="mt-4 w-full space-y-2">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 font-medium">Income Stability (25%)</span>
                 <span className="text-emerald-600 font-bold">Strong</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 font-medium">Debt Mgt. (20%)</span>
                 <span className="text-amber-600 font-bold">Moderate</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPI Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Monthly Income</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedApplicant.income)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Monthly Expenses</p>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(selectedApplicant.expenses)}</p>
          </div>
          <div className="bg-indigo-600 rounded-xl border border-indigo-700 shadow-sm shadow-indigo-600/20 p-5 text-white">
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Net Cash Flow</p>
            <p className="text-2xl font-bold">{formatCurrency(selectedApplicant.income - selectedApplicant.expenses)}</p>
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Income vs Spending (6 Mo)</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-700 font-medium cursor-pointer">
              <option>Bar Chart</option>
              <option>Area Chart</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 500}} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px', fontWeight: 500}} />
                <Bar dataKey="income" fill="#6366F1" name="Income" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" fill="#F43F5E" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-lg">Transaction History</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search description..." className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 text-slate-500 text-xs font-medium">{tx.date}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{tx.desc}</td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{tx.ref}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'Credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAIAssistant = () => (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in fade-in duration-300">
      
      {/* Context Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600"/>
            CreditReady AI Assistant
          </h2>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50/50 rounded-lg text-xs border border-indigo-100">
            <span className="text-indigo-400 font-semibold">Active Context:</span>
            <span className="font-bold text-indigo-700">{selectedApplicant.name}</span>
            <span className="text-indigo-300 font-mono text-[10px]">({selectedApplicant.id})</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider font-bold">
          <Activity size={12} /> Local Model Connected
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar History (Desktop) */}
        <div className="w-64 bg-white border-r border-slate-200 flex-col hidden lg:flex">
          <div className="p-4 border-b border-slate-100">
            <button 
              onClick={() => setChatHistory([{ role: 'assistant', text: "Hello! How can I help with your financial analysis today?\n\nAsk questions about authorized transactions, income and spending patterns, financial readiness scores, or applicant reports." }])}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <MessageSquare size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">Recent Conversations</div>
            {[
              'Transaction Analysis — ' + selectedApplicant.id, 
              'Understanding Readiness Score', 
              'Monthly Spending Review'
            ].map((chat, idx) => (
               <button key={idx} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors truncate ${idx === 0 ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' : 'text-slate-600 font-medium hover:bg-slate-100'}`}>
                {chat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32">
            
            {/* Suggested Prompts (only show if no user messages yet) */}
            {chatHistory.length === 1 && (
              <div className="max-w-3xl mx-auto mb-8 mt-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">How can I assist you?</h3>
                  <p className="text-sm text-slate-500 mt-1">Select a prompt below or type your own question.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Analyze Transactions', prompt: "Summarize the applicant's income, expenses, and cash flow over the selected period.", icon: TrendingUp },
                    { title: 'Explain Readiness Score', prompt: "Explain the applicant's financial readiness score and its components.", icon: Activity },
                    { title: 'Identify Unusual Patterns', prompt: "Highlight unusual transaction patterns that may require further review.", icon: AlertTriangle },
                    { title: 'Generate Financial Summary', prompt: "Prepare an evidence-based financial summary for the selected applicant.", icon: FileText },
                  ].map((card, idx) => (
                    <button 
                      key={idx}
                      onClick={() => generateAIResponse(card.prompt)}
                      className="p-5 bg-white border border-slate-200 rounded-xl text-left hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <card.icon size={16} className="text-indigo-500" />
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{card.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed flex-1">{card.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && chatHistory.length > 1 && (
                     <div className="w-8 h-8 rounded-full bg-indigo-600 flex shrink-0 items-center justify-center mr-3 mt-1 shadow-sm">
                       <ShieldCheck size={16} className="text-white" />
                     </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                  }`}>
                    <div className={`whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'font-medium' : ''}`}>
                      {msg.text.split('\n').map((line, i) => {
                        // Very basic markdown parsing for bolding headers/keys
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={i} className={line.trim() === '' ? 'h-3' : ''}>
                            {parts.map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                              }
                              // Style bullet points
                              if (part.trim().startsWith('- ')) {
                                return <span key={j} className="flex"><span className="mr-2 text-indigo-500">•</span><span>{part.substring(2)}</span></span>
                              }
                              return <span key={j}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isAILoading && (
                <div className="flex justify-start">
                   <div className="w-8 h-8 rounded-full bg-indigo-600 flex shrink-0 items-center justify-center mr-3 mt-1 shadow-sm">
                       <ShieldCheck size={16} className="text-white" />
                   </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={18} />
                    <span className="text-sm font-medium text-slate-600">Analyzing financial data...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 pb-6 px-6">
            <div className="max-w-4xl mx-auto">
               <div className="relative flex items-end gap-2 bg-white border border-slate-300 rounded-2xl p-2 focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-lg shadow-slate-200/50">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        generateAIResponse(chatInput);
                      }
                    }}
                    placeholder="Ask about transactions, income, spending, or financial readiness..."
                    className="flex-1 bg-transparent border-none resize-none max-h-32 min-h-[44px] text-sm text-slate-900 py-3 px-4 outline-none placeholder:text-slate-400 font-medium"
                    rows={1}
                  />
                  <button 
                    disabled={!chatInput.trim() || isAILoading}
                    onClick={() => generateAIResponse(chatInput)}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 mb-0.5 mr-0.5"
                  >
                    <Send size={18} />
                  </button>
               </div>
               <p className="text-center text-[10px] font-medium text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                 <Info size={12} className="text-slate-400" /> AI-generated insights may contain errors. Verify important findings against source records.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {renderSidebar()}
      
      <main className="flex-1 flex flex-col md:ml-64 w-full h-full relative">
        {renderTopBar()}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'applicants' && renderApplicants()}
          {currentView === 'applicantDetails' && renderApplicantDetails()}
          {currentView === 'ai' && renderAIAssistant()}
        </div>

        {/* Global Footer Disclaimer (hidden in AI view to save space) */}
        {currentView !== 'ai' && (
           <div className="p-4 text-center text-[10px] text-slate-400 border-t border-slate-200 bg-slate-50/80 backdrop-blur shrink-0 font-medium">
             Decision support only — not an official credit bureau score or an automated lending decision. Financial data is accessible only through authorized integrations and applicable customer consent.
           </div>
        )}
      </main>
    </div>
  );
}