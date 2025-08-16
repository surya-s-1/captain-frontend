import './globals.css'

export const metadata = {
  title: 'Next App',
  description: 'Work In Progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        {children}
      </body>
    </html>
  )
}
