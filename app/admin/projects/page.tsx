import { getProjects } from './actions'
import ProjectsPageClient from '@/components/projects/ProjectsPageClient'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const projects = await getProjects()

    return <ProjectsPageClient projects={projects} />
}
