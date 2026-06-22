# Hytale Save Editor (HSE)
	A comprehensive Hytale save file exploration and editing engine.
	
		
		
		<br>
		
        
		
	

##  Table of Contents
- [ What is HSE?](#-what-is-hse)
- [ GUI vs CLI](#-gui-vs-cli)
- [ Features](#-features)
- [ Getting Started](#-getting-started)
- [ Roadmap & Todo](#-roadmap--todo)
- [ Tech Stack](#-tech-stack)
- [ Documentation](#-documentation)
- [ License](#-license)

##  What is HSE?

Hytale Save Editor (HSE) is a robust toolkit designed to interface directly with Hytale's save file architecture. It bridges the gap between raw binary world data and user-friendly visual interfaces. It prioritizes safety through automatic backup infrastructure and provides a powerful engine for deep-level save manipulation.

##  GUI vs CLI

HSE now offers two ways to interact with your saves:
*   **Visual GUI (Recommended):** A sleek, modern desktop application built with Electron and React. Perfect for visual inventory management and world exploration.
*   **Terminal CLI:** The original power-user interface. Lightweight and fast for quick edits.

##  Features  
- **Visual Player Editor** – Modify Health, Mana, Stamina, and Position with ease.
- **Massive Bestiary** – Unlock all 240 creature memories with a searchable registry.
- **Expanded Recipes** – Unlock hundreds of tiered weapons, tools, and specialty items.
- **Global Region Explorer** – Automatically scan all `.region.bin` files to find chests, spawners, and signs.
- **Safety First** – Mandatory backup systems that preserve save integrity before any modification.
- **World Management** – Rename saves, reset specific regions, or perform a full world hard-reset.

##  Getting Started

### 1. Download (Windows)
Download the latest standalone installer from the **[Releases Page](https://github.com/Dxrmy/hytale-save-editor/releases)**.

### 2. Run from Source (Devs)

**For the GUI:**
1.  Navigate to the `gui` folder: `cd gui`
2.  Install dependencies: `npm install`
3.  Launch: `npm run dev`

**For the CLI:**
1.  Install Python requirements: `pip install -r requirements.txt`
2.  Run: `python hse.py`

##  Roadmap & Todo
- [x] Initial CLI implementation
- [x] Backup infrastructure
- [x] Save chunk decompression logic
- [x] v1.0.0 Stable Electron GUI Release
- [x] Full Bestiary (240 Memories) & Recipe Registry
- [ ] Waypoint Teleport Fix (Investigating Terrain Offsets)
- [/] Entity attribute modification (Players done, World entities partial)

##  Tech Stack
- **Backend:** Python 3.13+, Zstandard, BSON (pymongo).
- **Frontend:** Electron, React, TypeScript, Tailwind CSS, Vite.
- **Icons:** Lucide-React.

##  Documentation
For a detailed breakdown of the architecture and technical implementation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---
 Developed with ️ by <a href="https://github.com/Dxrmy">Dxrmy</a> |  Licensed under MIT
