import React from 'react';
import Head from 'next/head';
import type {AppProps} from 'next/app';
import {CssBaseline, ThemeProvider, createTheme, PaletteMode } from '@mui/material';
import type {EmotionCache} from "@emotion/cache";
import createEmotionCache from '../lib/create-emotion-cache';
import {CacheProvider, useTheme} from '@emotion/react';
import { SessionProvider } from 'next-auth/react';
import darkTheme from '../lib/theme/darkTheme';
import lightTheme from '../lib/theme/lightTheme';
import ThemeToggleButton from '../components/ThemeToggleButton/ThemeToggleButton';
import SideMenu from '../components/SideMenu/SideMenu';
import Login from './auth/login';
import Setting from './dashboard/setting'
import { Box } from '@mui/system';
import Register from './auth/register';


const clientSideEmotionCache = createEmotionCache();
const ColorModeContext = React.createContext({
    toggleColorMode: () => {},
});


type MyAppProps = AppProps & {
    emotionCache?: EmotionCache;
    pageProps: {
        session: any; // Adjust the type of session according to your session object structure
    };
}

const MyApp: React.FC<MyAppProps> = (props) => {
    const { Component, pageProps: { session, ...pageProps }, emotionCache = clientSideEmotionCache } = props;
    const [mode, setMode] = React.useState<"light" | "dark">("dark");
    const colorMode = React.useMemo(
        () => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
        },
        }),
        []
    );
        
    const darkThemeChosen = React.useMemo(
        () =>
            createTheme({
            ...darkTheme,
            }),
        [mode]
    );
    const lightThemeChosen = React.useMemo(
        () =>
            createTheme({
            ...lightTheme,
            }),
        [mode]
    );

    const isSettingPage = Component === Setting;
    
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider 
            theme={mode === "dark" ? darkThemeChosen : lightThemeChosen}
            >
                <SessionProvider session={session}>
                    <CacheProvider value={emotionCache}>
                        <Head>
                            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
                        </Head>
                        <CssBaseline/>
                            {(isSettingPage) && <Setting ColorModeContext={ColorModeContext}/>}
                        <Component {...pageProps} />
                    </CacheProvider>
                </SessionProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}

export default MyApp;
