# 🌑 Moon-Rocks / Rock-Shop Demo

A portable **Node + PostgreSQL** stack that lets rock-shop owners catalog, search, add, edit, and delete mineral inventory— all wrapped in Docker so it boots with a single command.

<p align="center">
  <img alt="screenshot" src="docs/screenshot.png" width="700">
</p>

---

## ✨ Features

* **PostgreSQL 16** with an example `minerals` table and seed data  
* **Express 5** back-end (`/api/minerals`)  
* Static **Bootstrap 5** front-end (`public/`)  
* One-click **Adminer** (DB UI) on port `8080`  
* Works on Windows 10/11, macOS, Linux—anywhere Docker runs

---

## 📦 Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Docker Desktop 4.25+** | Windows 10/11: enable *WSL 2* and turn on **WSL integration** for your distro.<br>macOS / Linux: regular Docker Engine. |
| **Git** | For cloning this repo (`git clone …`). |

> **No local Node / PostgreSQL required**—everything lives in containers.

---

## 🚀 Quick-start

```bash
git clone https://github.com/<your-org>/moon-rocks.git
cd moon-rocks/rockshop-app

# Build & launch in background
docker compose up --build -d