import "@/styles/globals.css";
import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import type { AppProps } from "next/app";
import awsconfig from "../aws-exports";

Amplify.configure({ ...awsconfig, ssr: true });

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
