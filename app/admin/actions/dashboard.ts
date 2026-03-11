'use server'

import { createTargetClient } from '@/utils/supabase/target-client'

export async function getDashboardStats() {
    try {
        const supabase = await createTargetClient()

        // 1. Total Users (Use Admin API for reliability and to verify Service Key)
        const { data: listUsersData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
        const totalUsers = (listUsersData as any)?.total || 0

        // 2. Database Status & Check Custom Tables
        // We'll check if 'profiles' exists by trying a simple count. 
        // If this fails, it likely means the child project doesn't have the schema set up.
        const { count: profilesCount, error: tableError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // 3. Active Apps (Count from Profiles if it exists)
        let activeApps = 0
        if (!tableError) {
            const { data: appsData } = await supabase
                .from('profiles')
                .select('app_id')
                .not('app_id', 'is', null)
            activeApps = appsData ? new Set(appsData.map(p => p.app_id)).size : 0
        }

        // 4. Recent Signups (from Auth)
        // Harder to count "last 7 days" strictly via listUsers without fetching all, 
        // but let's stick to 0 or try a simple approximation if needed.
        // For now, let's just return 0 or rely on profiles if available.
        let recentSignups = 0
        if (!tableError) {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString())
            recentSignups = count || 0
        }

        return {
            totalUsers: totalUsers || 0,
            activeApps: activeApps,
            recentSignups: recentSignups,
            dbStatus: (authError || tableError) ? 'Error' : 'Operational',
            // Debug Info
            debug: {
                projectId: (await (await import('next/headers')).cookies()).get('active_project_id')?.value || 'None',
                connectedUrl: (supabase as any)?.supabaseUrl || 'Unknown',
                authError: authError?.message || null,
                tableError: tableError?.message || null
            }
        }
    } catch (error: any) {
        console.error('Dashboard stats error:', error)
        return {
            totalUsers: 0,
            activeApps: 0,
            recentSignups: 0,
            dbStatus: 'Error',
            debug: {
                error: error?.message || String(error)
            }
        }
    }
}