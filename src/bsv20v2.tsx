import { useState } from "react";
import { Container, Box, Typography, Button, TextField } from '@mui/material';
import { OneSatApis, isBSV20v2 } from "scrypt-ord";
import { Addr, MethodCallOptions, PandaSigner, bsv, toByteString } from "scrypt-ts";
import { Navigate } from "react-router-dom";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { BSV20Mint } from "./contracts/bsv20Mint";
import Avatar  from "@mui/material/Avatar";

import axios from "axios";
function BSV20v2(props) {

    const { _ordiAddress, _signer, _network } = props
    const [_isLoading, setLoading] = useState<boolean>(false);
    const connected = () => {
        return _ordiAddress !== undefined
    }

    const [_symbol, setSymbol] = useState<string | undefined>(undefined)
    const [_max, setMax] = useState<bigint | undefined>(210000000n)
    const [_decimal, setDecimal] = useState<bigint | undefined>(0n)
    const [_lim, setLim] = useState<bigint | undefined>(1000n)
    const [_icon, setIcon] = useState<string | undefined>(undefined)
    const [_tokenId, setTokenId] = useState<string | undefined>(undefined)
    const [_available, setAvailable] = useState<bigint | undefined>(undefined)

    const [_tokenIdStatus, setTokenIdStatus] = useState<'valid' | 'invalid'>(
        'invalid'
    );

    const [_helperText, setHelperText] = useState<undefined | string>(
        undefined
    );

    const symbolOnChange = (e) => { 
        if (e.target.value) {
            setSymbol(e.target.value)
        } else {
            setSymbol(undefined)
        }
    }

    const maxOnChange = (e) => {
        if (/^\d+$/.test(e.target.value)) {
            setMax(BigInt(e.target.value))
        } else {
            setMax(undefined)
        }
    }

    const tokenIdOnChange = (e) => {
        if (e.target.value) {
            setTokenId(e.target.value)
        } else {
            setTokenId(undefined)
        }
    }

    const limOnChange = (e) => {
        if (/^\d+$/.test(e.target.value)) {
            setLim(BigInt(e.target.value))
        } else {
            setLim(undefined)
        }
    }


    const iconOnChange = (e) => {
        if (isBSV20v2(e.target.value)) {
            setIcon(e.target.value)
        } else {
            setIcon(undefined)
        }
    }


    const clearDeployInfo = (
      ) => {
       
        setSymbol(undefined);
        setMax(undefined);
        setDecimal(undefined);
        setLim(undefined);
        setIcon(undefined);
      };

    const setTokenInfo = (
        sym: string,
        max: string,
        dec: string,
        lim: bigint,
        available: bigint,
        icon?: string
        ) => {
         
        setSymbol(sym);
        setMax(BigInt(max));
        setDecimal(BigInt(dec));
        setLim(lim);
        setAvailable(available);
        if(icon) {
            setIcon(icon);
        }
        setTokenIdStatus('valid')
    };

    const clearTokenId = (
        ) => {
         
        setTokenId(undefined);
        setTokenIdStatus('invalid')
    };

    const [_mintOrDeploy, setMintOrDeploy] = useState("mint");
    const mintOrDeployOnChange = (e) => {
      const value = e.target.value as string;
      setMintOrDeploy(value);
      if (value === "deploy") {
        clearDeployInfo();
      } else {
        clearTokenId();
      }
      setResult(undefined);
      setHelperText(undefined)
    };

    const mintTokenIdOnBlur = async () => {
      if (_tokenId && isBSV20v2(_tokenId)) {
        try {
            
          const info = await axios
            .get(
              `${
                _network === bsv.Networks.mainnet
                  ? "https://ordinals.gorillapool.io"
                  : "https://testnet.ordinals.gorillapool.io"
              }/api/inscriptions/${_tokenId}/latest?script=true`
            )
            .then((r) => r.data)
            .catch((e) => {
              console.error("get inscriptions by tokenid failed!");
              return null;
            });

          if (info === null) {
            setHelperText("No token found!")
            clearTokenId()
            return;
          }

          const { amt, dec, sym, icon } = info.origin?.data?.insc?.json || {};

          const instance = BSV20Mint.fromUTXO({
            txId: info.txid,
            outputIndex: info.vout,
            script: Buffer.from(info.script, "base64").toString("hex"),
            satoshis: info.satoshis,
          });


          setTokenInfo(sym, amt, dec, instance.lim, instance.supply, icon);
          setHelperText(undefined)
        } catch (e) {
            setHelperText((e as unknown as any).message || "Unknow error")
            console.error('mintTokenIdOnBlur error:', e)
        }
      } else {
        if(_tokenId && !isBSV20v2(_tokenId)) {
            setHelperText("Invalid Token Id")
        }

        clearTokenId()
      }
    };

    const decimalOnChange = (e) => {
        if (/^\d+$/.test(e.target.value)) {
            setDecimal(BigInt(e.target.value))
        } else {
            setDecimal(undefined)
        }
    }

    const validMintInput = () => {
        return _tokenIdStatus === 'valid' && _tokenId !== undefined && _symbol !== undefined && _max !== undefined && _decimal !== undefined && _lim !== undefined
    }

    const validDeployInput = () => {
        return _symbol !== undefined && _max !== undefined && _decimal !== undefined && _lim !== undefined
    }

    const [_result, setResult] = useState<string | undefined>(undefined)

    const deploy = async () => {
        try {
            setLoading(true)
            const signer = _signer as PandaSigner
            const symbol = toByteString(_symbol!, true)
            const instance = new BSV20Mint(toByteString(''), symbol, _max!, _decimal!, _lim!)
            await instance.connect(signer)

            const tokenId = await instance.deployToken(_icon ? {
                icon: _icon
            } : {})
            setResult(`Token ID: ${tokenId}`)

            setSymbol(undefined)
            setMax(undefined)
            setDecimal(undefined)
            setIcon(undefined)
            setLim(undefined)
        } catch (e: any) {
            console.error('error', e)
            setResult(`${e.message ?? e}`)
        } finally {
            setLoading(false)
        }

        if (window.gtag) {
            window.gtag('event', 'deploy-bsv20v2');
        }
    }

    const mint = async () => {
        try {
            setLoading(true)
            const signer = _signer as PandaSigner

            const utxo = await OneSatApis.fetchLatestByOrigin(_tokenId!, _network);
            if(!utxo) {
                setResult(`No UTXO found for token id!`)
                return;
            }

            const instance = BSV20Mint.fromUTXO(utxo);

            await instance.connect(signer)

            instance.bindTxBuilder('mint', BSV20Mint.mintTxBuilder)

            const {tx} = await instance.methods.mint(
                Addr(_ordiAddress.toByteString()),
                instance.lim,
                {} as MethodCallOptions<BSV20Mint>
            )

            setResult(`Mint Tx: ${tx.id}`)


        } catch (e: any) {
            console.error('error', e)
            setResult(`${e.message ?? e}`)
        } finally {
            setLoading(false)
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

            <Box sx={{ my: 2 }}>
                <FormControl>
                <FormLabel id="radio-buttons-mint-deploy-label" sx={{ mb: 1 }}>
                    Mint or Deploy
                </FormLabel>
                <RadioGroup
                    aria-labelledby="radio-buttons-mint-deploy-label"
                    defaultValue="mint"
                    name="radio-buttons-mint-deploy"
                    onChange={mintOrDeployOnChange}
                >
                    <FormControlLabel
                    value="mint"
                    control={<Radio />}
                    label="Mint Existing Token"
                    />
                    <FormControlLabel
                    value="deploy"
                    control={<Radio />}
                    label="Deploy New Token"
                    />
                </RadioGroup>
                </FormControl>
            </Box>
            {_mintOrDeploy === "deploy" &&(
                <Box sx={{ mt: 3 }}>
                    <TextField label="Symbol" variant="outlined" fullWidth required onChange={symbolOnChange} />

                    <TextField label="Max Supply" type="number" variant="outlined" fullWidth required sx={{ mt: 2 }} onChange={maxOnChange} />
                    <TextField
                    label="Limit Per Mint"
                    sx={{ mt: 2 }}
                    required
                    variant="outlined"
                    fullWidth
                    onChange={limOnChange}
                    />
                    <TextField label="Decimal Precision" type="number" variant="outlined" fullWidth required sx={{ mt: 2 }} onChange={decimalOnChange} />
                    <TextField label="Icon" variant="outlined" placeholder="1Sat Ordinals NFT origin" fullWidth sx={{ mt: 2 }} onChange={iconOnChange} />
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected() || !validDeployInput()} onClick={deploy}>
                        Deploy It!
                    </Button>
                </Box>
            )}

            {_mintOrDeploy === "mint" &&(
                <Box sx={{ mt: 3 }}>
                    <TextField label="TokenId" variant="outlined" placeholder="TokenId" fullWidth
                    required
                    error={typeof _helperText === 'string'}
                    helperText={_helperText}
                    onChange={tokenIdOnChange}
                    onBlur={mintTokenIdOnBlur} />

                    {_tokenIdStatus === 'valid' && (
                            <Box>
                                <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>
                                Symbol: {_symbol?.toString() || "Null"}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>
                                Max Supply: {_max?.toString()}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>
                                Available Supply: {_available?.toString() || "0"}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2, ml: 2 }}>
                                Limit Per Mint: {_lim?.toString()}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2, ml: 2, mb: 1 }}>
                                Decimal Precision: {_decimal?.toString()}
                                </Typography>
                                {
                                    _icon &&(

                                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                            <Box>
                                                <Typography variant="body1" sx={{ mt: 2, ml: 2, mb: 1 }}>
                                                Icon: 
                                                </Typography>
                                            </Box>
                                            <Avatar alt="Icon" sx={{marginTop: 1, marginLeft: 0.6}} src={
                                                `https://ordinals.gorillapool.io/content/${_icon}?fuzzy=false`
                                            } />

                                        </Box>


                                    )
                                }
                            </Box>
                    )}
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected() || !validMintInput()} onClick={mint}>
                        Mint It!
                    </Button>
                </Box>
            )}
            {
                !_result
                    ? ''
                    : (<Box sx={{ mt: 3 }}><Typography variant="body1">{_result}</Typography></Box>)
            }
                        <Box>
                <Typography sx={{marginTop: 10}} variant="body1" align="center">
                    <a style={{ color: "#FE9C2F" }} href="https://docs.1satordinals.com/bsv20#new-in-v2-tickerless-mode" target="_blank" rel="noreferrer">what's new in v2</a>
                </Typography>
            </Box>
            <Backdrop sx={{ color: "#fff", zIndex: 1000000 }} open={_isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Container>
    )
}

export default BSV20v2;
