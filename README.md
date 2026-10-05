# WWF WrestleFest Arcade - Vocabulary Super Match 🤼‍♂️📚

An authentic 16-bit retro arcade wrestling HTML game inspired by **WWF WrestleFest**, integrated with educational vocabulary learning, multi-touch mobile landscape support, and Google Sheets classroom score tracking.

![WWF WrestleFest Arcade](https://img.shields.io/badge/Arcade-WWF_WrestleFest-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge)

---

## 🎮 Game Features

- **WWF WrestleFest Arcade Aesthetic**: 2D HTML5 canvas arena with ring ropes, turnbuckles, animated audience camera flashes, commentary ticker, and 16-bit retro synthesized audio.
- **Super Gauge Mechanic**: Fills as students punch, kick, taunt, or grapple in the ring.
- **Vocabulary Definition Popups**:
  - Shows word definitions on the top screen banner when the Super Gauge is 100% full.
  - Correct choice triggers a **Finisher Move Execution Combo** (e.g., *Atomic Legdrop*, *Gorilla Press Slam*, *Flying Elbow Drop*), deals massive damage, awards **+100 MARKS**, and unlocks a pinfall opportunity!
  - Incorrect choice results in an opponent counter-reversal and **-50 MARKS** deduction.
- **Rotated Multi-Touch Mobile Screen Auto-Fit**:
  - Built for rotated mobile screens (landscape orientation).
  - Multi-touch virtual D-Pad + 4 action buttons (`Punch [A]`, `Kick [B]`, `Taunt [C]`, `Pin [D]`) with simultaneous touch point tracking.
  - Auto-orientation detection prompt for mobile users.
- **Google Sheets Apps Script Integration**:
  - Automatically sends student results (Student Name, Student ID, Class, Score, Correct/Incorrect Answers, Time Spent) to a Google Sheet via a lightweight Apps Script Web App!
  - Fallback local history and downloadable CSV report card for offline classrooms.
- **Included Vocabulary List**:
  1. `entertainment`: something people watch for pleasure
  2. `ring`: the place where two boxers fight
  3. `crowd`: a large group of people
  4. `Commentator`: the person who describes the action in a sport
  5. `go crazy`: get very excited, shout and jump up and down
  6. `fans`: people who like a sports person or famous celebrity
  7. `salary`: the money you earn for work
  8. `spectator`: a person who watches a boxing match
  9. `scream`: to make a loud, high sound when excited

---

## 🚀 Pushing to GitHub

To push this repository to GitHub:

```bash
# 1. Initialize Git Repository
git init

# 2. Add all files & commit
git add .
git commit -m "Initial commit: WWF WrestleFest Vocabulary Arcade Game"

# 3. Create a new empty repository on GitHub and link remote:
git remote add origin https://github.com/YOUR_USERNAME/wrestlefest-vocabulary-game.git
git branch -M main
git push -u origin main
```

---

## 📊 Google Sheets Apps Script Setup

1. Open a new Google Sheet.
2. Go to **Extensions -> Apps Script**.
3. Replace the default code with the script provided in the in-game **Teacher Settings** modal.
4. Click **Deploy -> New Deployment**.
5. Select Type **Web app**, set **Execute as: Me**, and **Who has access: Anyone**.
6. Copy the Web App URL and paste it into the **Google Sheets Settings** panel inside the game!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📜 License
Apache-2.0 / Educational License
