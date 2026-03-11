import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createMasterClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function createTargetClient() {
    const cookieStore = await cookies()
    const projectId = cookieStore.get('active_project_id')?.value

    const masterClient = await createMasterClient()

    if (!projectId) {
        return masterClient
    }

    // Use Service Role to bypass RLS for configuration lookup
    // This ensures we can always read the project config even if the user context has issues
    const registryAdminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        }
    )

    const { data: project, error } = await registryAdminClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (error || !project) {
        console.warn(`Active project ${projectId} not found or error:`, error?.message)
        // Fallback to master if project config is missing/broken
        return masterClient
    }

    // Initialize client for the target project
    return createSupabaseClient(project.supabase_url, project.supabase_service_key, {
        auth: {
            persistSession: false,
        }
    })
}
