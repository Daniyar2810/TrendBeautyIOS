const FONNTE_TOKEN = 'caQMHog1uhGECGrXA65T'

export async function sendWhatsAppMessage({ phone, message }) {
    try {
        let cleanPhone = phone.replace(/\D/g, '')
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1)
        if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone

        console.log('Gönderilen numara:', cleanPhone)

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': FONNTE_TOKEN,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                target: cleanPhone,
                message: message,
                countryCode: '90'
            }).toString()
        })
        const data = await response.json()
        console.log('WhatsApp response:', data)
        return { success: true }
    } catch (err) {
        console.error('WhatsApp hatası:', err)
        return { success: false }
    }
}
