
'use server'

import { createTargetClient } from '@/utils/supabase/target-client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * List all public tables from the target Supabase project.
 * Strategy:
 *   1. Try calling a DB function `get_public_tables` (if user created one)
 *   2. Fallback: query the OpenAPI spec from PostgREST `/rest/v1/` which lists
 *      all exposed tables as top-level paths
 */
export async function listTables(): Promise<{ tables: string[], error: string | null }> {
    const cookieStore = await cookies()
    const projectId = cookieStore.get('active_project_id')?.value

    // Determine the Supabase URL and key for the target project
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (projectId) {
        // Fetch project config to get the target URL/key
        const registryClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        )
        const { data: project } = await registryClient
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single()

        if (project) {
            supabaseUrl = project.supabase_url
            supabaseKey = project.supabase_service_key
        }
    }

    // Strategy 1: Try RPC function
    const supabase = await createTargetClient()
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_tables')

    if (!rpcError && rpcData) {
        const tableNames = (rpcData as any[]).map((row: any) => row.table_name || row.tablename || row).sort()
        return { tables: tableNames, error: null }
    }

    // Strategy 2: Fetch the PostgREST OpenAPI spec — it lists all exposed tables
    try {
        const openApiUrl = `${supabaseUrl}/rest/v1/`
        const response = await fetch(openApiUrl, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Accept': 'application/openapi+json',
            },
        })

        if (response.ok) {
            const spec = await response.json()

            // OpenAPI spec has paths like "/table_name"
            if (spec.paths) {
                const tableNames = Object.keys(spec.paths)
                    .map((path: string) => path.replace(/^\//, ''))
                    .filter((name: string) => name && !name.startsWith('rpc/'))
                    .sort()
                return { tables: tableNames, error: null }
            }

            // Some versions list definitions
            if (spec.definitions) {
                const tableNames = Object.keys(spec.definitions).sort()
                return { tables: tableNames, error: null }
            }
        }
    } catch (e: any) {
        console.warn('[Database] OpenAPI fetch failed:', e.message)
    }

    return {
        tables: [],
        error: 'Could not auto-discover tables. Create a DB function `get_public_tables` or check your service key permissions.'
    }
}

export async function deleteRecord(tableName: string, id: string | number) {
    const supabase = await createTargetClient()

    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/database/${tableName}`)
    return { success: true }
}

export async function updateRecord(tableName: string, id: string | number, data: any) {
    const supabase = await createTargetClient()

    const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/database/${tableName}`)
    return { success: true }
}

export async function dropTable(tableName: string, confirmation: string) {
    // Safety: require the user to type the exact table name
    if (confirmation !== tableName) {
        return { error: 'Table name confirmation does not match.' }
    }

    // Basic SQL injection guard — only allow valid Postgres identifiers
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        return { error: 'Invalid table name.' }
    }

    const supabase = await createTargetClient()

    // Use rpc to execute DROP TABLE (requires a DB function)
    const { error } = await supabase.rpc('drop_table', {
        table_name: tableName,
    })

    if (error) {
        return {
            error: `${error.message}. You may need to create a DB function in your Supabase SQL Editor:\n\nCREATE OR REPLACE FUNCTION drop_table(table_name text)\nRETURNS void AS $$\nBEGIN\n  EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name);\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER;`
        }
    }

    revalidatePath('/admin/database')
    return { success: true }
}
