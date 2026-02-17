'use client'

import { useState } from 'react'
import { Plus, Trash2, Database, Key, FileEdit } from 'lucide-react'
import { createProject, updateProject, deleteProject, Project } from '@/app/admin/projects/actions'

export default function ProjectsPage({ projects }: { projects: Project[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        let res
        if (editingProject) {
            res = await updateProject(editingProject.id, formData)
        } else {
            res = await createProject(formData)
        }

        if (res.success) {
            setIsModalOpen(false)
            setEditingProject(null)
            window.location.reload()
        } else {
            alert('Failed to save project: ' + res.error)
        }
        setLoading(false)
    }

    function openAddModal() {
        setEditingProject(null)
        setIsModalOpen(true)
    }

    function openEditModal(project: Project) {
        setEditingProject(project)
        setIsModalOpen(true)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This will remove access to this project.')) return
        await deleteProject(id)
        window.location.reload()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
                <button
                    onClick={openAddModal}
                    className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <div key={project.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white dark:bg-zinc-900 px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Database className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <a href="#" className="focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                                <p className="truncate text-sm text-gray-500">{project.supabase_url}</p>
                            </a>
                        </div>
                        <div className="z-10 flex space-x-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(project) }}
                                className="text-gray-400 hover:text-indigo-500"
                            >
                                <FileEdit className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            {editingProject ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                                <input
                                    name="name"
                                    defaultValue={editingProject?.name}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="My Awesome App"
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Supabase Config</h3>
                                <div className="space-y-3">
                                    <input
                                        name="supabase_url"
                                        defaultValue={editingProject?.supabase_url}
                                        required
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Supabase URL (https://...)"
                                    />
                                    <input
                                        name="supabase_anon_key"
                                        defaultValue={editingProject?.supabase_anon_key}
                                        required
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Anon Key"
                                    />
                                    <input
                                        name="supabase_service_key"
                                        defaultValue={editingProject?.supabase_service_key}
                                        required
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Service Role Key (for Admin)"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Firebase Config (Optional)</h3>
                                <div className="space-y-3">
                                    <input
                                        name="firebase_project_id"
                                        defaultValue={editingProject?.firebase_project_id}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Project ID"
                                    />
                                    <input
                                        name="firebase_client_email"
                                        defaultValue={editingProject?.firebase_client_email}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Client Email"
                                    />
                                    <textarea
                                        name="firebase_private_key"
                                        defaultValue={editingProject?.firebase_private_key}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Private Key (-----BEGIN PRIVATE KEY...)"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingProject(null); }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingProject ? 'Update' : 'Add Project')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
