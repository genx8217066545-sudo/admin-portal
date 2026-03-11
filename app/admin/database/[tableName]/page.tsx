import { createTargetClient } from '@/utils/supabase/target-client'
import DataTable from '@/components/database/DataTable'

interface Props {
    params: Promise<{ tableName: string }>
    searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function TablePage({ params, searchParams }: Props) {
    const { tableName } = await params
    const supabase = await createTargetClient()

    // Basic fetch
    const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(0, 19) // Simple pagination: first 20 items

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error fetching table data</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Could not load data for table <strong>{tableName}</strong>.</p>
                                <p className="mt-1 font-mono text-xs">{error.message}</p>
                                <p className="mt-2">Ensure the table exists and Row Level Security (RLS) policies allow access.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Table: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{tableName}</span>
                </h1>
                <div className="text-sm text-gray-500">
                    Total Records: {count || 0}
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow">
                <DataTable data={data || []} tableName={tableName} />
            </div>
        </div>
    )
}
