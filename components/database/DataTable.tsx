
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Edit2, Trash2, Save, X } from 'lucide-react'
import { deleteRecord, updateRecord } from '@/app/admin/database/actions'
import { useRouter } from 'next/navigation'

// Helper to determine headers from data
function getHeaders(data: any[]): string[] {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
}

export default function DataTable({ data, tableName }: { data: any[], tableName: string }) {
    const [headers] = useState(() => getHeaders(data))
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                No records found in this table.
            </div>
        )
    }

    const handleDelete = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this record?')) return

        setLoading(true)
        const res = await deleteRecord(tableName, id)
        setLoading(false)

        if (res.error) {
            alert(`Error: ${res.error}`)
        } else {
            router.refresh()
        }
    }

    const startEdit = (row: any) => {
        setEditingId(row.id)
        setEditForm({ ...row })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleSave = async () => {
        if (!editingId) return

        setLoading(true)
        const res = await updateRecord(tableName, editingId, editForm)
        setLoading(false)

        if (res.error) {
            alert(`Error: ${res.error}`)
        } else {
            setEditingId(null)
            router.refresh()
        }
    }

    const handleInputChange = (header: string, value: string) => {
        setEditForm((prev: any) => ({
            ...prev,
            [header]: value
        }))
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0 z-10">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {header}
                                </th>
                            ))}
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                        {data.map((row, rowIndex) => {
                            const rowId = row.id || rowIndex;
                            const isEditing = editingId === row.id
                            return (
                                <tr key={rowId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    {headers.map((header) => (
                                        <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                            {isEditing && header !== 'id' && header !== 'created_at' ? (
                                                <input
                                                    type="text"
                                                    value={editForm[header] !== undefined ? (typeof editForm[header] === 'object' ? JSON.stringify(editForm[header]) : editForm[header]) : ''}
                                                    onChange={(e) => handleInputChange(header, e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                typeof row[header] === 'object' ?
                                                    <span className="font-mono text-xs text-gray-500">{JSON.stringify(row[header]).substring(0, 30)}...</span>
                                                    : String(row[header])
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={handleSave} disabled={loading} className="text-green-600 hover:text-green-900 dark:text-green-400">
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={cancelEdit} disabled={loading} className="text-gray-600 hover:text-gray-900 dark:text-gray-400">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(row)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination Stub */}
            <div className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(20, data.length)}</span> results
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button disabled className="p-1 rounded-md border border-gray-300 dark:border-zinc-700 disabled:opacity-50">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button disabled className="p-1 rounded-md border border-gray-300 dark:border-zinc-700 disabled:opacity-50">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
