import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  ShieldCheck, 
  PlusCircle, 
  ShoppingCart,
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

const BASE_PRICES = [
  { id: '0.5g', weight: 0.5, sell: 1347500, buy: 1202500 },
  { id: '1g', weight: 1, sell: 2595000, buy: 2405000 },
  { id: '2g', weight: 2, sell: 5130000, buy: 4810000 },
  { id: '3g', weight: 3, sell: 7670000, buy: 7215000 },
  { id: '5g', weight: 5, sell: 12750000, buy: 12025000 },
  { id: '10g', weight: 10, sell: 25445000, buy: 24050000 },
  { id: '25g', weight: 25, sell: 63487000, buy: 60125000 },
  { id: '50g', weight: 50, sell: 126895000, buy: 120250000 },
  { id: '100g', weight: 100, sell: 253712000, buy: 240500000 },
  { id: '250g', weight: 250, sell: 634015000, buy: 601250000 },
  { id: '500g', weight: 500, sell: 1267820000, buy: 1202500000 },
  { id: '1000g', weight: 1000, sell: 2535600000, buy: 2405000000 },
];

const formatIDR = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const LivePriceCell = ({ price, className = '' }) => {
  const [flash, setFlash] = useState('none'); // 'up', 'down', 'none'
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (prevPriceRef.current !== price) {
      if (price > prevPriceRef.current) {
        setFlash('up');
      } else if (price < prevPriceRef.current) {
        setFlash('down');
      }
      prevPriceRef.current = price;
      
      const timer = setTimeout(() => setFlash('none'), 600);
      return () => clearTimeout(timer);
    }
  }, [price]);

  let flashClass = 'text-slate-300';
  if (flash === 'up') flashClass = 'bg-emerald-500/20 text-emerald-400 font-bold transition-none';
  if (flash === 'down') flashClass = 'bg-rose-500/20 text-rose-400 font-bold transition-none';

  return (
    <td className={`px-4 py-3 whitespace-nowrap text-right transition-colors duration-500 rounded-sm ${flashClass} ${className}`}>
      {formatIDR(price)}
    </td>
  );
};

const EscrowModal = ({ listing, onClose, onComplete }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      if (step === 1) {
        // Auto progress from Processing to Done
        setTimeout(() => {
          setStep(3);
        }, 2000);
      }
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-yellow-500" />
            Secure P2P Escrow
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">Anda akan membeli emas dari user P2P. Dana akan ditahan di rekening bersama (Escrow) EmasP2P sampai transaksi selesai.</p>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gramasi</span>
                <span className="font-bold text-white">{listing.grammage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Seller</span>
                <span className="font-bold text-white">{listing.seller}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-base mt-2">
                <span className="text-slate-300">Total Pembayaran</span>
                <span className="font-bold text-yellow-400">{formatIDR(listing.price)}</span>
              </div>
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Kunci Harga & Bayar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="text-slate-300">Memproses pembayaran ke Escrow...</p>
            <p className="text-xs text-slate-500 text-center">Menghubungkan ke payment gateway dan mengamankan dana.</p>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 size={64} className="text-emerald-500" />
            <h4 className="text-xl font-bold text-white">Dana Diamankan!</h4>
            <p className="text-slate-300 text-center text-sm mb-4">
              Pembayaran {formatIDR(listing.price)} berhasil ditahan di Escrow.<br/>
              Seller telah dinotifikasi untuk mengirimkan emas/sertifikat kepada Anda.
            </p>
            <button 
              onClick={handleNext}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Tutup & Lihat Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [marketFactor, setMarketFactor] = useState(1.0);
  const [livePrices, setLivePrices] = useState([]);
  const [listings, setListings] = useState([
    { id: 1, grammage: '5g', price: 12500000, seller: 'TraderIndo88', timestamp: Date.now() - 3600000 },
    { id: 2, grammage: '10g', price: 24950000, seller: 'GoldMinerJkt', timestamp: Date.now() - 1800000 },
  ]);
  
  // Create Listing Form State
  const [selectedGram, setSelectedGram] = useState('1g');
  const [formPrice, setFormPrice] = useState('');
  
  // Escrow State
  const [selectedListing, setSelectedListing] = useState(null);

  // Simulate WebSocket Tick Engine
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setMarketFactor(prev => {
        // Random walk with mean reversion to 1.0
        const drift = (1.0 - prev) * 0.05; 
        const shock = (Math.random() - 0.5) * 0.0006; // +/- 0.03% max tick volatility
        return prev + drift + shock;
      });
    }, 1500); // Update every 1.5s for real-time feel

    return () => clearInterval(tickInterval);
  }, []);

  // Compute live prices based on the market factor
  useEffect(() => {
    const calculatedPrices = BASE_PRICES.map(base => {
      const liveSell = Math.round(base.sell * marketFactor);
      const liveBuy = Math.round(base.buy * marketFactor);
      const p2pFair = Math.round((liveSell + liveBuy) / 2);
      
      return {
        ...base,
        liveSell,
        liveBuy,
        p2pFair
      };
    });
    setLivePrices(calculatedPrices);
  }, [marketFactor]);

  // Get active price data for the form
  const activePriceData = livePrices.find(p => p.id === selectedGram) || livePrices[1] || BASE_PRICES[1];
  
  const handleCreateListing = (e) => {
    e.preventDefault();
    const priceNum = parseInt(formPrice.replace(/\D/g, ''), 10);
    
    if (!priceNum || priceNum < activePriceData.liveBuy || priceNum > activePriceData.liveSell) {
      return; // Invalid price (handled by UI validation)
    }

    const newListing = {
      id: Date.now(),
      grammage: selectedGram,
      price: priceNum,
      seller: 'Anda (Current User)',
      timestamp: Date.now()
    };

    setListings(prev => [newListing, ...prev]);
    setFormPrice('');
  };

  const handlePriceInput = (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setFormPrice(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-yellow-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-900 font-black text-xl">
              E
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                EmasP2P <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-500 font-medium tracking-wider uppercase border border-yellow-500/30">Live Market</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <Activity size={16} className={marketFactor !== 1.0 ? "text-emerald-400 animate-pulse" : ""} />
              Socket: Connected
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 font-medium">
              Saldo: Rp 50.000.000
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <LineChart className="text-yellow-500" />
              Live Market Board
            </h2>
            <span className="text-xs text-slate-400">Harga real-time berdasar volatilitas pasar global</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
            {/* Blurry glow effect behind the table */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-yellow-500/5 blur-3xl pointer-events-none rounded-full"></div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-semibold">Gramasi</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-right text-rose-400/80">
                      Harga Antam (Jual)<br/>
                      <span className="text-[10px] font-normal text-slate-500">Batas Atas P2P</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold text-right text-yellow-500/80">
                      Harga Adil P2P<br/>
                      <span className="text-[10px] font-normal text-slate-500">Tengah (Mid-Market)</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold text-right text-emerald-400/80">
                      Harga Buyback<br/>
                      <span className="text-[10px] font-normal text-slate-500">Batas Bawah P2P</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {livePrices.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading live data...</td></tr>
                  ) : (
                    livePrices.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap border-r border-slate-800/50">
                          {item.id}
                        </td>
                        <LivePriceCell price={item.liveSell} />
                        <LivePriceCell price={item.p2pFair} className="text-yellow-400 font-medium bg-slate-950/30" />
                        <LivePriceCell price={item.liveBuy} />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Listing Form */}
          <section className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl sticky top-24">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="text-yellow-500" />
                Buat Listing Jual
              </h2>
              
              <form onSubmit={handleCreateListing} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Pilih Gramasi Emas</label>
                  <select 
                    value={selectedGram}
                    onChange={(e) => setSelectedGram(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  >
                    {livePrices.map(p => (
                      <option key={p.id} value={p.id}>{p.id} Antam LM</option>
                    ))}
                  </select>
                </div>

                {livePrices.length > 0 && (
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Activity size={12}/> Live Limits:</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Maksimal (Antam):</span>
                      <span className="text-rose-400 font-medium">{formatIDR(activePriceData?.liveSell)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Minimal (Buyback):</span>
                      <span className="text-emerald-400 font-medium">{formatIDR(activePriceData?.liveBuy)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-yellow-500/80">Rekomendasi P2P:</span>
                      <span className="text-yellow-400 font-bold">{formatIDR(activePriceData?.p2pFair)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Harga Jual Anda (Rp)</label>
                  <input 
                    type="text" 
                    value={formPrice ? new Intl.NumberFormat('id-ID').format(formPrice) : ''}
                    onChange={handlePriceInput}
                    placeholder="Contoh: 1.250.000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg font-medium focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  />
                  
                  {/* Validation Feedback */}
                  {formPrice && activePriceData && (
                    <div className="mt-2 text-xs">
                      {parseInt(formPrice, 10) > activePriceData.liveSell ? (
                         <p className="text-rose-400 flex items-center gap-1"><AlertCircle size={12}/> Harga terlalu mahal (Melebihi Antam)</p>
                      ) : parseInt(formPrice, 10) < activePriceData.liveBuy ? (
                         <p className="text-rose-400 flex items-center gap-1"><AlertCircle size={12}/> Harga terlalu murah (Di bawah Buyback)</p>
                      ) : (
                         <p className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> Harga Valid untuk P2P</p>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!formPrice || (activePriceData && (parseInt(formPrice, 10) > activePriceData.liveSell || parseInt(formPrice, 10) < activePriceData.liveBuy))}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                >
                  Listing Sekarang
                </button>
              </form>
            </div>
          </section>

          {/* Active Listings Grid */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ArrowRightLeft className="text-yellow-500" />
              Listing P2P Aktif (Live)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                  Belum ada listing saat ini. Jadilah yang pertama!
                </div>
              ) : (
                listings.map((item) => {
                  // Find current live metrics for this grammage
                  const liveMetric = livePrices.find(p => p.id === item.grammage);
                  const isGoodDeal = liveMetric && item.price <= liveMetric.p2pFair;

                  return (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 rounded-xl p-5 shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-800 flex flex-col items-center justify-center border border-slate-700 group-hover:border-yellow-500/30 transition-colors">
                            <span className="text-yellow-500 font-bold text-sm">{item.grammage}</span>
                            <span className="text-[10px] text-slate-400 uppercase">Antam</span>
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm font-medium">{item.seller}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <ShieldCheck size={12} className="text-emerald-500"/> Verified
                            </p>
                          </div>
                        </div>
                        {isGoodDeal && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">
                            Best Deal
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mb-5">
                        <p className="text-2xl font-bold text-white tracking-tight">
                          {formatIDR(item.price)}
                        </p>
                        {liveMetric && (
                          <p className="text-xs text-slate-500">
                            Spread vs Antam: <span className="text-emerald-400 font-medium">Hemat {formatIDR(liveMetric.liveSell - item.price)}</span>
                          </p>
                        )}
                      </div>

                      <button 
                        onClick={() => setSelectedListing(item)}
                        disabled={item.seller === 'Anda (Current User)'}
                        className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {item.seller === 'Anda (Current User)' ? 'Listing Anda' : (
                          <><ShoppingCart size={16} className="text-yellow-500" /> Beli via Escrow</>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Render Escrow Modal if a listing is selected */}
      {selectedListing && (
        <EscrowModal 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
          onComplete={() => {
            setListings(prev => prev.filter(l => l.id !== selectedListing.id));
            setSelectedListing(null);
          }}
        />
      )}
    </div>
  );
}