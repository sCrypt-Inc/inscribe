import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Button, Container, Typography, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/system';
import { styled } from '@mui/material/styles';
import NFT from './nft';
import BSV20 from "./bsv20";

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: "#FE9C2F",
            focus: "#FE9C2F",
        },
        secondary: {
            main: "#FE9C2F",
            focus: "#FE9C2F",
        },
        info: {
            main: "#11cdef",
            focus: "#11cdef",
        },
        success: {
            main: "#2dce89",
            focus: "#2dce89",
        },
        warning: {
            main: "#fb6340",
            focus: "#fb6340",
        },
        error: {
            main: "#f5365c",
            focus: "#f5365c",
        },
        background: {
            default: "#000",
        },
        text: {
            primary: "#fff",
            secondary: "#FE9C2F",
            disabled: "#BDBDBD",
            hint: "#9E9E9E"
        },
        grey: {
            100: "#f8f9fa",
            200: "#e9ecef",
            300: "#dee2e6",
            400: "#ced4da",
            500: "#adb5bd",
            600: "#6c757d",
            700: "#495057",
            800: "#343a40",
            900: "#212529",
        },
        common: {
            black: '#000',
            white: '#fff',
            red: '#f00',
        },
        action: {
            hoverOpacity: 0.1,
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        pxToRem: (px) => `${px / 16}rem`,
    },
    shadows: ["none", "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)", /*...*/],
    transitions: {
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
        create: function (property = 'all', options: any = {}) {
            let { duration = '300ms', timingFunction = 'ease', delay = '0ms' } = options;
            return `${property} ${duration} ${timingFunction} ${delay}`;
        },
    },
    components: {
        MuiLink: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiButton: {
            defaultProps: {
                size: 'large',
            },
            styleOverrides: {
                root: {
                    fontWeight: '700',
                    '&.Mui-disabled': {
                        backgroundColor: '#999',
                        color: '#FFF',
                    },
                },
                contained: {
                    color: '#000'
                }
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#999',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FE9C2F',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FE9C2F',
                },
              },
            },
          },
    },
});

const AnimatedButton = styled(Button)`
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

function Home() {
    return (
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    1Sat Ordinals Inscription Demo
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 3 }}>
                <Button variant="contained" color="primary" component={Link} to="/nft">
                    Inscribe A NFT
                </Button>
                <Button variant="contained" color="primary" component={Link} to="/bsv20">
                    Inscribe A BSV20
                </Button>
            </Box>
        </Container>
    )
}


function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path="/nft" element={<NFT />} />
                    <Route path="/bsv20" element={<BSV20 />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App;