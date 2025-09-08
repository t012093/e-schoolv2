import './globals.css'

export const metadata = {
  title: 'Kanban Board',
  description: 'A drag and drop kanban board application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
