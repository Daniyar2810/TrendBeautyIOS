export default function Sidebar({

    activeTab,

    setActiveTab

}) {

    const tabs = [

        {
            key: 'appointments',
            label: 'Randevular'
        },

        {
            key: 'services',
            label: 'Hizmet Menüsü'
        },

        {
            key: 'employees',
            label: 'Uzman Kadrosu'
        },
        {
            key: 'available-times',
            label: 'Boş Saatler'
        },
        {
            key: 'calendar',
            label: 'Takvim'
        }

    ]

    return (

        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 p-4 flex-col gap-2 shrink-0">

            {/* LOGO */}
            <div className="mb-6">

                <h1 className="text-2xl font-extrabold text-rose-600">

                    Trend Beauty

                </h1>

                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">

                    Yönetim Paneli

                </p>

            </div>

            {/* TABS */}
            {tabs.map(tab => (

                <button
                    key={tab.key}

                    onClick={() =>
                        setActiveTab(tab.key)
                    }

                    className={`
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            text-left
            font-semibold
            transition
            border

            ${activeTab === tab.key

                            ? 'text-rose-600 bg-rose-50 border-rose-100'

                            : 'text-gray-500 hover:bg-gray-50 border-transparent'
                        }
          `}
                >

                    {tab.label}

                </button>
            ))}

            {/* STATUS */}
            <div className="mt-auto p-4 bg-gray-50 rounded-xl">

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">

                    Sistem Durumu

                </p>

                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">

                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

                    Çevrimiçi Veritabanı

                </div>

            </div>

        </aside>
    )
}