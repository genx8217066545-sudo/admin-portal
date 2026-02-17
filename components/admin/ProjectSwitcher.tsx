'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDown, Check, FolderGit2 } from 'lucide-react'
import { Project, switchProject } from '@/app/admin/projects/actions'
import { useRouter } from 'next/navigation'

interface ProjectSwitcherProps {
    projects: Project[]
    activeProjectId?: string
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function ProjectSwitcher({ projects, activeProjectId }: ProjectSwitcherProps) {
    const router = useRouter()
    const activeProject = projects.find(p => p.id === activeProjectId)

    async function handleSwitch(projectId: string) {
        await switchProject(projectId)
        router.refresh()
    }

    return (
        <Menu as="div" className="relative inline-block text-left w-full px-2 mb-4">
            <div>
                <Menu.Button className="group w-full rounded-md px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-between border border-gray-200 dark:border-zinc-700">
                    <span className="flex w-full items-center justify-between">
                        <span className="flex min-w-0 items-center justify-between space-x-3">
                            <FolderGit2 className="h-5 w-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
                            <span className="flex-1 flex flex-col min-w-0">
                                <span className="text-gray-900 dark:text-gray-100 text-sm font-medium truncate">
                                    {activeProject ? activeProject.name : 'Select Project'}
                                </span>
                            </span>
                        </span>
                        <ChevronDown
                            className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                        />
                    </span>
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 dark:divide-zinc-700 rounded-md bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-64 left-0">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }: { active: boolean }) => (
                                <button
                                    onClick={() => handleSwitch('')}
                                    className={classNames(
                                        active ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200',
                                        'group flex items-center px-4 py-2 text-sm w-full'
                                    )}
                                >
                                    <div className="flex justify-between w-full">
                                        <p className="truncate">Select Project</p>
                                        {!activeProjectId && <Check className="h-4 w-4 text-indigo-600" />}
                                    </div>
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                    <div className="py-1">
                        {projects.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                Project not added
                            </div>
                        ) : (
                            projects.map((project) => (
                                <Menu.Item key={project.id}>
                                    {({ active }: { active: boolean }) => (
                                        <button
                                            onClick={() => handleSwitch(project.id)}
                                            className={classNames(
                                                active ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200',
                                                'group flex items-center px-4 py-2 text-sm w-full'
                                            )}
                                        >
                                            <div className="flex justify-between w-full">
                                                <p className="truncate">{project.name}</p>
                                                {activeProjectId === project.id && <Check className="h-4 w-4 text-indigo-600" />}
                                            </div>
                                        </button>
                                    )}
                                </Menu.Item>
                            ))
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
