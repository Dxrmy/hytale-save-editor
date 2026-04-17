# Hytale Save Editor (HSE) Documentation

## 📑 Overview
Hytale Save Editor (HSE) is a comprehensive toolkit designed for deep-level manipulation of Hytale save files. It bridges the gap between raw binary world data and user-friendly JSON/GUI interfaces.

The project consists of a **Python Core Engine** for data processing and an **Electron/React Frontend** for visual interaction.

---

## 🏗 Architecture

### 1. Core Engine (Python)
The backend logic is centralized in `hse.py`. It handles:
- **Environment Detection**: Automatically locates Hytale saves and game installation paths.
- **Dynamic Asset Scanning**: HSE automatically scans Hytale's `Assets.zip` to find item and creature IDs. This ensures the app stays up-to-date with new Hytale patches automatically.
- **Backup System**: Creates timestamped clones of saves before any write operation.
- **Binary Parsing**: 
    - Decodes `.region.bin` files with multi-document BSON support.
    - Decompresses chunks using **Zstandard**.
    - Decodes chunk data from **BSON** (Binary JSON) to Python dictionaries.
- **Headless Mode**: A CLI interface that outputs raw JSON for the Electron GUI.

### 2. Frontend (Electron + React + Vite)
The UI is built with modern web technologies:
- **Electron**: Desktop shell and Python bridge.
- **React (TypeScript)**: State and UI management.
- **Tailwind CSS**: Sleek, Hytale-themed design.
- **Vite**: Build tool for performance.

---

## 🚀 How to Use

### Visual GUI (Recommended)
1. Navigate to the `gui` directory.
2. Install dependencies: `npm install`.
3. Launch development mode: `npm run dev`.
4. Select a save to see players and world settings.

### Terminal Interface (CLI)
1. Run `python hse.py`.
2. Follow the interactive menus.

---

## 🛠 Features Detail

### 1. Player Editing
- **Vital Stats**: Modify Health, Mana, and Stamina.
- **Position & Waypoints**: Teleport to fixed world waypoints or custom player-placed markers.
- **Inventory**: Edit all inventory types (Hotbar, Storage, Backpack, Armor, Utility).
- **Recipes & Bestiary**: Toggle hundreds of dynamic recipes and creature memories.

### 2. World Exploration
- **Global Region Explorer**: Scans every region file in the world to index storage blocks (Chests), Spawners, and Signs.
- **Universal Search**: Find any item across all containers in the world instantly.

### 3. World Management
- **Safe Chunk Reset**: Force Hytale to regenerate specific regions by deleting them.
- **Hard Reset**: Reset the entire world with a new seed while preserving players (with mandatory backup).
- **Save Renaming**: Cleanly rename save folders and display names.

---

## 📦 Requirements
- **Python 3.13+**
- **Node.js 18+**
- Python Packages: `zstandard`, `pymongo` (for BSON), `InquirerPy`, `rich`.

---
*Developed by Dxrmy | Hytale Save Editor © 2026*
