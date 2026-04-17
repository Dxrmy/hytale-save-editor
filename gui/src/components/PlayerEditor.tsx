import { useState, useEffect } from 'react';
import { Save as SaveIcon, Trash2, Heart, Shield, Package, BookOpen, MapPin, Code, Search, CheckCircle2, Circle, Brain } from 'lucide-react';

const COMPREHENSIVE_RECIPES = [
  // --- WEAPONS ---
  "hytale:wooden_sword", "hytale:stone_sword", "hytale:iron_sword", "hytale:gold_sword", "hytale:diamond_sword", 
  "hytale:copper_sword", "hytale:silver_sword", "hytale:thorium_sword", "hytale:cobalt_sword", "hytale:obsidian_sword", "hytale:void_sword",
  "hytale:wooden_axe", "hytale:stone_axe", "hytale:iron_axe", "hytale:gold_axe", "hytale:diamond_axe",
  "hytale:wooden_mace", "hytale:stone_mace", "hytale:iron_mace", "hytale:gold_mace", "hytale:diamond_mace",
  "hytale:wooden_dagger", "hytale:stone_dagger", "hytale:iron_dagger", "hytale:gold_dagger", "hytale:diamond_dagger",
  "hytale:wooden_bow", "hytale:stone_bow", "hytale:iron_bow", "hytale:gold_bow", "hytale:diamond_bow",
  "hytale:fire_staff", "hytale:ice_staff", "hytale:lightning_staff", "hytale:void_staff", "hytale:nature_staff",
  "hytale:iron_shield", "hytale:gold_shield", "hytale:diamond_shield", "hytale:wooden_shield",
  "hytale:arrow", "hytale:poison_arrow", "hytale:fire_arrow",
  "hytale:crude_sword", "hytale:crude_hatchet", "hytale:crude_pickaxe", "hytale:crude_daggers", "hytale:crude_battleaxe", "hytale:crude_mace", "hytale:crude_shortbow", "hytale:crude_hammer",
  "hytale:copper_battleaxe", "hytale:copper_daggers", "hytale:copper_mace", "hytale:copper_shortbow",
  "hytale:iron_battleaxe", "hytale:iron_daggers", "hytale:iron_mace", "hytale:iron_shortbow", "hytale:iron_hand_crossbow",
  "hytale:thorium_battleaxe", "hytale:thorium_daggers", "hytale:thorium_mace", "hytale:thorium_shortbow",
  "hytale:cobalt_battleaxe", "hytale:cobalt_daggers", "hytale:cobalt_mace", "hytale:cobalt_shortbow",
  "hytale:adamantite_battleaxe", "hytale:adamantite_daggers", "hytale:adamantite_mace", "hytale:adamantite_shortbow", "hytale:adamantite_sword",
  "hytale:mithril_battleaxe", "hytale:mithril_daggers", "hytale:mithril_mace", "hytale:mithril_shortbow", "hytale:mithril_sword",

  // --- TOOLS ---
  "hytale:wooden_pickaxe", "hytale:stone_pickaxe", "hytale:iron_pickaxe", "hytale:gold_pickaxe", "hytale:diamond_pickaxe",
  "hytale:copper_pickaxe", "hytale:silver_pickaxe", "hytale:thorium_pickaxe", "hytale:cobalt_pickaxe", "hytale:obsidian_pickaxe",
  "hytale:wooden_shovel", "hytale:stone_shovel", "hytale:iron_shovel", "hytale:gold_shovel", "hytale:diamond_shovel",
  "hytale:wooden_hoe", "hytale:stone_hoe", "hytale:iron_hoe", "hytale:gold_hoe", "hytale:diamond_hoe",
  "hytale:wooden_hammer", "hytale:stone_hammer", "hytale:iron_hammer", "hytale:gold_hammer", "hytale:diamond_hammer",
  "hytale:fishing_rod", "hytale:shears", "hytale:bucket", "hytale:water_bucket", "hytale:lava_bucket",
  "hytale:iron_hatchet", "hytale:iron_shovel", "hytale:thorium_hatchet", "hytale:cobalt_hatchet", "hytale:adamantite_hatchet", "hytale:adamantite_pickaxe", "hytale:mithril_hatchet", "hytale:mithril_pickaxe",
  "hytale:copper_hatchet", "hytale:crude_hoe", "hytale:copper_hoe", "hytale:iron_hoe", "hytale:crude_shears", "hytale:empty_watering_can",

  // --- ARMOR ---
  "hytale:leather_helmet", "hytale:leather_chestplate", "hytale:leather_leggings", "hytale:leather_boots",
  "hytale:iron_helmet", "hytale:iron_chestplate", "hytale:iron_leggings", "hytale:iron_boots",
  "hytale:gold_helmet", "hytale:gold_chestplate", "hytale:gold_leggings", "hytale:gold_boots",
  "hytale:diamond_helmet", "hytale:diamond_chestplate", "hytale:diamond_leggings", "hytale:diamond_boots",
  "hytale:copper_helmet", "hytale:copper_chestplate", "hytale:copper_leggings", "hytale:copper_boots",
  "hytale:void_helmet", "hytale:void_chestplate", "hytale:void_leggings", "hytale:void_boots",
  "hytale:iron_helm", "hytale:iron_cuirass", "hytale:iron_gauntlets", "hytale:iron_greaves",
  "hytale:thorium_helm", "hytale:thorium_cuirass", "hytale:thorium_gauntlets", "hytale:thorium_greaves",
  "hytale:cobalt_helm", "hytale:cobalt_cuirass", "hytale:cobalt_gauntlets", "hytale:cobalt_greaves",
  "hytale:adamantite_helm", "hytale:adamantite_cuirass", "hytale:adamantite_gauntlets", "hytale:adamantite_greaves",
  "hytale:mithril_helm", "hytale:mithril_cuirass", "hytale:mithril_gauntlets", "hytale:mithril_greaves",
  "hytale:copper_helm", "hytale:copper_cuirass", "hytale:copper_gauntlets", "hytale:copper_greaves",

  // --- CRAFTING & UTILITY ---
  "hytale:crafting_table", "hytale:furnace", "hytale:anvil", "hytale:bed", "hytale:torch", "hytale:campfire",
  "hytale:chest", "hytale:barrel", "hytale:glass_bottle", "hytale:paper", "hytale:map", "hytale:clock",
  "hytale:compass", "hytale:spyglass", "hytale:glider", "hytale:jetpack", "hytale:scuba_helmet",
  "hytale:spawner", "hytale:barrier", "hytale:bedrock", "hytale:workbench", "hytale:builders_workbench",
  "hytale:armorer_workbench", "hytale:blacksmith_anvil", "hytale:tanning_rack", "hytale:farmer_workbench",
  "hytale:chef_stove", "hytale:furniture_workbench", "hytale:salvager_workbench", "hytale:alchemist_workbench", "hytale:arcanist_workbench",
  "hytale:repair_kit", "hytale:crude_bedroll", "hytale:crude_torch", "hytale:bear_trap", "hytale:hay_target", "hytale:metal_spike_trap",
  "hytale:rail", "hytale:rail_cart", "hytale:training_dummy", "hytale:wooden_spike_trap", "hytale:capture_crate", "hytale:chicken_coop",
  "hytale:fishing_trap", "hytale:teleporter", "hytale:slowing_totem", "hytale:inkwell", "hytale:woodcutters_block",

  // --- CHESTS & CONTAINERS ---
  "Furniture_Ancient_Chest_Large", "Furniture_Ancient_Chest_Small",
  "Furniture_Christmas_Chest_Small", "Furniture_Christmas_Chest_Small_Green",
  "Furniture_Christmas_Chest_Small_Red", "Furniture_Christmas_Chest_Small_RedDotted",
  "Furniture_Christmas_Chest_Small_White", "Furniture_Crude_Chest_Large",
  "Furniture_Crude_Chest_Small", "Furniture_Desert_Chest_Large",
  "Furniture_Desert_Chest_Small", "Furniture_Dungeon_Chest_Epic",
  "Furniture_Dungeon_Chest_Epic_Large", "Furniture_Dungeon_Chest_Legendary_Large",
  "Furniture_Feran_Chest_Large", "Furniture_Feran_Chest_Small",
  "Furniture_Frozen_Castle_Chest_Large", "Furniture_Frozen_Castle_Chest_Small",
  "Furniture_Goblin_Chest_Small", "Furniture_Human_Ruins_Chest_Large",
  "Furniture_Human_Ruins_Chest_Small", "Furniture_Jungle_Chest_Large",
  "Furniture_Jungle_Chest_Small", "Furniture_Kweebec_Chest_Large",
  "Furniture_Kweebec_Chest_Small", "Furniture_Lumberjack_Chest_Large",
  "Furniture_Lumberjack_Chest_Small", "Furniture_Royal_Magic_Chest_Large",
  "Furniture_Royal_Magic_Chest_Small", "Furniture_Scarak_Hive_Chest_Large",
  "Furniture_Scarak_Hive_Chest_Small", "Furniture_Tavern_Chest_Large",
  "Furniture_Tavern_Chest_Small", "Furniture_Temple_Dark_Chest_Large",
  "Furniture_Temple_Dark_Chest_Small", "Furniture_Temple_Emerald_Chest_Large",
  "Furniture_Temple_Emerald_Chest_Small", "Furniture_Temple_Light_Chest_Large",
  "Furniture_Temple_Light_Chest_Small", "Furniture_Temple_Scarak_Chest_Large",
  "Furniture_Temple_Scarak_Chest_Small", "Furniture_Temple_Wind_Chest_Large",
  "Furniture_Temple_Wind_Chest_Small", "Furniture_Village_Chest_Large",
  "Furniture_Village_Chest_Small",

  // --- BLOCKS ---
  "hytale:dirt", "hytale:grass_block", "hytale:stone", "hytale:cobblestone", "hytale:sand", "hytale:gravel",
  "hytale:oak_log", "hytale:oak_planks", "hytale:oak_leaves", "hytale:birch_log", "hytale:birch_planks",
  "hytale:spruce_log", "hytale:spruce_planks", "hytale:glass", "hytale:bricks", "hytale:stone_bricks",
  "hytale:iron_ore", "hytale:gold_ore", "hytale:diamond_ore", "hytale:copper_ore", "hytale:coal_ore",
  "hytale:thorium_ore", "hytale:cobalt_ore", "hytale:obsidian", "hytale:void_stone",
  "hytale:sandstone", "hytale:red_sandstone", "hytale:quartz_block", "hytale:glowstone",
  "hytale:leafy_soil", "hytale:mud", "hytale:dry_mud", "hytale:needled_soil", "hytale:cold_dirt", "hytale:dry_dirt", "hytale:poisoned_dirt", "hytale:soil_pathway",
  "hytale:ice", "hytale:snow", "hytale:pile_of_sticks", "hytale:beech_sapling", "hytale:birch_sapling", "hytale:ash_sapling", "hytale:oak_sapling", "hytale:spruce_sapling", "hytale:redwood_sapling", "hytale:palm_sapling",

  // --- FOOD & CONSUMABLES ---
  "hytale:apple", "hytale:bread", "hytale:cooked_beef", "hytale:cooked_chicken", "hytale:cooked_pork",
  "hytale:cooked_fish", "hytale:carrot", "hytale:potato", "hytale:mushroom_stew", "hytale:cookie",
  "hytale:healing_potion", "hytale:mana_potion", "hytale:stamina_potion", "hytale:poison_potion",
  "hytale:mushroom_skewer", "hytale:fruit_skewer", "hytale:meat_skewer", "hytale:vegetable_skewer",
  "hytale:cheese", "hytale:spices", "hytale:popberry_bomb", "hytale:antidote", "hytale:lesser_health_potion", "hytale:lesser_stamina_potion", "hytale:lesser_energy_potion", "hytale:potion_of_dog_morphing",

  // --- MOB DROPS & MISC ---
  "hytale:bone", "hytale:rotten_flesh", "hytale:string", "hytale:spider_eye", "hytale:gunpowder",
  "hytale:feather", "hytale:leather", "hytale:iron_ingot", "hytale:gold_ingot", "hytale:diamond",
  "hytale:copper_ingot", "hytale:thorium_ingot", "hytale:cobalt_ingot", "hytale:void_shard",
  "hytale:kweebec_leaf", "hytale:trork_tusk", "hytale:outlander_mask", "hytale:scarak_chitin",
  "hytale:special_scroll", "hytale:health_bar", "hytale:light_leather", "hytale:medium_leather", "hytale:heavy_leather", "hytale:dark_leather", "hytale:prismatic_leather", "hytale:scaled_leather", "hytale:storm_leather", "hytale:soft_leather",
  "hytale:linen_scraps", "hytale:shadoweave_scraps", "hytale:cindercloth_scraps", "hytale:stormsilk_scraps", "hytale:venom_sac", "hytale:essence_of_the_void", "hytale:essence_of_fire", "hytale:essence_of_ice", "hytale:essence_of_life", "hytale:greater_essence_of_life",
  "hytale:ruby", "hytale:sapphire", "hytale:voidheart"
];

const COMPREHENSIVE_MEMORIES = [
    // --- ABYSSAL ---
    "hytale:moray_eel", "hytale:hammerhead_shark", "hytale:lava_shellfish", "hytale:trilobite", "hytale:black_trilobite", "hytale:humpback_whale",
    
    // --- AVIAN ---
    "hytale:archaeopteryx", "hytale:bat", "hytale:ice_bat", "hytale:bluebird", "hytale:crow", "hytale:duck", "hytale:greenfich", "hytale:flamingo", "hytale:hawk", "hytale:brown_owl", "hytale:snowy_owl", "hytale:parrot", "hytale:penguin", "hytale:pigeon", "hytale:pterodactyl", "hytale:raven", "hytale:sparrow", "hytale:tetrabird", "hytale:vulture", "hytale:woodpecker",
    
    // --- CRITTER ---
    "hytale:cactee", "hytale:frog", "hytale:gecko", "hytale:silk_larva", "hytale:meerkat", "hytale:molerat", "hytale:mouse", "hytale:rat", "hytale:scorpion", "hytale:magma_slug", "hytale:frost_snail", "hytale:magma_snail", "hytale:cobra", "hytale:marsh_snake", "hytale:rattlesnake", "hytale:spider", "hytale:cave_spider", "hytale:squirrel",
    
    // --- ELEMENTAL ---
    "hytale:earthen_golem", "hytale:ember_golem", "hytale:frost_golem", "hytale:sandswept_golem", "hytale:thunder_golem", "hytale:firesteel_golem", "hytale:living_spark", "hytale:ember_spirit", "hytale:first_spirit", "hytale:root_spirit", "hytale:thunder_spirit",
    
    // --- FERAN ---
    "hytale:feran_burrower", "hytale:feran_civilian", "hytale:feran_civilian_bugged", "hytale:feran_cub", "hytale:feran_longtooth", "hytale:feran_sharptooth", "hytale:feran_windwalker",
    
    // --- FISH ---
    "hytale:bluegill", "hytale:catfish", "hytale:clownfish", "hytale:crab", "hytale:frostgill", "hytale:blue_jellyfish", "hytale:cyan_jellyfish", "hytale:green_jellyfish", "hytale:man_of_war", "hytale:red_jellyfish", "hytale:yellow_jellyfish", "hytale:lobster", "hytale:minnow", "hytale:pike", "hytale:piranha", "hytale:black_piranha", "hytale:pufferfish", "hytale:salmon", "hytale:snapjaw", "hytale:blue_tang", "hytale:chevron_tang", "hytale:lemon_peel_tang", "hytale:sailfin_tang", "hytale:rainbow_trout",
    
    // --- GOBLIN ---
    "hytale:goblin_duke", "hytale:goblin_hermit", "hytale:goblin_lobber", "hytale:goblin_miner", "hytale:goblin_ogre", "hytale:goblin_scavenger", "hytale:goblin_scrapper", "hytale:goblin_thief",
    
    // --- KWEEBEC ---
    "hytale:kweebec_rootling", "hytale:kweebec_sapling", "hytale:kweebec_seedling", "hytale:kweebec_sproutling", "hytale:kweebec",
    
    // --- LIVESTOCK ---
    "hytale:antelope", "hytale:armadillo", "hytale:bison", "hytale:bison_calf", "hytale:boar", "hytale:boar_piglet", "hytale:bunny", "hytale:camel", "hytale:camel_calf", "hytale:chicken", "hytale:chick", "hytale:desert_chicken", "hytale:desert_chick", "hytale:cow", "hytale:calf", "hytale:doe", "hytale:stag", "hytale:goat", "hytale:kid", "hytale:horse", "hytale:foal", "hytale:moose_bull", "hytale:moose_cow", "hytale:mosshorn", "hytale:mouflon", "hytale:mouflon_lamb", "hytale:pig", "hytale:piglet", "hytale:rabbit", "hytale:ram", "hytale:ram_lamb", "hytale:sheep", "hytale:lamb", "hytale:skrill", "hytale:skrill_chick", "hytale:turkey", "hytale:turkey_chick", "hytale:warthog", "hytale:warthog_piglet",
    
    // --- MYTHIC ---
    "hytale:frost_dragon", "hytale:emberwulf", "hytale:shadow_knight", "hytale:wraith", "hytale:yeti",
    
    // --- OUTLANDER ---
    "hytale:outlander_berserker", "hytale:outlander_brute", "hytale:outlander_initiate", "hytale:outlander_hunter", "hytale:outlander_marauder", "hytale:outlander_unsworn", "hytale:outlander_priest", "hytale:outlander_sorcerer", "hytale:outlander_staler", "hytale:outlander",
    
    // --- PREDATOR ---
    "hytale:grizzly_bear", "hytale:polar_bear", "hytale:fox", "hytale:hyena", "hytale:snow_leopard", "hytale:sabertooth_tiger", "hytale:black_wolf", "hytale:white_wolf", "hytale:wolf", "hytale:bear",
    
    // --- REPTILE ---
    "hytale:crocodile", "hytale:fen_stalker", "hytale:sand_lizard", "hytale:cave_raptor", "hytale:cave_rex", "hytale:snapdragon", "hytale:rhino_toad", "hytale:magma_rhino_toad", "hytale:tortoise", "hytale:trillodon",
    
    // --- SCARAK ---
    "hytale:scarak_broodmother", "hytale:scarak_defender", "hytale:scarak_fighter", "hytale:scarak_louse", "hytale:scarak_seeker", "hytale:scarak",
    
    // --- TRORK ---
    "hytale:trork_brawler", "hytale:trork_chieftain", "hytale:trork_guard", "hytale:trork_hunter", "hytale:trork_mauler", "hytale:trork_sentry", "hytale:trork_elder", "hytale:trork_warrior", "hytale:trork",
    
    // --- UNDEAD ---
    "hytale:undead_chicken", "hytale:undead_cow", "hytale:ghoul", "hytale:skeleton_horse", "hytale:armored_skeleton_horse", "hytale:bleached_hound", "hytale:undead_pig", "hytale:skeleton_archer", "hytale:skeleton_archmage", "hytale:burnt_skeleton_alchemist", "hytale:burnt_skeleton_archer", "hytale:burnt_skeleton_gunner", "hytale:burnt_skeleton_knight", "hytale:burnt_skeleton_lancer", "hytale:burnt_skeleton_praetorian", "hytale:burnt_skeleton_soldier", "hytale:burnt_skeleton_wizard", "hytale:skeleton_fighter", "hytale:frost_skeleton_archer", "hytale:frost_skeleton_archmage", "hytale:frost_skeleton_fighter", "hytale:frost_skeleton_knight", "hytale:frost_skeleton_mage", "hytale:frost_skeleton_ranger", "hytale:frost_skeleton_scout", "hytale:frost_skeleton_soldier", "hytale:incandescent_skeleton_fighter", "hytale:incandescent_skeleton_footman", "hytale:incandescent_skeleton_head", "hytale:incandescent_skeleton_mage", "hytale:skeleton_knight", "hytale:skeleton_mage", "hytale:skeleton_pirate_captain", "hytale:skeleton_pirate_gunner", "hytale:skeleton_pirate_striker", "hytale:skeleton_ranger", "hytale:sandswept_skeleton_archer", "hytale:sandswept_skeleton_archmage", "hytale:sandswept_skeleton_assassin", "hytale:sandswept_skeleton_guard", "hytale:sandswept_skeleton_mage", "hytale:sandswept_skeleton_ranger", "hytale:sandswept_skeleton_scout", "hytale:sandswept_skeleton_soldier", "hytale:skeleton_scout", "hytale:skeleton_soldier", "hytale:werewolf", "hytale:zombie", "hytale:aberrant_zombie", "hytale:burnt_zombie", "hytale:frost_zombie", "hytale:sandswept_zombie", "hytale:skeleton", "hytale:crawler",
    
    // --- VOID ---
    "hytale:void_crawler", "hytale:void_eye", "hytale:void_larva", "hytale:void_spawn", "hytale:void_spectre", "hytale:the_hedera", "hytale:gaea", "hytale:varyn", "hytale:custom_npc"
];

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

  useEffect(() => {
    loadPlayer();
    loadWaypoints();
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
          <h2 className="text-xl font-bold text-white mb-1 font-sans">Player Editor</h2>
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
                <div className="flex gap-2 flex-wrap">
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
                      setNested(["Components", "Player", "PlayerData", "KnownRecipes"], [...new Set([...existing, ...COMPREHENSIVE_RECIPES])]);
                      onShowSuccess("Unlocked comprehensive recipe pack!");
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
                  {knownMemories.length} / 240
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => {
                      const existing = getNested(data, ["Components", "PlayerMemories", "Memories"]) || [];
                      setNested(["Components", "PlayerMemories", "Memories"], [...new Set([...existing, ...COMPREHENSIVE_MEMORIES])]);
                      onShowSuccess("Unlocked all 240 memories!");
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
                    {COMPREHENSIVE_RECIPES.filter(r => r.toLowerCase().includes(recipeSearch.toLowerCase())).map(recipeId => {
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
                                <span className={`text-[10px] font-bold font-mono truncate mr-2 ${isUnlocked ? 'text-hytale-purple' : ''}`}>{recipeId.replace('hytale:', '')}</span>
                                {isUnlocked ? <CheckCircle2 size={14} className="text-hytale-purple shrink-0 shadow-lg shadow-purple-500/20" /> : <Circle size={14} className="shrink-0 opacity-10" />}
                            </button>
                        );
                    })}
                  </div>

                  <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-between items-center shrink-0">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setNested(["Components", "Player", "PlayerData", "KnownRecipes"], [...new Set([...knownRecipes, ...COMPREHENSIVE_RECIPES])]);
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
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black opacity-60">{knownMemories.length} / 240 creatures cataloged</p>
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
                    {COMPREHENSIVE_MEMORIES.filter(m => m.toLowerCase().includes(memorySearch.toLowerCase())).map(memoryId => {
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
                                setNested(["Components", "PlayerMemories", "Memories"], [...COMPREHENSIVE_MEMORIES]);
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
