import { useEffect, useState } from 'react';
import { requestNotificationPermission } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { sendTelegramMessage } from '../lib/telegram';

// Bileşenler
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileTabs from '../components/MobileTabs';
import AppointmentTable from '../components/AppointmentTable';
import ServiceTable from '../components/ServiceTable';
import EmployeeTable from '../components/EmployeeTable';
import Modal from '../components/Modal';
import AvailableTimes from '../components/AvailableTimes';

export default function AdminDashboard({ logout }) {
    const [activeTab, setActiveTab] = useState('appointments');
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [employeeId, setEmployeeId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [service, setService] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [toast, setToast] = useState('');

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    }

    function openWhatsApp(phone, message) {
    const cleanPhone = `90${phone.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')}`
    const encodedMsg = encodeURIComponent(message)
    const url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    
    const link = document.createElement('a')
    link.href = url
    // target="_blank" kaldırıldı, iOS'ta direkt açılsın
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

    async function loadDatabase() {
        try {
            const { data: sData } = await supabase.from('services').select('*');
            setServices(sData || []);
            const { data: eData } = await supabase.from('employees').select('*');
            setEmployees(eData || []);
            const { data: aData } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
            setAppointments(aData || []);
        } catch (err) {
            console.error("Veri yükleme hatası:", err);
        }
    }

    useEffect(() => {
        requestNotificationPermission();
        loadDatabase();
    }, []);

    // REAL-TIME + TELEGRAM BİLDİRİM
    useEffect(() => {
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async (payload) => {
                loadDatabase();

                if (payload.eventType === 'INSERT' || payload.event === 'INSERT' || payload.type === 'INSERT') {
                    const yeni = payload.new;
                    await sendTelegramMessage(
                        `🔔 Yeni Randevu!\n\n👤 Müşteri: ${yeni.customer_name}\n📞 Telefon: ${yeni.customer_phone}\n📅 Tarih: ${yeni.appointment_date}\n⏰ Saat: ${yeni.appointment_start_time}`
                    );
                }
            })
            .subscribe((status) => {
                console.log('CHANNEL STATUS:', status);
            });

        return () => { supabase.removeChannel(channel); };
    }, []);

    function openModal(type, item = null) {
        setModalType(type);
        setSelectedItem(item);
        setFormData(item || {});
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    async function deleteItem(type, id) {
        let tableName = type === 'service' ? 'services' : type === 'employee' ? 'employees' : 'appointments';
        await supabase.from(tableName).delete().eq('id', id);
        loadDatabase();
        showToast('Kayıt silindi.');
    }

    async function handleApproveQuick(app, serviceObj, employeeObj) {
        try {
            const { error } = await supabase.from('appointments').update({ status: 'Onaylandı' }).eq('id', app.id);
            if (error) throw error;

            // Telegram bildirimi
            await sendTelegramMessage(
                `✅ Randevu Onaylandı\n\n👤 ${app.customer_name}\n📅 ${app.appointment_date} - ${app.appointment_start_time}\n✨ ${serviceObj?.title || '-'}`
            );

            // Müşteriye WhatsApp
            if (app.customer_phone) {
                openWhatsApp(
                    app.customer_phone,
                    `Merhaba ${app.customer_name}, ${app.appointment_date} tarihindeki *${serviceObj?.title}* randevunuz onaylandı! ✅\n\n⏰ Saat: ${app.appointment_start_time}\n📍 Trend Beauty Kadıköy\n\nSizi bekliyoruz!`
                )
            }

            // Uzmana WhatsApp (kısa gecikme ile aç)
            if (employeeObj?.phone) {
                setTimeout(() => {
                    openWhatsApp(
                        employeeObj.phone,
                        `Yeni randevu atandı! 💇\n\nMüşteri: ${app.customer_name}\nTarih: ${app.appointment_date}\nSaat: ${app.appointment_start_time}\nHizmet: ${serviceObj?.title}`
                    )
                }, 1500)
            }

            showToast('Randevu onaylandı!');
            loadDatabase();
        } catch (err) {
            console.error(err);
            showToast('İşlem başarısız.');
        }
    }

    async function handleSave() {
        try {
            if (modalType === 'service') {
                if (selectedItem) await supabase.from('services').update(formData).eq('id', selectedItem.id);
                else await supabase.from('services').insert([formData]);

            } else if (modalType === 'employee') {
                if (selectedItem) await supabase.from('employees').update(formData).eq('id', selectedItem.id);
                else await supabase.from('employees').insert([formData]);

            } else if (modalType === 'appointment') {
                const { error } = await supabase.from('appointments').update({
                    status: formData.status,
                    appointment_date: formData.appointment_date,
                    appointment_start_time: formData.appointment_start_time,
                    end_time: formData.end_time,
                    employee_id: formData.employee_id
                }).eq('id', selectedItem.id);

                if (error) throw error;

                if (formData.status === 'Onaylandı') {
                    const e = employees.find(x => x.id === formData.employee_id);
                    const s = services.find(x => x.id === selectedItem.service_id);

                    // Telegram bildirimi
                    await sendTelegramMessage(
                        `✅ Randevu Güncellendi\n\n👤 ${selectedItem.customer_name}\n📅 ${formData.appointment_date} - ${formData.appointment_start_time}\n👩‍💼 Uzman: ${e?.full_name || '-'}`
                    );

                    // Müşteriye WhatsApp
                    if (selectedItem.customer_phone) {
                        openWhatsApp(
                            selectedItem.customer_phone,
                            `Merhaba ${selectedItem.customer_name}, randevunuz onaylandı! ✅\n\n📅 Tarih: ${formData.appointment_date}\n⏰ Saat: ${formData.appointment_start_time}\n👩‍💼 Uzman: ${e?.full_name || '-'}\n📍 Trend Beauty Kadıköy\n\nSizi bekliyoruz!`
                        )
                    }

                    // Uzmana WhatsApp
                    if (e?.phone) {
                        setTimeout(() => {
                            openWhatsApp(
                                e.phone,
                                `Randevu güncellendi! 💇\n\nMüşteri: ${selectedItem.customer_name}\nTarih: ${formData.appointment_date}\nSaat: ${formData.appointment_start_time}\nHizmet: ${s?.title || '-'}`
                            )
                        }, 1500)
                    }
                }
            }

            closeModal();
            await loadDatabase();
            showToast('Başarıyla kaydedildi.');
        } catch (error) {
            console.error(error);
            showToast('Kaydedilirken bir hata oluştu.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">

            {/* TOAST BİLDİRİM */}
            {toast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-medium">
                    {toast}
                </div>
            )}

            <div className="hidden md:block">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <Header logout={logout} />

                <div className="md:hidden">
                    <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                <main className="flex-1 p-3 md:p-6 overflow-y-auto">
                    {activeTab === 'appointments' && (
                        <div className="space-y-6">
                            <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200">
                                <AppointmentTable
                                    key={JSON.stringify(appointments)}
                                    appointments={appointments}
                                    services={services}
                                    employees={employees}
                                    openModal={openModal}
                                    deleteItem={deleteItem}
                                    onApprove={handleApproveQuick}
                                    refreshData={loadDatabase}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Randevu Takvimi</h2>
                            <AppointmentCalendar appointments={appointments} services={services} employees={employees} />
                        </div>
                    )}

                    {activeTab === 'available-times' && (
                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">Canlı Müsait Saat Sistemi</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <select value={service} onChange={(e) => setService(e.target.value)} className="border rounded-xl p-3 w-full">
                                    <option value="">Hizmet Seç</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="border rounded-xl p-3 w-full">
                                    <option value="">Uzman Seç</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                                </select>
                                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="border rounded-xl p-3 w-full" />
                            </div>
                            <AvailableTimes employeeId={employeeId} appointmentDate={appointmentDate} service={service} />
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <ServiceTable services={services} openModal={openModal} deleteItem={deleteItem} />
                    )}

                    {activeTab === 'employees' && (
                        <EmployeeTable employees={employees} openModal={openModal} deleteItem={deleteItem} />
                    )}
                </main>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                type={modalType}
                item={selectedItem}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSave}
                employees={employees}
            />
        </div>
    );
}
