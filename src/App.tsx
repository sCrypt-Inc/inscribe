import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Button, Container, Typography, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/system';
import { styled } from '@mui/material/styles';
import NFT from './nft';
import BSV20 from "./bsv20";
import { useRef, useState } from "react";
import { PandaSigner, bsv } from "scrypt-ts";
import { OrdiProvider } from "scrypt-ord";

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

export function networkStr(network: bsv.Networks.Network | undefined) {
    return network === undefined
        ? 'not connected'
        : network === bsv.Networks.mainnet
            ? 'mainnet'
            : 'testnet'
}

function Home(props) {

    const { _network, _payAddress, _ordiAddress, _error, connect } = props

    const connected = () => {
        return _network !== undefined && _payAddress !== undefined && _ordiAddress !== undefined
    }

    return (
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Inscribe on Bitcoin SV
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={connect} disabled={connected()}>
                    {connected() ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
            </Box>
            <Box sx={{ mt: 3 }}>
                <Typography variant="body1">
                    Network: {networkStr(_network)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: 3 }}>
                <Button variant="contained" color="primary" component={Link} to="/nft" disabled={!connected()}>
                    Image
                </Button>
                <Button variant="contained" color="primary" component={Link} to="/bsv20" disabled={!connected()}>
                    BSV-20
                </Button>
            </Box>
            {
                !_error
                    ? ''
                    : (<Box sx={{ mt: 3 }}><Typography variant="body1">{_error}</Typography></Box>)
            }
        </Container>
    )
}

function App() {
    const [_payAddress, setPayAddress] = useState<bsv.Address | undefined>(undefined)
    const [_ordiAddress, setOrdiAddress] = useState<bsv.Address | undefined>(undefined)
    const [_network, setNetwork] = useState<bsv.Networks.Network | undefined>(undefined)
    const [_error, setError] = useState<string | undefined>(undefined)

    const _signer = useRef<PandaSigner>(new PandaSigner(new OrdiProvider()))

    const connect = async () => {
        try {
            const signer = _signer.current as PandaSigner
            const { isAuthenticated, error } = await signer.requestAuth()
            if (!isAuthenticated) {
                throw new Error(error)
            }
            setPayAddress(await signer.getDefaultAddress())
            setOrdiAddress(await signer.getOrdAddress())
            const network = await signer.getNetwork()
            setNetwork(network)
            await signer.connect(new OrdiProvider(network))
            setError(undefined)
        } catch (e) {
            setError(`${e}`)
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home _payAddress={_payAddress} _ordiAddress={_ordiAddress} _network={_network} _error={_error} connect={connect} />} />
                    <Route path="/nft" element={<NFT _ordiAddress={_ordiAddress} _signer={_signer.current} />} />
                    <Route path="/bsv20" element={<BSV20 _ordiAddress={_ordiAddress} _signer={_signer.current} />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App;
