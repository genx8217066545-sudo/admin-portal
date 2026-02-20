
'use client'

import { createContext, useContext } from 'react'

const ActiveProjectContext = createContext<string | undefined>(undefined)

export function ActiveProjectProvider({ projectId, children }: { projectId?: string, children: React.ReactNode }) {
    return (
        <ActiveProjectContext.Provider value={projectId}>
            {children}
        </ActiveProjectContext.Provider>
    )
}

export function useActiveProject() {
    return useContext(ActiveProjectContext)
}
