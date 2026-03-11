
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Edit2, Trash2, Save, X, Braces } from 'lucide-react'
import { deleteRecord, updateRecord } from '@/app/admin/database/actions'
import { useRouter } from 'next/navigation'
import JsonEditorModal from './JsonEditorModal'

// Helper to determine headers from data
function getHeaders(data: any[]): string[] {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
}

// Check if a value is a JSON object or array
function isJsonValue(value: any): boolean {
    return value !== null && typeof value === 'object'
}

export default function DataTable({ data, tableName }: { data: any[], tableName: string }) {
    const [headers] = useState(() => getHeaders(data))
    const [editingId, setEditingId] = useState<string | number | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // JSON modal state
    const [jsonModal, setJsonModal] = useState<{
        isOpen: boolean
        fieldName: string
        value: any
        readOnly: boolean
        rowId?: string | number
    }>({ isOpen: false, fieldName: '', value: null, readOnly: true })

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

    const handleInputChange = (header: string, value: any) => {
        setEditForm((prev: any) => ({
            ...prev,
            [header]: value
        }))
    }

    // Open JSON modal in read-only mode (view)
    const openJsonViewer = (fieldName: string, value: any) => {
        setJsonModal({ isOpen: true, fieldName, value, readOnly: true })
    }

    // Open JSON modal in edit mode
    const openJsonEditor = (fieldName: string, value: any, rowId: string | number) => {
        setJsonModal({ isOpen: true, fieldName, value, readOnly: false, rowId })
    }

    const handleJsonSave = (parsedValue: any) => {
        if (jsonModal.fieldName) {
            handleInputChange(jsonModal.fieldName, parsedValue)
        }
    }

    // Render a cell value
    const renderCellValue = (row: any, header: string, isEditing: boolean) => {
        const value = isEditing ? editForm[header] : row[header]

        // Non-editable fields
        if (header === 'id' || header === 'created_at') {
            if (isJsonValue(row[header])) {
                return (
                    <button
                        onClick={() => openJsonViewer(header, row[header])}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                    >
                        <Braces className="h-3 w-3" />
                        JSON
                    </button>
                )
            }
            return <span>{String(row[header])}</span>
        }

        // JSON/object fields
        if (isJsonValue(value)) {
            if (isEditing) {
                return (
                    <button
                        onClick={() => openJsonEditor(header, editForm[header], row.id)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                    >
                        <Edit2 className="h-3 w-3" />
                        Edit JSON
                    </button>
                )
            }
            return (
                <button
                    onClick={() => openJsonViewer(header, value)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                >
                    <Braces className="h-3 w-3" />
                    JSON
                </button>
            )
        }

        // Regular editable fields
        if (isEditing) {
            return (
                <input
                    type="text"
                    value={editForm[header] !== undefined ? String(editForm[header]) : ''}
                    onChange={(e) => handleInputChange(header, e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            )
        }

        // Regular view
        return <span>{String(value)}</span>
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
                                            {renderCellValue(row, header, isEditing)}
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

            {/* JSON Editor Modal */}
            <JsonEditorModal
                isOpen={jsonModal.isOpen}
                onClose={() => setJsonModal({ ...jsonModal, isOpen: false })}
                onSave={handleJsonSave}
                fieldName={jsonModal.fieldName}
                initialValue={jsonModal.value}
                readOnly={jsonModal.readOnly}
            />
        </div>
    )
}
