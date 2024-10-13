import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import {
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
  GlobalStyles,
} from '@mui/material';

import { Theme, DarkModeContext } from './utils/theme';
import Home from './pages/Home';
// import Spine from './pages/Spine';
import Sushida from './pages/Sushida';

function App() {
  //////// darkmode
  const [darkMode, setDarkMode] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    // OSのtheme変更時
    if (localStorage.getItem('darkMode') === 'true') {
      setDarkMode(true);
    } else if (localStorage.getItem('darkMode') === 'false') {
      setDarkMode(false);
    } else if (prefersDarkMode) {
      // クライアントのtheme
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, [prefersDarkMode]);

  return (
    <DarkModeContext.Provider
      value={useMemo(
        () => ({
          toggleDarkMode: () => {
            setDarkMode((prevDarkMode: boolean) => {
              if (prevDarkMode) {
                localStorage.setItem('darkMode', 'false');
                return false;
              } else {
                localStorage.setItem('darkMode', 'true');
                return true;
              }
            });
          },
          setDarkMode: (darkMode: boolean) => {
            setDarkMode(() => {
              if (darkMode) {
                localStorage.setItem('darkMode', 'true');
                return true;
              } else {
                localStorage.setItem('darkMode', 'false');
                return false;
              }
            });
          },
          state: darkMode,
        }),
        []
      )}
    >
      <ThemeProvider theme={Theme(darkMode)}>
        <CssBaseline />
        <GlobalStyles
          styles={(theme) => ({
            a: {
              color: theme.palette.secondary.light,
              textDecoration: 'none',
              transition: '0.2s',
            },
            'a:hover': {
              color: theme.palette.secondary.dark,
            },
          })}
        />
        {/* <Header /> */}
        {/* <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter> */}

        {/* 単体ならこれで */}
        {/* <Spine /> */}
        <Sushida />
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
