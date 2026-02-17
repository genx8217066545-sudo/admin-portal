
import { Bell } from 'lucide-react'
import NotificationForm from '@/components/notifications/NotificationForm'
import { getAppIds } from '@/app/admin/actions/notifications'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
    const appIds = await getAppIds()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    Notifications
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <NotificationForm appIds={appIds} />

                {/* Info / history column could go here */}
                <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Tips</h3>
                    <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><strong>Broadcast</strong> sends to every user with a registered device token.</li>
                        <li><strong>By App ID</strong> targets users belonging to a specific application (e.g., 'driver-app', 'customer-app').</li>
                        <li><strong>Specific User</strong> sends to a single user identified by their email.</li>
                        <li>Ensure your users have logged in recently to have active FCM tokens.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
