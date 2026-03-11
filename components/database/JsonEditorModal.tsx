
'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, WrapText, Check, AlertTriangle, Maximize2 } from 'lucide-react'

interface JsonEditorModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (parsedValue: any) => void
    fieldName: string
    initialValue: any
    readOnly?: boolean
}

export default function JsonEditorModal({
    isOpen,
    onClose,
    onSave,
    fieldName,
    initialValue,
    readOnly = false,
}: JsonEditorModalProps) {
    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            try {
                const formatted = JSON.stringify(
                    typeof initialValue === 'string' ? JSON.parse(initialValue) : initialValue,
                    null,
                    2
                )
                setText(formatted)
                setError(null)
            } catch {
                setText(typeof initialValue === 'string' ? initialValue : JSON.stringify(initialValue))
                setError(null)
            }
        }
    }, [isOpen, initialValue])

    const validate = useCallback((value: string): boolean => {
        try {
            JSON.parse(value)
            setError(null)
            return true
        } catch (e: any) {
            setError(e.message)
            return false
        }
    }, [])

    const handleChange = (value: string) => {
        setText(value)
        validate(value)
    }

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(text)
            setText(JSON.stringify(parsed, null, 2))
            setError(null)
        } catch {
            // can't format invalid JSON – error is already shown
        }
    }

    const handleSave = () => {
        try {
            const parsed = JSON.parse(text)
            onSave(parsed)
            onClose()
        } catch (e: any) {
            setError(e.message)
        }
    }

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 's' && (e.ctrlKey || e.metaKey) && !readOnly) {
                e.preventDefault()
                handleSave()
            }
        }
        if (isOpen) window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, text, readOnly])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 flex flex-col w-[90vw] h-[85vh] max-w-5xl rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            <Maximize2 className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {readOnly ? 'View' : 'Edit'} JSON
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {fieldName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!readOnly && (
                            <button
                                onClick={handleFormat}
                                title="Format JSON"
                                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
                            >
                                <WrapText className="h-3.5 w-3.5" />
                                Format
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden p-1">
                    <textarea
                        value={text}
                        onChange={(e) => handleChange(e.target.value)}
                        readOnly={readOnly}
                        spellCheck={false}
                        className={`w-full h-full resize-none rounded-lg p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                            ${readOnly
                                ? 'bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300 cursor-default'
                                : 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100'
                            }
                            ${error && !readOnly ? 'ring-2 ring-red-400/50' : ''}
                        `}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80">
                    {/* Validation status */}
                    <div className="flex items-center gap-2 text-xs">
                        {error ? (
                            <>
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                <span className="text-red-600 dark:text-red-400 font-mono max-w-md truncate">
                                    {error}
                                </span>
                            </>
                        ) : (
                            <>
                                <Check className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">
                                    Valid JSON
                                </span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
                        >
                            {readOnly ? 'Close' : 'Cancel'}
                        </button>
                        {!readOnly && (
                            <button
                                onClick={handleSave}
                                disabled={!!error}
                                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                <Save className="h-3.5 w-3.5" />
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
