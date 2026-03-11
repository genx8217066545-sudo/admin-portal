import admin from 'firebase-admin'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Keep track of initialized apps to avoid reloading
const apps: Record<string, admin.app.App> = {}

export async function getFirebaseAdmin() {
    const cookieStore = await cookies()
    const projectId = cookieStore.get('active_project_id')?.value

    // Default: Master Project
    if (!projectId) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            })
        }
        return admin
    }

    // Target Project
    if (apps[projectId]) {
        return apps[projectId]
    }

    const masterClient = await createClient()
    const { data: project } = await masterClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (!project || !project.firebase_project_id) {
        throw new Error('Project not configured for Firebase')
    }

    // Avoid duplicate app name error by checking if it exists in admin.apps
    const appName = `project-${projectId}`
    const existingApp = admin.apps.find(app => app?.name === appName)
    if (existingApp) {
        apps[projectId] = existingApp
        return existingApp
    }

    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: project.firebase_project_id,
            clientEmail: project.firebase_client_email,
            privateKey: project.firebase_private_key?.replace(/\\n/g, '\n'),
        }),
    }, appName)

    apps[projectId] = app
    return app
}

// Helper accessors that resolve the app first
export const getMessaging = async () => (await getFirebaseAdmin()).messaging()
export const getProjectManagement = async () => (await getFirebaseAdmin()).projectManagement()
