import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useContext,
} from "react";
import { PandaSigner, UTXO, bsv } from "scrypt-ts";
import { OrdiProvider } from "scrypt-ord";
export interface AppContextProps {
  network: bsv.Networks.Network | null;

  price: number;
  feePerKb: number;
  payAddress: bsv.Address | null;
  ordiAddress: bsv.Address | null;
  error: string | null;
  connect: () => void;
  signer: PandaSigner;
  connected: () => boolean;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
  const { children } = props;
  const [_price, setPrice] = useState<number>(0);

  const [_utxos, setUTXOs] = useState<UTXO[]>([]);
  const [_feePerKb, setFeePerKb] = useState<number>(1);

  const signer = useRef<PandaSigner>(new PandaSigner(new OrdiProvider()));

  const [_payAddress, setPayAddress] = useState<bsv.Address | null>(null);
  const [_ordiAddress, setOrdiAddress] = useState<bsv.Address | null>(null);
  const [_network, setNetwork] = useState<bsv.Networks.Network| null>(
    null
  );
  const [_error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      const { isAuthenticated, error } = await signer.current.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      setPayAddress(await signer.current.getDefaultAddress());
      setOrdiAddress(await signer.current.getOrdAddress());
      setNetwork(await signer.current.getNetwork());
      setError(null);
    } catch (e: any) {
      console.error("error", e);
      setError(`${e.message ?? e}`);
    }
  };

  useEffect(() => {
    fetch("https://api.whatsonchain.com/v1/bsv/main/exchangerate")
      .then((res) => res.json())
      .then((data) => {
        setPrice(data?.rate || 0);
      })
      .catch((e) => {
        setPrice(0);
        console.error("error", e);
      });
  }, []);

  useEffect(() => {
    if (_payAddress) {
      signer.current
        .listUnspent(_payAddress)
        .then((us) => {
          setUTXOs(us || []);
        })
        .catch((e) => {
          console.error("error", e);
        });
    }
  }, []);

  useEffect(() => {
    signer.current
      .provider!.getFeePerKb()
      .then((fpkb) => {
        setFeePerKb(fpkb);
      })
      .catch((e) => {
        console.error("error", e);
      });
  }, []);


  const connected = () => {
    return _network !== null && _payAddress !== null && _ordiAddress !== null
  };

  return (
    <AppContext.Provider
      value={{
        price: _price,
        payAddress: _payAddress,
        ordiAddress: _ordiAddress,
        network: _network,
        feePerKb: _feePerKb,
        error: _error,
        connect,
        signer: signer.current,
        connected
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppProvider = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within a AppProvider");
  }
  return context;
};
