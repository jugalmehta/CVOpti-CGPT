import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Resume Tailor AI', description: 'Tailor a resume to a job description with a sequential AI workflow.' }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
