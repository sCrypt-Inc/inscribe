import { useRef, useState } from "react";
import { Container, Box, Typography, Button, TextField, Link } from '@mui/material';
import { BSV20V2P2PKH, OrdiProvider } from "scrypt-ord";
import { Addr, PandaSigner, bsv, toByteString } from "scrypt-ts";

function BSV20() {

    const [_payAddress, setPayAddress] = useState<bsv.Address | undefined>(undefined)
    const [_ordiAddress, setOrdiAddress] = useState<bsv.Address | undefined>(undefined)
    const [_network, setNetwork] = useState<bsv.Networks.Network | undefined>(undefined)

    const networkStr = () => {
        return _network === undefined
            ? 'not connected'
            : _network === bsv.Networks.mainnet
                ? 'mainnet'
                : 'testnet'
    }

    const _signer = useRef<PandaSigner>(new PandaSigner(new OrdiProvider()))

    const connected = () => {
        return _network !== undefined && _payAddress !== undefined && _ordiAddress !== undefined
    }

    const connect = async () => {
        const signer = _signer.current as PandaSigner
        const { isAuthenticated, error } = await signer.requestAuth()
        if (!isAuthenticated) {
            throw new Error(`Unauthenticated: ${error}`)
        }
        setPayAddress(await signer.getDefaultAddress())
        setOrdiAddress(await signer.getOrdAddress())
        const network = await signer.getNetwork()
        setNetwork(network)
        await signer.connect(new OrdiProvider(network))
    }

    const [_symbol, setSymbol] = useState<string | undefined>(undefined)
    const [_amount, setAmount] = useState<bigint | undefined>(undefined)
    const [_decimal, setDecimal] = useState<bigint | undefined>(undefined)

    const symbolOnChange = (e) => { setSymbol(e.target.value) }
    const amountOnChange = (e) => { setAmount(BigInt(e.target.value)) }
    const decimalOnChange = (e) => { setDecimal(BigInt(e.target.value)) }

    const mint = async () => {
        if (_symbol !== undefined && _amount !== undefined && _decimal !== undefined) {
            const signer = _signer.current as PandaSigner
            const symbol = toByteString(_symbol, true)
            const instance = new BSV20V2P2PKH(toByteString(''), symbol, _amount, _decimal, Addr(_ordiAddress!.toByteString()))
            await instance.connect(signer)

            const tokenId = await instance.deployToken()
            console.log(`Token ID: ${tokenId}`)

            setSymbol(undefined)
            setAmount(undefined)
            setDecimal(undefined)
        }
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Box sx={{ pb: 4 }}>
                    <Link href="/" > &lt;- Back to Home </Link>
                </Box>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    BSV20 Inscription
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={connect} disabled={connected()}>
                    {connected() ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
            </Box>
            <Box sx={{ mt: 3 }}>
                <Typography variant="body1">
                    Network: {networkStr()}
                </Typography>
                <Typography variant="body1">
                    Pay Address: {_payAddress?.toString() || 'Not connected'}
                </Typography>
                <Typography variant="body1">
                    Ordi Address: {_ordiAddress?.toString() || 'Not connected'}
                </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
                <TextField label="Symbol" variant="outlined" fullWidth onChange={symbolOnChange} />
                <TextField label="Amount" variant="outlined" fullWidth sx={{ mt: 2 }} onChange={amountOnChange} />
                <TextField label="Decimal" variant="outlined" fullWidth sx={{ mt: 2 }} onChange={decimalOnChange} />
                <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected()} onClick={mint}>
                    Mint It!
                </Button>
            </Box>
        </Container>
    )
}

export default BSV20;
