import type { AppProps } from "next/app";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";
import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material";
import { Noto_Sans_JP } from "next/font/google";

export const notoSansJp = Noto_Sans_JP({
  weight: ["400", "600"],
  display: "swap",
  style: "normal",
  subsets: ["latin"],
});

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
