import * as React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import PageNotFound from './Pages/PageNotFound';
import Sign from './Pages/Sign';
import MainHome from "./Component/MainHome";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function App() {
  const [theme, setTheme] = React.useState('dark');

  const darkTheme = createTheme({
    palette: {
      mode: theme
    },
    typography: {
      fontFamily: ['Poppins', 'sans-serif'].join(',')
    }
  });


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter >
        <Routes>
          <Route path='/Home' element={<MainHome setTheme={setTheme} theme={theme} />} >
            <Route index element={<Home />} />
          </Route>
          <Route index element={<Sign theme={theme} />} />
          <Route path='/*' element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>

  );
}

