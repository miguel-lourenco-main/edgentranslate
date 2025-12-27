'use client'

import * as React from 'react'

interface LandingPageFilesContext {
  landingPageFiles: File[]
  setLandingPageFiles: (landingPageFiles: File[]) => void
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

  // TODO: load existing workflow thorugh cookies

  const [landingPageFiles, setLandingPageFiles] = React.useState<File[]>([])

  return (
    <LandingPageFilesContext.Provider
      value={{ landingPageFiles, setLandingPageFiles }}
    >
      {children}
    </LandingPageFilesContext.Provider>
  )
}
