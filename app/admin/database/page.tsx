
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database, Plus, Search, Table as TableIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

// in a real app, this might come from a config file or API
const DEFAULT_TABLES = [
    'profiles',
    'posts',
    'todos',
    'users' // distinct from auth.users
]

export default function DatabasePage() {
    const [tables, setTables] = useState<string[]>(DEFAULT_TABLES)
    const [newTable, setNewTable] = useState('')
    const router = useRouter()

    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTable && !tables.includes(newTable)) {
            setTables([...tables, newTable])
            setNewTable('')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="h-6 w-6" />
                    Database Manager
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => (
                    <Link
                        key={table}
                        href={`/admin/database/${table}`}
                        className="group flex flex-col justify-between rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-zinc-700 transition-colors">
                                <TableIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                {table}
                            </h3>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>View records &rarr;</span>
                        </div>
                    </Link>
                ))}

                {/* Add New Table Card */}
                <div className="flex flex-col justify-center rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6">
                    <form onSubmit={handleAddTable} className="space-y-3">
                        <label htmlFor="new-table" className="text-sm font-medium text-gray-900 dark:text-white">
                            Access another table
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="new-table"
                                type="text"
                                placeholder="public.table_name"
                                value={newTable}
                                onChange={(e) => setNewTable(e.target.value)}
                                className="block w-full rounded-md border border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 bg-white dark:bg-zinc-900"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            The table must be accessible via your Supabase API policies.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
