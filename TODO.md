# TODO List

## ✅ Completed Fixes
- [x] **Waypoint Teleportation**: Functional.
    - Resolved coordinate system mapping for custom markers.
    - Merged static and custom waypoint files.
    - Implemented `LastPosition` update in `PerWorldData`.
- [x] **Chest Scanner**: Functional.
    - Fixed sector offset logic.
    - Implemented multi-BSON document support per chunk.
    - Added categorization for Spawners and Signs.
- [x] **Dynamic Asset Core**: Functional.
    - Automated scanning of `Assets.zip` for future-proof updates.

## 🛠 High Priority Fixes
- [ ] **Entity Attribute Modification**: Implement editing for world entities found via scanner.
    - Create IPC bridge for targeted block component modification.
    - Handle coordinate mapping between region chunk data and world space.

## 🚀 Future Features
- [ ] **BSON Re-encoding**: Allow editing chest contents and saving back to binary region files.
- [ ] **Sector Relocation**: Handle resizing of chunks when BSON data grows after editing.
- [ ] **Visual World Map**: Render scanned region data on a 2D map.
