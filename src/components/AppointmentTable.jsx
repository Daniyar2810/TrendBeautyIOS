import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { sendWhatsAppMessage } from '../lib/whatsapp';

export default function AppointmentTable({
    appointments,
    services,
    employees,
    openModal,
    deleteItem,
    refreshData
}) {
    // Timezone-safe tarih string'i
    const toDateStr = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = toDateStr(today);

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterService, setFilterService] = useState('');

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
                <span className="bg-rose-100 text-rose-600 text-sm font-bold px-3 py-1 rounded-full">
                    {filtered.length} randevu
                </span>
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
                    <div className="font-medium text-gray-500">Bu gün için randevu bulunamadı</div>
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
        </div>
    );
}
