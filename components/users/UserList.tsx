
'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Plus, Trash2, Mail, Calendar, Shield } from 'lucide-react'
import { deleteUser, createUser } from '@/app/admin/users/actions'

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        setLoading(true)
        const result = await deleteUser(userId)
        setLoading(false)

        if (result.error) {
            alert(result.error)
        } else {
            setUsers(users.filter(u => u.id !== userId))
        }
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </button>
            </div>

            <div className="overflow-hidden bg-white dark:bg-zinc-900 shadow sm:rounded-md border border-gray-200 dark:border-zinc-800">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {users.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No users found. Check your Supabase connection.
                        </li>
                    ) : (
                        users.map((user) => (
                            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 gap-4">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                                {user.email}
                                                {user.app_metadata?.provider && (
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10">
                                                        {user.app_metadata.provider}
                                                    </span>
                                                )}
                                            </p>
                                            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                                                <div className="flex items-center">
                                                    <Mail className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <span className="truncate">{user.id}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="rounded-full p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {isModalOpen && (
                <CreateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUserCreated={(newUser) => {
                        setUsers([newUser, ...users])
                        setIsModalOpen(false)
                    }}
                />
            )}
        </>
    )
}

function CreateUserModal({ isOpen, onClose, onUserCreated }: { isOpen: boolean; onClose: () => void; onUserCreated: (user: User) => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await createUser(formData)

        setLoading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.user) {
            onUserCreated(result.user)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
