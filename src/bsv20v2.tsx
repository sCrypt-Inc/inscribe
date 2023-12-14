import { useState } from "react";
import { Container, Box, Typography, Button, TextField } from '@mui/material';
import { BSV20V2P2PKH, isBSV20v2 } from "scrypt-ord";
import { Addr, PandaSigner, toByteString } from "scrypt-ts";
import { Navigate } from "react-router-dom";

function BSV20v2(props) {

    const { _ordiAddress, _signer } = props

    const connected = () => {
        return _ordiAddress !== undefined
    }

    const [_symbol, setSymbol] = useState<string | undefined>(undefined)
    const [_amount, setAmount] = useState<bigint | undefined>(undefined)
    const [_decimal, setDecimal] = useState<bigint | undefined>(undefined)
    const [_icon, setIcon] = useState<string | undefined>(undefined)

    const symbolOnChange = (e) => { setSymbol(e.target.value) }

    const amountOnChange = (e) => {
        if (/^\d+$/.test(e.target.value)) {
            setAmount(BigInt(e.target.value))
        } else {
            setAmount(undefined)
        }
    }

    const iconOnChange = (e) => {
        if (isBSV20v2(e.target.value)) {
            setIcon(e.target.value)
        } else {
            setIcon(undefined)
        }
    }

    const decimalOnChange = (e) => {
        if (/^\d+$/.test(e.target.value)) {
            setDecimal(BigInt(e.target.value))
        } else {
            setDecimal(undefined)
        }
    }

    const validInput = () => {
        return _symbol !== undefined && _amount !== undefined && _decimal !== undefined
    }

    const [_result, setResult] = useState<string | undefined>(undefined)

    const mint = async () => {
        try {
            const signer = _signer as PandaSigner
            const symbol = toByteString(_symbol!, true)
            const instance = new BSV20V2P2PKH(toByteString(''), symbol, _amount!, _decimal!, Addr(_ordiAddress!.toByteString()))
            await instance.connect(signer)

            const tokenId = await instance.deployToken(_icon ? {
                icon: _icon
            } : {})
            setResult(`Token ID: ${tokenId}`)

            setSymbol(undefined)
            setAmount(undefined)
            setDecimal(undefined)
            setIcon(undefined)
        } catch (e: any) {
            console.error('error', e)
            setResult(`${e.message ?? e}`)
        }

        if (window.gtag) {
            window.gtag('event', 'inscribe-bsv20v2');
        }
    }

    return (
        <Container maxWidth="md">
            {!connected() && (<Navigate to="/" />)}
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Inscribe BSV-20 v2
                </Typography>
            </Box>
            <Box>
                <Typography variant="body1" align="center">
                    <a style={{ color: "#FE9C2F" }} href="https://docs.1satordinals.com/bsv20#new-in-v2-tickerless-mode" target="_blank" rel="noreferrer">what's new in v2</a>
                </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
                <TextField label="Symbol" variant="outlined" fullWidth required onChange={symbolOnChange} />
                <TextField label="Amount" type="number" variant="outlined" fullWidth required sx={{ mt: 2 }} onChange={amountOnChange} />
                <TextField label="Decimal" type="number" variant="outlined" fullWidth required sx={{ mt: 2 }} onChange={decimalOnChange} />
                <TextField label="Icon" variant="outlined" placeholder="1Sat Ordinals NFT origin" fullWidth sx={{ mt: 2 }} onChange={iconOnChange} />
                <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected() || !validInput()} onClick={mint}>
                    Mint It!
                </Button>
            </Box>
            {
                !_result
                    ? ''
                    : (<Box sx={{ mt: 3 }}><Typography variant="body1">{_result}</Typography></Box>)
            }
        </Container>
    )
}

export default BSV20v2;
