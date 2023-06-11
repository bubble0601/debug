import type { AppProps } from 'next/app'
import { SnackbarProvider } from 'notistack'
import { RecoilRoot } from 'recoil'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </SnackbarProvider>
  )
}
