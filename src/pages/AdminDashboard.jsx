import { useEffect, useState } from 'react'

import { requestNotificationPermission } from '../lib/firebase'

import { sendWhatsAppMessage } from '../lib/whatsapp'

import { supabase } from '../lib/supabase'

import AppointmentCalendar from '../components/calendar/AppointmentCalendar'

import Sidebar from '../components/Sidebar'

import Header from '../components/Header'

import MobileTabs from '../components/MobileTabs'

import AppointmentTable from '../components/AppointmentTable'

import ServiceTable from '../components/ServiceTable'

import EmployeeTable from '../components/EmployeeTable'

import Modal from '../components/Modal'

import AvailableTimes from '../components/AvailableTimes'

export default function AdminDashboard({ logout }) {

    // STATES
    const [activeTab, setActiveTab] =
        useState('appointments')

    const [services, setServices] =
        useState([])

    const [employees, setEmployees] =
        useState([])

    const [appointments, setAppointments] =
        useState([])

    const [employeeId, setEmployeeId] =
        useState('')

    const [appointmentDate, setAppointmentDate] =
        useState('')

    const [service, setService] =
        useState('')

    // MODAL
    const [isModalOpen, setIsModalOpen] =
        useState(false)

    const [modalType, setModalType] =
        useState('')

    const [selectedItem, setSelectedItem] =
        useState(null)

    const [formData, setFormData] =
        useState({})

    // LOAD DATABASE
    async function loadDatabase() {

        // SERVICES
        const {
            data: servicesData
        } = await supabase
            .from('services')
            .select('*')

        setServices(
            servicesData || []
        )

        // EMPLOYEES
        const {
            data: employeesData
        } = await supabase
            .from('employees')
            .select('*')

        setEmployees(
            employeesData || []
        )

        // APPOINTMENTS
        const {
            data: appointmentsData
        } = await supabase
            .from('appointments')
            .select('*')

        setAppointments(
            appointmentsData || []
        )
    }

    useEffect(() => {

        requestNotificationPermission()

        loadDatabase()

    }, [])

    useEffect(() => {

        const channel = supabase
            .channel('test-channel')

            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                },

                async (payload) => {

                    const {
                        data,
                        error
                    } = await supabase
                        .from('appointments')
                        .select('*')
                        .order('created_at', {
                            ascending: false
                        })

                    if (!error) {

                        setAppointments([
                            ...(data || [])
                        ])
                    }

                    new Notification(
                        'Yeni Randevu 📅',
                        {
                            body:
                                payload.new.customer_name +
                                ' yeni randevu oluşturdu',
                        }
                    )
                }
            )

            .subscribe()

        return () => {

            supabase.removeChannel(channel)
        }

    }, [])

    function openModal(type, item = null) {

        setModalType(type)

        setSelectedItem(item)

        setFormData(item || {})

        setIsModalOpen(true)
    }

    // CLOSE MODAL
    function closeModal() {

        setIsModalOpen(false)
    }

    // DELETE
    async function deleteItem(type, id) {

        let tableName = ''

        if (type === 'service') {
            tableName = 'services'
        }

        if (type === 'employee') {
            tableName = 'employees'
        }

        if (type === 'appointment') {
            tableName = 'appointments'
        }

        await supabase
            .from(tableName)
            .delete()
            .eq('id', id)

        loadDatabase()
    }

    // SAVE
    async function handleSave() {

        // SERVICE
        if (modalType === 'service') {

            if (selectedItem) {

                await supabase
                    .from('services')
                    .update(formData)
                    .eq('id', selectedItem.id)

            } else {

                await supabase
                    .from('services')
                    .insert([formData])
            }
        }

        // EMPLOYEE
        if (modalType === 'employee') {

            if (selectedItem) {

                await supabase
                    .from('employees')
                    .update(formData)
                    .eq('id', selectedItem.id)

            } else {

                await supabase
                    .from('employees')
                    .insert([formData])
            }
        }

        // APPOINTMENT
        if (modalType === 'appointment') {

            const { data, error } = await supabase
                .from('appointments')
                .update({

                    status: formData.status,

                    appointment_date:
                        formData.appointment_date,

                    appointment_start_time:
                        formData.appointment_start_time,

                    end_time:
                        formData.end_time,

                    employee_id:
                        formData.employee_id

                })
                .eq('id', selectedItem.id)
                .select()

            // STATUS APPROVED OLUNCA WHATSAPP GÖNDER
            if (formData.status === 'Onaylandı') {
                const selectedService =
                    services.find(
                        service =>
                            service.id === selectedItem.service_id
                    )

                const selectedEmployee =
                    employees.find(
                        employee =>
                            employee.id === formData.employee_id
                    )

                // PHONE FORMAT
                const customerPhone =
                    `90${selectedItem.customer_phone.replace(/^0/, '')}`

                const message =
                    ` *Trend Beauty*

Merhaba *${selectedItem.customer_name}* hanım,

Randevunuz başarıyla *onaylanmıştır.* 

━━━━━━━━━━━━━━━

*Hizmet:*  
${selectedService?.title || '-'}

 *Uzman:*  
${selectedEmployee?.full_name || '-'}

 *Tarih:*  
${formData.appointment_date}

 *Saat:*  
${formData.appointment_start_time}

━━━━━━━━━━━━━━━

Sizi salonumuzda ağırlamaktan mutluluk duyarız 

 Trend Beauty
`

                // OPEN WHATSAPP
                // SEND CUSTOMER MESSAGE
                await sendWhatsAppMessage({

                    phone: customerPhone,

                    message

                })
            }
            // EXPERT MESSAGE
        }
            closeModal()

        loadDatabase()
    }

    return (

        <div className="min-h-screen bg-gray-50 flex overflow-hidden">

            {/* SIDEBAR DESKTOP */}
            <div className="hidden md:block">

                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">

                <Header
                    logout={logout}
                />

                {/* MOBILE TABS */}
                <div className="md:hidden">

                    <MobileTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                </div>

                <main className="flex-1 p-3 md:p-6 overflow-y-auto">

                    {/* APPOINTMENTS */}
                    {activeTab === 'appointments' && (

                        <div className="space-y-6">

                            {/* TABLE */}
                            <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200">

                                <AppointmentTable
                                    key={JSON.stringify(appointments)}
                                    appointments={[...appointments]}
                                    services={services}
                                    employees={employees}
                                    openModal={openModal}
                                    deleteItem={deleteItem}
                                />

                            </div>

                        </div>
                    )}

                    {/* CALENDAR */}
                    {activeTab === 'calendar' && (

                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">

                            <h2 className="text-xl md:text-2xl font-bold mb-6">

                                Randevu Takvimi

                            </h2>

                            <AppointmentCalendar
                                appointments={appointments}
                                services={services}
                                employees={employees}
                            />

                        </div>

                    )}

                    {/* AVAILABLE TIMES */}
                    {/* AVAILABLE TIMES */}
                    {activeTab === 'available-times' && (

                        <div className="mt-6 bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200 overflow-hidden">

                            <h2 className="text-xl md:text-2xl font-bold mb-6">

                                Canlı Müsait Saat Sistemi

                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                                {/* SERVICE */}
                                <select
                                    value={service}

                                    onChange={(e) =>
                                        setService(e.target.value)
                                    }

                                    className="border rounded-xl p-3 w-full"
                                >

                                    <option value="">
                                        Hizmet Seç
                                    </option>

                                    {services.map(service => (

                                        <option
                                            key={service.id}
                                            value={service.id}
                                        >

                                            {service.title}

                                        </option>
                                    ))}

                                </select>

                                {/* EMPLOYEE */}
                                <select
                                    value={employeeId}

                                    onChange={(e) =>
                                        setEmployeeId(e.target.value)
                                    }

                                    className="border rounded-xl p-3 w-full"
                                >

                                    <option value="">
                                        Uzman Seç
                                    </option>

                                    {employees.map(employee => (

                                        <option
                                            key={employee.id}
                                            value={employee.id}
                                        >

                                            {employee.full_name}

                                        </option>
                                    ))}

                                </select>

                                {/* DATE */}
                                <input
                                    type="date"

                                    value={appointmentDate}

                                    onChange={(e) =>
                                        setAppointmentDate(e.target.value)
                                    }

                                    className="border rounded-xl p-3 w-full"
                                />

                            </div>

                            {/* AVAILABLE TIMES */}
                            <AvailableTimes
                                employeeId={employeeId}
                                appointmentDate={appointmentDate}
                                service={service}
                            />


                        </div>

                    )}
                    {/* SERVICES */}
                    {activeTab === 'services' && (

                        <div className="overflow-x-auto">

                            <ServiceTable
                                services={services}
                                openModal={openModal}
                                deleteItem={deleteItem}
                            />

                        </div>
                    )}

                    {/* EMPLOYEES */}
                    {activeTab === 'employees' && (

                        <div className="overflow-x-auto">

                            <EmployeeTable
                                employees={employees}
                                openModal={openModal}
                                deleteItem={deleteItem}
                            />

                        </div>
                    )}

                </main>

            </div>

            {/* MODAL */}
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

    )

}