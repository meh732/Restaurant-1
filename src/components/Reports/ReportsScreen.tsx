import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { formatCurrency } from '../../lib/utils';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns-jalali';
import { Calendar, TrendingUp, Receipt, Users } from 'lucide-react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

type DatePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export default function ReportsScreen() {
  const [preset, setPreset] = useState<DatePreset>('today');
  
  const [customRange, setCustomRange] = useState<DateObject[]>([
    new DateObject({ calendar: persian }).subtract(7, "days"),
    new DateObject({ calendar: persian })
  ]);

  const orders = useLiveQuery(() => db.orders.toArray());

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (preset) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      case 'this_week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'custom':
        if (customRange.length === 2 && customRange[0] && customRange[1]) {
          startDate = startOfDay(customRange[0].toDate());
          endDate = endOfDay(customRange[1].toDate());
        } else {
          startDate = new Date(0);
          endDate = new Date();
        }
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    return orders.filter(order => {
      if (order.status !== 'paid') return false;
      return isWithinInterval(new Date(order.createdAt), { start: startDate, end: endDate });
    });
  }, [orders, preset, customRange]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  
  // Calculate item breakdown
  const itemSales = useMemo(() => {
    const counts: Record<string, { qty: number, revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.name]) {
          counts[item.name] = { qty: 0, revenue: 0 };
        }
        counts[item.name].qty += item.quantity;
        counts[item.name].revenue += (item.price * item.quantity);
      });
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredOrders]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">گزارشات فروش</h1>
            <p className="text-slate-500 mt-2">آمار و ارقام عملکرد رستوران خود را مشاهده کنید.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={preset} 
              onChange={e => setPreset(e.target.value as DatePreset)}
              className="px-4 py-3 rounded-lg border border-slate-300 bg-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">امروز</option>
              <option value="yesterday">دیروز</option>
              <option value="this_week">این هفته</option>
              <option value="this_month">این ماه</option>
              <option value="custom">بازه سفارشی...</option>
            </select>

            {preset === 'custom' && (
              <div className="flex items-center gap-2">
                <DatePicker
                  range
                  calendar={persian}
                  locale={persian_fa}
                  value={customRange}
                  onChange={(dateObjects: any) => setCustomRange(dateObjects)}
                  inputClass="px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 text-center w-64"
                />
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">مجموع درآمد</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">تعداد فاکتورها</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalOrders} فاکتور</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">میانگین هر فاکتور</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '0 تومان'}
              </h3>
            </div>
          </div>
        </div>

        {/* Detailed Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">پرفروش‌ترین غذاها</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-right">
                <thead className="text-sm text-slate-500 sticky top-0 bg-white">
                  <tr>
                    <th className="py-3 px-4 font-medium">نام آیتم</th>
                    <th className="py-3 px-4 font-medium">تعداد فروش</th>
                    <th className="py-3 px-4 font-medium">درآمد حاصل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemSales.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3 px-4 text-slate-600">{item.qty} عدد</td>
                      <td className="py-3 px-4 text-slate-600">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                  {itemSales.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">داده‌ای برای نمایش وجود ندارد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Invoices list */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">فاکتورهای اخیر</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-right">
                <thead className="text-sm text-slate-500 sticky top-0 bg-white">
                  <tr>
                    <th className="py-3 px-4 font-medium">شماره</th>
                    <th className="py-3 px-4 font-medium">زمان</th>
                    <th className="py-3 px-4 font-medium">مشتری</th>
                    <th className="py-3 px-4 font-medium">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...filteredOrders].reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">#{order.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm" dir="ltr">
                        {format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.customerPhone ? (
                          <div className="flex flex-col text-right">
                            <span className="font-bold text-slate-700 text-xs">{order.customerName || 'بدون نام'}</span>
                            <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{order.customerPhone}</span>
                            {order.customerSubscriptionCode && (
                              <span className="text-[9px] text-amber-600 font-bold">اشتراک: {order.customerSubscriptionCode}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">عمومی</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-medium">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">داده‌ای برای نمایش وجود ندارد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
