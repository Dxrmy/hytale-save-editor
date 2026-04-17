import { useState, useEffect } from 'react';
import { Search, Compass, Trash2, MapPin, Box, Ghost, FileText } from 'lucide-react';

export default function RegionExplorer({ save, onShowError }) {
  const [regions, setRegions] = useState<string[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    loadRegionsAndScan();
  }, [save]);

  const loadRegionsAndScan = async () => {
    setLoading(true);
    setAllData([]);
    try {
      // @ts-ignore
      const regRes = await window.electronAPI.invokeHSE('list-regions', ['--save', save.name]);
      if (regRes.error) {
        onShowError(regRes.error);
      } else {
        setRegions(regRes);
        // Automatically scan all regions
        // @ts-ignore
        const scanRes = await window.electronAPI.invokeHSE('scan-all-regions', ['--save', save.name]);
        if (scanRes.error) {
            onShowError(scanRes.error);
        } else {
            setAllData(scanRes || []);
        }
      }
    } catch (e) {
      onShowError('Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  const resetRegion = async (region: string) => {
    const confirm = window.confirm(`Are you sure you want to delete ${region}? The game will regenerate this area from scratch next time you visit it.`);
    if (!confirm) return;
    
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('safe-chunk-reset', ['--save', save.name, '--chunkfile', region]);
      if (res.error) onShowError(res.error);
      else {
        loadRegionsAndScan();
      }
    } catch (e) {
      onShowError('Failed to delete region');
    }
  };

  const filteredData = allData.map(c => {
    let matches = [];
    if (c.type === 'Chest') {
        const items = c.inventory?.Inventory?.Items || [];
        if (Array.isArray(items)) {
          matches = items.filter(i => (i.Id || '').toLowerCase().includes(searchQuery.toLowerCase()));
        } else {
          matches = Object.values(items).filter((i: any) => (i.Id || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return { ...c, matches };
    } else if (c.type === 'Spawner') {
        const spawnerName = (c.spawner?.Prefab || c.spawner?.EntityId || 'Unknown').toLowerCase();
        if (spawnerName.includes(searchQuery.toLowerCase())) {
            return { ...c, matches: [c.spawner] };
        }
    } else if (c.type === 'Sign') {
        const signText = (c.sign?.Text || '').toLowerCase();
        if (signText.includes(searchQuery.toLowerCase())) {
            return { ...c, matches: [c.sign] };
        }
    }
    return { ...c, matches: [] };
  }).filter(c => (filterType === 'All' || c.type === filterType) && (searchQuery === '' || c.matches?.length > 0));

  return (
    <div className="flex flex-col h-full space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-hytale-panel p-4 rounded-xl border border-gray-800 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Compass size={22} className="text-hytale-purple"/> Global Region Explorer</h2>
          <p className="text-sm text-gray-500 font-mono">{save.name}</p>
        </div>
        <div className="flex gap-2">
            <button onClick={loadRegionsAndScan} className="px-4 py-2 bg-[#252525] border border-gray-700 text-white rounded hover:bg-gray-800 transition-colors">
                Rescan All
            </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-[500px]">
        
        {/* Region List */}
        <div className="w-64 bg-hytale-panel rounded-xl border border-gray-800 shadow-sm flex flex-col shrink-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider p-4 border-b border-gray-800">Chunk Management</h3>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {regions.map(r => {
              return (
                <div key={r} className="group relative flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    {r}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetRegion(r); }}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Safe Chunk Reset (Delete Region)"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {regions.length === 0 && !loading && <div className="p-4 text-center text-gray-500 text-sm">No regions found.</div>}
          </div>
        </div>

        {/* Global Results */}
        <div className="flex-1 bg-hytale-panel rounded-xl border border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1e1e1e] flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-[#121212] border border-gray-700 text-white rounded-md px-3 py-1.5 outline-none focus:border-hytale-purple cursor-pointer"
              >
                  <option value="All">All Entities</option>
                  <option value="Chest">Chests</option>
                  <option value="Spawner">Spawners</option>
                  <option value="Sign">Signs</option>
              </select>
              <h3 className="text-white font-medium ml-2">
                Found {filteredData.length} records
              </h3>
            </div>
            
            <div className="flex items-center bg-[#121212] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-hytale-purple transition-colors w-64">
              <Search size={16} className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search items, entities, text..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm text-white w-full focus:outline-none placeholder-gray-600"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
                <Compass size={48} className="mb-4 opacity-20" />
                <span>Scanning all BSON data across {regions.length} regions...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Box size={48} className="mb-4 opacity-10" />
                <span>No records found matching query.</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a1a1a] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800">
                      <th className="px-4 py-3 font-medium">Region</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Data / Contents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredData.map((c, idx) => {
                      const Icon = c.type === 'Chest' ? Box : c.type === 'Spawner' ? Ghost : FileText;
                      
                      return (
                        <tr key={`${idx}`} className="hover:bg-[#1e1e1e] transition-colors items-start">
                          <td className="px-4 py-3 text-sm font-mono text-hytale-purple align-top w-48">
                            <div className="text-xs text-gray-500">{c.region_file}</div>
                            C{c.chunk[0]},{c.chunk[1]} [{c.pos_index}]
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200 align-top w-32">
                            <div className="flex items-center gap-2">
                                <Icon size={14} className={c.type === 'Chest' ? 'text-orange-400' : c.type === 'Spawner' ? 'text-red-400' : 'text-blue-400'}/>
                                {c.type}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 align-top">
                            {c.type === 'Chest' && (
                                <div className="flex flex-wrap gap-2">
                                    {(searchQuery ? c.matches : (Array.isArray(c.inventory?.Inventory?.Items) ? c.inventory?.Inventory?.Items : Object.values(c.inventory?.Inventory?.Items || {}))).map((item: any, i: number) => (
                                        <span key={i} className="bg-[#111] px-2 py-1 rounded border border-gray-700 flex gap-2">
                                            <span className="text-gray-200">{item.Id || 'Unknown'}</span>
                                            <span className="text-green-400 font-mono">x{item.Quantity || item.Count || 1}</span>
                                        </span>
                                    ))}
                                    {(!c.inventory?.Inventory?.Items || Object.keys(c.inventory.Inventory.Items).length === 0) && <span className="text-gray-500 italic">Empty</span>}
                                </div>
                            )}
                            {c.type === 'Spawner' && (
                                <span className="text-red-300 font-mono">{c.spawner?.Prefab || c.spawner?.EntityId || 'Unknown Entity'}</span>
                            )}
                            {c.type === 'Sign' && (
                                <span className="text-blue-300 italic">"{c.sign?.Text || ''}"</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
