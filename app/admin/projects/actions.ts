'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Project = {
    id: string
    name: string
    supabase_url: string
    supabase_anon_key: string
    supabase_service_key: string
    firebase_project_id?: string
    firebase_client_email?: string
    firebase_private_key?: string
}

export async function getProjects() {
    const supabase = await createClient()

    const { data: dbProjects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching DB projects:', error)
        return []
    }

    return dbProjects as Project[]
}

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    const project = {
        name: formData.get('name') as string,
        supabase_url: formData.get('supabase_url') as string,
        supabase_anon_key: formData.get('supabase_anon_key') as string,
        supabase_service_key: formData.get('supabase_service_key') as string,
        firebase_project_id: formData.get('firebase_project_id') as string,
        firebase_client_email: formData.get('firebase_client_email') as string,
        firebase_private_key: formData.get('firebase_private_key') as string,
    }

    const { error } = await supabase
        .from('projects')
        .insert(project)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/projects')
    return { success: true }
}

export async function updateProject(id: string, formData: FormData) {
    const supabase = await createClient()

    const project = {
        name: formData.get('name') as string,
        supabase_url: formData.get('supabase_url') as string,
        supabase_anon_key: formData.get('supabase_anon_key') as string,
        supabase_service_key: formData.get('supabase_service_key') as string,
        firebase_project_id: formData.get('firebase_project_id') as string,
        firebase_client_email: formData.get('firebase_client_email') as string,
        firebase_private_key: formData.get('firebase_private_key') as string,
    }

    const { error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/projects')
    return { success: true }
}

export async function deleteProject(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/projects')
    return { success: true }
}

export async function switchProject(projectId: string) {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('active_project_id', projectId)
    // Revalidate the entire admin layout tree so ALL sub-pages
    // (users, database, app-config, etc.) re-fetch with the new project
    revalidatePath('/admin', 'layout')
    return { success: true }
}
