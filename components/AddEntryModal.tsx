
import React, { useState, useEffect, useRef } from 'react';
import { AppConfig, FareEntry } from '../types';
import { X, Calendar as CalendarIcon, Bus, Plus, Trash2, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, CreditCard, Wallet } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (date: string, entries: FareEntry[]) => void;
  onAddPayment: (date: string, amount: number, label: string) => void;
  config: AppConfig;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onAdd, onAddPayment, config }) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'payment'>('trips');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedEntries, setSelectedEntries] = useState<FareEntry[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(config.monthlyDebit.toString());
  const [paymentLabel, setPaymentLabel] = useState('Monthly Direct Debit');
  const calendarRef = useRef<HTMLDivElement>(null);

  // Reset logic when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEntries([]);
      setPaymentAmount(config.monthlyDebit.toString());
      setPaymentLabel('Monthly Direct Debit');
      setSelectedDate(new Date());
      setViewDate(new Date());
      setIsCalendarOpen(false);
    }
  }, [isOpen, config.monthlyDebit]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  if (!isOpen) return null;

  const handleAddCategory = (cat: { label: string, price: number }) => {
    setSelectedEntries([...selectedEntries, { label: cat.label, priceAtTime: cat.price }]);
  };

  const handleRemoveEntry = (idx: number) => {
    setSelectedEntries(selectedEntries.filter((_, i) => i !== idx));
  };

  const tripTotal = selectedEntries.reduce((sum, e) => sum + e.priceAtTime, 0);

  // Calendar Logic
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const renderCalendar = () => (
    <div className="absolute top-full left-0 mt-2 z-[120] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-[280px] animate-in fade-in zoom-in duration-150">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-bold text-slate-800">{format(viewDate, 'MMMM yyyy')}</span>
        <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-[10px] font-black text-slate-300 text-center py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedDate(day);
                setIsCalendarOpen(false);
              }}
              className={`
                text-xs font-medium py-2 rounded-lg transition-all
                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-indigo-50'}
                ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' : ''}
                ${isTodayDate && !isSelected ? 'text-indigo-600 font-bold border border-indigo-100' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto max-h-[90vh]">
        <div className="flex flex-col border-b border-slate-100">
          <div className="flex items-center justify-between p-6 pb-2">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Entry</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex px-6 gap-6">
            <button onClick={() => setActiveTab('trips')} className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'trips' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className="flex items-center gap-2"><Bus className="w-4 h-4" /> Bus Trips</div>
              {activeTab === 'trips' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button onClick={() => setActiveTab('payment')} className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'payment' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pass Payment</div>
              {activeTab === 'payment' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {activeTab === 'trips' ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto border-r border-slate-100 bg-slate-50/20">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Categories</p>
                <div className="space-y-2">
                  {config.fareCategories.map((fare) => (
                    <button key={fare.id} onClick={() => handleAddCategory(fare)} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left shadow-sm group">
                      <span className="font-semibold text-sm text-slate-700">{fare.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-600 text-xs">£{fare.price.toFixed(2)}</span>
                        <div className="p-1 bg-slate-50 rounded-md border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col bg-white">
                <div className="space-y-4 flex-grow overflow-y-auto">
                  <div className="space-y-1 relative" ref={calendarRef}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Select Date</label>
                    <button 
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 transition-colors"
                    >
                      <span>{format(selectedDate, 'PPP')}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isCalendarOpen && renderCalendar()}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selections ({selectedEntries.length})</label>
                    <div className="space-y-2">
                      {selectedEntries.length === 0 ? <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl text-slate-300 text-xs italic">Tap items on the left</div> : selectedEntries.map((e, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                          <span className="font-semibold text-slate-700">{e.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">£{e.priceAtTime.toFixed(2)}</span>
                            <button onClick={() => handleRemoveEntry(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Raw Total</span>
                    <span className="text-2xl font-black text-indigo-600">£{tripTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    disabled={selectedEntries.length === 0} 
                    onClick={() => onAdd(format(selectedDate, 'yyyy-MM-dd'), selectedEntries)} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    Save Day Trips <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 space-y-6 flex-grow bg-slate-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 relative" ref={calendarRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Date</label>
                  <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-300 transition-colors"
                  >
                    <span>{format(selectedDate, 'MMM d, yy')}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isCalendarOpen && renderCalendar()}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet className="w-4 h-4" /> Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                    <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-4 outline-none font-mono font-bold shadow-sm" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setPaymentAmount(config.adminFee.toString());
                        setPaymentLabel('Admin Fee');
                      }}
                      className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      £{config.adminFee.toFixed(2)} Admin
                    </button>
                    <button 
                      onClick={() => {
                        setPaymentAmount(config.monthlyDebit.toString());
                        setPaymentLabel('Monthly Direct Debit');
                      }}
                      className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      £{config.monthlyDebit.toFixed(2)} Pass
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Label</label>
                <input type="text" value={paymentLabel} onChange={(e) => setPaymentLabel(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none shadow-sm" />
              </div>
              <button 
                onClick={() => onAddPayment(format(selectedDate, 'yyyy-MM-dd'), parseFloat(paymentAmount) || 0, paymentLabel)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <CreditCard className="w-5 h-5" /> Log Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
