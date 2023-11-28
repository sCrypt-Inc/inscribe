import { useRef, useState } from "react";
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
        <div className="App">
            <header className="App-header">
                <h1>BSV20</h1>

                <label>Network: {networkStr()}</label>
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
                        : (
                            <div>
                                <label>Symbol:</label>
                                <input type='text' value={_symbol?.toString() || ''} onChange={symbolOnChange} />
                                <br />
                                <label>Amount:</label>
                                <input type='number' value={_amount?.toString() || ''} onChange={amountOnChange} />
                                <br />
                                <label>Decimal:</label>
                                <input type='number' value={_decimal?.toString() || ''} onChange={decimalOnChange} />
                                <br />
                                <button onClick={mint}>Mint</button>
                            </div>
                        )
                }

            </header>
        </div>
    )
}

export default BSV20;
