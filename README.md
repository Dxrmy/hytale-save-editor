<div align="center">
  <h1>Hytale Save Editor (HSE)</h1>
  <p><b>Terminal-first Hytale save file exploration and editing engine.</b></p>
  <img src="https://img.shields.io/badge/Python-3.13%2B-3776AB?style=flat-square" alt="Python">
  <img src="https://img.shields.io/badge/Type-Save_Editor-green?style=flat-square" alt="Type">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</div>

Hytale Save Editor (HSE) is a robust set of Python utilities designed to interface directly with Hytale's save file architecture. It prioritizes safety through automatic backup infrastructure and provides a streamlined interactive interface for deep-level save manipulation.

### **✨ Features**
- **Safety First**: Integrated backup systems that preserve save integrity before any modification.
- **Interactive CLI**: Powered by InquirerPy for intuitive, terminal-based navigation.
- **Deep Inspection**: Specialized peek utilities for regions, sectors, and chunks.
- **Rich Visualization**: High-fidelity terminal tables and status reports.

## ⚙️ Configuration
HSE creates a local `.hse_config` or uses command-line arguments to locate your Hytale installation.

1. **Path Setup**:
   Ensure your Hytale save directory is accessible. By default, HSE looks in common installation paths, but you can provide a custom path via:
   ```bash
   python hse.py --path "C:/Path/To/Hytale/Saves"
   ```

## 🚧 Roadmap & Todo
The project is currently in an active development phase, focusing on expanding data mapping coverage.

- [x] Initial CLI implementation
- [x] Backup infrastructure
- [/] Save chunk decompression logic
- [ ] BSON data mapping for chest contents
- [ ] Entity attribute modification

## 🛠 Tech Stack
- **Python 3.13+**: Core logic and data processing.
- **InquirerPy**: Interactive terminal prompts.
- **Rich**: Advanced terminal formatting and tables.

<div align="center">
  <h2>📊 Analytics</h2>
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=Dxrmy&repo=hytale-save-editor&theme=transparent" alt="Hytale Save Editor Stats">
</div>

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
