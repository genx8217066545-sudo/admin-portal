
import { getAdminProfile, getActiveProjectInfo } from './actions'
import SettingsForm from '@/components/settings/SettingsForm'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const [profileRes, projectRes] = await Promise.all([
        getAdminProfile(),
        getActiveProjectInfo(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-indigo-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <SettingsForm
                adminProfile={profileRes.data}
                activeProject={projectRes.data}
            />
        </div>
    )
}
