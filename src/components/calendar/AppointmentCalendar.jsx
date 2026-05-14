import { Calendar, momentLocalizer }
    from 'react-big-calendar'

import moment
    from 'moment'

import { useMemo }
    from 'react'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer =
    momentLocalizer(moment)

export default function AppointmentCalendar({

    appointments,

    services,

    employees

}) {

    // MOBILE CHECK
    const isMobile =
        window.innerWidth < 768

    // EVENTS
    const events = useMemo(() => {

        return appointments.map(app => {

            const service =
                services.find(
                    s => s.id === app.service_id
                )

            const employee =
                employees.find(
                    e => e.id === app.employee_id
                )

            // START
            const start =
                new Date(
                    `${app.appointment_date}T${app.appointment_start_time}`
                )

            // END
            const end =
                new Date(
                    `${app.appointment_date}T${app.end_time}`
                )

            return {

                title:
                    `${app.customer_name}
 - ${service?.title}
 - ${employee?.full_name}`,

                start,

                end
            }
        })

    }, [appointments, services, employees])

    return (

        <div className="bg-white p-2 md:p-4 rounded-2xl shadow border border-gray-200 overflow-hidden">

            <div className="h-[500px] md:h-[700px] text-sm md:text-base">

                <Calendar

                    localizer={localizer}

                    events={events}

                    startAccessor="start"

                    endAccessor="end"

                    defaultView={
                        isMobile
                            ? 'agenda'
                            : 'week'
                    }

                    views={
                        isMobile
                            ? ['agenda']
                            : ['month', 'week', 'day', 'agenda']
                    }

                    popup

                    selectable

                    step={30}

                    timeslots={2}

                    style={{
                        height: '100%'
                    }}

                    messages={{
                        today: 'Bugün',
                        previous: 'Geri',
                        next: 'İleri',
                        month: 'Ay',
                        week: 'Hafta',
                        day: 'Gün',
                        agenda: 'Liste',
                        date: 'Tarih',
                        time: 'Saat',
                        event: 'Randevu',
                        noEventsInRange: 'Randevu bulunamadı'
                    }}

                />

            </div>

        </div>
    )
}