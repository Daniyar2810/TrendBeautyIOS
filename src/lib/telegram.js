const TELEGRAM_TOKEN = '8828941554:AAFrA7n-qoVND_dztPc6Eb90ExBqhuLyDEI'
const CHAT_ID = '-1003961156030'  // ← yeni supergroup ID

export async function sendTelegramMessage(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        })
        const data = await response.json()
        console.log('Telegram response:', data)
    } catch (err) {
        console.error('Telegram hatası:', err)
    }
}
