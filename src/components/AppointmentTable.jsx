export default function AppointmentTable({

    appointments,

    services,

    employees,

    openModal,

    deleteItem

}) {

    return (

        <div>

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">

                <div>

                    <h2 className="text-2xl font-extrabold text-gray-800">

                        Randevu Takvimi

                    </h2>

                    <p className="text-gray-500 text-sm">

                        Gelecek randevuları ve müşteri taleplerini izleyin.

                    </p>

                </div>

            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">

                <table className="w-full text-left border-collapse">

                    <thead>

                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">

                            <th className="p-4 font-bold">
                                Müşteri
                            </th>

                            <th className="p-4 font-bold">
                                Hizmet & Uzman
                            </th>

                            <th className="p-4 font-bold">
                                Zamanlama
                            </th>

                            <th className="p-4 font-bold">
                                Tutar
                            </th>

                            <th className="p-4 font-bold">
                                Durum
                            </th>

                            <th className="p-4 font-bold text-right">
                                İşlem
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">

                        {(appointments || []).map(app => {

                            const service =
                                services.find(
                                    s => String(s.id) === String(app.service_id)
                                )

                            const employee =
                                employees.find(
                                    e => String(e.id) === String(app.employee_id)
                                )

                            return (

                                <tr
                                    key={app.id}
                                    className="hover:bg-gray-50"
                                >

                                    {/* CUSTOMER */}
                                    <td className="p-4">

                                        <a
                                            href={`https://wa.me/${app.customer_phone}`}
                                        >

                                            <div className="font-bold text-gray-900">

                                                {app.customer_name}

                                            </div>
                                        </a>

                                        <a
                                            href={`tel:${app.customer_phone}`}
                                            className="text-xs text-blue-600 hover:underline font-medium"
                                        >

                                            {app.customer_phone}

                                        </a>

                                    </td>

                                    {/* SERVICE */}
                                    <td className="p-4">

                                        <div className="font-semibold text-rose-600">

                                            {service?.title}

                                        </div>

                                        <div className="text-xs text-gray-500">

                                            {employee?.full_name}

                                        </div>

                                    </td>

                                    {/* DATE */}
                                    <td className="p-4">

                                        <div className="font-medium">

                                            {app.appointment_date}

                                        </div>

                                        <div className="text-xs text-gray-400">

                                            {app.appointment_start_time}
                                            {' - '}
                                            {app.end_time}

                                        </div>

                                    </td>

                                    {/* PRICE */}
                                    <td className="p-4 font-bold text-gray-900">

                                        ₺ {app.total_price}

                                    </td>

                                    {/* STATUS */}
                                    <td className="p-4">

                                        <span
                                            className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold

                        ${app.status === 'Onaylandı'
                                                    ? 'bg-green-100 text-green-700'
                                                    : app.status === 'İptal'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }
                      `}
                                        >

                                            {app.status}

                                        </span>

                                    </td>

                                    {/* ACTIONS */}
                                    <td className="p-4 text-right space-x-2">

                                        <button
                                            onClick={() =>
                                                openModal(
                                                    'appointment',
                                                    app
                                                )
                                            }

                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                        >

                                            Düzenle

                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteItem(
                                                    'appointment',
                                                    app.id
                                                )
                                            }

                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >

                                            Sil

                                        </button>

                                    </td>

                                </tr>
                            )
                        })}

                    </tbody>

                </table>

            </div>

        </div>
    )
}