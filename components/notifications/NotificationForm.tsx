'use client'

import { useState } from 'react'
import { Send, Users, Smartphone, User } from 'lucide-react'
import { sendBroadcastNotification, sendAppNotification, sendNotificationToUser } from '@/app/admin/actions/notifications'

interface Props {
    appIds: string[]
}

export default function NotificationForm({ appIds }: Props) {
    const [loading, setLoading] = useState(false)
    const [targetType, setTargetType] = useState<'broadcast' | 'app' | 'user'>('broadcast')
    const [selectedApp, setSelectedApp] = useState(appIds[0] || '')
    const [userEmail, setUserEmail] = useState('')
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            let result;
            if (targetType === 'broadcast') {
                result = await sendBroadcastNotification(title, body)
            } else if (targetType === 'app') {
                if (!selectedApp) {
                    setMessage({ type: 'error', text: 'Please select an App ID' })
                    setLoading(false)
                    return
                }
                result = await sendAppNotification(selectedApp, title, body)
            } else {
                if (!userEmail) {
                    setMessage({ type: 'error', text: 'Please enter a user email' })
                    setLoading(false)
                    return
                }
                result = await sendNotificationToUser(userEmail, title, body)
            }

            if (result && (result as any).success) {
                setMessage({ type: 'success', text: 'Notification sent successfully!' })
                setTitle('')
                setBody('')
            } else {
                setMessage({ type: 'error', text: `Failed to send: ${JSON.stringify((result as any)?.error || 'Unknown error')}` })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Compose Notification</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Send a push notification to your users. Choose your target audience carefully.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                    {/* Target Selection */}
                    <div>
                        <label className="text-base font-semibold text-gray-900 dark:text-white">Target Audience</label>
                        <p className="text-sm text-gray-500">Who should receive this message?</p>
                        <fieldset className="mt-4">
                            <legend className="sr-only">Notification Target</legend>
                            <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                                <div className="flex items-center">
                                    <input
                                        id="broadcast"
                                        name="target-type"
                                        type="radio"
                                        checked={targetType === 'broadcast'}
                                        onChange={() => setTargetType('broadcast')}
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="broadcast" className="ml-3 block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        All Users
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="app"
                                        name="target-type"
                                        type="radio"
                                        checked={targetType === 'app'}
                                        onChange={() => setTargetType('app')}
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="app" className="ml-3 block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        By App ID
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="user"
                                        name="target-type"
                                        type="radio"
                                        checked={targetType === 'user'}
                                        onChange={() => setTargetType('user')}
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="user" className="ml-3 block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Specific User
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    {/* Conditional Inputs */}
                    {targetType === 'app' && (
                        <div>
                            <label htmlFor="app-select" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Select App ID
                            </label>
                            <div className="mt-2">
                                <select
                                    id="app-select"
                                    name="app-select"
                                    value={selectedApp}
                                    onChange={(e) => setSelectedApp(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                >
                                    {appIds.map((id) => (
                                        <option key={id} value={id}>{id}</option>
                                    ))}
                                    {appIds.length === 0 && <option disabled>No App IDs found</option>}
                                </select>
                            </div>
                        </div>
                    )}

                    {targetType === 'user' && (
                        <div>
                            <label htmlFor="user-email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                User Email
                            </label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    name="user-email"
                                    id="user-email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    placeholder="user@example.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Message Details */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Title
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                placeholder="New Feature Alert!"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="body" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Body
                        </label>
                        <div className="mt-2">
                            <textarea
                                id="body"
                                name="body"
                                rows={3}
                                required
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                placeholder="We've just released a new update..."
                            />
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
