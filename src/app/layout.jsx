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
        <div className='flex min-h-screen'>
          <Sidebar />
          <div className='w-full flex justify-center items-center'>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
