
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Database, Settings, LogOut, Bell, FolderGit2, Sliders, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import ProjectSwitcher from './ProjectSwitcher'
import { Project } from '@/app/admin/projects/actions'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Database', href: '/admin/database', icon: Database },
    { name: 'App Config', href: '/admin/app-config', icon: Sliders },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Projects', href: '/admin/projects', icon: FolderGit2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
    projects: Project[]
    activeProjectId?: string
    mobileOpen: boolean
    onMobileClose: () => void
}

export default function Sidebar({ projects, activeProjectId, mobileOpen, onMobileClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const sidebarContent = (
        <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
                {/* Close button only visible on mobile */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="px-3 pt-4">
                <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                            onClick={onMobileClose}
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

    return (
        <>
            {/* Desktop sidebar — always visible on lg+ */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile sidebar — overlay when open */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={onMobileClose}
                    />
                    {/* Sidebar panel */}
                    <div className="fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    )
}
