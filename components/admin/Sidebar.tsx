
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Database, Settings, LogOut, Bell, FolderGit2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import ProjectSwitcher from './ProjectSwitcher'
import { Project } from '@/app/admin/projects/actions'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Database', href: '/admin/database', icon: Database },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Projects', href: '/admin/projects', icon: FolderGit2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
    projects: Project[]
    activeProjectId?: string
}

export default function Sidebar({ projects, activeProjectId }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
            <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
            </div>

            <div className="px-3 pt-4">
                <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href

                    // Hide sensitive items if no project is selected (Registry mode)
                    // Always show Dashboard, Projects, Settings
                    const isAlwaysVisible = ['Dashboard', 'Projects', 'Settings'].includes(item.name)
                    if (!activeProjectId && !isAlwaysVisible) {
                        return null
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white',
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                <button
                    onClick={handleSignOut}
                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut
                        className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400"
                        aria-hidden="true"
                    />
                    Sign out
                </button>
            </div>
        </div>
    )
}
