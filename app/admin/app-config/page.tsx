
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Save, Loader2, CheckCircle2, AlertTriangle,
    Smartphone, Apple, Shield, Image as ImageIcon,
    Plus, X, Wrench, Gift, Link2, ToggleLeft,
    ChevronDown, ChevronRight, Puzzle, Braces
} from 'lucide-react'
import { getAppState, updateAppState } from './actions'
import JsonEditorModal from '@/components/database/JsonEditorModal'
import { useActiveProject } from '@/components/admin/ActiveProjectContext'

// Known fields that have dedicated sections
const KNOWN_KEYS = new Set([
    'id', 'created_at', 'updated_at',
    'android_play_store_link', 'ios_app_store_link',
    'eventEnabled', 'rewardsEnabled', 'maintenance_mode',
    'maintenance_message', 'ad_image_urls',
    'android', 'ios', 'rewards',
])

// ─── Toggle Switch ───────────────────────────
function Toggle({ checked, onChange, label, description }: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
    description?: string
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-zinc-600'
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    )
}

// ─── Section Card ────────────────────────────
function SectionCard({ title, icon: Icon, children, defaultOpen = true }: {
    title: string
    icon: any
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>
            {open && <div className="px-5 pb-5 border-t border-gray-100 dark:border-zinc-800 pt-4">{children}</div>}
        </div>
    )
}

// ─── Editable String List ────────────────────
function StringList({ items, onChange, placeholder }: {
    items: string[]
    onChange: (items: string[]) => void
    placeholder?: string
}) {
    const [newItem, setNewItem] = useState('')

    const addItem = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()])
            setNewItem('')
        }
    }

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, value: string) => {
        const updated = [...items]
        updated[index] = value
        onChange(updated)
    }

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(i, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        onClick={() => removeItem(i)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder={placeholder || 'Add new item...'}
                    className="flex-1 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                    onClick={addItem}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

// ─── Dynamic Field Renderer ──────────────────
function DynamicField({ label, value, onChange }: {
    label: string
    value: any
    onChange: (v: any) => void
}) {
    const [jsonModalOpen, setJsonModalOpen] = useState(false)

    // Boolean → toggle
    if (typeof value === 'boolean') {
        return <Toggle checked={value} onChange={onChange} label={label} />
    }

    // Number → number input
    if (typeof value === 'number') {
        return (
            <label className="block py-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </label>
        )
    }

    // Array or Object → JSON editor button
    if (typeof value === 'object' && value !== null) {
        return (
            <div className="py-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-xs">
                        {Array.isArray(value) ? `Array (${value.length} items)` : `Object (${Object.keys(value).length} keys)`}
                    </span>
                    <button
                        onClick={() => setJsonModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                        <Braces className="h-3 w-3" />
                        Edit JSON
                    </button>
                </div>
                <JsonEditorModal
                    isOpen={jsonModalOpen}
                    onClose={() => setJsonModalOpen(false)}
                    onSave={(parsed) => { onChange(parsed); setJsonModalOpen(false) }}
                    fieldName={label}
                    initialValue={value}
                    readOnly={false}
                />
            </div>
        )
    }

    // String or fallback → text input
    return (
        <label className="block py-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
        </label>
    )
}

// ─── Main Page ───────────────────────────────
export default function AppConfigPage() {
    const activeProjectId = useActiveProject()
    const [config, setConfig] = useState<any>(null)
    const [rawKeys, setRawKeys] = useState<string[]>([])
    const [rowId, setRowId] = useState<string | number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const router = useRouter()

    const fetchConfig = useCallback(async () => {
        setLoading(true)
        const res = await getAppState()
        if (res.error || !res.data) {
            setErrorMsg(res.error || 'No app_state row found')
            setLoading(false)
            return
        }

        const row = res.data
        setRawKeys(Object.keys(row))

        // Extract id for updates, keep everything else as config
        const { id, created_at, updated_at, ...rest } = row
        setRowId(id)

        // If there's a single "details" or "config" column wrapping everything, unwrap it
        const keys = Object.keys(rest)
        if (keys.length === 1 && typeof rest[keys[0]] === 'object' && !Array.isArray(rest[keys[0]])) {
            // Likely all config is inside a single JSON column
            setConfig(rest[keys[0]])
        } else {
            setConfig(rest)
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        fetchConfig()
    }, [fetchConfig, activeProjectId])

    const handleSave = async () => {
        if (!rowId || !config) return
        setSaving(true)
        setSaveStatus('idle')

        // If the original data had a wrapper column, re-wrap before saving
        const rawNonMeta = rawKeys.filter(k => !['id', 'created_at', 'updated_at'].includes(k))
        let payload: Record<string, any>
        if (rawNonMeta.length === 1 && typeof config === 'object') {
            // Re-wrap into the original column name
            payload = { [rawNonMeta[0]]: config }
        } else {
            payload = config
        }

        const res = await updateAppState(rowId, payload)

        setSaving(false)
        if (res.error) {
            setSaveStatus('error')
            setErrorMsg(res.error)
        } else {
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 3000)
            router.refresh()
        }
    }

    const update = (key: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }))
    }

    const updateNested = (parent: string, key: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: value }
        }))
    }

    const updateReward = (index: number, key: string, value: any) => {
        setConfig((prev: any) => {
            const rewards = [...(prev.rewards || [])]
            rewards[index] = { ...rewards[index], [key]: value }
            return { ...prev, rewards }
        })
    }

    const addReward = () => {
        setConfig((prev: any) => ({
            ...prev,
            rewards: [...(prev.rewards || []), { code: '', title: '', description: '', message: '' }]
        }))
    }

    const removeReward = (index: number) => {
        setConfig((prev: any) => ({
            ...prev,
            rewards: prev.rewards.filter((_: any, i: number) => i !== index)
        }))
    }

    // Compute custom/unknown keys for dynamic section
    const customKeys = config ? Object.keys(config).filter(k => !KNOWN_KEYS.has(k)) : []

    // ─── Loading state
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="ml-3 text-sm text-gray-500">Loading app configuration...</span>
            </div>
        )
    }

    // ─── Error state
    if (!config) {
        return (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800/40">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Failed to load app configuration</h3>
                        <p className="text-xs text-red-700 dark:text-red-500 mt-1 font-mono">{errorMsg}</p>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                            Make sure the <code className="px-1 py-0.5 bg-red-100 dark:bg-red-900/40 rounded">app_state</code> table exists and has at least one row.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Raw column keys detected: <code className="font-mono">{rawKeys.join(', ') || 'none'}</code>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-500" />
                        App Configuration
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your app&apos;s feature flags, links, and settings
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saveStatus === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-300" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Save error banner */}
            {saveStatus === 'error' && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 border border-red-200 dark:border-red-800/40 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* ─── Feature Flags ─────────────────────── */}
            {(config.eventEnabled !== undefined || config.rewardsEnabled !== undefined || config.maintenance_mode !== undefined) && (
                <SectionCard title="Feature Flags" icon={ToggleLeft}>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {config.eventEnabled !== undefined && (
                            <Toggle
                                checked={config.eventEnabled ?? false}
                                onChange={(v) => update('eventEnabled', v)}
                                label="Events Enabled"
                                description="Show the events section in the app"
                            />
                        )}
                        {config.rewardsEnabled !== undefined && (
                            <Toggle
                                checked={config.rewardsEnabled ?? false}
                                onChange={(v) => update('rewardsEnabled', v)}
                                label="Rewards Enabled"
                                description="Enable the rewards/referral program"
                            />
                        )}
                        {config.maintenance_mode !== undefined && (
                            <Toggle
                                checked={config.maintenance_mode ?? false}
                                onChange={(v) => update('maintenance_mode', v)}
                                label="Maintenance Mode"
                                description="Show maintenance screen to all users"
                            />
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ─── Maintenance ────────────────────────── */}
            {config.maintenance_message !== undefined && (
                <SectionCard title="Maintenance" icon={Wrench}>
                    <label className="block">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Maintenance Message</span>
                        <textarea
                            value={config.maintenance_message ?? ''}
                            onChange={(e) => update('maintenance_message', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="We're doing some upgrades. Back in a bit 💛"
                        />
                    </label>
                </SectionCard>
            )}

            {/* ─── App Links ──────────────────────────── */}
            {(config.android_play_store_link !== undefined || config.ios_app_store_link !== undefined) && (
                <SectionCard title="App Store Links" icon={Link2}>
                    <div className="space-y-4">
                        {config.android_play_store_link !== undefined && (
                            <label className="block">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Android Play Store Link</span>
                                <input
                                    type="url"
                                    value={config.android_play_store_link ?? ''}
                                    onChange={(e) => update('android_play_store_link', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="https://play.google.com/store/apps/..."
                                />
                            </label>
                        )}
                        {config.ios_app_store_link !== undefined && (
                            <label className="block">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">iOS App Store Link</span>
                                <input
                                    type="url"
                                    value={config.ios_app_store_link ?? ''}
                                    onChange={(e) => update('ios_app_store_link', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="https://apps.apple.com/app/..."
                                />
                            </label>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ─── Ad Image URLs ──────────────────────── */}
            {config.ad_image_urls !== undefined && (
                <SectionCard title="Ad Image URLs" icon={ImageIcon}>
                    <StringList
                        items={config.ad_image_urls ?? []}
                        onChange={(urls) => update('ad_image_urls', urls)}
                        placeholder="Paste ad image URL..."
                    />
                </SectionCard>
            )}

            {/* ─── Android Config ─────────────────────── */}
            {config.android !== undefined && (
                <SectionCard title="Android Configuration" icon={Smartphone}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Minimum Version</span>
                            <input
                                type="text"
                                value={config.android?.min_version ?? ''}
                                onChange={(e) => updateNested('android', 'min_version', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="1.0(9)"
                            />
                        </label>
                        <div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Blocked Versions</span>
                            <div className="mt-1">
                                <StringList
                                    items={config.android?.blocked_versions ?? []}
                                    onChange={(v) => updateNested('android', 'blocked_versions', v)}
                                    placeholder="e.g. 1.0(12)"
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* ─── iOS Config ─────────────────────────── */}
            {config.ios !== undefined && (
                <SectionCard title="iOS Configuration" icon={Apple}>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Minimum Version</span>
                            <input
                                type="text"
                                value={config.ios?.min_version ?? ''}
                                onChange={(e) => updateNested('ios', 'min_version', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="0.1.1(10)"
                            />
                        </label>
                        <div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Blocked Versions</span>
                            <div className="mt-1">
                                <StringList
                                    items={config.ios?.blocked_versions ?? []}
                                    onChange={(v) => updateNested('ios', 'blocked_versions', v)}
                                    placeholder="e.g. 0.1.0(9)"
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* ─── Rewards ────────────────────────────── */}
            {config.rewards !== undefined && (
                <SectionCard title="Rewards" icon={Gift}>
                    <div className="space-y-4">
                        {(config.rewards ?? []).map((reward: any, index: number) => (
                            <div key={index} className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4 space-y-3 relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                        Reward #{index + 1}
                                    </span>
                                    <button
                                        onClick={() => removeReward(index)}
                                        className="flex items-center justify-center h-7 w-7 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Code</span>
                                        <input
                                            type="text"
                                            value={reward.code ?? ''}
                                            onChange={(e) => updateReward(index, 'code', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="EIO001"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Title</span>
                                        <input
                                            type="text"
                                            value={reward.title ?? ''}
                                            onChange={(e) => updateReward(index, 'title', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Unlock your reward"
                                        />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</span>
                                    <input
                                        type="text"
                                        value={reward.description ?? ''}
                                        onChange={(e) => updateReward(index, 'description', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Short description"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Message</span>
                                    <textarea
                                        value={reward.message ?? ''}
                                        onChange={(e) => updateReward(index, 'message', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                        placeholder="Full reward message text..."
                                    />
                                </label>
                            </div>
                        ))}
                        <button
                            onClick={addReward}
                            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors w-full justify-center"
                        >
                            <Plus className="h-4 w-4" />
                            Add Reward
                        </button>
                    </div>
                </SectionCard>
            )}

            {/* ─── Custom / Dynamic Fields ────────────── */}
            {customKeys.length > 0 && (
                <SectionCard title={`Custom Fields (${customKeys.length})`} icon={Puzzle} defaultOpen={true}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        These fields were detected in your <code className="px-1 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded">app_state</code> row
                        but don&apos;t have a dedicated section above. They are rendered dynamically.
                    </p>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {customKeys.map((key) => (
                            <DynamicField
                                key={key}
                                label={key}
                                value={config[key]}
                                onChange={(v) => update(key, v)}
                            />
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Bottom Save */}
            <div className="flex justify-end pb-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
