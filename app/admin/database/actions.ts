
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteRecord(tableName: string, id: string | number) {
    const supabase = await createClient()

    // We assume 'id' column for now. 
    // In a robust app, we'd query the primary key name.
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/database/${tableName}`)
    return { success: true }
}

export async function updateRecord(tableName: string, id: string | number, data: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/database/${tableName}`)
    return { success: true }
}
