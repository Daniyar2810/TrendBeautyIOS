import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { sendWhatsAppMessage } from '../lib/whatsapp';

// ── Yeni Randevu Modalı ──────────────────────────────────────────────────────
function NewAppointmentModal({ services, employees, defaultDate, onClose, onSaved }) {
    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        appointment_date: defaultDate,
        appointment_start_time: '',
        service_id: '',
        employee_id: '',
        notes: '',
        status: 'Beklemede',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Seçilen hizmete göre bitiş saatini ve fiyatı hesapla
    const selectedService = services.find(s => String(s.id) === form.service_id);
    const totalPrice = selectedService?.price ?? '';

    function calcEndTime(start, durationMin) {
        if (!start || !durationMin) return '';
        const [h, m] = start.split(':').map(Number);
        const total = h * 60 + m + Number(durationMin);
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }

    const endTime = calcEndTime(form.appointment_start_time, selectedService?.duration_minutes);

    const handleSave = async () => {
        if (!form.customer_name || !form.appointment_date || !form.appointment_start_time || !form.service_id || !form.employee_id) {
            setError('Lütfen zorunlu alanları doldurun.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const { error: dbError } = await supabase.from('appointments').insert([{
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                appointment_date: form.appointment_date,
                appointment_start_time: form.appointment_start_time,
                end_time: endTime,
                service_id: form.service_id,
                employee_id: form.employee_id,
                notes: form.notes,
                status: form.status,
                duration_minutes: selectedService?.duration_minutes ?? null,
                total_price: totalPrice || null,
            }]);
            if (dbError) throw dbError;
            onSaved();
            onClose();
        } catch (e) {
            setError(e.message || 'Kayıt sırasında hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-extrabold text-gray-800">Yeni Randevu</h3>
                        <p className="text-xs text-gray-400">Tüm alanları doldurup kaydedin</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-500 text-lg font-bold transition-all"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Müşteri Adı */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Müşteri Adı <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={form.customer_name}
                            onChange={e => set('customer_name', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* Telefon */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Telefon</label>
                        <input
                            type="tel"
                            placeholder="05XX XXX XX XX"
                            value={form.customer_phone}
                            onChange={e => set('customer_phone', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                        />
                    </div>

                    {/* Tarih + Saat */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tarih <span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                value={form.appointment_date}
                                onChange={e => set('appointment_date', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Başlangıç Saati <span className="text-red-400">*</span></label>
                            <input
                                type="time"
                                value={form.appointment_start_time}
                                onChange={e => set('appointment_start_time', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                            />
                        </div>
                    </div>

                    {/* Hizmet */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Hizmet <span className="text-red-400">*</span></label>
                        <select
                            value={form.service_id}
                            onChange={e => set('service_id', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                        >
                            <option value="">Hizmet seçin</option>
                            {services.map(s => (
                                <option key={s.id} value={String(s.id)}>
                                    {s.title} — ₺{s.price} ({s.duration_minutes} dk)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Uzman */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Uzman <span className="text-red-400">*</span></label>
                        <select
                            value={form.employee_id}
                            onChange={e => set('employee_id', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                        >
                            <option value="">Uzman seçin</option>
                            {employees.map(e => (
                                <option key={e.id} value={String(e.id)}>{e.full_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Durum */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Durum</label>
                        <select
                            value={form.status}
                            onChange={e => set('status', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                        >
                            <option value="Beklemede">Beklemede</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="İptal">İptal</option>
                        </select>
                    </div>

                    {/* Notlar */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Notlar</label>
                        <textarea
                            rows={2}
                            placeholder="Ek bilgi..."
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none resize-none"
                        />
                    </div>

                    {/* Özet (otomatik hesaplanan) */}
                    {selectedService && form.appointment_start_time && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bitiş saati</span>
                                <span className="font-bold">{endTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Toplam tutar</span>
                                <span className="font-bold text-rose-600">₺{totalPrice}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-sm"
                    >
                        {saving ? 'Kaydediliyor...' : '✓ Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function AppointmentTable({
    appointments,
    services,
    employees,
    openModal,
    deleteItem,
    refreshData
}) {
    const toDateStr = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = toDateStr(today);

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterService, setFilterService] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);   // ← YENİ

    function changeDay(delta) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setDate(d.getDate() + delta);
        setSelectedDate(toDateStr(d));
    }

    function formatDisplayDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        const tomorrowStr = toDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
        const yesterdayStr = toDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
        if (dateStr === todayStr) return `Bugün — ${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
        if (dateStr === tomorrowStr) return `Yarın — ${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
        if (dateStr === yesterdayStr) return `Dün — ${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
        return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    const filtered = useMemo(() => {
        return (appointments || []).filter(app => {
            const dateMatch = app.appointment_date === selectedDate;
            const empMatch = filterEmployee ? String(app.employee_id) === filterEmployee : true;
            const svcMatch = filterService ? String(app.service_id) === filterService : true;
            return dateMatch && empMatch && svcMatch;
        }).sort((a, b) => (a.appointment_start_time || '').localeCompare(b.appointment_start_time || ''));
    }, [appointments, selectedDate, filterEmployee, filterService]);

    const handleApprove = async (app, service, employee) => {
        try {
            const { error: dbError } = await supabase
                .from('appointments')
                .update({ status: 'Onaylandı' })
                .eq('id', app.id);
            if (dbError) throw dbError;

            const formatPhone = (phone) => {
                if (!phone) return '';
                return `90${phone.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')}`;
            };

            if (app.customer_phone) {
                const customerMsg = `*Trend Beauty Randevu Onayı* ✅\n\nMerhaba *${app.customer_name}*,\n${app.appointment_date} tarihindeki *${service?.title}* randevunuz onaylanmıştır.\n\n⏰ Saat: ${app.appointment_start_time}\n📍 Konum: Trend Beauty Salon\n\nSizi bekliyoruz!`;
                await sendWhatsAppMessage({ phone: formatPhone(app.customer_phone), message: customerMsg });
            }

            if (employee?.phone) {
                const expertMsg = `*Yeni İş Ataması!* 💇\n\n👤 Müşteri: ${app.customer_name}\n📅 Tarih: ${app.appointment_date}\n🕒 Saat: ${app.appointment_start_time}\n✨ Hizmet: ${service?.title}`;
                await sendWhatsAppMessage({ phone: formatPhone(employee.phone), message: expertMsg });
            }

            if (refreshData) refreshData();
        } catch (error) {
            console.error("İşlem Hatası:", error);
        }
    };

    return (
        <div className="p-4">
            {/* BAŞLIK */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800">Randevular</h2>
                    <p className="text-gray-500 text-sm">Günlük randevu takibi</p>
                </div>

                {/* ── Sağ taraf: badge + YENİ RANDEVU butonu ── */}
                <div className="flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-600 text-sm font-bold px-3 py-1 rounded-full">
                        {filtered.length} randevu
                    </span>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                        <span className="text-base leading-none">+</span>
                        Yeni Randevu
                    </button>
                </div>
            </div>

            {/* GÜN NAVİGASYONU */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-3 shadow-sm">
                <button
                    onClick={() => changeDay(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-rose-100 hover:text-rose-600 transition-all text-2xl font-bold select-none"
                >
                    ‹
                </button>

                <div className="text-center flex-1">
                    <div className="font-bold text-gray-800 text-sm md:text-base">{formatDisplayDate(selectedDate)}</div>
                    {selectedDate !== todayStr && (
                        <button
                            onClick={() => setSelectedDate(todayStr)}
                            className="text-xs text-rose-500 hover:underline mt-0.5"
                        >
                            Bugüne dön
                        </button>
                    )}
                </div>

                <button
                    onClick={() => changeDay(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-rose-100 hover:text-rose-600 transition-all text-2xl font-bold select-none"
                >
                    ›
                </button>
            </div>

            {/* FİLTRELER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-rose-300 outline-none"
                />
                <select
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-rose-300 outline-none"
                >
                    <option value="">👩‍💼 Tüm Uzmanlar</option>
                    {employees.map(e => (
                        <option key={e.id} value={String(e.id)}>{e.full_name}</option>
                    ))}
                </select>
                <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-rose-300 outline-none"
                >
                    <option value="">✨ Tüm Hizmetler</option>
                    {services.map(s => (
                        <option key={s.id} value={String(s.id)}>{s.title}</option>
                    ))}
                </select>
            </div>

            {/* TABLO */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <div className="text-5xl mb-3">📅</div>
                    <div className="font-medium text-gray-500 mb-4">Bu gün için randevu bulunamadı</div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                        + Yeni Randevu Ekle
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                                <th className="p-4 font-bold">Müşteri</th>
                                <th className="p-4 font-bold">Hizmet & Uzman</th>
                                <th className="p-4 font-bold">Saat</th>
                                <th className="p-4 font-bold">Tutar</th>
                                <th className="p-4 font-bold">Durum</th>
                                <th className="p-4 font-bold text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {filtered.map(app => {
                                const service = services.find(s => String(s.id) === String(app.service_id));
                                const employee = employees.find(e => String(e.id) === String(app.employee_id));
                                const isPending = app.status === 'Bekliyor' || app.status === 'Beklemede' || !app.status;

                                return (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <a
                                                href={`https://wa.me/90${app.customer_phone?.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')}?text=Merhaba%20${encodeURIComponent(app.customer_name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-gray-900 hover:text-green-600 transition-colors block"
                                            >
                                                {app.customer_name} 💬
                                            </a>
                                            <a href={`tel:${app.customer_phone}`} className="text-xs text-blue-600 font-medium">
                                                {app.customer_phone}
                                            </a>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-semibold text-rose-600">{service?.title || 'Bilinmeyen Hizmet'}</div>
                                            <div className="text-xs text-gray-500">{employee?.full_name || 'Atanmamış'}</div>
                                        </td>

                                        <td className="p-4">
                                            <div className="font-medium">{app.appointment_start_time}</div>
                                            <div className="text-xs text-gray-400">{app.end_time}</div>
                                        </td>

                                        <td className="p-4 font-bold text-gray-900">₺{app.total_price}</td>

                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                app.status === 'Onaylandı' ? 'bg-green-100 text-green-700' :
                                                app.status === 'İptal' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {app.status || 'Beklemede'}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            {isPending && (
                                                <button
                                                    onClick={() => handleApprove(app, service, employee)}
                                                    className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm"
                                                >
                                                    ✓ Onayla
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openModal('appointment', app)}
                                                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-xs"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => deleteItem('appointment', app.id)}
                                                className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* YENİ RANDEVU MODALI */}
            {showNewModal && (
                <NewAppointmentModal
                    services={services}
                    employees={employees}
                    defaultDate={selectedDate}
                    onClose={() => setShowNewModal(false)}
                    onSaved={() => { if (refreshData) refreshData(); }}
                />
            )}
        </div>
    );
}
