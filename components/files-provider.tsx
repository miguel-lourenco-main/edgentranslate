'use client'

import * as React from 'react'
import { clearLandingWorkflow, loadLandingWorkflow, saveLandingWorkflow } from '~/lib/client/landing-workflow-store'

interface LandingPageFilesContext {
  landingPageFiles: File[]
  landingTargetLanguage: string | null
  landingWorkflowSavedAt: number | null
  setLandingPageFiles: (landingPageFiles: File[]) => void
  saveLandingWorkflow: (input: { files: File[]; targetLanguage: string | null }) => Promise<void>
  clearLandingWorkflow: () => Promise<void>
}

const LandingPageFilesContext = React.createContext<LandingPageFilesContext | undefined>(
  undefined
)

export function useLandingPageFiles() {
  const context = React.useContext(LandingPageFilesContext)
  if (!context) {
    throw new Error('useLandingPageFiles must be used within a LandingPageFilesProvider')
  }
  return context
}

interface LandingPageFilesProviderProps {
  children: React.ReactNode
}

export function LandingPageFilesProvider({ children }: LandingPageFilesProviderProps) {

  const [landingPageFiles, setLandingPageFiles] = React.useState<File[]>([])
  const [landingTargetLanguage, setLandingTargetLanguage] = React.useState<string | null>(null)
  const [landingWorkflowSavedAt, setLandingWorkflowSavedAt] = React.useState<number | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function hydrate() {
      if (typeof window === 'undefined') return

      try {
        const existing = await loadLandingWorkflow()
        if (!existing || cancelled) return

        setLandingPageFiles(existing.files)
        setLandingTargetLanguage(existing.targetLanguage)
        setLandingWorkflowSavedAt(existing.savedAt)
      } catch {
        // Ignore hydration errors (e.g. blocked storage)
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <LandingPageFilesContext.Provider
      value={{
        landingPageFiles,
        landingTargetLanguage,
        landingWorkflowSavedAt,
        setLandingPageFiles,
        saveLandingWorkflow: async (input) => {
          setLandingPageFiles(input.files)
          setLandingTargetLanguage(input.targetLanguage)
          setLandingWorkflowSavedAt(Date.now())
          await saveLandingWorkflow(input)
        },
        clearLandingWorkflow: async () => {
          setLandingPageFiles([])
          setLandingTargetLanguage(null)
          setLandingWorkflowSavedAt(null)
          await clearLandingWorkflow()
        },
      }}
    >
      {children}
    </LandingPageFilesContext.Provider>
  )
}
