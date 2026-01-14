
import React from 'react';
import { SubscriptionPayment } from '../types';
import { format, parseISO } from 'date-fns';
import { CreditCard, Trash2, Download } from 'lucide-react';

interface PaymentLedgerProps {
  payments: SubscriptionPayment[];
  onRemovePayment: (id: string) => void;
  onExport: () => void;
}

const PaymentLedger: React.FC<PaymentLedgerProps> = ({ payments, onRemovePayment, onExport }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Pass Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Subscription payment history</p>
        </div>
        <button onClick={onExport} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Download CSV"><Download className="w-5 h-5" /></button>
      </div>
      
      <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
        <div className="space-y-3">
          {[...payments].reverse().map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><CreditCard className="w-5 h-5" /></div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{payment.label}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{format(parseISO(payment.date), 'PPP')}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="font-mono font-black text-indigo-600 text-lg">£{payment.amount.toFixed(2)}</div>
                <button onClick={() => onRemovePayment(payment.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {payments.length === 0 && <div className="py-20 text-center text-slate-300 text-sm italic">No pass payments logged.</div>}
        </div>
      </div>
    </div>
  );
};

export default PaymentLedger;
