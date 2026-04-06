# Hytale Save Editor (HSE)

A set of Python scripts for managing and exploring Hytale save files.

## Features
- **Environment Validation**: Checks for Hytale save directories in %APPDATA%.
- **Backup Infrastructure**: Automatically creates backups before making changes.
- **Interactive CLI**: Uses InquirerPy for a user-friendly terminal experience.
- **Rich Output**: High-quality terminal tables and formatting via ich.

## Scripts
- hse.py: The main Hytale Save Editor interface.
- debug_hse.py: Debugging utilities for the editor.
- peek_data.py, peek_region.py, peek_sector.py: Tools for inspecting raw save data.
- ead_chunk.py, ead_bson_chunk.py: Tools for reading specific Hytale data formats.
- scan_chests.py: A utility to scan for chests and their contents.
- erify_mappings.py: Verifies data mappings within the saves.

## Prerequisites
- Python 3.10+
- Dependencies (see below)

## Installation
1. Clone the repository:
   `ash
   git clone https://github.com/Dxrmy/hytale-save-editor.git
   cd hytale-save-editor
   `
2. Install dependencies:
   `ash
   pip install -r requirements.txt
   `

## Usage
Run the main editor script:
`ash
python hse.py
`

## Disclaimer
This tool is provided as-is. Always ensure you have backups of your save files before performing any destructive actions.
