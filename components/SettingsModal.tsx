
import React, { useState, useEffect } from 'react';
import { AppConfig, FareCategory } from '../types';
import { X, Settings, Wallet, PoundSterling, Save, Trash2, Plus, Target } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState({
    monthlyDebit: config.monthlyDebit.toString(),
    adminFee: config.adminFee.toString(),
    weeklyCap: config.weeklyCap.toString(),
  });
  const [categories, setCategories] = useState<FareCategory[]>(config.fareCategories);
  const [newCat, setNewCat] = useState({ label: '', price: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        monthlyDebit: config.monthlyDebit.toString(),
        adminFee: config.adminFee.toString(),
        weeklyCap: config.weeklyCap.toString(),
      });
      setCategories(config.fareCategories);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleAddCat = () => {
    if (!newCat.label || !newCat.price) return;
    setCategories([...categories, { 
      id: crypto.randomUUID(), 
      label: newCat.label, 
      price: parseFloat(newCat.price) 
    }]);
    setNewCat({ label: '', price: '' });
  };

  const handleRemoveCat = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      monthlyDebit: parseFloat(formData.monthlyDebit) || 0,
      adminFee: parseFloat(formData.adminFee) || 0,
      weeklyCap: parseFloat(formData.weeklyCap) || 0,
      fareCategories: categories
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
             <Settings className="w-5 h-5 text-indigo-600" />
             <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">App Configuration</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Wallet className="w-3 h-3" /> Monthly Pass</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                  <input type="number" step="0.01" value={formData.monthlyDebit} onChange={(e) => setFormData({...formData, monthlyDebit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-3 py-2.5 outline-none font-mono font-bold" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><PoundSterling className="w-3 h-3" /> Admin Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                  <input type="number" step="0.01" value={formData.adminFee} onChange={(e) => setFormData({...formData, adminFee: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-3 py-2.5 outline-none font-mono font-bold" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3 h-3" /> Weekly Cap</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">£</span>
                  <input type="number" step="0.01" value={formData.weeklyCap} onChange={(e) => setFormData({...formData, weeklyCap: e.target.value})} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl pl-6 pr-3 py-2.5 outline-none font-mono font-bold text-indigo-700" />
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Manage Fare Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-slate-500">£{c.price.toFixed(2)}</span>
                    <button type="button" onClick={() => handleRemoveCat(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2">
              <input type="text" placeholder="New Category Label" value={newCat.label} onChange={e => setNewCat({...newCat, label: e.target.value})} className="md:col-span-7 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
              <input type="number" step="0.01" placeholder="Price" value={newCat.price} onChange={e => setNewCat({...newCat, price: e.target.value})} className="md:col-span-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono outline-none" />
              <button type="button" onClick={handleAddCat} className="md:col-span-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
