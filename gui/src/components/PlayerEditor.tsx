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
          if (res && !res.error) {
              if (res.items) setDynamicItems(res.items);
              if (res.memories) setDynamicMemories(res.memories);
          }
      } catch (e) {
          console.error("Failed to load dynamic assets:", e);
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

  const toggleRecipe = (recipeId: string) => {
    const recipesPath = ["Components", "Player", "PlayerData", "KnownRecipes"];
    const recipes = getNested(data, recipesPath) || [];
    if (recipes.includes(recipeId)) {
        setNested(recipesPath, recipes.filter(r => r !== recipeId));
    } else {
        setNested(recipesPath, [...recipes, recipeId]);
    }
  };

  const toggleMemory = (memoryId: string) => {
      const memoryPath = ["Components", "PlayerMemories", "Memories"];
      const memories = getNested(data, memoryPath) || [];
      const existingIdx = memories.findIndex((m: any) => m === memoryId || m.id === memoryId);
      if (existingIdx > -1) {
          setNested(memoryPath, memories.filter((_: any, i: number) => i !== existingIdx));
      } else {
          setNested(memoryPath, [...memories, memoryId]);
      }
  };

  if (loading) return <div className="text-gray-500 animate-pulse">Loading player data...</div>;
  if (!data) return <div className="text-red-400">No data found or failed to parse.</div>;

  // Skill detection logic
  const potentialSkillPaths = [
    ["Components", "Progression"],
    ["Components", "Skills"],
    ["Components", "Player", "PlayerData", "Progression"],
    ["Components", "EndgamePlayerData"],
    ["Components", "Player", "PlayerData"]
  ];
  let skillsPath = null;
  for (const path of potentialSkillPaths) {
    if (getNested(data, path) !== undefined) {
      skillsPath = path;
      break;
    }
  }
  const skillsObj = skillsPath ? getNested(data, skillsPath) : {};

  // Reputation
  const repPath = ["Components", "Player", "PlayerData", "ReputationData"];
  const reputation = getNested(data, repPath) || {};

  // Mod / Custom Components Detection
  const knownComponents = [
    "Nameplate", "BackpackInventory", "HotbarInventory", "StorageInventory", 
    "Transform", "EntityStats", "Player", "UIComponentList", "hotbar_manager", 
    "HitboxCollision", "UniqueItemUsages", "Instance", "UUID", "ArmorInventory", 
    "HeadRotation", "DisplayName", "UtilityInventory", "Progression", "Skills", "EndgamePlayerData", "PlayerMemories"
  ];
  const modComponents = Object.keys(data.Components || {}).filter(k => !knownComponents.includes(k));

  const knownRecipes = getNested(data, ["Components", "Player", "PlayerData", "KnownRecipes"]) || [];
  const knownMemories = getNested(data, ["Components", "PlayerMemories", "Memories"]) || [];

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex justify-between items-center bg-hytale-panel p-4 rounded-xl border border-gray-800 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Player Editor</h2>
          <p className="text-sm text-gray-500 font-mono">{playerPath.split(/[\/\\]/).pop()}</p>
        </div>
        <button 
          onClick={savePlayer}
          className="flex items-center gap-2 bg-hytale-purple hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <SaveIcon size={18} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vital Stats & Position */}
        <div className="space-y-6">
          <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><Heart size={20} className="text-red-400"/> Vital Stats</h3>
            <div className="space-y-3">
              {renderStat('Health', ["Components", "EntityStats", "Stats", "Health", "Value"])}
              {renderStat('Mana', ["Components", "EntityStats", "Stats", "Mana", "Value"])}
              {renderStat('Stamina', ["Components", "EntityStats", "Stats", "Stamina", "Value"])}
            </div>
          </div>

          <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><MapPin size={20} className="text-green-400"/> Position & Navigation</h3>
            <div className="space-y-3 mb-4">
              {renderStat('X', ["Components", "Transform", "Position", "X"])}
              {renderStat('Y', ["Components", "Transform", "Position", "Y"])}
              {renderStat('Z', ["Components", "Transform", "Position", "Z"])}
            </div>
            
            {waypoints.length > 0 ? (
              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 font-sans uppercase tracking-widest text-[10px]">Teleport to Waypoint</h4>
                <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {waypoints.map((wp: any, i) => (
                    <button 
                      key={i}
                      onClick={() => teleportToWaypoint(wp.Name || 'Unnamed')}
                      className="bg-[#1e1e1e] hover:bg-hytale-purple/20 border border-gray-700 hover:border-hytale-purple text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-xs transition-colors font-medium"
                    >
                      {wp.Name || 'Unnamed'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-800 pt-4 mt-4 text-sm text-gray-500 italic">
                No waypoints found in world.
              </div>
            )}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans"><Package size={20} className="text-orange-400"/> Inventories</h3>
            <select 
              onChange={(e) => setActiveInventory(e.target.value)} 
              value={activeInventory}
              className="bg-[#121212] border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-hytale-purple cursor-pointer font-sans"
            >
              <option value="HotbarInventory">Hotbar</option>
              <option value="StorageInventory">Storage</option>
              <option value="BackpackInventory">Backpack</option>
              <option value="ArmorInventory">Armor</option>
              <option value="UtilityInventory">Utility</option>
            </select>
          </div>
          
          <div className="flex-1 bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 overflow-y-auto max-h-[400px] custom-scrollbar">
            <div className="space-y-2">
              {Object.entries(getNested(data, ["Components", activeInventory, "Inventory", "Items"]) || {}).map(([slot, item]: [string, any]) => (
                <div key={slot} className="flex gap-3 items-center bg-[#222] p-2 rounded-md border border-gray-700/50 hover:border-gray-600 transition-colors">
                  <span className="w-12 text-center text-[10px] font-black text-gray-500 bg-[#151515] py-1 rounded uppercase tracking-tighter">S{slot}</span>
                  <input 
                    type="text" 
                    value={item.Id || ''} 
                    onChange={(e) => setNested(["Components", activeInventory, "Inventory", "Items", slot, "Id"], e.target.value)}
                    className="flex-1 bg-[#111] border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-hytale-purple font-mono"
                    placeholder="Item ID"
                  />
                  <input 
                    type="number" 
                    value={item.Quantity || item.Count || 1} 
                    onChange={(e) => setNested(["Components", activeInventory, "Inventory", "Items", slot, "Quantity"], parseInt(e.target.value))}
                    className="w-16 bg-[#111] border border-gray-700 rounded px-2 py-1 text-xs text-center text-green-400 font-mono focus:outline-none focus:border-hytale-purple"
                  />
                </div>
              ))}
              {!getNested(data, ["Components", activeInventory, "Inventory", "Items"]) && (
                <div className="text-center py-8 text-gray-500 text-sm italic">
                  This inventory section is empty or not initialized.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipes & Quests */}
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><BookOpen size={20} className="text-blue-400"/> Recipes & Quests</h3>
          
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium text-sm font-sans">Known Recipes</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                  {knownRecipes.length} Unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => {
                      const existing = getNested(data, ["Components", "Player", "PlayerData", "KnownRecipes"]) || [];
                      setNested(["Components", "Player", "PlayerData", "KnownRecipes"], [...new Set([...existing, ...dynamicItems])]);
                      onShowSuccess(`Unlocked all ${dynamicItems.length} items!`);
                  }} className="bg-[#252525] hover:bg-[#333] border border-gray-700 text-gray-300 py-2 rounded-md text-xs transition-colors font-sans uppercase font-bold tracking-wider">
                      Unlock All
                  </button>
                  <button 
                    onClick={() => setShowRecipeModal(true)}
                    className="bg-hytale-purple/10 hover:bg-hytale-purple/20 border border-hytale-purple/30 text-hytale-purple py-2 rounded-md text-xs transition-colors font-black uppercase tracking-widest"
                  >
                      Registry
                  </button>
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium text-sm font-sans">Active Objectives</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                  {getNested(data, ["Components", "Player", "PlayerData", "ActiveObjectiveUUIDs"])?.length || 0} Active
                </span>
              </div>
              <button onClick={() => {
                  setNested(["Components", "Player", "PlayerData", "ActiveObjectiveUUIDs"], []);
                  setNested(["Components", "ObjectiveHistory"], {});
                  onShowSuccess("Cleared all quests and history!");
              }} className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-md text-xs transition-colors font-sans uppercase font-bold tracking-wider">
                  <Trash2 size={14} /> Clear Quests & History
              </button>
            </div>
          </div>
        </div>

        {/* Skills & Reputation */}
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><Shield size={20} className="text-yellow-400"/> Skills & Reputation</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Skill Levels</h4>
              {skillsPath && Object.keys(skillsObj).length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(skillsObj).map(([k, v]: [string, any]) => {
                    if (typeof v !== 'object') return null;
                    const subKey = ["Level", "Value", "Current", "Experience", "Exp"].find(sk => v[sk] !== undefined);
                    if (!subKey) return null;

                    return (
                      <div key={k} className="flex items-center justify-between gap-4 bg-[#1e1e1e] p-2 rounded-md border border-gray-800/50">
                        <span className="text-[11px] font-bold text-gray-400 truncate uppercase tracking-tighter" title={k}>{k}</span>
                        <input 
                          type="number" 
                          value={v[subKey]} 
                          onChange={(e) => setNested([...skillsPath, k, subKey], parseFloat(e.target.value))}
                          className="w-20 bg-[#121212] border border-gray-700 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:border-hytale-purple font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No skills component found.</p>
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Faction Reputation</h4>
              {Object.keys(reputation).length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(reputation).map(([faction, val]: [string, any]) => (
                    <div key={faction} className="flex items-center justify-between gap-4 bg-[#1e1e1e] p-2 rounded-md border border-gray-800/50">
                      <span className="text-[11px] font-bold text-gray-400 truncate uppercase tracking-tighter">{faction}</span>
                      <input 
                        type="number" 
                        value={val} 
                        onChange={(e) => setNested([...repPath, faction], parseFloat(e.target.value))}
                        className="w-20 bg-[#121212] border border-gray-700 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:border-hytale-purple font-mono"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No reputation data found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Memories Unlocker Section */}
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><Brain size={20} className="text-purple-400"/> Memories Unlocker</h3>
          <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium text-sm font-sans">Discovery Progress</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-black uppercase tracking-widest">
                  {knownMemories.length} / {dynamicMemories.length || '---'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => {
                      const existing = getNested(data, ["Components", "PlayerMemories", "Memories"]) || [];
                      setNested(["Components", "PlayerMemories", "Memories"], [...new Set([...existing, ...dynamicMemories])]);
                      onShowSuccess(`Unlocked all ${dynamicMemories.length} memories!`);
                  }} className="bg-[#252525] hover:bg-[#333] border border-gray-700 text-gray-300 py-2 rounded-md text-xs transition-colors font-sans uppercase font-bold tracking-wider">
                      Unlock All
                  </button>
                  <button 
                    onClick={() => setShowMemoryModal(true)}
                    className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 py-2 rounded-md text-xs transition-colors font-black uppercase tracking-widest"
                  >
                      Bestiary
                  </button>
              </div>
            </div>
        </div>

        {/* Advanced Mod Components */}
        <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-sans"><Code size={20} className="text-gray-400"/> System Components</h3>
          
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
            {modComponents.map(comp => (
              <div key={comp} className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded-lg border border-gray-800/50 hover:border-hytale-purple/50 transition-colors">
                <div className="truncate pr-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{comp}</h4>
                </div>
                <button 
                  onClick={() => startEditingRaw(comp)}
                  className="px-2 py-1 bg-gray-800 hover:bg-hytale-purple hover:text-white text-gray-300 text-[9px] rounded transition-all uppercase font-black tracking-widest"
                >
                  Raw Edit
                </button>
              </div>
            ))}
            {modComponents.length === 0 && <p className="text-xs text-gray-500 italic">No custom/mod components found.</p>}
          </div>
        </div>

      </div>

      {/* Raw JSON Editor Modal */}
      {editingRaw && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-hytale-panel border border-gray-800 rounded-xl w-full max-w-2xl flex flex-col h-[80vh] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl">
              <h3 className="text-white font-medium flex items-center gap-2 font-sans"><Code size={18} className="text-hytale-purple"/> System Registry: {editingRaw}</h3>
              <button onClick={() => setEditingRaw(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <textarea 
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="flex-1 bg-[#121212] text-green-400 font-mono text-xs p-4 focus:outline-none resize-none custom-scrollbar"
              spellCheck={false}
            />
            <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => setEditingRaw(null)} className="px-4 py-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest">Cancel</button>
              <button onClick={saveRawComponent} className="px-6 py-2 bg-hytale-purple hover:bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-500/20 text-xs font-black uppercase tracking-widest">Commit Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Unlocker Modal */}
      {showRecipeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-hytale-panel border border-gray-800 rounded-xl w-full max-w-4xl flex flex-col h-[85vh] shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 bg-[#1a1a1a] flex justify-between items-center">
                    <div>
                        <h3 className="text-white text-xl font-bold flex items-center gap-2 font-sans"><BookOpen size={22} className="text-hytale-purple"/> Global Recipe Registry</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black opacity-60">{knownRecipes.length} records active in player state</p>
                    </div>
                    <button onClick={() => setShowRecipeModal(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
                  </div>
                  
                  <div className="p-4 bg-[#121212] border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter registry by ID..."
                            value={recipeSearch}
                            onChange={e => setRecipeSearch(e.target.value)}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-hytale-purple transition-all font-mono text-sm"
                        />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-[#161616] custom-scrollbar">
                    {(dynamicItems.length > 0 ? dynamicItems : []).filter(r => r.toLowerCase().includes(recipeSearch.toLowerCase())).map(recipeId => {
                        const isUnlocked = knownRecipes.includes(recipeId);
                        return (
                            <button 
                                key={recipeId}
                                onClick={() => toggleRecipe(recipeId)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all active:scale-95 ${
                                    isUnlocked 
                                    ? 'bg-hytale-purple/10 border-hytale-purple/40 text-white' 
                                    : 'bg-[#1e1e1e] border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400'
                                }`}
                            >
                                <span className={`text-[10px] font-bold font-mono truncate mr-2 ${isUnlocked ? 'text-hytale-purple' : ''}`}>{recipeId.replace('hytale:', '').replace(/_/g, ' ')}</span>
                                {isUnlocked ? <CheckCircle2 size={14} className="text-hytale-purple shrink-0 shadow-lg shadow-purple-500/20" /> : <Circle size={14} className="shrink-0 opacity-10" />}
                            </button>
                        );
                    })}
                  </div>

                  <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-between items-center shrink-0">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setNested(["Components", "Player", "PlayerData", "KnownRecipes"], [...new Set([...knownRecipes, ...dynamicItems])]);
                            }}
                            className="px-4 py-2 bg-hytale-purple/20 text-hytale-purple border border-hytale-purple/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-hytale-purple hover:text-white transition-all"
                        >
                            Sync All
                        </button>
                        <button 
                            onClick={() => {
                                setNested(["Components", "Player", "PlayerData", "KnownRecipes"], []);
                            }}
                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                            Wipe All
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowRecipeModal(false)}
                        className="px-8 py-2 bg-hytale-purple text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                    >
                        Confirm Sync
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* Memory Unlocker Modal */}
      {showMemoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-hytale-panel border border-gray-800 rounded-xl w-full max-w-3xl flex flex-col h-[80vh] shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 bg-[#1a1a1a] flex justify-between items-center">
                    <div>
                        <h3 className="text-white text-xl font-bold flex items-center gap-2 font-sans"><Brain size={22} className="text-purple-400"/> Echoes of Orbis: Bestiary</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black opacity-60">{knownMemories.length} / {dynamicMemories.length || '---'} creatures cataloged</p>
                    </div>
                    <button onClick={() => setShowMemoryModal(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
                  </div>
                  
                  <div className="p-4 bg-[#121212] border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter Bestiary by creature..."
                            value={memorySearch}
                            onChange={e => setMemorySearch(e.target.value)}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-mono text-sm"
                        />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#161616] custom-scrollbar">
                    {(dynamicMemories.length > 0 ? dynamicMemories : []).filter(m => m.toLowerCase().includes(memorySearch.toLowerCase())).map(memoryId => {
                        const isUnlocked = knownMemories.some((m: any) => m === memoryId || m.id === memoryId);
                        return (
                            <button 
                                key={memoryId}
                                onClick={() => toggleMemory(memoryId)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all active:scale-95 ${
                                    isUnlocked 
                                    ? 'bg-purple-500/10 border-purple-500/40 text-white' 
                                    : 'bg-[#1e1e1e] border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400'
                                }`}
                            >
                                <span className={`text-xs font-black font-mono truncate mr-2 uppercase tracking-tighter ${isUnlocked ? 'text-purple-400' : ''}`}>{memoryId.replace('hytale:', '').replace(/_/g, ' ')}</span>
                                {isUnlocked ? <CheckCircle2 size={16} className="text-purple-400 shrink-0 shadow-lg shadow-purple-500/20" /> : <Circle size={16} className="shrink-0 opacity-10" />}
                            </button>
                        );
                    })}
                  </div>

                  <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-between items-center shrink-0">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setNested(["Components", "PlayerMemories", "Memories"], [...dynamicMemories]);
                            }}
                            className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                        >
                            Log All
                        </button>
                        <button 
                            onClick={() => {
                                setNested(["Components", "PlayerMemories", "Memories"], []);
                            }}
                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                            Wipe Bestiary
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowMemoryModal(false)}
                        className="px-8 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                    >
                        Save Bestiary
                    </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
