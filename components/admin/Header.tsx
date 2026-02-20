
'use client'

import { Menu } from 'lucide-react'

interface HeaderProps {
    onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden flex items-center justify-center h-9 w-9 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                    A
                </div>
            </div>
        </header>
    )
}
