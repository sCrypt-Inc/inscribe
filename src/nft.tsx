import { useRef, useState } from 'react';
import './App.css';
import { OrdiNFTP2PKH, OrdiProvider } from 'scrypt-ord';
import { Addr, bsv, PandaSigner } from 'scrypt-ts';
import ImageUploading, { ImageListType } from 'react-images-uploading';

function NFT() {

  const [_payAddress, setPayAddress] = useState<bsv.Address | undefined>(undefined)
  const [_ordiAddress, setOrdiAddress] = useState<bsv.Address | undefined>(undefined)
  const [_network, setNetwork] = useState<bsv.Networks.Network | undefined>(undefined)

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
    <div className="App">
      <header className="App-header">
        <h1>NFT</h1>
        <label>Network: {_network?.toString() || 'not connected'}</label>
        <label>Pay Address: {_payAddress?.toString() || 'not connected'}</label>
        <label>Ordi Address: {_ordiAddress?.toString() || 'not connected'}</label>

        {
          connected()
            ? ''
            : <button onClick={connect}>Connect</button>
        }

        {
          !connected()
            ? ''
            :
            <ImageUploading value={images} onChange={onChange} dataURLKey="data_url" >
              {
                ({ imageList, onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
                  <div>
                    <button style={isDragging ? { color: 'red' } : undefined} onClick={onImageUpload} {...dragProps} >
                      Select an image
                    </button>
                    &nbsp;
                    <button onClick={onImageRemoveAll}>Remove selected</button>
                    {
                      imageList.map(
                        (image, index) => (
                          <div key={index} className="image-item">
                            <img src={image['data_url']} alt="" width="100" />
                            <div className="image-item__btn-wrapper">
                              <button onClick={() => inscribe()}>Inscribe</button>
                            </div>
                          </div>
                        )
                      )
                    }
                  </div>
                )
              }
            </ImageUploading>
        }

      </header>
    </div>
  );
}

export default NFT;
