<p align="center">
	<a href="#">
		<img src="https://raw.githubusercontent.com/Dxrmy/hytale-save-editor/main/assets/hse_logo.png" alt="Hytale Save Editor Icon" width="128">
	</a>
	<h1 align="center">Hytale Save Editor (HSE)</h1>
	<h5 align="center">A terminal-first Hytale save file exploration and editing engine.</h5>
	<p align="center">
		<a href="https://github.com/Dxrmy/hytale-save-editor/stargazers">
			<img src="https://img.shields.io/github/stars/Dxrmy/hytale-save-editor.svg?style=for-the-badge&color=%237B5BF5" alt="stargazers">
		</a>
		<a href="https://github.com/Dxrmy/hytale-save-editor/issues">
			<img src="https://img.shields.io/github/issues/Dxrmy/hytale-save-editor?style=for-the-badge&color=%237B5BF5" alt="Issues">
		</a>
		<br>
		<a href="https://www.python.org/">
			<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
		</a>
		<img src="https://img.shields.io/badge/License-MIT-4fb325?style=for-the-badge" alt="MIT License">
	</p>
</p>

## 📌 Table of Contents
- [📌 Table of Contents](#-table-of-contents)
- [❓ What is HSE?](#-what-is-hse)
- [✨ Features](#-features)
- [⚙️ Configuration](#️-configuration)
- [🚧 Roadmap & Todo](#-roadmap--todo)
- [🛠 Tech Stack](#-tech-stack)
- [⭐ Support the Project](#-support-the-project)
- [📄 License](#-license)

## ❓ What is HSE?

Hytale Save Editor (HSE) is a robust set of Python utilities designed to interface directly with Hytale's save file architecture. It prioritizes safety through automatic backup infrastructure and provides a streamlined interactive interface for deep-level save manipulation.

## ✨ Features  
- **Safety First** – Integrated backup systems that preserve save integrity before any modification.
- **Interactive CLI** – Powered by InquirerPy for intuitive, terminal-based navigation.
- **Deep Inspection** – Specialized peek utilities for regions, sectors, and chunks.
- **Rich Visualization** – High-fidelity terminal tables and status reports via Rich.

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
- [x] Save chunk decompression logic
- [ ] BSON data mapping for chest contents (Currently non-functional)
- [ ] Waypoint Teleport (Currently non-functional)
- [/] Entity attribute modification (Players done, Entities partial)

## 🛠 Tech Stack
- **Python 3.13+**: Core logic and data processing.
- **InquirerPy**: Interactive terminal prompts.
- **Rich**: Advanced terminal formatting and tables.

## ⭐ Support the Project
Consider giving the project a ⭐ star on GitHub! Your support helps more people discover it and keeps me motivated to improve it.

[![Sponsor Me](https://img.shields.io/badge/Sponsor%20Me-%E2%9D%A4-red?style=for-the-badge)](https://github.com/sponsors/Dxrmy)

---
<p align="center">💻 Developed with ❤️ by <a href="https://github.com/Dxrmy">Dxrmy</a> | 📜 Licensed under MIT</p>
