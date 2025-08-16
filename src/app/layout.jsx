import Sidebar from '@/components/sidebar'
import './globals.css'

export const metadata = {
  title: 'Next App',
  description: 'Work In Progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <div className="flex flex-row min-h-screen">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  )
}
