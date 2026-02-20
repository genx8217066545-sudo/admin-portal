
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    User, Palette, Bell, Shield, FolderGit2, AlertTriangle,
    ChevronDown, ChevronRight, Loader2, CheckCircle2,
    Sun, Moon, Monitor, LogOut, Trash2, Eye, EyeOff, ExternalLink,
} from 'lucide-react'
import { changePassword, clearActiveProject } from '@/app/admin/settings/actions'
import { createClient } from '@/utils/supabase/client'

// ─── Section Card ────────────────────────────
function SectionCard({ title, icon: Icon, children, defaultOpen = true, variant = 'default' }: {
    title: string
    icon: any
    children: React.ReactNode
    defaultOpen?: boolean
    variant?: 'default' | 'danger'
}) {
    const [open, setOpen] = useState(defaultOpen)

    const iconBg = variant === 'danger'
        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'

    const borderColor = variant === 'danger'
        ? 'border-red-200 dark:border-red-800/40'
        : 'border-gray-200 dark:border-zinc-800'

    return (
        <div className={`rounded-xl border ${borderColor} bg-white dark:bg-zinc-900 shadow-sm overflow-hidden`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${iconBg}`}>
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

// ─── Info Row ────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-50 dark:border-zinc-800 last:border-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%] break-all">
                {value || '—'}
            </span>
        </div>
    )
}

// ─── Theme Button ────────────────────────────
function ThemeButton({ active, icon: Icon, label, onClick }: {
    active: boolean
    icon: any
    label: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 px-5 py-4 transition-all ${active
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

// ─── Types ────────────────────────────────────
interface AdminProfile {
    id: string
    email: string
    lastSignIn: string | null
    createdAt: string | null
    role: string
}

interface ActiveProject {
    id: string
    name: string
    supabase_url: string
    created_at: string
}

interface SettingsFormProps {
    adminProfile: AdminProfile | null
    activeProject: ActiveProject | null
}

// ─── Main Component ──────────────────────────
export default function SettingsForm({ adminProfile, activeProject }: SettingsFormProps) {
    const router = useRouter()
    const supabase = createClient()

    // Theme
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

    // Notification preferences (localStorage)
    const [emailNotif, setEmailNotif] = useState(true)
    const [pushNotif, setPushNotif] = useState(true)

    // Compact sidebar (localStorage)
    const [compactSidebar, setCompactSidebar] = useState(false)

    // Password change
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Danger zone
    const [clearing, setClearing] = useState(false)

    // Load preferences from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | 'system' | null
        if (savedTheme) setTheme(savedTheme)

        const savedEmailNotif = localStorage.getItem('admin-email-notif')
        if (savedEmailNotif !== null) setEmailNotif(savedEmailNotif === 'true')

        const savedPushNotif = localStorage.getItem('admin-push-notif')
        if (savedPushNotif !== null) setPushNotif(savedPushNotif === 'true')

        const savedCompact = localStorage.getItem('admin-compact-sidebar')
        if (savedCompact !== null) setCompactSidebar(savedCompact === 'true')
    }, [])

    // Theme application
    useEffect(() => {
        localStorage.setItem('admin-theme', theme)

        const root = document.documentElement

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            applyTheme(mediaQuery.matches)

            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
            mediaQuery.addEventListener('change', handler)
            return () => mediaQuery.removeEventListener('change', handler)
        } else {
            applyTheme(theme === 'dark')
        }
    }, [theme])

    // Save notification preferences
    useEffect(() => {
        localStorage.setItem('admin-email-notif', String(emailNotif))
    }, [emailNotif])

    useEffect(() => {
        localStorage.setItem('admin-push-notif', String(pushNotif))
    }, [pushNotif])

    useEffect(() => {
        localStorage.setItem('admin-compact-sidebar', String(compactSidebar))
    }, [compactSidebar])

    const handleChangePassword = async () => {
        setPwStatus(null)

        if (newPassword.length < 6) {
            setPwStatus({ type: 'error', message: 'Password must be at least 6 characters' })
            return
        }

        if (newPassword !== confirmPassword) {
            setPwStatus({ type: 'error', message: 'Passwords do not match' })
            return
        }

        setPwSaving(true)
        const res = await changePassword(newPassword)
        setPwSaving(false)

        if (res.success) {
            setPwStatus({ type: 'success', message: 'Password updated successfully!' })
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setPwStatus(null), 4000)
        } else {
            setPwStatus({ type: 'error', message: res.error || 'Failed to update password' })
        }
    }

    const handleClearProject = async () => {
        setClearing(true)
        await clearActiveProject()
        setClearing(false)
        router.push('/admin')
        router.refresh()
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const formatDate = (d: string | null) => {
        if (!d) return '—'
        return new Date(d).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* ─── Admin Profile ─────────────────────── */}
            <SectionCard title="Admin Profile" icon={User}>
                {adminProfile ? (
                    <div>
                        <InfoRow label="Email" value={adminProfile.email} />
                        <InfoRow label="User ID" value={adminProfile.id} />
                        <InfoRow label="Role" value={adminProfile.role} />
                        <InfoRow label="Last Sign In" value={formatDate(adminProfile.lastSignIn)} />
                        <InfoRow label="Account Created" value={formatDate(adminProfile.createdAt)} />
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load admin profile.</p>
                )}
            </SectionCard>

            {/* ─── Portal Appearance ──────────────────── */}
            <SectionCard title="Portal Appearance" icon={Palette}>
                <div className="space-y-5">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</p>
                        <div className="flex gap-3">
                            <ThemeButton active={theme === 'light'} icon={Sun} label="Light" onClick={() => setTheme('light')} />
                            <ThemeButton active={theme === 'dark'} icon={Moon} label="Dark" onClick={() => setTheme('dark')} />
                            <ThemeButton active={theme === 'system'} icon={Monitor} label="System" onClick={() => setTheme('system')} />
                        </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-zinc-800">
                        <Toggle
                            checked={compactSidebar}
                            onChange={setCompactSidebar}
                            label="Compact Sidebar"
                            description="Reduce sidebar padding for a denser layout"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* ─── Notification Preferences ──────────── */}
            <SectionCard title="Notification Preferences" icon={Bell}>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    <Toggle
                        checked={emailNotif}
                        onChange={setEmailNotif}
                        label="Email Notifications"
                        description="Receive email alerts for critical events"
                    />
                    <Toggle
                        checked={pushNotif}
                        onChange={setPushNotif}
                        label="Push Notifications"
                        description="Receive browser push notifications"
                    />
                </div>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    These preferences are stored locally on this device.
                </p>
            </SectionCard>

            {/* ─── Security ──────────────────────────── */}
            <SectionCard title="Security" icon={Shield}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Update your admin password. You&apos;ll remain signed in after changing it.
                    </p>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPw ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Minimum 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPw(!showNewPw)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPw ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {pwStatus && (
                        <div className={`rounded-lg px-4 py-3 flex items-center gap-2 text-sm ${pwStatus.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                            }`}>
                            {pwStatus.type === 'success'
                                ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                : <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            }
                            {pwStatus.message}
                        </div>
                    )}

                    <button
                        onClick={handleChangePassword}
                        disabled={pwSaving || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                        {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </SectionCard>

            {/* ─── Active Project Info ────────────────── */}
            <SectionCard title="Active Project" icon={FolderGit2}>
                {activeProject ? (
                    <div>
                        <InfoRow label="Project Name" value={activeProject.name} />
                        <InfoRow label="Project ID" value={activeProject.id} />
                        <InfoRow label="Supabase URL" value={activeProject.supabase_url} />
                        <InfoRow label="Created" value={formatDate(activeProject.created_at)} />
                        <div className="mt-3">
                            <a
                                href={activeProject.supabase_url.replace('.supabase.co', '.supabase.com/project/default')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                            >
                                Open Supabase Dashboard
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <FolderGit2 className="h-8 w-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No project selected. Choose a project from the sidebar to see its details here.
                        </p>
                    </div>
                )}
            </SectionCard>

            {/* ─── Danger Zone ────────────────────────── */}
            <SectionCard title="Danger Zone" icon={AlertTriangle} variant="danger" defaultOpen={false}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Clear Active Project</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Reset the selected project and return to the registry view.
                            </p>
                        </div>
                        <button
                            onClick={handleClearProject}
                            disabled={clearing || !activeProject}
                            className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Clear
                        </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Sign out of the admin portal on this device.
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </SectionCard>
        </div>
    )
}
