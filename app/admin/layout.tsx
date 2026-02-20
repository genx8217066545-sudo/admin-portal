
import AdminShell from '@/components/admin/AdminShell'
import { ActiveProjectProvider } from '@/components/admin/ActiveProjectContext'
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
        <AdminShell projects={projects} activeProjectId={activeProjectId}>
            <ActiveProjectProvider projectId={activeProjectId}>
                {children}
            </ActiveProjectProvider>
        </AdminShell>
    )
}
