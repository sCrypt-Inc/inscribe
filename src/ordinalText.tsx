import { useState, useRef } from "react";
import { Container, Box, Typography, Button, TextField } from "@mui/material";
import { OrdiNFTP2PKH } from "scrypt-ord";
import { Addr, PandaSigner } from "scrypt-ts";
import { Navigate } from "react-router-dom";
import { useAppProvider } from "./AppContext";

function OrdinalText(props) {

  const { ordiAddress: _ordiAddress,
    signer: _signer,
    connected
  } = useAppProvider();

  const [result, setResult] = useState<string | undefined>(undefined);

  const mint = async () => {
    try {
      const signer = _signer as PandaSigner;

      const value = text.current?.value;
      if (value !== undefined) {
        const instance = new OrdiNFTP2PKH(Addr(_ordiAddress!.toByteString()));
        console.log("value :", value);
        await instance.connect(signer);
        const inscriptionTx = await instance.inscribeText(value);
        setResult(`Text Inscription ID: ${inscriptionTx.id}`);
      } else {
        setResult("Error: Input value is undefined");
      }
    } catch (e: any) {
      console.error('error', e)
      setResult(`${e.message ?? e}`)
    }

    if (window.gtag) {
      window.gtag('event', 'inscribe-text');
    }
  };

  const text: React.RefObject<HTMLInputElement> = useRef(null);

  return (
    <Container maxWidth="md">
      {!connected() && <Navigate to="/" />}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Inscribe Text
        </Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        <TextField inputRef={text} label="any text here" variant="outlined" fullWidth />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!connected()}
          onClick={mint}>
          Inscribe It!
        </Button>
      </Box>
      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1">{result}</Typography>
        </Box>
      )}
    </Container>
  );
}

export default OrdinalText;
