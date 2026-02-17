
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import { getProjects } from './projects/actions'
import { cookies } from 'next/headers'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const projects = await getProjects()
    const cookieStore = await cookies()
    const activeProjectId = cookieStore.get('active_project_id')?.value

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-zinc-950">
            <Sidebar projects={projects} activeProjectId={activeProjectId} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
