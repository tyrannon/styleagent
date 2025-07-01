# Claude Code - Style Agent Bootstrapping Tasks 🚀

Hi Claude! We are beginning a new companion project to our StyleMuse iOS/Android app. This is called **Style Agent**, and it will initially run on Mac only.

---

## 🎯 Primary Goals

1. ✅ Reproduce the **core features** of the StyleMuse mobile app on desktop.
2. ✅ Begin implementing **local AI-powered capabilities** that the mobile app will connect to later.
3. ✅ Maintain a **shared design language**, folder structure, and functional parity with the existing codebase.

---

## 📱 StyleMuse Features to Port to Desktop

Rebuild the following as desktop versions (SwiftUI or Electron, TBD):

- [ ] Wardrobe viewer with scrollable gallery of user-uploaded clothing
- [ ] Ability to add new clothing items (drag/drop or file picker)
- [ ] Tagging system for clothing (color, type, texture, season, etc.)
- [ ] Daily outfit suggestion flow
- [ ] Saved outfits history viewer
- [ ] “Inspire Me” feature to generate outfits based on mood or weather
- [ ] Editable titles and tags for each item
- [ ] Support basic UI for deleting clothing items
- [ ] Display item details in a modal or panel

Mirror all functionality and styling conventions from the mobile app where possible.

---

## 🧠 AI Feature Track (Mac App Only — Local AI)

Simultaneously, begin building out a **local AI agent** powered by a local LLM (LLaMA 3, Phi-3, or Mistral) running via **Ollama** or **MLC**.

Key features:

- [ ] Run LLM locally and allow user input via voice (Whisper) or keyboard
- [ ] Accept style-related prompts like:  
  - “What should I wear today?”  
  - “Give me something cozy for a cloudy day”  
  - “Find something bold and vintage for tonight”
- [ ] Pull clothing data from local `wardrobe.json` or SQLite
- [ ] Respond with outfit suggestions using embedded wardrobe knowledge
- [ ] Allow voice interaction with `Whisper` and respond via TTS
- [ ] Log feedback on whether the user liked the outfit
- [ ] Learn from choices over time (simple preference model)

*Note: The AI logic lives in the `agent/` folder and is modular. You can iterate independently from the UI layer.*

---

## 🔁 Integration Plan

Eventually, this Mac app will:
- Run the local AI brain
- Sync with StyleMuse mobile (local network or API)
- Become a full daily personal assistant for wardrobe and style

---

## 💡 Folder Structure (For Reference)
