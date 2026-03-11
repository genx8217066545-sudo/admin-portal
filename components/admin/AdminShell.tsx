
'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Project } from '@/app/admin/projects/actions'

interface AdminShellProps {
    children: React.ReactNode
    projects: Project[]
    activeProjectId?: string
}

export default function AdminShell({ children, projects, activeProjectId }: AdminShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-zinc-950">
            <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
