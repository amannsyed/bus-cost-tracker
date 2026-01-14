import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Target } from 'lucide-react';

interface SummaryCardsProps {
  totalPayg: number;
  breakEvenDay: string | null;
  totalSubscription: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalPayg, breakEvenDay, totalSubscription }) => {
  const diff = totalPayg - totalSubscription;
  const isSaving = diff > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Subscription Cost</span>
          <CreditCard className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">£{totalSubscription.toFixed(2)}</div>
        <div className="text-xs text-slate-400 mt-1">Based on tracked period</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">PAYG Spent</span>
          <Wallet className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">£{totalPayg.toFixed(2)}</div>
        <div className="text-xs text-slate-400 mt-1">Total manual entries</div>
      </div>

      <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${isSaving ? 'ring-2 ring-emerald-500/20' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Financial Impact</span>
          {isSaving ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
        </div>
        <div className={`text-2xl font-bold ${isSaving ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isSaving ? `+ £${diff.toFixed(2)}` : `- £${Math.abs(diff).toFixed(2)}`}
        </div>
        <div className="text-xs text-slate-400 mt-1">{isSaving ? 'Total saved' : 'Current deficit'}</div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-sm font-medium">Break-even Date</span>
          <Target className="w-5 h-5 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {breakEvenDay ? breakEvenDay : 'Pending...'}
        </div>
        <div className="text-xs text-slate-400 mt-1">{breakEvenDay ? 'First milestone reached' : 'Still tracking'}</div>
      </div>
    </div>
  );
};

export default SummaryCards;