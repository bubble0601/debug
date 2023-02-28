import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <Component {...pageProps} />
    </SnackbarProvider>
  )
}
