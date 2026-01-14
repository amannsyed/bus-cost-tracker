import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Bus, Calendar, PoundSterling, Wallet } from 'lucide-react';

interface SetupScreenProps {
  onComplete: (config: AppConfig) => void;
  initialConfig: AppConfig;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete, initialConfig }) => {
  const [formData, setFormData] = useState({
    startDate: initialConfig.startDate,
    monthlyDebit: initialConfig.monthlyDebit.toString(),
    adminFee: initialConfig.adminFee.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use spreader to ensure all fields required by AppConfig are provided
    onComplete({
      ...initialConfig,
      startDate: formData.startDate,
      monthlyDebit: parseFloat(formData.monthlyDebit) || 0,
      adminFee: parseFloat(formData.adminFee) || 0,
      isSetup: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to FareCompare</h1>
          <p className="text-indigo-100 mt-2">Let's set up your personalized bus tracker.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Start Tracking Date
            </label>
            <input 
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Monthly Debit
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyDebit}
                  onChange={(e) => setFormData({...formData, monthlyDebit: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  placeholder="68.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <PoundSterling className="w-4 h-4" /> Admin Fee
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={formData.adminFee}
                  onChange={(e) => setFormData({...formData, adminFee: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  placeholder="25.00"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            Start Comparing
          </button>
        </form>
      </div>
      <p className="mt-8 text-slate-400 text-sm font-medium">Your data is stored locally in your browser.</p>
    </div>
  );
};

export default SetupScreen;