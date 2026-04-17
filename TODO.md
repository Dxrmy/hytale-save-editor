# TODO List

## 🛠 High Priority Fixes
- [ ] **Waypoint Teleportation**: Currently non-functional.
    - Investigate the correct coordinate system used in player JSON vs world markers.
    - Check if there is an offset or a need to update `PerWorldData` in other files (e.g., `LastPosition` might not be enough).
    - Verify if the `Y` coordinate safety offset (+2.0) is correct for Hytale terrain.
- [ ] **Chest Scanner**: Currently non-functional.
    - Investigate if the sector offset logic in `scan_region_for_chests_logic` (Hytale's `.region.bin` format) is 100% correct.
    - Verify the BSON path to chest inventory data. It currently assumes `Components -> StorageInventory -> Inventory -> Items`.
    - Check for different chest types/item IDs that might use different component paths.

## 🚀 Future Features
- [ ] **Entity Attribute Modification**: Full implementation for NPCs and world entities.
- [ ] **BSON Re-encoding**: Allow editing chest contents and saving back to binary region files.
- [ ] **Sector Relocation**: Handle resizing of chunks when BSON data grows after editing.
