
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, Plus, Table as TableIcon, Loader2, RefreshCw, AlertTriangle, Trash2, X } from 'lucide-react'
import { listTables, dropTable } from './actions'
import { useActiveProject } from '@/components/admin/ActiveProjectContext'

export const dynamic = 'force-dynamic'

// ─── Delete Confirmation Modal ───────────────
function DeleteTableModal({ tableName, onClose, onDeleted }: {
    tableName: string
    onClose: () => void
    onDeleted: () => void
}) {
    const [confirmation, setConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)
        const res = await dropTable(tableName, confirmation)
        setLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            onDeleted()
        }
    }

    const isMatch = confirmation === tableName

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/40">
                            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-red-900 dark:text-red-300">Delete Table</h2>
                            <p className="text-xs text-red-700 dark:text-red-400">This action is irreversible</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        You are about to permanently delete the table{' '}
                        <code className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded font-semibold">
                            {tableName}
                        </code>{' '}
                        and all its data. This cannot be undone.
                    </p>

                    <label className="block">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Type <span className="font-bold font-mono text-red-600 dark:text-red-400">{tableName}</span> to confirm
                        </span>
                        <input
                            type="text"
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            placeholder={tableName}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-mono focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            autoFocus
                        />
                    </label>

                    {error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!isMatch || loading}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                        {loading ? 'Deleting...' : 'Delete Table'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────
export default function DatabasePage() {
    const activeProjectId = useActiveProject()
    const [tables, setTables] = useState<string[]>([])
    const [newTable, setNewTable] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [manualTables, setManualTables] = useState<string[]>([])
    const [deletingTable, setDeletingTable] = useState<string | null>(null)

    const fetchTables = async () => {
        setLoading(true)
        setError(null)
        const res = await listTables()

        if (res.error) {
            setError(res.error)
            setTables([])
        } else {
            setTables(res.tables)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchTables()
    }, [activeProjectId])

    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault()
        const name = newTable.trim()
        if (name && !tables.includes(name) && !manualTables.includes(name)) {
            setManualTables([...manualTables, name])
            setNewTable('')
        }
    }

    const handleTableDeleted = () => {
        setDeletingTable(null)
        fetchTables()
    }

    const allTables = [...tables, ...manualTables.filter(t => !tables.includes(t))]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Database className="h-6 w-6" />
                        Database Manager
                    </h1>
                    {!loading && !error && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tables.length} table{tables.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchTables}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border border-amber-200 dark:border-amber-800/40">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                Could not auto-discover tables
                            </h3>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 font-mono">{error}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                                You can still access tables manually using the form below. This usually happens if the service role key
                                doesn&apos;t have access to <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">information_schema</code>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="ml-3 text-sm text-gray-500">Discovering tables...</span>
                </div>
            )}

            {/* Tables grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allTables.map((table) => {
                        const isManual = manualTables.includes(table) && !tables.includes(table)
                        return (
                            <div
                                key={table}
                                className="group relative flex flex-col justify-between rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all"
                            >
                                {/* Delete button */}
                                <button
                                    onClick={(e) => { e.preventDefault(); setDeletingTable(table) }}
                                    className="absolute top-3 right-3 flex items-center justify-center h-7 w-7 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    title={`Delete ${table}`}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>

                                <Link href={`/admin/database/${table}`} className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-zinc-700 transition-colors">
                                            <TableIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {table}
                                            </h3>
                                            {isManual && (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                    manually added
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <span>View records &rarr;</span>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}

                    {/* Add Table Card */}
                    <div className="flex flex-col justify-center rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6">
                        <form onSubmit={handleAddTable} className="space-y-3">
                            <label htmlFor="new-table" className="text-sm font-medium text-gray-900 dark:text-white">
                                Access another table
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="new-table"
                                    type="text"
                                    placeholder="table_name"
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
                                Add a table that wasn&apos;t auto-discovered.
                            </p>
                        </form>
                    </div>

                    {/* Empty state */}
                    {allTables.length === 0 && !loading && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                            <Database className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm">No tables found. Add one manually above.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Table Confirmation Modal */}
            {deletingTable && (
                <DeleteTableModal
                    tableName={deletingTable}
                    onClose={() => setDeletingTable(null)}
                    onDeleted={handleTableDeleted}
                />
            )}
        </div>
    )
}
