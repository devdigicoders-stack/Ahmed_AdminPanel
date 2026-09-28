import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  fetchAdminEnquiries, 
  updateEnquiryStatusApi, 
  deleteEnquiryApi,
  updateAdminProfileApi,
  changeAdminPasswordApi
} from '../services/api';
import { 
  Search, 
  Trash2, 
  Phone, 
  Globe, 
  ShieldCheck, 
  RefreshCw,
  LogOut,
  Eye,
  X,
  User,
  KeyRound,
  Inbox,
  Clock,
  CheckCircle,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Dashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const { lang, toggleLanguage, isRTL } = useLanguage();
  
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: ''
  });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminEnquiries(token);
    setEnquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+974 4455 6677',
        title: user.title || 'Operations Manager'
      });
    }
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateEnquiryStatusApi(token, id, newStatus);
    if (res.success) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to delete this enquiry?' : 'هل أنت متأكد من رغبتك في حذف هذا الاستفسار؟')) {
      const res = await deleteEnquiryApi(token, id);
      if (res.success) {
        setEnquiries(prev => prev.filter(e => e.id !== id));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(null);
        }
      }
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setIsSavingProfile(true);

    const res = await updateAdminProfileApi(token, profileForm);
    if (res.success) {
      updateUser(res.user);
      setProfileMsg({
        text: lang === 'en' ? 'Profile updated successfully!' : 'تم تحديث الملف الشخصي بنجاح!',
        type: 'success'
      });
      setTimeout(() => setShowProfileModal(false), 1200);
    } else {
      setProfileMsg({ text: res.message || 'Update failed', type: 'error' });
    }
    setIsSavingProfile(false);
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({
        text: lang === 'en' ? 'New passwords do not match.' : 'كلمات المرور الجديدة غير متطابقة.',
        type: 'error'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({
        text: lang === 'en' ? 'Password must be at least 6 characters.' : 'يجب أن لا تقل كلمة المرور عن 6 أحرف.',
        type: 'error'
      });
      return;
    }

    setIsSavingPassword(true);
    const res = await changeAdminPasswordApi(token, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    if (res.success) {
      setPasswordMsg({
        text: lang === 'en' ? 'Password changed successfully!' : 'تم تغيير كلمة المرور بنجاح!',
        type: 'success'
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 1200);
    } else {
      setPasswordMsg({ text: res.message || 'Password update failed', type: 'error' });
    }
    setIsSavingPassword(false);
  };

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      const matchStatus = statusFilter === 'all' || enq.status === statusFilter;
      const matchService = serviceFilter === 'all' || enq.serviceRequired === serviceFilter;
      const matchSearch = searchQuery === '' || 
        (enq.fullName && enq.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (enq.mobileNumber && enq.mobileNumber.includes(searchQuery)) ||
        (enq.id && enq.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (enq.emailAddress && enq.emailAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (enq.additionalRequirements && enq.additionalRequirements.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchService && matchSearch;
    });
  }, [enquiries, statusFilter, serviceFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter(e => e.status === 'New').length;
    const inProgress = enquiries.filter(e => e.status === 'In Progress').length;
    const confirmed = enquiries.filter(e => e.status === 'Confirmed' || e.status === 'Completed').length;
    return { total, newCount, inProgress, confirmed };
  }, [enquiries]);

  // Bilingual Labels
  const labels = {
    en: {
      portalTitle: "Enquiry Management Portal",
      portalSub: "Live Customer Leads & Booking Requests — Qatar",
      myProfile: "My Profile",
      changePassword: "Change Password",
      refresh: "Refresh Data",
      logout: "Sign Out",
      searchPlaceholder: "Search client name, mobile, Enquiry ID, requirements...",
      allStatuses: "All Statuses",
      allServices: "All Services",
      statTotal: "Total Enquiries",
      statNew: "New Requests",
      statProgress: "In Progress",
      statConfirmed: "Confirmed / Closed",
      thId: "Enquiry ID",
      thClient: "Client & Mobile",
      thService: "Service & Duration",
      thDate: "Start Date",
      thStatus: "Status",
      thAction: "Actions",
      noData: "No customer enquiries found matching your filters.",
      modalTitle: "Enquiry Full Details",
      whatsAppDirect: "Direct WhatsApp",
      callDirect: "Call Client",
      notes: "Requirements / Preferences",
      submittedOn: "Submitted on:",
      close: "Close",
      saveChanges: "Save Changes",
      websiteLink: "Visit Website"
    },
    ar: {
      portalTitle: "لوحة إدارة استفسارات العملاء",
      portalSub: "متابعة الطلبات المباشرة وحجوزات الكوادر — دولة قطر",
      myProfile: "ملفي الشخصي",
      changePassword: "تغيير كلمة المرور",
      refresh: "تحديث البيانات",
      logout: "تسجيل الخروج",
      searchPlaceholder: "ابحث بالاسم، رقم الجوال، رقم الطلب، أو الملاحظات...",
      allStatuses: "كافة الحالات",
      allServices: "كافة الخدمات",
      statTotal: "إجمالي الطلبات",
      statNew: "طلبات جديدة",
      statProgress: "قيد المتابعة",
      statConfirmed: "مؤكد / مكتمل",
      thId: "رقم الطلب",
      thClient: "اسم العميل والجوال",
      thService: "الخدمة والمدة",
      thDate: "تاريخ البدء",
      thStatus: "الحالة",
      thAction: "الإجراءات",
      noData: "لا توجد طلبات مطابقة لمعايير البحث الحالية.",
      modalTitle: "تفاصيل الطلب الكاملة",
      whatsAppDirect: "محادثة واتساب مباشرة",
      callDirect: "اتصال هاتفي",
      notes: "المتطلبات والتفضيلات",
      submittedOn: "تاريخ التقديم:",
      close: "إغلاق",
      saveChanges: "حفظ التعديلات",
      // websiteLink: "زيارة الموقع"
    }
  }[lang];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-[#E5DBCE] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B132B] to-[#380C1B] text-[#C5A059] flex items-center justify-center font-bold text-xl shadow-md border border-[#C5A059]/30">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#380C1B]">
                {labels.portalTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B132B]/10 text-[#5B132B] uppercase">
                Enquiries Only
              </span>
            </div>
            <p className="text-xs text-[#665E5E] mt-0.5">
              {labels.portalSub}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* My Profile Button */}
          <button
            onClick={() => {
              setProfileMsg({ text: '', type: '' });
              setShowProfileModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5C7B3] hover:border-[#5B132B] text-xs font-bold text-[#380C1B] transition-all cursor-pointer shadow-sm"
          >
            <User size={14} className="text-[#C5A059]" />
            <span>{labels.myProfile}</span>
          </button>

          {/* Change Password Button */}
          <button
            onClick={() => {
              setPasswordMsg({ text: '', type: '' });
              setShowPasswordModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5C7B3] hover:border-[#5B132B] text-xs font-bold text-[#380C1B] transition-all cursor-pointer shadow-sm"
          >
            <KeyRound size={14} className="text-[#C5A059]" />
            <span>{labels.changePassword}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5C7B3] hover:border-[#5B132B] text-xs font-bold text-[#380C1B] bg-[#FAF8F5] transition-all cursor-pointer shadow-sm"
          >
            <Globe size={14} className="text-[#C5A059]" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-[#D5C7B3] hover:bg-[#FAF8F5] text-[#380C1B] transition-colors cursor-pointer"
            title={labels.refresh}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Website Link */}
        

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer border border-rose-200"
          >
            <LogOut size={14} />
            <span>{labels.logout}</span>
          </button>
        </div>

      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5DBCE] shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-[#8A8181] uppercase">{labels.statTotal}</span>
          <div className="text-2xl font-black text-[#380C1B]">{stats.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DBCE] shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase">{labels.statNew}</span>
          <div className="text-2xl font-black text-blue-700">{stats.newCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DBCE] shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase">{labels.statProgress}</span>
          <div className="text-2xl font-black text-amber-700">{stats.inProgress}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DBCE] shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">{labels.statConfirmed}</span>
          <div className="text-2xl font-black text-emerald-700">{stats.confirmed}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto p-5 rounded-3xl bg-white border border-[#E5DBCE] shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-[#8A8181]`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className={`w-full py-2.5 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-xs sm:text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]`}
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-xs sm:text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
            >
              <option value="all">{labels.allStatuses}</option>
              <option value="New">{lang === 'en' ? 'New' : 'جديد'}</option>
              <option value="In Progress">{lang === 'en' ? 'In Progress' : 'قيد المتابعة'}</option>
              <option value="Confirmed">{lang === 'en' ? 'Confirmed' : 'مؤكد'}</option>
              <option value="Completed">{lang === 'en' ? 'Completed' : 'مكتمل'}</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="md:col-span-3">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-xs sm:text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
            >
              <option value="all">{labels.allServices}</option>
              <option value="Housemaid">{lang === 'en' ? 'Housemaid' : 'عاملة منزلية'}</option>
              <option value="House Cook">{lang === 'en' ? 'House Cook' : 'طاهٍ منزلي'}</option>
              <option value="Family Driver">{lang === 'en' ? 'Family Driver' : 'سائق عائلي'}</option>
              <option value="Private Nurse">{lang === 'en' ? 'Private Nurse' : 'ممرضة خاصة'}</option>
              <option value="Caregiver">{lang === 'en' ? 'Caregiver' : 'مقدم رعاية'}</option>
              <option value="Other">{lang === 'en' ? 'Other' : 'أخرى'}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-[#E5DBCE] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <thead className="bg-[#FAF8F5] text-[#380C1B] border-b border-[#E5DBCE] font-bold">
              <tr>
                <th className="py-4 px-4 sm:px-6">{labels.thId}</th>
                <th className="py-4 px-4 sm:px-6">{labels.thClient}</th>
                <th className="py-4 px-4 sm:px-6">{labels.thService}</th>
                <th className="py-4 px-4 sm:px-6">{labels.thDate}</th>
                <th className="py-4 px-4 sm:px-6">{labels.thStatus}</th>
                <th className="py-4 px-4 sm:px-6 text-center">{labels.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DBCE]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#8A8181]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-[#C5A059]" />
                      <span>{lang === 'en' ? 'Loading Enquiries...' : 'جارٍ تحميل البيانات...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#8A8181]">
                    <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                    <span>{labels.noData}</span>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#5B132B]">
                      {enq.id}
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-[#380C1B]">{enq.fullName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[#665E5E] mt-0.5">
                        <Phone size={11} className="text-[#C5A059]" />
                        <span>{enq.mobileNumber}</span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-semibold text-[#380C1B] block">{enq.serviceRequired}</span>
                      <span className="text-[11px] text-[#8A8181]">{enq.preferredDuration}</span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 text-xs text-[#524848]">
                      {enq.preferredStartDate || (lang === 'en' ? 'Immediate' : 'فوري')}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4 sm:px-6">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-full border focus:outline-none cursor-pointer ${getStatusBadgeClass(enq.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E5DBCE] text-[#380C1B] hover:bg-[#5B132B] hover:text-white transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {/* WhatsApp Direct */}
                        <a
                          href={`https://wa.me/${(enq.whatsappNumber || enq.mobileNumber).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={15} />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. ENQUIRY FULL DETAILS MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E5DBCE] relative">
            <div className="p-6 bg-gradient-to-r from-[#5B132B] to-[#380C1B] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C5A059] text-[#380C1B] uppercase">
                  {selectedEnquiry.id}
                </span>
                <h3 className="text-xl font-bold mt-1">{labels.modalTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-[#380C1B] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE]">
                  <span className="text-[10px] text-[#8A8181] block uppercase">{lang === 'en' ? 'Full Name:' : 'اسم العميل:'}</span>
                  <span className="font-bold text-[#380C1B] text-sm">{selectedEnquiry.fullName}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE]">
                  <span className="text-[10px] text-[#8A8181] block uppercase">{lang === 'en' ? 'Mobile:' : 'الجوال:'}</span>
                  <span className="font-bold text-[#380C1B] text-sm">{selectedEnquiry.mobileNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE]">
                  <span className="text-[10px] text-[#8A8181] block uppercase">{lang === 'en' ? 'Service Required:' : 'الخدمة المطلوبة:'}</span>
                  <span className="font-bold text-[#5B132B]">{selectedEnquiry.serviceRequired}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE]">
                  <span className="text-[10px] text-[#8A8181] block uppercase">{lang === 'en' ? 'Duration / Start:' : 'المدة وتاريخ البدء:'}</span>
                  <span className="font-semibold text-[#380C1B]">{selectedEnquiry.preferredDuration} ({selectedEnquiry.preferredStartDate || 'Immediate'})</span>
                </div>
              </div>

              {selectedEnquiry.emailAddress && (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE]">
                  <span className="text-[10px] text-[#8A8181] block uppercase">{lang === 'en' ? 'Email Address:' : 'البريد الإلكتروني:'}</span>
                  <span className="font-semibold text-[#380C1B]">{selectedEnquiry.emailAddress}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] space-y-1">
                <span className="text-[10px] font-bold text-[#8A8181] uppercase">{labels.notes}</span>
                <p className="text-[#443C3C] leading-relaxed">
                  {selectedEnquiry.additionalRequirements || (lang === 'en' ? 'No additional notes provided.' : 'لا توجد ملاحظات إضافية.')}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8A8181] pt-1">
                <span>{labels.submittedOn} {selectedEnquiry.createdAt}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(selectedEnquiry.status)}`}>
                  {selectedEnquiry.status}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DBCE] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${(selectedEnquiry.whatsappNumber || selectedEnquiry.mobileNumber).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FaWhatsapp size={14} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedEnquiry.mobileNumber}`}
                  className="px-3.5 py-2 rounded-xl bg-[#5B132B] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Phone size={13} />
                  <span>{labels.callDirect}</span>
                </a>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#524848] hover:bg-[#EBE5DA] cursor-pointer"
              >
                {labels.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E5DBCE] relative">
            <div className="p-6 bg-gradient-to-r from-[#5B132B] to-[#380C1B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User size={22} className="text-[#C5A059]" />
                <h3 className="text-xl font-bold">{labels.myProfile}</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-[#380C1B] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {profileMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Full Name' : 'الاسم الكامل'}
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                    {lang === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                    {lang === 'en' ? 'Designation / Role' : 'المسمى الوظيفي'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5DBCE]">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#524848] hover:bg-[#EBE5DA] cursor-pointer"
                >
                  {labels.close}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#5B132B] hover:bg-[#380C1B] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save size={14} />
                  <span>{isSavingProfile ? (lang === 'en' ? 'Saving...' : 'جارٍ الحفظ...') : labels.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E5DBCE] relative">
            <div className="p-6 bg-gradient-to-r from-[#5B132B] to-[#380C1B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound size={22} className="text-[#C5A059]" />
                <h3 className="text-xl font-bold">{labels.changePassword}</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-[#380C1B] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {passwordMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Current Password' : 'كلمة المرور الحالية'}
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'New Password (min 6 characters)' : 'كلمة المرور الجديدة (6 أحرف على الأقل)'}
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#380C1B] uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DBCE] text-sm text-[#380C1B] focus:outline-none focus:border-[#5B132B]"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5DBCE]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#524848] hover:bg-[#EBE5DA] cursor-pointer"
                >
                  {labels.close}
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#5B132B] hover:bg-[#380C1B] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <KeyRound size={14} />
                  <span>{isSavingPassword ? (lang === 'en' ? 'Updating...' : 'جارٍ التحديث...') : labels.changePassword}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
