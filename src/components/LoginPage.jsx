import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
    const [username, setUsername] = useState('admin@test.com')
    const [password, setPassword] = useState('123456')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (loading) return
        
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: username,
                password: password
            })

            if (error) {
                alert(error.message)
                return
            }
            
            // onLogin() çağrısını kaldırdık çünkü App.jsx'teki onAuthStateChange
            // girişi otomatik algılayıp bizi dashboard'a uçuracak.
        } catch (err) {
            alert("Giriş yapılırken bir hata oluştu: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-rose-100">
                {/* TOP */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
                        🔒
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Yönetici Girişi
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Lütfen giriş yapın
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                            placeholder="admin@test.com"
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50"
                            placeholder="123456"
                            required
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-3 rounded-lg font-bold transition shadow-lg ${
                            loading ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    )
}
