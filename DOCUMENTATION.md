# Hytale Save Editor (HSE) Documentation

## 📑 Overview
Hytale Save Editor (HSE) is a comprehensive toolkit designed for deep-level manipulation of Hytale save files. It bridges the gap between raw binary world data and user-friendly JSON/GUI interfaces.

The project consists of a **Python Core Engine** for data processing and an **Electron/React Frontend** for visual interaction.

---

## 🏗 Architecture

### 1. Core Engine (Python)
The backend logic is centralized in `hse.py`. It handles:
- **Environment Detection**: Automatically locates Hytale saves via `%APPDATA%`.
- **Backup System**: Creates timestamped clones of saves before any write operation.
- **Binary Parsing**: 
    - Decodes `.region.bin` files (Hytale's custom world format).
    - Decompresses chunks using **Zstandard**.
    - Decodes chunk data from **BSON** (Binary JSON) to Python dictionaries.
- **Headless Mode**: A CLI interface that outputs raw JSON, allowing external tools (like the Electron GUI) to query and update the save state.

### 2. Frontend (Electron + React + Vite)
The UI is built with modern web technologies:
- **Electron**: Provides the desktop shell and the "Bridge" to execute Python commands.
- **React (TypeScript)**: Manages the state and user interface components.
- **Vite**: The build tool ensuring fast development and optimized production bundles.
- **IPC Bridge**: A secure communication layer (`ipcMain`/`ipcRenderer`) that spawns Python processes as child tasks and captures their JSON output.

---

## 🚀 How to Use

### Terminal Interface (CLI)
For power users who prefer the command line:
1. Open a terminal in the project root.
2. Run `python hse.py`.
3. Follow the interactive menus to edit player stats, inventories, or explore world regions.

### GUI Interface (Electron)
For a visual experience:
1. Navigate to the `gui` directory.
2. Install dependencies: `npm install`.
3. Launch development mode: `npm run dev`.
4. The app will open, allowing you to browse saves and players visually.

---

## 🛠 Features Detail

### 1. Player Editing
- **Vital Stats**: Modify Health, Mana, and Stamina.
- **Position**: Teleport players to specific X, Y, Z coordinates.
- **Inventory**: View and edit items in the Hotbar, Storage, Backpack, Armor, and Utility slots.
- **Recipes**: A "Comprehensive Pack" unlocker that gives you access to almost all items (including various chests).

### 2. World Exploration
- **Region Scanner**: Scans binary world files for "BlockComponent" data.
- **Chest Finder**: Automatically identifies all storage containers in a region and lists their contents.
- **Item Search**: Search for specific Item IDs (e.g., `hytale:diamond`) across all discovered chests in a region.

### 3. Safety & Maintenance
- **Safe Chunk Reset**: Selectively delete region files to force the game to regenerate specific areas.
- **Hard Reset**: Reset an entire world with a new seed while maintaining a mandatory backup.
- **Save Renaming**: Cleanly rename save folders and their internal display names.

---

## 🧪 Technical Implementation Notes

### The Region File Format
Hytale saves chunks in `.region.bin` files. HSE parses these by:
1. Reading the 32-byte header (Magic, Version, Entries).
2. Navigating the Sector Table (1024 entries of 8 bytes each).
3. Locating the 4096-byte sectors.
4. Extracting Zstd-compressed BSON data from each sector.

### Headless Bridge Protocol
When the GUI needs data, it calls `hse.py --headless <command>`.
- **Example**: `python hse.py --headless list-saves` returns a JSON array of available saves.
- This allows the GUI to be completely decoupled from the complex binary logic, making it easier to maintain.

---

## 📦 Requirements
- **Python 3.13+**
- **Node.js 18+**
- Python Packages: `zstandard`, `pymongo` (for BSON), `InquirerPy`, `rich`.
- Node Packages: `electron`, `react`, `lucide-react`, `vite`.

---
*Developed by Dxrmy | Hytale Save Editor © 2026*
