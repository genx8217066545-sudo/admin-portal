
'use server'

import { createTargetClient } from '@/utils/supabase/target-client'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    try {
        const supabase = await createTargetClient()
        // Use auth.admin.listUsers() to get users. 
        // Note: active_project_id cookie determines which project instance is used.
        const { data: { users }, error } = await supabase.auth.admin.listUsers()

        if (error) {
            console.error('Error fetching users:', error)
            return []
        }

        return users || []
    } catch (err) {
        console.error('Error in getUsers:', err)
        return []
    }
}

export async function createUser(formData: FormData) {
    try {
        const supabase = await createTargetClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) {
            return { error: 'Email and password are required' }
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/users')
        return { success: true, user: data.user }
    } catch (err) {
        return { error: 'User creation failed: ' + err }
    }
}

export async function deleteUser(userId: string) {
    try {
        const supabase = await createTargetClient()
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err) {
        return { error: 'User deletion failed: ' + err }
    }
}
