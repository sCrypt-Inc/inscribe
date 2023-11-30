import { useRef, useState } from 'react';
import './App.css';
import { OrdiNFTP2PKH, OrdiProvider } from 'scrypt-ord';
import { Addr, bsv, PandaSigner } from 'scrypt-ts';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { Container, Box, Typography, Button, TextField, Grid, Link } from '@mui/material';

function NFT() {

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

  const [images, setImages] = useState<ImageListType>([])

  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
  }

  const inscribe = async () => {
    const signer = _signer.current as PandaSigner
    const instance = new OrdiNFTP2PKH(Addr(_ordiAddress!.toByteString()))
    await instance.connect(signer)

    const image = images[0]
    const b64 = Buffer.from(await image.file!.arrayBuffer()).toString('base64')
    const inscribeTx = await instance.inscribeImage(b64, image.file!.type)
    console.log(`Inscribe Tx: ${inscribeTx.id}`)

    setImages([])
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ pb: 4 }}>
          <Link href="/" > &lt;- Back to Home </Link>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Image NFT Inscription
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
        {
          !connected()
            ? ''
            :
            <ImageUploading value={images} onChange={onChange} dataURLKey="data_url" >
              {
                ({ imageList, onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                      <Button variant="contained" color="primary" disabled={!connected()} onClick={onImageUpload}>
                        Select an image
                      </Button>
                      <Button variant='outlined' color="secondary" onClick={onImageRemoveAll}>
                        Remove selected
                      </Button>
                    </Box>
                    {
                      imageList.map(
                        (image, index) => (
                          <Box sx={{ position: 'relative', width: '100%', mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }} key={index}>
                            <Box sx={{ position: 'relative'}}>
                              <img src={image['data_url']} alt="" width='100%'/>
                              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
                            </Box>
                            <Button variant="contained" color="primary" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }} disabled={!connected()} onClick={inscribe}>
                              Inscribe It!
                            </Button>
                          </Box>
                        )
                      )
                    }
                  </>
                )
              }
            </ImageUploading>
        }
      </Box>
    </Container>
  );
}

export default NFT;
