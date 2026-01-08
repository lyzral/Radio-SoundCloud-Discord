# 🎵 Discord Radio / Music Bot — Lavalink & SoundCloud

This project is a **Discord music / radio bot** designed to play audio in voice channels using **Lavalink**, with support for **SoundCloud links** and queue-based playback.

The bot is intended for **private usage**, with command access restricted to **SYS, bot owners, and whitelist members**.

---

## ✨ Features

- 🎶 Music playback in voice channels  
- 📻 Radio-style continuous playback  
- 🔗 SoundCloud support  
- 📜 Queue management system  
- ▶️ Play / Stop / Skip / Next controls  
- 🎧 Now playing display  
- 👑 Owner & whitelist management  
- 🔒 Command access restriction  
- 💾 Persistent JSON storage  
- 🎨 Clean public embeds  
- ⚡ Stable Lavalink integration  

---

## 🧩 Commands Overview

### `/join`
Connects the bot to your voice channel.

### `/leave`
Disconnects the bot from the voice channel.

### `/play <url>`
Plays a track or adds it to the queue.

### `/stop`
Stops the current playback and clears the queue.

### `/skip`
Skips the current track.

### `/next`
Defines the next track in the queue.

### `/now`
Displays the currently playing track.

### `/queue`
Displays the current queue.

---

## 👑 Owner & Whitelist Commands

**SYS only**
- `/owner <user>`
- `/unowner <user>`
- `/ownerlist`

**Owners / SYS**
- `/wl <user>`
- `/unwl <user>`
- `/whitelist`

---

## 🔐 Permissions & Security

Slash commands are restricted to SYS, bot owners, and whitelisted members.

---

## 🗂 Project Structure

```txt
EN_COURS/
├── src/
├── lavalink/
├── config.js
├── index.js
├── package.json
└── README.md
```

---

## ⚙️ Requirements

- Node.js v18+
- discord.js v14
- Java 17+ (Lavalink)

---

## 📦 Installation

```bash
npm install
```

---

## 🔧 Configuration

Edit `config.js` with your credentials.

---

## ▶️ Running the Bot

```bash
java -jar Lavalink.jar
node index.js
```

---

## 📜 License

Private / internal usage only.
