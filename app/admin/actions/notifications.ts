'use server'

import { getMessaging, getProjectManagement } from '@/utils/firebase-admin'
import { createTargetClient } from '@/utils/supabase/target-client'

export async function getAppIds() {
    try {
        const projectManagement = await getProjectManagement()
        const androidApps = await projectManagement.listAndroidApps()
        const iosApps = await projectManagement.listIosApps()

        // Fetch metadata for each app to get packageName / bundleId
        const androidDetails = await Promise.all(androidApps.map(app => app.getMetadata()))
        const iosDetails = await Promise.all(iosApps.map(app => app.getMetadata()))

        const androidIds = androidDetails.map(app => app.packageName)
        const iosIds = iosDetails.map(app => app.bundleId)

        // Return unique app IDs (package names / bundle IDs)
        return Array.from(new Set([...androidIds, ...iosIds]))
    } catch (error) {
        console.error('Error fetching app IDs from Firebase:', error)
        return []
    }
}

export async function sendNotificationToUser(email: string, title: string, body: string, data?: Record<string, string>) {
    const supabase = await createTargetClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('email', email)
        .single()

    if (error || !profile?.fcm_token) {
        return { success: false, error: 'User not found or no device token' }
    }

    return sendNotification(profile.fcm_token, title, body, data)
}

export async function sendBroadcastNotification(title: string, body: string, data?: Record<string, string>) {
    const supabase = await createTargetClient()
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('fcm_token')
        .not('fcm_token', 'is', null)

    if (error) {
        return { success: false, error: error.message }
    }

    const tokens = profiles.map(p => p.fcm_token)
    if (tokens.length === 0) return { success: true, message: 'No users to send to' }

    // Firebase multicast allows up to 500 tokens. We need to batch if more.
    return sendMulticastNotification(tokens.slice(0, 500), title, body, data)
}

export async function sendAppNotification(appId: string, title: string, body: string, data?: Record<string, string>) {
    const supabase = await createTargetClient()
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('app_id', appId)
        .not('fcm_token', 'is', null)

    if (error) {
        return { success: false, error: error.message }
    }

    const tokens = profiles.map(p => p.fcm_token)
    if (tokens.length === 0) return { success: true, message: 'No users in this app' }

    return sendMulticastNotification(tokens.slice(0, 500), title, body, data)
}

export async function sendNotification(token: string, title: string, body: string, data?: Record<string, string>) {
    try {
        const messaging = await getMessaging()
        const message = {
            notification: {
                title,
                body,
            },
            data,
            token,
        }

        const response = await messaging.send(message)
        console.log('Successfully sent message:', response)
        return { success: true, messageId: response }
    } catch (error) {
        console.error('Error sending message:', error)
        return { success: false, error }
    }
}

export async function sendMulticastNotification(tokens: string[], title: string, body: string, data?: Record<string, string>) {
    try {
        const messaging = await getMessaging()
        const message = {
            notification: {
                title,
                body,
            },
            data,
            tokens,
        }

        const response = await messaging.sendEachForMulticast(message)
        console.log(response.successCount + ' messages were sent successfully')
        return { success: true, successCount: response.successCount, failureCount: response.failureCount, responses: response.responses }
    } catch (error) {
        console.error('Error sending multicast message:', error)
        return { success: false, error }
    }
}
