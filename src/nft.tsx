import { useState } from 'react';
import './App.css';
import { OrdiNFTP2PKH } from 'scrypt-ord';
import { Addr, PandaSigner } from 'scrypt-ts';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { Container, Box, Typography, Button } from '@mui/material';
import { Navigate, Link } from 'react-router-dom';

function NFT(props) {

  const { _ordiAddress, _signer } = props

  const connected = () => {
    return _ordiAddress !== undefined
  }

  const [images, setImages] = useState<ImageListType>([])

  const onImagesChange = (imageList: ImageListType) => {
    setImages(imageList);
  }

  const [_result, setResult] = useState<string | undefined>(undefined)

  const inscribe = async () => {
    try {
      const signer = _signer as PandaSigner
      const instance = new OrdiNFTP2PKH(Addr(_ordiAddress!.toByteString()))
      await instance.connect(signer)

      const image = images[0]
      const b64 = Buffer.from(await image.file!.arrayBuffer()).toString('base64')
      const inscribeTx = await instance.inscribeImage(b64, image.file!.type)

      setResult(`Inscribe Tx: ${inscribeTx.id}`)
      setImages([])
    } catch (e) {
      setResult(`${e}`)
    }
  }

  return (
    <Container maxWidth="md">
      {!connected() && (<Navigate to="/" />)}
      <Box sx={{ my: 4 }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Inscribe Image
        </Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        {
          <ImageUploading value={images} onChange={onImagesChange} dataURLKey="data_url" >
            {
              ({ imageList, onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    <Button variant="contained" color="primary" onClick={onImageUpload}>
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
                          <Box sx={{ position: 'relative' }}>
                            <img src={image['data_url']} alt="" width='100%' />
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
                          </Box>
                          <Button variant="contained" color="primary" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }} onClick={inscribe}>
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
      {
        !_result
          ? ''
          : (<Box sx={{ mt: 3 }}><Typography variant="body1">{_result}</Typography></Box>)
      }
    </Container>
  );
}

export default NFT;
