import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NFT from './nft';
import BSV20 from "./bsv20";

function Home() {
    const navigate = useNavigate()
    return (
        <div className="App">
            <header className="App-header">
                <h1>1Sat Ordinals Demo</h1>
                <button onClick={() => navigate('/nft')}>NFT</button>
                <br />
                <button onClick={() => navigate('/bsv20')}>BSV20</button>
            </header>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path="/nft" element={<NFT />} />
                <Route path="/bsv20" element={<BSV20 />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
