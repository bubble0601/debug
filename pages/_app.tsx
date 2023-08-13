import type { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";
import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider>
      <RecoilRoot>
        <ThemeProvider theme={createTheme()}>
          <Component {...pageProps} />
        </ThemeProvider>
      </RecoilRoot>
    </SnackbarProvider>
  );
}
