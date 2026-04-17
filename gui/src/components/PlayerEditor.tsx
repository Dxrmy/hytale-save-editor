import { useState, useEffect } from 'react';
import { Save as SaveIcon, Trash2, Heart, Shield, Package, BookOpen, MapPin, Code, Search, CheckCircle2, Circle, Brain } from 'lucide-react';

export default function PlayerEditor({ playerPath, saveName, onShowError, onShowSuccess }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeInventory, setActiveInventory] = useState('HotbarInventory');
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [editingRaw, setEditingRaw] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memorySearch, setMemorySearch] = useState('');
  
  const [dynamicItems, setDynamicItems] = useState<string[]>([]);
  const [dynamicMemories, setDynamicMemories] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPlayer();
    loadWaypoints();
    loadDynamicAssets();
  }, [playerPath]);

  const loadPlayer = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('get-player', ['--path', playerPath]);
      if (res.error) onShowError(res.error);
      else setData(res);
    } catch (e) {
      onShowError('Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const loadWaypoints = async () => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('list-waypoints', ['--save', saveName]);
      if (!res.error && Array.isArray(res)) setWaypoints(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDynamicAssets = async () => {
      try {
          // @ts-ignore
          const res = await window.electronAPI.invokeHSE('list-dynamic-assets', []);
          if (res && res.error) {
              console.error("Dynamic asset error:", res.error);
              onShowError(`Asset Scan Failed: ${res.error}`);
          } else if (res) {
              if (res.items) setDynamicItems(res.items);
              if (res.memories) setDynamicMemories(res.memories);
              if (res.translations) setTranslations(res.translations);
          }
      } catch (e) {
          console.error("Failed to load dynamic assets:", e);
          onShowError("Failed to communicate with asset scanner.");
      }
  };

  const teleportToWaypoint = async (wpName: string) => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('teleport-player', ['--save', saveName, '--path', playerPath, '--waypoint', wpName]);
      if (res.error) onShowError(res.error);
      else {
        onShowSuccess(`Teleported to ${wpName}!`);
        loadPlayer(); // Refresh pos
      }
    } catch (e) {
      onShowError('Failed to teleport');
    }
  };

  const savePlayer = async () => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('update-player', ['--path', playerPath, '--data', JSON.stringify(data)]);
      if (res.error) onShowError(res.error);
      else onShowSuccess('Player saved successfully!');
    } catch (e) {
      onShowError('Failed to save player');
    }
  };

  const getNested = (obj: any, keys: string[]) => keys.reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
  
  const setNested = (keys: string[], value: any) => {
    const newData = { ...data };
    let curr = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
    setData(newData);
  };

  const renderStat = (label: string, path: string[]) => {
    const val = getNested(data, path);
    if (val === undefined) return null;
    return (
      <div className="flex items-center justify-between gap-4 p-2 bg-[#1e1e1e] rounded-lg border border-gray-800">
        <label className="text-gray-400 font-medium w-24">{label}</label>
        <input 
          type="number" 
          value={val} 
          onChange={(e) => setNested(path, parseFloat(e.target.value))}
          className="flex-1 bg-[#121212] border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-hytale-purple transition-colors"
        />
      </div>
    );
  };

  const startEditingRaw = (compKey: string) => {
    setEditingRaw(compKey);
    setRawText(JSON.stringify(data.Components[compKey], null, 2));
  };

  const saveRawComponent = () => {
    if (!editingRaw) return;
    try {
      const parsed = JSON.parse(rawText);
      const newData = { ...data };
      newData.Components[editingRaw] = parsed;
      setData(newData);
      setEditingRaw(null);
    } catch (e) {
      onShowError("Invalid JSON format");
    }
  };

  // --- REGISTRY LOGIC ---

  const normalizeId = (id: string) => {
      if (!id) return "";
      const lower = id.toLowerCase().replace("hytale:", "");
      return lower;
  };

  const getDisplayName = (id: string, type: 'item' | 'npc') => {
      const rawId = id.replace("hytale:", "");
      // Try various translation key patterns
      const keys = [
          `server.items.${rawId}.name`,
          `server.npcRoles.${rawId}.name`,
          `server.items.${rawId}`,
          `server.npcRoles.${rawId}`,
          rawId
      ];
      for (const k of keys) {
          if (translations[k]) return translations[k];
      }
      // Formatting fallback: replace _ with space and capitalize
      return rawId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isRecipeUnlocked = (recipeId: string) => {
      const recipes = getNested(data, ["Components", "Player", "PlayerData", "KnownRecipes"]) || [];
      const target = normalizeId(recipeId);
      return recipes.some((r: string) => normalizeId(r) === target);
  };

  const toggleRecipe = (recipeId: string) => {
    const recipesPath = ["Components", "Player", "PlayerData", "KnownRecipes"];
    const recipes = getNested(data, recipesPath) || [];
    const target = normalizeId(recipeId);
    
    const existingIdx = recipes.findIndex((r: string) => normalizeId(r) === target);
    if (existingIdx > -1) {
        setNested(recipesPath, recipes.filter((_: any, i: number) => i !== existingIdx));
    } else {
        setNested(recipesPath, [...recipes, recipeId.replace("hytale:", "")]);
    }
  };

  const isMemoryUnlocked = (memoryId: string) => {
      const memories = getNested(data, ["Components", "PlayerMemories", "Memories"]) || [];
      const target = normalizeId(memoryId);
      return memories.some((m: any) => {
          const role = (typeof m === 'string' ? m : m.NPCRole || m.id || m.Id || '').toLowerCase();
          return normalizeId(role) === target;
      });
  };

  const toggleMemory = (memoryId: string) => {
      const memoryPath = ["Components", "PlayerMemories", "Memories"];
      const memories = getNested(data, memoryPath) || [];
      const target = normalizeId(memoryId);
      
      const existingIdx = memories.findIndex((m: any) => {
          const role = (typeof m === 'string' ? m : m.NPCRole || m.id || m.Id || '').toLowerCase();
          return normalizeId(role) === target;
      });

      if (existingIdx > -1) {
          setNested(memoryPath, memories.filter((_: any, i: number) => i !== existingIdx));
      } else {
          setNested(memoryPath, [...memories, {
              "Id": "NPC",
              "NPCRole": memoryId.replace("hytale:", ""),
              "CapturedTimestamp": Date.now()
          }]);
      }
  };

  if (loading) return <div className="text-gray-500 animate-pulse">Loading player data...</div>;
  if (!data) return <div className="text-red-400">No data found or failed to parse.</div>;

  const skillsPath = [
    ["Components", "Progression"], ["Components", "Skills"], ["Components", "Player", "PlayerData", "Progression"], ["Components", "EndgamePlayerData"]
  ].find(p => getNested(data, p) !== undefined);
  const skillsObj = skillsPath ? getNested(data, skillsPath) : {};

  const reputation = getNested(data, ["Components", "Player", "PlayerData", "ReputationData"]) || {};
  const modComponents = Object.keys(data.Components || {}).filter(k => ![
    "Nameplate", "BackpackInventory", "HotbarInventory", "StorageInventory", "Transform", "EntityStats", 
    "Player", "UIComponentList", "hotbar_manager", "HitboxCollision", "UniqueItemUsages", "Instance", 
    "UUID", "ArmorInventory", "HeadRotation", "DisplayName", "UtilityInventory", "Progression", "Skills", 
    "EndgamePlayerData", "PlayerMemories"
  ].includes(k));

  const knownRecipes = getNested(data, ["Components", "Player", "PlayerData", "KnownRecipes"]) || [];
  const knownMemories = getNested(data, ["Components", "PlayerMemories", "Memories"]) || [];

  return (
    <div className="space-y-6 pb-12 relative font-sans">
      <div className="flex justify-between items-center bg-hytale-panel p-4 rounded-xl border border-gray-800 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Player Editor</h2>
          <p className="text-xs text-gray-500 font-mono">{playerPath.split(/[\/\\]/).pop()}</p>
        </div>
        <button onClick={savePlayer} className="flex items-center gap-2 bg-hytale-purple hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20">
          <SaveIcon size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Heart size={20} className="text-red-400"/> Vital Stats</h3>
            <div className="space-y-3">
              {renderStat('Health', ["Components", "EntityStats", "Stats", "Health", "Value"])}
              {renderStat('Mana', ["Components", "EntityStats", "Stats", "Mana", "Value"])}
              {renderStat('Stamina', ["Components", "EntityStats", "Stats", "Stamina", "Value"])}
            </div>
        </div>

        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MapPin size={20} className="text-green-400"/> Waypoints</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {renderStat('X', ["Components", "Transform", "Position", "X"])}
                {renderStat('Y', ["Components", "Transform", "Position", "Y"])}
                {renderStat('Z', ["Components", "Transform", "Position", "Z"])}
            </div>
            <div className="border-t border-gray-800 pt-4 max-h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2">
                {waypoints.map((wp: any, i) => (
                    <button key={i} onClick={() => teleportToWaypoint(wp.Name)} className="bg-[#1e1e1e] hover:bg-hytale-purple/20 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-xs transition-colors">
                        {translations[wp.Name] || wp.Name || 'Waypoint'}
                    </button>
                ))}
                {waypoints.length === 0 && <p className="text-xs text-gray-500 italic">No waypoints found.</p>}
            </div>
        </div>

        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Package size={20} className="text-orange-400"/> Inventories</h3>
            <select onChange={(e) => setActiveInventory(e.target.value)} value={activeInventory} className="bg-[#121212] border border-gray-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none">
              <option value="HotbarInventory">Hotbar</option>
              <option value="StorageInventory">Storage</option>
              <option value="BackpackInventory">Backpack</option>
              <option value="ArmorInventory">Armor</option>
              <option value="UtilityInventory">Utility</option>
            </select>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 overflow-y-auto max-h-[300px] custom-scrollbar space-y-2">
              {Object.entries(getNested(data, ["Components", activeInventory, "Inventory", "Items"]) || {}).map(([slot, item]: [string, any]) => (
                <div key={slot} className="flex gap-2 items-center bg-[#222] p-2 rounded border border-gray-700/50">
                  <span className="w-8 text-[10px] font-black text-gray-500">S{slot}</span>
                  <input type="text" value={item.Id || ''} onChange={(e) => setNested(["Components", activeInventory, "Inventory", "Items", slot, "Id"], e.target.value)} className="flex-1 bg-[#111] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200" />
                  <input type="number" value={item.Quantity || item.Count || 1} onChange={(e) => setNested(["Components", activeInventory, "Inventory", "Items", slot, "Quantity"], parseInt(e.target.value))} className="w-12 bg-[#111] border border-gray-700 rounded px-1 py-1 text-xs text-center text-green-400" />
                </div>
              ))}
          </div>
        </div>

        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={20} className="text-blue-400"/> Progression</h3>
          <div className="space-y-4">
            <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 font-medium text-sm">Recipes</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-black">{knownRecipes.length} Known</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setNested(["Components", "Player", "PlayerData", "KnownRecipes"], [...new Set([...knownRecipes, ...dynamicItems])])} className="bg-[#252525] hover:bg-[#333] border border-gray-700 text-gray-300 py-2 rounded text-xs">Unlock All</button>
                  <button onClick={() => setShowRecipeModal(true)} className="bg-hytale-purple/10 hover:bg-hytale-purple/20 border border-hytale-purple/30 text-hytale-purple py-2 rounded text-xs font-bold">Open Registry</button>
              </div>
            </div>
            <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 font-medium text-sm">Bestiary</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-black">{knownMemories.length} Collected</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setNested(["Components", "PlayerMemories", "Memories"], [...dynamicMemories])} className="bg-[#252525] hover:bg-[#333] border border-gray-700 text-gray-300 py-2 rounded text-xs">Unlock All</button>
                  <button onClick={() => setShowMemoryModal(true)} className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 py-2 rounded text-xs font-bold">Open Bestiary</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Skills</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(skillsObj).map(([k, v]: [string, any]) => {
                        const subKey = ["Level", "Value", "Current", "Experience", "Exp"].find(sk => v?.[sk] !== undefined);
                        if (!subKey) return null;
                        return (
                            <div key={k} className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded border border-gray-800">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">{k}</span>
                                <input type="number" value={v[subKey]} onChange={(e) => setNested([...skillsPath!, k, subKey], parseFloat(e.target.value))} className="w-16 bg-[#121212] border border-gray-700 rounded px-2 py-0.5 text-xs text-white text-right" />
                            </div>
                        );
                    })}
                </div>
            </div>
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Factions</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(reputation).map(([f, val]: [string, any]) => (
                        <div key={f} className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded border border-gray-800">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{f}</span>
                            <input type="number" value={val} onChange={(e) => setNested(["Components", "Player", "PlayerData", "ReputationData", f], parseFloat(e.target.value))} className="w-16 bg-[#121212] border border-gray-700 rounded px-2 py-0.5 text-xs text-white text-right" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Registry Modal */}
      {showRecipeModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-hytale-panel border border-gray-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
                      <h3 className="text-white text-xl font-black uppercase tracking-tight">Global Item Registry</h3>
                      <button onClick={() => setShowRecipeModal(false)} className="text-gray-500 hover:text-white">✕ Close</button>
                  </div>
                  <div className="p-4 bg-black/20"><input type="text" placeholder="Search item registry..." value={recipeSearch} onChange={e => setRecipeSearch(e.target.value)} className="w-full bg-[#121212] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-hytale-purple transition-all font-mono" /></div>
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 custom-scrollbar bg-[#111]">
                      {dynamicItems.filter(id => id.toLowerCase().includes(recipeSearch.toLowerCase())).map(id => {
                          const active = isRecipeUnlocked(id);
                          return (
                              <button key={id} onClick={() => toggleRecipe(id)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${active ? 'bg-hytale-purple/20 border-hytale-purple/50 text-white' : 'bg-[#1e1e1e] border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                                  <span className="text-[10px] font-bold uppercase truncate pr-2">{getDisplayName(id, 'item')}</span>
                                  {active ? <CheckCircle2 size={14} className="text-hytale-purple" /> : <Circle size={14} className="opacity-10" />}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Bestiary Modal */}
      {showMemoryModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-hytale-panel border border-gray-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
                      <h3 className="text-white text-xl font-black uppercase tracking-tight">Bestiary (Memories)</h3>
                      <button onClick={() => setShowMemoryModal(false)} className="text-gray-500 hover:text-white">✕ Close</button>
                  </div>
                  <div className="p-4 bg-black/20"><input type="text" placeholder="Search Bestiary..." value={memorySearch} onChange={e => setMemorySearch(e.target.value)} className="w-full bg-[#121212] border border-gray-800 rounded-xl py-3 px-4 text-white outline-none focus:border-purple-500 transition-all font-mono" /></div>
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 gap-2 custom-scrollbar bg-[#111]">
                      {dynamicMemories.filter(id => id.toLowerCase().includes(memorySearch.toLowerCase())).map(id => {
                          const active = isMemoryUnlocked(id);
                          return (
                              <button key={id} onClick={() => toggleMemory(id)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${active ? 'bg-purple-500/20 border-purple-500/50 text-white' : 'bg-[#1e1e1e] border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                                  <span className="text-[11px] font-bold uppercase truncate pr-2">{getDisplayName(id, 'npc')}</span>
                                  {active ? <CheckCircle2 size={14} className="text-purple-400" /> : <Circle size={14} className="opacity-10" />}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Raw JSON Modal */}
      {editingRaw && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-8">
            <div className="bg-hytale-panel border border-gray-800 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800 bg-[#1a1a1a] flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-gray-500">Registry Edit: {editingRaw}</span>
                    <button onClick={() => setEditingRaw(null)}>✕</button>
                </div>
                <textarea value={rawText} onChange={e => setRawText(e.target.value)} className="flex-1 bg-black text-green-500 font-mono text-xs p-6 outline-none" spellCheck={false} />
                <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-end"><button onClick={saveRawComponent} className="bg-hytale-purple text-white px-6 py-2 rounded-lg text-xs font-black uppercase">Commit</button></div>
            </div>
        </div>
      )}
    </div>
  );
}
