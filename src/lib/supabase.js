import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ougzcgwrrkktthfitzws.supabase.co'

// BURAYA SUPABASE PANELİNDEN ALDIĞIN "eyJhbGci..." İLE BAŞLAYAN UZUN ANON KEY'İ YAPIŞTIR
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Z3pjZ3dycmtrdHRoZml0endzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzIwNjgsImV4cCI6MjA5MzY0ODA2OH0.yRtRziNyTd-9LezUaRRRB9FUgiQ8Z8TZ0lsbKn7ojXE'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            persistSession: true, // Mobil cihazlarda oturumun açık kalması için şarttır!
            autoRefreshToken: true,
            detectSessionInUrl: false
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    }
)
