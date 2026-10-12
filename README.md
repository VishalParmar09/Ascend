# ⚔️ Ascend: The System

> *"You have received a Daily Quest: Preparation to Become Strong."*

**Ascend** is a gamified self-improvement and fitness tracking platform inspired by RPG progression systems and anime-style status interfaces.

The goal is to transform everyday habits, physical training, and personal discipline into a structured progression journey. Users complete quests, earn experience points (XP), level up, track their training, and measure their consistency over time.

## 🚧 Project Status

Ascend is currently in the planning and initial development stage.

Features described below represent the planned product and will be implemented incrementally as the project develops.

## 🌟 Planned Features

- **📜 Daily Quest System:** Create and complete daily tasks for physical fitness, learning, productivity, and personal development.
- **📊 Hunter Status Window:** View player level, rank, XP, progress, and RPG-inspired attributes such as STR, AGI, VIT, INT, and PER.
- **🏋️ Custom Training Programs:** Create workout routines and record exercises, sets, reps, weights, running distances, and workout history.
- **⚖️ XP and Progression Engine:** Award experience based on predefined quest difficulty, completion rules, and consistency.
- **🔥 Streaks and Achievements:** Track consecutive days of activity and unlock achievements for reaching milestones.
- **🏆 Leaderboard:** Compare progress with other users through transparent, server-calculated rankings.
- **📈 Progress Analytics:** Review quest completion rates, training history, personal records, and long-term consistency.

## 🛠️ Proposed Technology Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | CSS; Tailwind CSS may be added |
| Backend | Java 21 + Spring Boot |
| API | REST |
| Database | PostgreSQL |
| Persistence | Spring Data JPA + Hibernate |
| Build Tool | Maven |
| Version Control | Git + GitHub |

The frontend will communicate with the backend through REST APIs. The backend will handle application rules, user data, quest completion, XP calculations, and database operations.

## 🏗️ Planned Architecture

```text
┌──────────────────────────────────────┐
│           React Web App              │
│       Player Dashboard & Quests      │
└──────────────────┬───────────────────┘
                   │
                REST API
                   │
┌──────────────────▼───────────────────┐
│       Java + Spring Boot API          │
│  Quest Logic · XP · Training · Users │
└──────────────────┬───────────────────┘
                   │
           Spring Data JPA
                   │
┌──────────────────▼───────────────────┐
│            PostgreSQL                │
│  Users · Quests · XP · Workout Logs  │
└──────────────────────────────────────┘
```

## 📂 Planned Project Structure

```text
Ascend/
├── frontend/       # React web application
├── backend/        # Spring Boot REST API
├── .gitignore      # Files excluded from version control
└── README.md       # Project documentation
```

## 🎯 Project Goals

- Build a functional full-stack web application.
- Learn and apply Git-based version control throughout development.
- Design a maintainable backend with clear business logic.
- Practice database design, REST API development, and automated testing.
- Deploy the application and document how to run it.
- Explore a native Android client after the web application is established.

## 👤 Author

**Vishal Parmar** — [@VishalParmar09](https://github.com/VishalParmar09)

B.Tech in Computer Science and Engineering

---

*Ascend is an independent learning and software development project. It is not affiliated with or endorsed by the creators or rights holders of Solo Leveling.*
