export default function MobileTabs({

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
            label: 'Hizmetler'
        },

        {
            key: 'employees',
            label: 'Uzmanlar'
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

        <div className="md:hidden bg-white border-b border-gray-200 p-2 flex gap-2 overflow-x-auto">

            {tabs.map(tab => (

                <button
                    key={tab.key}

                    onClick={() =>
                        setActiveTab(tab.key)
                    }

                    className={`
            whitespace-nowrap
            px-4
            py-2
            rounded-xl
            font-semibold
            text-sm
            transition

            ${activeTab === tab.key

                            ? 'bg-rose-50 text-rose-600'

                            : 'bg-gray-100 text-gray-700'
                        }
          `}
                >

                    {tab.label}

                </button>
            ))}

        </div>
    )
}