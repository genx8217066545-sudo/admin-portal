
import { getUsers } from './actions'
import UserList from '@/components/users/UserList'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            </div>

            <UserList initialUsers={users} />
        </div>
    )
}
