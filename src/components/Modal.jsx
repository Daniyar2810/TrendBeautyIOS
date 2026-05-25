export default function Modal({
    isOpen,
    onClose,
    type,
    item,
    formData,
    setFormData,
    onSubmit,
    employees,
    services
}) {
    if (!isOpen) return null;

    const titles = {
        service: item ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle',
        employee: item ? 'Uzman Düzenle' : 'Yeni Uzman Ekle',
        appointment: 'Randevu Düzenle'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* HEADER */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{titles[type] || 'Düzenle'}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">

                    {/* ── HİZMET FORMU ── */}
                    {type === 'service' && (
                        <>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Hizmet Adı</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Saç Boyama"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Açıklama</label>
                                <textarea
                                    placeholder="Hizmet açıklaması..."
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300 resize-none h-24"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Fiyat (₺)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Süre (dk)</label>
                                    <input
                                        type="number"
                                        placeholder="60"
                                        value={formData.duration_minutes || ''}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                        className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Görsel URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>
                        </>
                    )}

                    {/* ── UZMAN FORMU ── */}
                    {type === 'employee' && (
                        <>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Ad Soyad</label>
                                <input
                                    type="text"
                                    placeholder="Uzman adı..."
                                    value={formData.full_name || ''}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Uzmanlık</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Saç Uzmanı"
                                    value={formData.specialty || ''}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Telefon</label>
                                <input
                                    type="tel"
                                    placeholder="05XX XXX XX XX"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>
                        </>
                    )}

                    {/* ── RANDEVU FORMU ── */}
                    {type === 'appointment' && (
                        <>
                            {/* Müşteri Bilgisi */}
                            <div className="bg-rose-50 p-4 rounded-2xl">
                                <p className="font-bold text-gray-800">{item?.customer_name}</p>
                                <p className="text-sm text-rose-600">{item?.customer_phone}</p>
                            </div>

                            {/* Durum */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Durum</label>
                                <select
                                    value={formData.status || ''}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                >
                                    <option value="Bekliyor">Bekliyor</option>
                                    <option value="Onaylandı">Onaylandı</option>
                                    <option value="İptal">İptal</option>
                                </select>
                            </div>

                            {/* Tarih */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Randevu Tarihi</label>
                                <input
                                    type="date"
                                    value={formData.appointment_date || ''}
                                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            </div>

                            {/* Başlangıç & Bitiş Saati */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Başlangıç Saati</label>
                                    <input
                                        type="time"
                                        value={formData.appointment_start_time || ''}
                                        onChange={(e) => setFormData({ ...formData, appointment_start_time: e.target.value })}
                                        className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Bitiş Saati</label>
                                    <input
                                        type="time"
                                        value={formData.end_time || ''}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                </div>
                            </div>

                            {/* Uzman Seçimi */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Uzman</label>
                                <select
                                    value={formData.employee_id || ''}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="w-full bg-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-300"
                                >
                                    <option value="">Uzman Seç</option>
                                    {(employees || []).map(e => (
                                        <option key={e.id} value={e.id}>{e.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-5 py-3 rounded-xl bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200 transition"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-lg"
                    >
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
