
import React, { useState, useMemo, useEffect } from 'react';
import { DailyFare, ChartDataPoint, AppConfig, SubscriptionPayment, FareCategory } from './types';
import { INITIAL_FARE_CATEGORIES, DEFAULT_WEEKLY_CAP } from './constants';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, min, max } from 'date-fns';
import DailyTracker from './components/DailyTracker';
import FareChart from './components/FareChart';
import SummaryCards from './components/SummaryCards';
import SetupScreen from './components/SetupScreen';
import AddEntryModal from './components/AddEntryModal';
import SettingsModal from './components/SettingsModal';
import PaymentLedger from './components/PaymentLedger';
import { Bus, RotateCcw, Plus, Settings, CreditCard, Download } from 'lucide-react';

const STORAGE_KEY_DATA = 'fare_compare_entries_v5';
const STORAGE_KEY_CONFIG = 'fare_compare_config_v5';
const STORAGE_KEY_PAYMENTS = 'fare_compare_payments_v5';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    return saved ? JSON.parse(saved) : {
      startDate: '2026-01-10',
      monthlyDebit: 68,
      adminFee: 25,
      weeklyCap: DEFAULT_WEEKLY_CAP,
      isSetup: false,
      fareCategories: INITIAL_FARE_CATEGORIES
    };
  });

  const [dailyFares, setDailyFares] = useState<DailyFare[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<SubscriptionPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(dailyFares));
  }, [dailyFares]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const handleSetupComplete = (newConfig: AppConfig) => {
    const initialPayment: SubscriptionPayment = {
      id: crypto.randomUUID(),
      date: newConfig.startDate,
      amount: newConfig.adminFee + newConfig.monthlyDebit,
      label: 'Initial Setup (Admin + Month 1)'
    };
    setPayments([initialPayment]);
    setConfig({ ...newConfig, isSetup: true });
  };

  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setIsSettingsOpen(false);
  };

  const handleAddEntry = (date: string, entries: { label: string, priceAtTime: number }[]) => {
    setDailyFares((prev) => {
      const existingIndex = prev.findIndex(f => isSameDay(parseISO(f.date), parseISO(date)));
      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = { date, entries };
      } else {
        updated = [...prev, { date, entries }];
      }
      return updated.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    });
    setIsModalOpen(false);
  };

  const handleAddPayment = (date: string, amount: number, label: string) => {
    const newPayment: SubscriptionPayment = {
      id: crypto.randomUUID(),
      date,
      amount,
      label
    };
    setPayments((prev) => [...prev, newPayment].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()));
  };

  const handleRemovePayment = (id: string) => {
    setPayments((prev) => prev.filter(p => p.id !== id));
  };

  const handleFareRemove = (date: string, indexToRemove: number) => {
    setDailyFares((prev) => 
      prev.map(df => {
        if (df.date === date) {
          const newEntries = df.entries.filter((_, idx) => idx !== indexToRemove);
          return { ...df, entries: newEntries };
        }
        return df;
      }).filter(df => df.entries.length > 0)
    );
  };

  const handleDeleteDay = (date: string) => {
    if (confirm(`Are you sure you want to delete all entries for ${date}?`)) {
      setDailyFares((prev) => prev.filter(df => df.date !== date));
    }
  };

  const handleReset = () => {
    if (confirm("Reset everything? This will delete all data.")) {
      setDailyFares([]);
      setPayments([]);
      setConfig({ ...config, isSetup: false });
      localStorage.clear();
    }
  };

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const allDates = new Set<string>();
    dailyFares.forEach(f => allDates.add(f.date));
    payments.forEach(p => allDates.add(p.date));
    if (allDates.size === 0) return [];
    
    const sortedDates = Array.from(allDates).sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());
    const firstDate = parseISO(sortedDates[0]);
    const lastDate = parseISO(sortedDates[sortedDates.length - 1]);
    const fullDateRange = eachDayOfInterval({ start: firstDate, end: lastDate });

    let cumulativePayg = 0;
    let cumulativePass = 0;
    
    // Track weekly spend for capping
    const weeklySpend: Record<string, number> = {};

    return fullDateRange.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-ww');
      
      // Calculate daily raw spend
      const dayData = dailyFares.find(df => df.date === dateStr);
      let dayRawTotal = 0;
      if (dayData) {
        dayRawTotal = dayData.entries.reduce((sum, e) => sum + e.priceAtTime, 0);
      }

      // Apply weekly cap logic
      const currentWeekTotal = weeklySpend[weekKey] || 0;
      const allowedSpend = Math.max(0, config.weeklyCap - currentWeekTotal);
      const dayCappedSpend = Math.min(dayRawTotal, allowedSpend);
      
      weeklySpend[weekKey] = currentWeekTotal + dayCappedSpend;
      cumulativePayg += dayCappedSpend;

      // Subscription Logic
      const dayPayments = payments.filter(p => p.date === dateStr);
      cumulativePass += dayPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        day: format(d, 'dd/MM'),
        label: format(d, 'MMM d, yyyy'),
        cumulativePayg,
        subscriptionCost: cumulativePass,
        timestamp: d.getTime()
      };
    });
  }, [dailyFares, payments, config.weeklyCap]);

  const stats = useMemo(() => {
    if (!chartData.length) return { totalPayg: 0, totalSubscription: 0, breakEvenDay: null };
    const lastPoint = chartData[chartData.length - 1];
    const breakEvenPoint = chartData.find(d => d.cumulativePayg >= d.subscriptionCost && d.subscriptionCost > 0);
    return { 
      totalPayg: lastPoint.cumulativePayg, 
      totalSubscription: lastPoint.subscriptionCost, 
      breakEvenDay: breakEvenPoint ? breakEvenPoint.day : null 
    };
  }, [chartData]);

  const exportCSV = (type: 'trips' | 'payments') => {
    let csvContent = "";
    if (type === 'trips') {
      csvContent = "Date,Fares,Total Cost\n" + dailyFares.map(df => 
        `"${df.date}","${df.entries.map(e => e.label).join('; ')}",${df.entries.reduce((s, e) => s + e.priceAtTime, 0).toFixed(2)}`
      ).join("\n");
    } else {
      csvContent = "Date,Label,Amount\n" + payments.map(p => 
        `"${p.date}","${p.label}",${p.amount.toFixed(2)}`
      ).join("\n");
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farecompare_${type}_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  if (!config.isSetup) {
    return <SetupScreen onComplete={handleSetupComplete} initialConfig={config} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">FareCompare</h1>
              <span className="text-xs text-slate-500 font-medium">Cap: £{config.weeklyCap}/wk</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={handleReset} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Commuter Analysis</h2>
            <p className="text-slate-500 mt-1">Comparing manual payments with weekly-capped bus fares.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add Entry
          </button>
        </div>

        <SummaryCards totalPayg={stats.totalPayg} breakEvenDay={stats.breakEvenDay} totalSubscription={stats.totalSubscription} />

        {chartData.length > 0 ? <FareChart data={chartData} /> : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center mb-8 text-slate-400">
            Log your first data point to generate the comparison chart.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DailyTracker 
              dailyFares={dailyFares} 
              onRemoveFare={handleFareRemove} 
              onDeleteDay={handleDeleteDay}
              onAddDay={() => setIsModalOpen(true)}
              onExport={() => exportCSV('trips')}
            />
            <PaymentLedger 
              payments={payments} 
              onRemovePayment={handleRemovePayment} 
              onExport={() => exportCSV('payments')}
            />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <CreditCard className="w-5 h-5" />
                <h4 className="font-bold text-slate-800">Plan Snapshot</h4>
              </div>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-400">Weekly PAYG Cap</span>
                  <span className="font-bold text-slate-700">£{config.weeklyCap.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-400">Monthly Pass Cost</span>
                  <span className="font-bold text-slate-700">£{config.monthlyDebit.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full mt-2 py-2 text-indigo-600 text-xs font-bold border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Adjust Plan Settings
                </button>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl">
               <h4 className="font-bold text-sm uppercase tracking-widest opacity-60 mb-4">Fare Categories</h4>
               <div className="space-y-2">
                 {config.fareCategories.map(f => (
                   <div key={f.id} className="flex justify-between text-xs items-center">
                     <span className="font-medium">{f.label}</span>
                     <span className="font-mono bg-indigo-800 px-2 py-0.5 rounded">£{f.price.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      <AddEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddEntry} 
        onAddPayment={handleAddPayment}
        config={config}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config} 
        onSave={handleUpdateConfig}
      />
    </div>
  );
};

export default App;
