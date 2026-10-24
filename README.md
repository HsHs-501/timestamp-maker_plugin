<div align="center">

# ⏱️ Timestamp Maker

**A lightweight, powerful Revenge & Vendetta plugin for Discord (Android)**  
*Generate, preview, and copy dynamic `<t:UNIX:FORMAT>` timestamp tags with a single tap.*

<br/>

[![Discord Server](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/jwpb9YdBJa)
[![Developer](https://img.shields.io/badge/Developer-HsHs--501-181717?style=for-the-badge&logo=github&logoColor=white)](#)
[![Discord User](https://img.shields.io/badge/Discord-.95.4-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/jwpb9YdBJa)
[![Platform](https://img.shields.io/badge/Platform-Discord%20Android%20(Revenge)-3DDC84?style=for-the-badge&logo=android&logoColor=white)](#)

<br/>

</div>

---

## 📖 What is this?

Discord natively supports dynamic timestamps that automatically display in each viewer's local timezone and format (e.g. `<t:1790000000:R>` renders as *"in 2 hours"* or *"2 hours ago"*). 

Calculating UNIX epoch time on mobile is annoying. **Timestamp Maker** lets you generate, preview, and copy every format directly inside Discord.

---

## ✨ Features

- ⚙️ **Interactive Settings Page**: Pick any date (`YYYY-MM-DD`) and time (`HH:mm`, 24-hour).
- ⚡ **Quick Presets**: One-tap buttons for `Now`, `+1 Hour`, `+1 Day`, and `Tomorrow 09:00`.
- 📋 **One-Tap Copy**: Tap any format row to instantly copy `<t:...:...>` to your clipboard.
- 💬 **Slash Command (`/timestamp`)**:
  - Type `/timestamp when: <input>` directly in chat.
  - Sends local messages (visible only to you) containing both rendered previews and copyable raw text.
  - Supports friendly inputs:
    - `now`
    - `+2h`, `+30m`, `+1d`, `+1w`
    - `tomorrow 09:00` or `tomorrow`
    - `21:30` (today at 21:30)
    - Full date: `2026-10-25 21:30`
- 🚀 **Zero Build / No Bundler**: Built in plain ES2019 IIFE format for Revenge Classic (tested on build `577c7f2-main` / Discord `350.8`).
- 🛡️ **Safe & Stable**: Avoids unstable Toast APIs and falls back cleanly to local alert dialogs if needed.

---

## 🏷️ Supported Formats

| Flag | Name | Discord Output Example | Tag Format |
| :---: | :--- | :--- | :--- |
| `t` | Short Time | `9:30 PM` | `<t:UNIX:t>` |
| `T` | Long Time | `9:30:00 PM` | `<t:UNIX:T>` |
| `d` | Short Date | `10/25/2026` | `<t:UNIX:d>` |
| `D` | Long Date | `October 25, 2026` | `<t:UNIX:D>` |
| `f` | Short Date/Time | `October 25, 2026 9:30 PM` | `<t:UNIX:f>` |
| `F` | Long Date/Time with Weekday | `Sunday, October 25, 2026 9:30 PM` | `<t:UNIX:F>` |
| `R` | Relative Time | `in 2 hours` / `2 days ago` | `<t:UNIX:R>` |

---

## 📥 Installation

To install this plugin in **Revenge** on Discord (Android):

1. Copy the plugin URL:
   ```text
   https://github.com/HsHs-501/timestamp-maker_plugin
   ```
2. Open Discord and go to **User Settings** (your profile icon).
3. Scroll down to the **Revenge** section and tap **Plugins**.
4. Tap the **`+`** (Install Plugin) button at the top right.
5. Paste the plugin URL and confirm the install.
6. The plugin will load automatically into your client. You can access its settings directly from the plugin list or use `/timestamp` in chat!

---

## 👤 Author & Community

- **Developer**: **HsHs-501**
- **Discord User**: `.95.4`
- **Discord Server**: [Join Server](https://discord.gg/jwpb9YdBJa)

---

<div align="center">
<sub>Built with ❤️ for the Revenge / Vendetta Discord Community</sub>
</div>
