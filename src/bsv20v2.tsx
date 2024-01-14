import { useState } from "react";
import { Container, Box, Typography, Button, TextField } from '@mui/material';
import { OneSatApis, isBSV20v2 } from "scrypt-ord";
import { Addr, DummyProvider, MethodCallOptions, PandaSigner, TestWallet, UTXO, bsv, fromByteString, toByteString } from "scrypt-ts";
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

import { useAppProvider } from "./AppContext";
import { dummyUTXO } from "./utils";

const serviceFeePerRepeat = 100;
function BSV20v2(props) {

    const [_isLoading, setLoading] = useState<boolean>(false);

    const [_symbol, setSymbol] = useState<string | undefined>(undefined)
    const [_max, setMax] = useState<bigint | undefined>(210000000n)
    const [_decimal, setDecimal] = useState<bigint | undefined>(0n)
    const [_lim, setLim] = useState<bigint | undefined>(1000n)
    const [_icon, setIcon] = useState<string | undefined>(undefined)
    const [_tokenId, setTokenId] = useState<string | undefined>(undefined)
    const [_available, setAvailable] = useState<bigint | undefined>(undefined)

    const [_mintFee, setMintFee] = useState<number>(20)

    
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

    const { ordiAddress: _ordiAddress, 
        price: _price, 
        payAddress: _payAddress, 
        network: _network,
        feePerKb: _feePerKb,
        signer: _signer,
        connected} = useAppProvider();

    const [_cost, setCost] = useState<number>(0);

    const [_repeat, setRepeat] = useState<bigint | undefined>(1n);
    const repeatOnChange = (e) => {
      if (/^\d+$/.test(e.target.value)) {
        setRepeat(BigInt(e.target.value));
        setCost(calcCost([dummyUTXO(_ordiAddress!, Number.MAX_SAFE_INTEGER)], _mintFee, Number(e.target.value)));
      } else {
        setRepeat(undefined);
      }
    };

    function calcCost(utxos: UTXO[], mintFee: number, repeat: number) {

        const tx = buildTx(utxos, _payAddress!, mintFee, _feePerKb, repeat);
        return tx.inputAmount - tx.getChangeAmount() + Number(repeat!);
    }

    function buildTx(
        utxos: UTXO[],
        changeAddress: bsv.Address,
        mintFee: number,
        feePerKb: number,
        repeat: number
      ) {
        const fundAddress = "1BK5badc4DyGEjULf5ZY3k93apSb2Abeyw";
    
        const fee = serviceFeePerRepeat * repeat;
        const tx = new bsv.Transaction().from(utxos).addOutput(
          new bsv.Transaction.Output({
            script: bsv.Script.fromAddress(fundAddress),
            satoshis: fee,
          })
        );
    

        for (let i = 0; i < repeat; i++) {
          tx.addOutput(
            new bsv.Transaction.Output({
              satoshis: mintFee,
              script: bsv.Script.buildPublicKeyHashOut(
                "17o3vLY15beFFRz3TDGMqcUrXG3XtEZLxy"
              ),
            })
          );
        }

        console.log('changeAddress', changeAddress)
    
        tx.change(changeAddress);
        tx.feePerKb(feePerKb);
    
        return tx;
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
        max: bigint,
        dec: bigint,
        lim: bigint,
        available: bigint,
        icon?: string
        ) => {
         
        setSymbol(sym);
        setMax(max / BigInt(Math.pow(10, Number(dec))));
        setDecimal(BigInt(dec));
        setLim(lim);
        setAvailable(available);
        setIcon(icon);
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

    const fetchArtifact = async (max: bigint) => {

        let bsv20Mint_release_desc = "";
      
        if(max < 100000000n) {
            bsv20Mint_release_desc = "bsv20Mint_release_desc_8.json"
        } else if(max < 1000000000000n) {
            bsv20Mint_release_desc = "bsv20Mint_release_desc_12.json"
        } else if(max < 10000000000000000n) {
            bsv20Mint_release_desc = "bsv20Mint_release_desc_16.json"
        } else {
            bsv20Mint_release_desc = "bsv20Mint_release_desc_20.json"
        }

        return fetch(`/${bsv20Mint_release_desc}`).then(res => res.json());
    }

    const mintTokenIdOnBlur = async () => {
      if (_tokenId && isBSV20v2(_tokenId)) {
        try {
          setTokenIdStatus("invalid")
          setHelperText(undefined)
          const info = await fetch(
              `${
                _network === bsv.Networks.mainnet
                  ? "https://ordinals.gorillapool.io"
                  : "https://testnet.ordinals.gorillapool.io"
              }/api/inscriptions/${_tokenId}/latest?script=true`
            )
            .then((r) => {
                if(r.status === 200) {
                    return r.json()
                } 
                return null;
            })
            .catch((e) => {
              console.error("get inscriptions by tokenid failed!");
              return null;
            });

          if (info === null) {
            setHelperText("No token found!")
            clearTokenId()
            return;
          }

          console.log('info', info)

          const { amt, sym, icon } = info.origin?.data?.insc?.json || {};

  
          const artifact = await fetchArtifact(BigInt(amt || 21000000));
          BSV20Mint.loadArtifact(artifact)

          const instance = BSV20Mint.fromUTXO({
            txId: info.txid,
            outputIndex: info.vout,
            script: Buffer.from(info.script, "base64").toString("hex"),
            satoshis: info.satoshis,
          });

        // const tx = await _signer.provider!.getTransaction("a05ebd6368ee8cc3112497aa099bcf274849cae456e2742244b8e6e5ad6e8e39")

        // const instance = BSV20Mint.fromUTXO({
        //     txId: tx.id,
        //     outputIndex: 0,
        //     script: tx.outputs[0].script.toHex(),
        //     satoshis: 1,
        //   });

          setTokenInfo(fromByteString(instance.sym), instance.max, instance.dec, instance.lim, instance.supply, icon);
          setHelperText(undefined)
          if(_repeat) {
            instance.bindTxBuilder('mint', BSV20Mint.mintTxBuilder)

            await instance.connect(new TestWallet(bsv.PrivateKey.fromRandom(bsv.Networks.testnet), 
                new DummyProvider()))

            
            const {tx} = await instance.methods.mint(
                Addr(_ordiAddress!.toByteString()),
                instance.lim,
                {
                    partiallySigned: true
                } as MethodCallOptions<BSV20Mint>
            )

            const mintFee = tx.getFee() + 1;

            setMintFee(mintFee);

            setCost(calcCost([dummyUTXO(_ordiAddress!, Number.MAX_SAFE_INTEGER)], mintFee, Number(_repeat)));
          }

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
        return _isLoading === false && _tokenIdStatus === 'valid' && _tokenId !== undefined && _symbol !== undefined && _max !== undefined && _decimal !== undefined && _lim !== undefined
    }

    const validMintInputRepeat = () => {
        return _isLoading === false && _repeat !== undefined && _repeat <= 20000n && _tokenIdStatus === 'valid' && _tokenId !== undefined && _symbol !== undefined && _max !== undefined && _decimal !== undefined && _lim !== undefined
    }

    const validDeployInput = () => {
        return _isLoading === false &&  _symbol !== undefined && _max !== undefined && _decimal !== undefined && _lim !== undefined
    }

    const [_result, setResult] = useState<string | undefined>(undefined)

    const deploy = async () => {
        try {
            setLoading(true)
            const signer = _signer as PandaSigner
            const symbol = toByteString(_symbol!, true)
            const total = _max! * BigInt(Math.pow(10, Number(_decimal!)));
            const artifact = await fetchArtifact(total);

            BSV20Mint.loadArtifact(artifact)
   
            const instance = new BSV20Mint(toByteString(''), symbol, total, _decimal!, _lim!)
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

            const utxo = await OneSatApis.fetchLatestByOrigin(_tokenId!, _network!);
            if(!utxo) {
                setResult(`No UTXO found for token id!`)
                return;
            }

            const instance = BSV20Mint.fromUTXO(utxo);

            await instance.connect(signer)

            instance.bindTxBuilder('mint', BSV20Mint.mintTxBuilder)

            const {tx} = await instance.methods.mint(
                Addr(_ordiAddress!.toByteString()),
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


    const fire = async () => {
        try {
            try {
                setLoading(true);
                await _signer.connect()
                const utxos = await _signer.provider!.listUnspent(_payAddress!);
                const tx = buildTx(utxos, _payAddress!, _mintFee,  _feePerKb, Number(_repeat!));
                const signedTx = await _signer.signTransaction(tx);
                const response = await fetch(`https://inscribe-api.scrypt.io/bsv20v2/batch_mint`, {
                    method: 'POST',
                    mode: "cors", 
                    cache: "no-cache", 
                    credentials: "same-origin", 
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        raw: signedTx.toString(),
                        origin: _tokenId!,
                        amt: Number(_lim!),
                        repeat: Number(_repeat!),
                        addr: _ordiAddress!.toString(),
                    })
                  })
                  .then((r) => r.json());
          
                const historyTxs = JSON.parse(localStorage.getItem("history") || "[]");
          
                historyTxs.push({
                  tx: tx.id,
                  time: new Date().getTime(),
                });
          
                localStorage.setItem("history_v2", JSON.stringify(historyTxs));
          
                setResult(
                  response?.code === 0
                    ? `Order Tx: ${tx.id}`
                    : `Error ${response.code}: ${response.message}`
                );
              } catch (e: any) {
                console.error("error", e);
                setResult(`${e.message ?? e}`);
              } finally {
                setLoading(false);
              }


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

                    <TextField label="Max Supply" 
                    type="number" 
                    variant="outlined"
                    placeholder="21000000"
                    fullWidth 
                    required 
                    sx={{ mt: 2 }} onChange={maxOnChange} />
                    <TextField
                    label="Limit Per Mint"
                    sx={{ mt: 2 }}
                    required
                    variant="outlined"
                    placeholder="1000"
                    fullWidth
                    onChange={limOnChange}
                    />
                    <TextField label="Decimal Precision" type="number" placeholder="0" InputProps={{ inputProps: { min: 0, max: 18 } }} variant="outlined" fullWidth required sx={{ mt: 2 }} onChange={decimalOnChange} />
                    <TextField label="Icon" variant="outlined" placeholder="1Sat Ordinals NFT origin" fullWidth sx={{ mt: 2 }} onChange={iconOnChange} />
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected() || !validDeployInput()} onClick={deploy}>
                        Deploy It!
                    </Button>
                </Box>
            )}

            {_mintOrDeploy === "mint" && (
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

                </Box>
            )}

            { _mintOrDeploy === "mint" && _network === bsv.Networks.testnet && (
                <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!connected() || !validMintInput()} onClick={mint}>
                        Mint It!
                </Button>
            )}

            { _mintOrDeploy === "mint"  && (
                    <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Repeat (Max: 20000, Fee: 100 sats/mint)"
                      defaultValue={1}
                      variant="outlined"
                      required
                      fullWidth
                      onChange={repeatOnChange}
                      disabled={!validMintInput()}
                    />
        
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        disabled={!connected() || !validMintInputRepeat()}
                        onClick={fire}
                      >
                        Fire!
                      </Button>
                      {_cost > 0 && validMintInputRepeat() ? (
                        <Typography color="primary" sx={{ mt: 3, ml: 3 }}>
                          {_price > 0
                            ? `Total Cost: ${_cost} sats, $${(
                                (_price * _cost) /
                                100000000
                              ).toFixed(5)}USD `
                            : `Total Cost: ${_cost} sats`}
                        </Typography>
                      ) : (
                        <></>
                      )}
                    </Box>
                  </Box>
                )
            }

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
