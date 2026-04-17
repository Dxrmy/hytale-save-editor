import { useState, useEffect } from 'react';
import { Save as SaveIcon, Trash2, Edit3, ShieldAlert, Compass, Code, Settings as SettingsIcon } from 'lucide-react';

export default function WorldEditor({ save, onShowError, onShowSuccess }) {
  const [configData, setConfigData] = useState<any>(null);
  const [timeData, setTimeData] = useState<any>(null);
  const [instanceData, setInstanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const configPath = `${save.path}/universe/worlds/default/config.json`.replace(/\\/g, '/');
  const timePath = `${save.path}/universe/worlds/default/resources/Time.json`.replace(/\\/g, '/');
  const instancePath = `${save.path}/universe/worlds/default/resources/InstanceData.json`.replace(/\\/g, '/');

  useEffect(() => {
    loadData();
  }, [save]);

  const loadData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const resConf = await window.electronAPI.invokeHSE('get-player', ['--path', configPath]);
      // @ts-ignore
      const resTime = await window.electronAPI.invokeHSE('get-player', ['--path', timePath]);
      // @ts-ignore
      const resInst = await window.electronAPI.invokeHSE('get-player', ['--path', instancePath]);
      
      console.log("HSE Response Config:", resConf);
      console.log("HSE Response Time:", resTime);
      console.log("HSE Response Instance:", resInst);

      if (resConf && typeof resConf === 'object' && !resConf.error) setConfigData(resConf);
      else setConfigData(null);

      if (resTime && typeof resTime === 'object' && !resTime.error) setTimeData(resTime);
      else setTimeData(null);

      if (resInst && typeof resInst === 'object' && !resInst.error) setInstanceData(resInst);
      else setInstanceData(null);

    } catch (e) {
      console.error("Error loading world data:", e);
      onShowError('Critical failure loading world files');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('update-player', ['--path', configPath, '--data', JSON.stringify(configData)]);
      if (res.error) onShowError(res.error);
      else onShowSuccess('World config saved successfully!');
    } catch (e) {
      onShowError('Failed to save config');
    }
  };

  const saveTime = async () => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('update-player', ['--path', timePath, '--data', JSON.stringify(timeData)]);
      if (res.error) onShowError(res.error);
      else onShowSuccess('Time saved successfully!');
    } catch (e) {
      onShowError('Failed to save time');
    }
  };

  const saveInstance = async () => {
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('update-player', ['--path', instancePath, '--data', JSON.stringify(instanceData)]);
      if (res.error) onShowError(res.error);
      else onShowSuccess('Instance data saved successfully!');
    } catch (e) {
      onShowError('Failed to save instance data');
    }
  };

  const doRename = async () => {
    const newName = prompt("Enter new folder name for this save:");
    if (!newName) return;
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('rename-save', ['--save', save.name, '--newname', newName]);
      if (res.error) onShowError(res.error);
      else {
        onShowSuccess('Save renamed! Please refresh the save list.');
      }
    } catch(e) {
      onShowError('Failed to rename save');
    }
  };

  const doHardReset = async () => {
    const confirm = window.confirm("DANGER: This will delete ALL world progress, reset chunks, and reset player inventories to zero. Are you ABSOLUTELY sure?");
    if (!confirm) return;
    
    const newSeed = prompt("Enter a NEW integer seed for the world:");
    if (!newSeed || isNaN(parseInt(newSeed))) {
      onShowError("Invalid seed.");
      return;
    }
    
    try {
      // @ts-ignore
      const res = await window.electronAPI.invokeHSE('hard-reset', ['--save', save.name, '--seed', newSeed]);
      if (res.error) onShowError(res.error);
      else {
        onShowSuccess('World hard reset complete! A backup was automatically created.');
        loadData();
      }
    } catch(e) {
      onShowError('Failed to perform hard reset');
    }
  };

  const setConfig = (key: string, value: any) => setConfigData({ ...configData, [key]: value });
  const setTime = (key: string, value: any) => setTimeData({ ...timeData, [key]: value });
  const setInstanceValue = (key: string, value: any) => setInstanceData({ ...instanceData, [key]: value });

  if (loading) return <div className="p-8 text-gray-500 animate-pulse text-center font-sans">Loading world settings...</div>;

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-hytale-panel p-4 rounded-xl border border-gray-800 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 font-sans tracking-tight">World Config</h2>
          <p className="text-xs text-gray-500 font-mono opacity-60">{save.name}</p>
        </div>
        <div className="flex gap-2">
            <button onClick={loadData} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors">Reload Files</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        
        {/* World Config */}
        <div className="space-y-6">
          {configData ? (
            <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans"><SettingsIcon size={20} className="text-blue-400"/> General Settings</h3>
                <button onClick={saveConfig} className="flex items-center gap-2 bg-hytale-purple hover:bg-purple-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-lg shadow-purple-500/10">
                  <SaveIcon size={14} /> Save Config
                </button>
              </div>
              
              <div className="space-y-4 font-sans text-sm text-gray-200">
                <div className="flex items-center justify-between gap-4 p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/50">
                  <label className="text-gray-400 font-medium">Display Name</label>
                  <input type="text" value={configData?.DisplayName || ''} onChange={e => setConfig("DisplayName", e.target.value)} className="w-48 bg-[#121212] border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-hytale-purple transition-colors" />
                </div>
                <div className="flex items-center justify-between gap-4 p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/50">
                  <label className="text-gray-400 font-medium">Seed</label>
                  <input type="number" value={configData?.Seed || 0} onChange={e => setConfig("Seed", parseInt(e.target.value))} className="w-48 bg-[#121212] border border-gray-700 rounded-md px-3 py-1.5 text-white font-mono focus:outline-none focus:border-hytale-purple transition-colors" />
                </div>
                
                <div className="pt-4 space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Gameplay Toggles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                        { label: 'PVP Enabled', key: 'IsPvpEnabled' },
                        { label: 'Fall Damage', key: 'IsFallDamageEnabled' },
                        { label: 'Time Ticking', key: 'IsTicking' },
                        { label: 'NPC Spawning', key: 'IsSpawningNPC' }
                    ].map(item => (
                        <label key={item.key} className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/30 hover:border-hytale-purple/30 cursor-pointer transition-all group">
                            <span className="text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                            <input type="checkbox" checked={configData?.[item.key] || false} onChange={e => setConfig(item.key, e.target.checked)} className="w-4 h-4 accent-hytale-purple cursor-pointer" />
                        </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-hytale-panel p-8 rounded-xl border border-gray-800 text-gray-500 italic text-sm text-center border-dashed">config.json not found in save folder.</div>
          )}

          {timeData ? (
            <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-sans"><Compass size={20} className="text-orange-400"/> World Time</h3>
                <button onClick={saveTime} className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors font-medium">
                  <SaveIcon size={14} /> Save Time
                </button>
              </div>

              <div className="space-y-4 font-sans text-gray-200">
                <div className="flex flex-col gap-2 p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/50">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Current ISO Timestamp</label>
                  <input type="text" value={timeData?.Now || ''} onChange={e => setTime("Now", e.target.value)} className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-hytale-purple transition-colors" />
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Presets</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries({
                      "Dawn": "1970-01-01T06:00:00.000Z",
                      "Noon": "1970-01-01T12:00:00.000Z",
                      "Dusk": "1970-01-01T18:00:00.000Z",
                      "Midnight": "1970-01-01T00:00:00.000Z"
                    }).map(([name, val]) => (
                      <button key={name} onClick={() => setTime("Now", val)} className="bg-[#1e1e1e] hover:bg-gray-800 border border-gray-800 text-gray-300 py-2 rounded text-xs transition-all font-medium active:scale-95">
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-hytale-panel p-8 rounded-xl border border-gray-800 text-gray-500 italic text-sm text-center border-dashed">Time.json not found.</div>
          )}
        </div>

        <div className="space-y-6">
          {/* Instance Data */}
          {instanceData && typeof instanceData === 'object' ? (
            <div className="bg-hytale-panel p-6 rounded-xl border border-gray-800 shadow-sm font-sans flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Code size={20} className="text-green-400"/> Instance Variables</h3>
                <button onClick={saveInstance} className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] border border-gray-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors font-medium">
                  <SaveIcon size={14} /> Save Instance
                </button>
              </div>

              <div className="space-y-2 pr-2 custom-scrollbar text-gray-200">
                {Object.keys(instanceData).map(key => {
                  const val = instanceData[key];
                  const type = typeof val;
                  
                  if (type === 'boolean') {
                    return (
                      <label key={key} className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-700/50 group">
                        <span className="text-gray-300 truncate w-3/4 text-sm font-medium group-hover:text-white transition-colors" title={key}>{key}</span>
                        <input type="checkbox" checked={val} onChange={e => setInstanceValue(key, e.target.checked)} className="w-4 h-4 accent-hytale-purple cursor-pointer" />
                      </label>
                    );
                  } else if (type === 'number') {
                    return (
                      <div key={key} className="flex items-center justify-between gap-4 p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/30">
                        <label className="text-gray-400 font-medium truncate w-1/2 text-sm" title={key}>{key}</label>
                        <input type="number" value={val} onChange={e => setInstanceValue(key, parseFloat(e.target.value))} className="w-24 bg-[#121212] border border-gray-700 rounded-md px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-hytale-purple transition-colors text-right" />
                      </div>
                    );
                  } else if (type === 'string') {
                    return (
                      <div key={key} className="flex items-center justify-between gap-4 p-3 bg-[#1e1e1e] rounded-lg border border-gray-800/30">
                        <label className="text-gray-400 font-medium truncate w-1/3 text-sm" title={key}>{key}</label>
                        <input type="text" value={val} onChange={e => setInstanceValue(key, e.target.value)} className="flex-1 bg-[#121212] border border-gray-700 rounded-md px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-hytale-purple transition-colors" />
                      </div>
                    );
                  }
                  return null;
                })}
                {Object.keys(instanceData).length === 0 && <div className="text-gray-500 italic text-sm text-center py-8">No variables found in InstanceData.json.</div>}
              </div>
            </div>
          ) : (
            <div className="bg-hytale-panel p-8 rounded-xl border border-gray-800 text-gray-500 italic text-sm text-center border-dashed">InstanceData.json not found.</div>
          )}

          {/* Dangerous Ops */}
          <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20 shadow-sm font-sans">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2"><ShieldAlert size={20} /> Danger Zone</h3>
            <div className="space-y-3">
              <button onClick={doRename} className="w-full flex items-center justify-between px-4 py-3 bg-[#1e1e1e] hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-300 transition-all text-sm group">
                <span className="flex items-center gap-2 group-hover:text-white transition-colors text-gray-200"><Edit3 size={16} className="text-gray-500 group-hover:text-white" /> Rename Save Directory</span>
              </button>
              <button onClick={doHardReset} className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all text-sm group">
                <span className="flex items-center gap-2 font-bold text-red-400"><Trash2 size={16} /> Wipe World & Reset Seed</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
