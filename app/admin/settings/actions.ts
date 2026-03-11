
'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getAdminProfile() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return { data: null, error: error?.message || 'Not authenticated' }
    }

    return {
        data: {
            id: user.id,
            email: user.email || '',
            lastSignIn: user.last_sign_in_at || null,
            createdAt: user.created_at || null,
            role: user.role || 'authenticated',
        },
        error: null,
    }
}

export async function getActiveProjectInfo() {
    const cookieStore = await cookies()
    const projectId = cookieStore.get('active_project_id')?.value

    if (!projectId) {
        return { data: null, error: null }
    }

    const supabase = await createClient()

    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, supabase_url, created_at')
        .eq('id', projectId)
        .single()

    if (error || !project) {
        return { data: null, error: error?.message || 'Project not found' }
    }

    return { data: project, error: null }
}

export async function changePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function clearActiveProject() {
    const cookieStore = await cookies()
    cookieStore.delete('active_project_id')
    revalidatePath('/admin', 'layout')
    return { success: true }
}
