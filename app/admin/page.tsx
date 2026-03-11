import { getDashboardStats } from './actions/dashboard'
import { ExternalLink, Users, Activity, Database, Server } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const activeProjectId = cookieStore.get('active_project_id')?.value

    if (!activeProjectId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-indigo-50 dark:bg-zinc-800 p-4 rounded-full">
                    <Database className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Admin Portal</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
                    Please select a project from the sidebar or add a new one to get started.
                    This registry project is for configuration only.
                </p>
                <div className="flex gap-4 pt-4">
                    <Link
                        href="/admin/projects"
                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Manage Projects
                    </Link>
                </div>
            </div>
        )
    }

    const stats = await getDashboardStats()
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.com/dashboard'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <Link
                    href={projectUrl}
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                    View Supabase Project
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Stat Cards */}
                <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900 px-4 py-5 shadow sm:p-6 border border-gray-100 dark:border-zinc-800">
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Users className="h-4 w-4" /> Total Users
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {stats.totalUsers.toLocaleString()}
                    </dd>
                </div>

                <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900 px-4 py-5 shadow sm:p-6 border border-gray-100 dark:border-zinc-800">
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" /> Active Apps
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {stats.activeApps}
                    </dd>
                </div>

                <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900 px-4 py-5 shadow sm:p-6 border border-gray-100 dark:border-zinc-800">
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Database className="h-4 w-4" /> New Signups (7d)
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        +{stats.recentSignups}
                    </dd>
                </div>

                <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900 px-4 py-5 shadow sm:p-6 border border-gray-100 dark:border-zinc-800">
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Server className="h-4 w-4" /> Database Status
                    </dt>
                    <dd className={`mt-1 text-3xl font-semibold tracking-tight ${stats.dbStatus === 'Operational' ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.dbStatus}
                    </dd>
                </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-zinc-900 shadow border border-gray-100 dark:border-zinc-800 p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    System Overview
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Real-time metrics are fetching from your Supabase database. For detailed infrastructure logs (CPU, Latency, Storage), please visit the Supabase Dashboard.
                </p>

                {/* Debug Info - Remove in production */}
                <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs font-mono text-yellow-800 dark:text-yellow-200 overflow-x-auto">
                    <p><strong>Active Project ID:</strong> {stats.debug?.projectId}</p>
                    <p><strong>Connected URL:</strong> {stats.debug?.connectedUrl}</p>
                    {stats.debug?.authError && <p className="text-red-600"><strong>Auth Error:</strong> {stats.debug.authError}</p>}
                    {stats.debug?.tableError && <p className="text-red-600"><strong>Table Error:</strong> {stats.debug.tableError}</p>}
                    {stats.debug?.error && <p className="text-red-600"><strong>General Error:</strong> {stats.debug.error}</p>}
                </div>
            </div>
        </div>
    )
}
