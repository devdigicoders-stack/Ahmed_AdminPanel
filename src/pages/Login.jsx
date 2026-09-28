import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, Mail, Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { lang, toggleLanguage, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    en: {
      title: "Admin Portal Sign In",
      subtitle: "Ahmed for Facility Services — Qatar",
      enquiryOnlyNote: "Strictly for managing customer booking enquiries and quotes.",
      emailLabel: "Admin Email Address",
      passwordLabel: "Password",
      submitBtn: "Access Admin Dashboard",
      switchLang: "العربية",
      invalid: "Invalid credentials. Please verify."
    },
    ar: {
      title: "تسجيل دخول لوحة الإدارة",
      subtitle: "أحمد لخدمات المرافق — دولة قطر",
      enquiryOnlyNote: "مخصصة فقط لإدارة ومتابعة طلبات واستفسارات العملاء.",
      emailLabel: "البريد الإلكتروني للإدارة",
      passwordLabel: "كلمة المرور",
      submitBtn: "دخول لوحة التحكم",
      switchLang: "English",
      invalid: "بيانات الدخول غير صحيحة. يرجى التحقق."
    }
  }[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message || t.invalid);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#5B132B]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />

      {/* Language Toggle in top right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DBCE] text-xs font-bold text-[#380C1B] hover:border-[#5B132B] shadow-sm transition-all cursor-pointer"
        >
          <Globe size={14} className="text-[#C5A059]" />
          <span>{t.switchLang}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E5DBCE] shadow-xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B132B] to-[#380C1B] text-[#C5A059] mx-auto flex items-center justify-center font-bold shadow-lg border border-[#C5A059]/30">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#380C1B] tracking-tight pt-2">
            {t.title}
          </h2>
          <p className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
            {t.subtitle}
          </p>
          <p className="text-xs text-[#7A7070]">
            {t.enquiryOnlyNote}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-[#8A8181]`} />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-2.5 ${isRTL ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B] focus:ring-1 focus:ring-[#5B132B] transition-all`}
                placeholder={lang === 'en' ? 'Enter admin email' : 'أدخل البريد الإلكتروني'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1.5">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} text-[#8A8181]`} />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-2.5 ${isRTL ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B] focus:ring-1 focus:ring-[#5B132B] transition-all`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#5B132B] to-[#420D1F] hover:from-[#420D1F] hover:to-[#2B0915] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{t.submitBtn}</span>
                <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-[#8A8181]">
        © {new Date().getFullYear()} Ahmed for Facility Services • Dedicated Enquiry Portal
      </div>

    </div>
  );
}
