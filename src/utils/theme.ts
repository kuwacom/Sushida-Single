import React, { useContext } from 'react';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';


// theme 型拡張
// https://mui.com/material-ui/customization/breakpoints/#custom-breakpoints
// declare module '@mui/material/styles' {
//     interface Theme {

//     }
//     interface ThemeOptions {

//     }
// }

// brakepoint 型拡張
// https://mui.com/material-ui/customization/breakpoints/#custom-breakpoints
declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        xxl: true;
    }
}

//// 新しい割り当て方法
// tool: https://zenoo.github.io/mui-theme-creator/
//
export const Theme = (darkMode: boolean) => {
    let themeOptions: ThemeOptions;
    if (darkMode) {
        themeOptions = {
            palette: {
                mode: 'dark',
                background: {
                    // default: '#000010'
                    default: '#000008'
                },
                primary: {
                    main: '#80d8ff'
                },
                secondary: {
                    main: '#ccff90'
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: { // scrollbar
                        "::-webkit-scrollbar": {
                            width: 8,
                            height: 8,
                        },
                        "::-webkit-scrollbar-track": {
                            backgroundColor: "#00568d",
                            borderRadius: 2
                        },
                        "::-webkit-scrollbar-thumb": {
                            backgroundColor: "#e2f4fa",
                            borderRadius: 2
                        }
                    }
                }
            }
        };
    } else {
        themeOptions = {
            palette: {
                mode: 'light',
                background: {
                    default: '#fafafa'
                },
                primary: {
                    main: '#3f51b5'
                },
                secondary: {
                    main: '#009688'
                },
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: { // scrollbar
                        "::-webkit-scrollbar": {
                            width: 8,
                            height: 8,
                        },
                        "::-webkit-scrollbar-track": {
                            backgroundColor: "#84d5fc",
                            borderRadius: 2
                        },
                        "::-webkit-scrollbar-thumb": {
                            backgroundColor: "#19589c",
                            borderRadius: 2
                        }
                    }
                }
            }
        };
    }
    return createTheme(deepmerge({
        // brakepointはbootstrap同じに
        // https://getbootstrap.jp/docs/5.0/layout/breakpoints/
        breakpoints: {
            values: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200,
                xxl: 1400
            },
        },
        typography: {
            // 'fontFamily': "'SmartFontUI'", // デフォのフォント変更
        }
    }, themeOptions));
} 

export const DarkModeContext = React.createContext<{
    toggleDarkMode: () => void;
    setDarkMode: (darkMode: boolean) => void;
    state: boolean;
} | undefined>(undefined);
export function useDarkMode() {
    const context = useContext(DarkModeContext)
    if (context == undefined) {
        throw new Error("useDarkMode is undefined");
    }
    return context;
}

export default { Theme, DarkModeContext, useDarkMode }