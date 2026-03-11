
'use server'

import { createTargetClient } from '@/utils/supabase/target-client'
import { revalidatePath } from 'next/cache'

export async function getAppState() {
    const supabase = await createTargetClient()

    // Try .single() first — if it fails (0 or multiple rows), fallback to first row
    const { data, error } = await supabase
        .from('app_state')
        .select('*')
        .limit(1)

    if (error) {
        return { data: null, error: error.message }
    }

    if (!data || data.length === 0) {
        return { data: null, error: 'No rows found in app_state table' }
    }

    // Return the first row — log the raw structure for debugging
    const row = data[0]
    console.log('[App Config] Raw row keys:', Object.keys(row))
    return { data: row, error: null }
}

export async function updateAppState(id: string | number, updates: Record<string, any>) {
    const supabase = await createTargetClient()

    const { error } = await supabase
        .from('app_state')
        .update(updates)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/app-config')
    return { success: true }
}
