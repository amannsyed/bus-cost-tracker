
import React from 'react';
import { DailyFare } from '../types';
import { format, parseISO } from 'date-fns';
import { Plus, X, Bus, Download, Trash2 } from 'lucide-react';

interface DailyTrackerProps {
  dailyFares: DailyFare[];
  onRemoveFare: (date: string, index: number) => void;
  onDeleteDay: (date: string) => void;
  onAddDay: () => void;
  onExport: () => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ dailyFares, onRemoveFare, onDeleteDay, onAddDay, onExport }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Trip Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical log of all PAYG entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Download CSV"><Download className="w-5 h-5" /></button>
          <button onClick={onAddDay} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Entry
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-100">
              <th className="pb-4 px-4 font-medium text-slate-400 text-[10px] uppercase tracking-wider">Date</th>
              <th className="pb-4 px-4 font-medium text-slate-400 text-[10px] uppercase tracking-wider">Historical Entries</th>
              <th className="pb-4 px-4 font-medium text-slate-400 text-[10px] uppercase tracking-wider text-right">Daily Raw</th>
              <th className="pb-4 px-4 font-medium text-slate-400 text-[10px] uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...dailyFares].reverse().map((day) => {
              const dateObj = parseISO(day.date);
              const dayTotal = day.entries.reduce((sum, e) => sum + e.priceAtTime, 0);
              return (
                <tr key={day.date} className="group hover:bg-slate-50 transition-all rounded-lg overflow-hidden">
                  <td className="py-4 px-4 bg-slate-50/30 align-top w-32 rounded-l-xl">
                    <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{format(dateObj, 'EEE, d MMM')}</span>
                  </td>
                  <td className="py-4 px-4 bg-slate-50/30 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {day.entries.map((e, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600">
                          <Bus className="w-2.5 h-2.5 text-indigo-400" />
                          {e.label} (£{e.priceAtTime.toFixed(2)})
                          <button onClick={() => onRemoveFare(day.date, idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right bg-slate-50/30 align-top">
                    <span className="font-mono font-black text-slate-700 text-sm">£{dayTotal.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4 text-right bg-slate-50/30 align-top rounded-r-xl">
                    <button 
                      onClick={() => onDeleteDay(day.date)}
                      className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                      title="Delete all trips for this day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dailyFares.length === 0 && <div className="py-20 text-center text-slate-300 text-sm italic">No entries yet.</div>}
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
    </div>
  );
};

export default DailyTracker;
