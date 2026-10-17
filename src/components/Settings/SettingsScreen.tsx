import React, { useState, useEffect, useRef } from 'react';
import { db, AppSettings } from '../../lib/db';
import { exportDB, importDB } from '../../lib/utils';
import { Save, Download, Upload } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsScreen() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings?.id) return;
    setIsSaving(true);
    await db.settings.update(settings.id, formData);
    setIsSaving(false);
    alert('تنظیمات با موفقیت ذخیره شد.');
  };

  const handleExport = async () => {
    const json = await exportDB();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('آیا مطمئن هستید؟ اطلاعات فعلی پاک شده و با فایل بکاپ جایگزین خواهند شد.')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string;
          await importDB(jsonString);
          alert('بازیابی اطلاعات با موفقیت انجام شد.');
        } catch (err) {
          alert('خطا در بازیابی اطلاعات.');
        }
      };
      reader.readAsText(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">تنظیمات کسب‌وکار</h1>
          <p className="text-slate-500 mt-2">اطلاعات فروشگاه یا رستوران خود را برای چاپ در بالای فاکتورها وارد کنید.</p>
        </div>

        {/* Form Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">نام فروشگاه / رستوران</label>
              <input 
                name="restaurantName"
                value={formData.restaurantName || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="مثال: فروشگاه البرز"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">شماره تماس</label>
              <input 
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="مثال: 021-12345678"
                dir="ltr"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">آدرس</label>
              <textarea 
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="آدرس کامل فروشگاه / رستوران"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">وبسایت</label>
              <input 
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="www.example.com"
                dir="ltr"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">آیدی اینستاگرام</label>
              <input 
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="@username"
                dir="ltr"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">آیدی تلگرام</label>
              <input 
                name="telegram"
                value={formData.telegram || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="@channel_or_username"
                dir="ltr"
              />
            </div>

             <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">لینک لوگو (URL)</label>
              <input 
                name="logoUrl"
                value={formData.logoUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://.../logo.png"
                dir="ltr"
              />
            </div>

            <div className="col-span-2 border-t border-slate-200 my-4 pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">تنظیمات مالیات</h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.taxEnabled || false}
                      onChange={(e) => setFormData({ ...formData, taxEnabled: e.target.checked })}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.taxEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.taxEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="font-medium text-slate-700">اعمال مالیات به صورت پیش‌فرض</span>
                </label>

                {formData.taxEnabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">درصد مالیات:</label>
                    <input 
                      type="number"
                      name="taxPercentage"
                      value={formData.taxPercentage || 0}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                      dir="ltr"
                      min="0"
                      max="100"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 border-t border-slate-200 my-4 pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">تنظیمات فاکتور</h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.requireCustomerPhone || false}
                      onChange={(e) => setFormData({ ...formData, requireCustomerPhone: e.target.checked })}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.requireCustomerPhone ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.requireCustomerPhone ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="font-medium text-slate-700">ثبت شماره موبایل مشتری اجباری باشد</span>
                </label>
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <Save size={20} />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">پشتیبان‌گیری از اطلاعات (Backup)</h2>
          <p className="text-slate-500 mb-6">
            میتوانید از کل اطلاعات سیستم از جمله منوها، فاکتورها و تنظیمات فایل بکاپ تهیه کنید و یا آن را بازیابی کنید.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Download size={20} />
              دریافت فایل بکاپ
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Upload size={20} />
              بازیابی از فایل
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImport}
            />
          </div>
        </div>

        {/* Developer Credit Signature Card */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-4 z-10">
            <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl">
              ME
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">طراح و توسعه‌دهنده سیستم</h3>
              <p className="text-sm text-slate-400 mt-1">توسعه، شخصی‌سازی و راه‌اندازی شبکه توسط مهندس محمد ابراهیم حیدری (۰۹۱۹۳۳۵۱۳۶۵)</p>
            </div>
          </div>
          <div className="text-right z-10 border-r md:border-r-0 md:border-l border-slate-800 pr-4 md:pr-0 md:pl-6">
            <span className="text-xs text-slate-500 block">نسخه تجاری اختصاصی</span>
            <span className="text-sm font-semibold text-blue-400 mt-1 block">Arka System v1.0.0</span>
          </div>
        </div>

      </div>
    </div>
  );
}
