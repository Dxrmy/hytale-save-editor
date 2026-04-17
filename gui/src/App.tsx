import { useState, useEffect } from 'react';
import { User, Map as MapIcon, Database, RefreshCcw, Settings, Compass, ShieldAlert, Edit3 } from 'lucide-react';
import PlayerEditor from './components/PlayerEditor';
import WorldEditor from './components/WorldEditor';
import RegionExplorer from './components/RegionExplorer';

interface Save {
  name: string;
  path: string;
}

interface Player {
  name: string;
  path: string;
}

function App() {
  const [saves, setSaves] = useState<Save[]>([]);
  const [selectedSave, setSelectedSave] = useState<Save | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [view, setView] = useState<'players' | 'world' | 'regions'>('players');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSaves();
  }, []);

  const fetchSaves = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.electronAPI.invokeHSE('list-saves', []);
      if (Array.isArray(result)) {
        setSaves(result);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to communicate with backend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectSave = async (save: Save) => {
    if (selectedSave?.path === save.path) return;
    
    setSelectedSave(save);
    setSelectedPlayer(null);
    setView('players');
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.electronAPI.invokeHSE('list-players', ['--save', save.name]);
      if (Array.isArray(result)) {
        setPlayers(result);
      } else {
        setPlayers([]);
      }
    } catch (err) {
      setError('Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  const handleShowSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-hytale-dark text-gray-200 font-sans selection:bg-hytale-purple selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#151515] shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-hytale-purple rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Database size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Hytale Save Editor</h1>
        </div>
        <button 
          onClick={fetchSaves}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-full border border-gray-800 transition-all uppercase tracking-widest active:scale-95"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Sync Saves
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-800 bg-[#121212] overflow-y-auto py-4 flex flex-col shrink-0 scrollbar-hide">
          <h2 className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">World Registry</h2>
          <div className="px-3 space-y-1">
            {saves.map(save => {
              const isSelected = selectedSave?.path === save.path;
              return (
                <div key={save.path} className="flex flex-col">
                  <button 
                    onClick={() => selectSave(save)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl transition-all ${
                      isSelected ? 'bg-hytale-purple text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                    }`}
                  >
                    <Database size={16} className={isSelected ? 'text-white' : 'text-gray-600'} />
                    <span className="font-bold text-sm truncate">{save.name}</span>
                  </button>
                  
                  {/* Sub-menu */}
                  {isSelected && (
                    <div className="ml-6 mt-2 mb-3 pl-4 border-l-2 border-gray-800 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {[
                          { id: 'players', label: 'Players', icon: User },
                          { id: 'world', label: 'World Config', icon: Settings },
                          { id: 'regions', label: 'Region Explorer', icon: Compass }
                      ].map(item => (
                        <button 
                            key={item.id}
                            onClick={(e) => { e.stopPropagation(); setView(item.id as any); setSelectedPlayer(null); }}
                            className={`flex items-center gap-3 w-full px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                            view === item.id && !selectedPlayer ? 'text-hytale-purple bg-hytale-purple/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                            }`}
                        >
                            <item.icon size={14} />
                            {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {saves.length === 0 && !loading && (
              <div className="px-6 py-8 text-xs text-gray-600 text-center italic leading-relaxed border border-gray-800 border-dashed rounded-xl mx-3">
                No Hytale saves detected in %AppData%.
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#161616] relative custom-scrollbar">
          {!selectedSave ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center border border-gray-800 shadow-2xl">
                <Database size={40} className="opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Initialization Required</p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Select a save from the registry to begin</p>
              </div>
            </div>
          ) : view === 'world' ? (
            <div className="p-8 w-full">
              <WorldEditor save={selectedSave} onShowError={setError} onShowSuccess={handleShowSuccess} />
            </div>
          ) : view === 'regions' ? (
            <div className="p-6 h-full w-full">
              <RegionExplorer save={selectedSave} onShowError={setError} />
            </div>
          ) : selectedPlayer ? (
            <div className="p-8 w-full flex flex-col min-h-full max-w-6xl mx-auto">
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="self-start mb-6 text-hytale-purple hover:text-purple-400 flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-widest group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Players
              </button>
              <PlayerEditor playerPath={selectedPlayer.path} saveName={selectedSave.name} onShowError={setError} onShowSuccess={handleShowSuccess} />
            </div>
          ) : (
            <div className="p-8 w-full max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-hytale-purple/10 border border-hytale-purple/20 rounded-2xl flex items-center justify-center">
                    <User size={24} className="text-hytale-purple" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{selectedSave.name}</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Active Player Directory</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {players.map(player => (
                  <button 
                    key={player.path}
                    onClick={() => setSelectedPlayer(player)}
                    className="flex flex-col items-center p-6 bg-hytale-panel border border-gray-800/50 rounded-2xl hover:border-hytale-purple hover:bg-gray-800 transition-all group shadow-sm active:scale-95"
                  >
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all border border-gray-800 group-hover:border-hytale-purple/50 shadow-inner">
                      <User size={32} className="text-gray-500 group-hover:text-hytale-purple transition-colors" />
                    </div>
                    <div className="text-[10px] text-gray-500 break-all font-mono group-hover:text-gray-300 transition-colors px-2 py-1 bg-black/30 rounded uppercase tracking-tighter w-full text-center">{player.name}</div>
                  </button>
                ))}
                {players.length === 0 && !loading && (
                  <div className="col-span-full py-20 text-center text-gray-600 bg-hytale-panel rounded-3xl border-2 border-gray-800 border-dashed">
                    <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-50 text-gray-400">Void Entity Detected</p>
                    <p className="text-xs uppercase tracking-widest text-gray-700">No players found in this save directory</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Loading & Toasts */}
      {loading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-hytale-purple text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl z-[100] border border-white/10 flex items-center gap-3">
          <RefreshCcw size={14} className="animate-spin" /> Data Transferring
        </div>
      )}

      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/30 text-green-400 px-8 py-4 rounded-2xl shadow-2xl z-[100] font-bold text-sm backdrop-blur-xl animate-in slide-in-from-top-4 duration-500 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          {success}
        </div>
      )}

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-400 px-8 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-6 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-red-500" />
            <span className="font-bold text-sm tracking-tight">{typeof error === 'string' ? error : 'Backend Link Severed'}</span>
          </div>
          <button onClick={() => setError(null)} className="text-white bg-red-500/20 hover:bg-red-500/40 w-6 h-6 flex items-center justify-center rounded-lg transition-all font-black">✕</button>
        </div>
      )}
    </div>
  );
}

export default App;
