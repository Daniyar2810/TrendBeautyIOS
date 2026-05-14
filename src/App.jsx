import { useEffect, useState } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'

import { supabase } from './lib/supabase'

import LoginPage from './components/LoginPage'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {

    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    // PUSH NOTIFICATION
    useEffect(() => {

        const setupPush = async () => {

            try {

                // İZİN İSTE
                const permission =
                    await PushNotifications.requestPermissions()

                console.log(
                    'PERMISSION:',
                    permission
                )

                if (
                    permission.receive !== 'granted'
                ) {

                    console.log(
                        'Bildirim izni reddedildi'
                    )

                    return
                }

                // REGISTER
                await PushNotifications.register()

                console.log(
                    'PUSH REGISTER OK'
                )

                // TOKEN AL
                const result =
                    await FirebaseMessaging.getToken()

                console.log(
                    'FCM TOKEN:',
                    result.token
                )

                try {

                    console.log('FETCH BAŞLIYOR')

                    const response = await fetch(
                        'https://trendbeauty-server.onrender.com/save-token',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                token: result.token,
                            }),
                        }
                    )

                    console.log('FETCH BİTTİ')

                    const text = await response.text()

                    console.log('RAW RESPONSE:', text)
                    console.log('STATUS:', response.status)

                } catch (err) {

                    console.log(
                        'FETCH HATASI:',
                        JSON.stringify(err)
                    )

                    console.log(err)
                }

                // PUSH GELDİ
                await PushNotifications.addListener(
                    'pushNotificationReceived',
                    (notification) => {

                        console.log(
                            'PUSH GELDİ:',
                            notification
                        )

                    }
                )

                // BİLDİRİME TIKLANDI
                await PushNotifications.addListener(
                    'pushNotificationActionPerformed',
                    (action) => {

                        console.log(
                            'BİLDİRİME TIKLANDI:',
                            action
                        )

                    }
                )

            } catch (error) {

                console.error(
                    'Push setup hatası:',
                    error
                )

            }
        }

        setupPush()

        return () => {
            PushNotifications.removeAllListeners()
        }

    }, [])

    // SESSION CHECK
    useEffect(() => {

        supabase.auth
            .getSession()
            .then(({ data }) => {

                setSession(data.session)
                setLoading(false)

            })

        const { data: listener } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {

                    setSession(session)

                }
            )

        return () => {
            listener.subscription.unsubscribe()
        }

    }, [])

    // LOADING
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                Yükleniyor...
            </div>
        )

    }

    // LOGIN
    if (!session) {
        return <LoginPage />
    }

    // LOGOUT
    async function logout() {
        await supabase.auth.signOut()
    }

    // DASHBOARD
    return (
        <AdminDashboard logout={logout} />
    )
}