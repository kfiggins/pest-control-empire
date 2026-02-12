# 🐛 Pest Empire Tycoon

A turn-based business simulation game where you build and manage a pest control empire.

## Game Concept

You're the mastermind behind a growing pest control business. Secure clients, keep them happy, and expand your empire through strategic planning and smart investments. Every decision matters in this thoughtful, turn-based strategy game.

## Core Features

- **Client Management**: Acquire and retain clients with varying demands
- **Employee System**: Hire skilled workers and assign them to jobs
- **Fleet Management**: Expand your truck fleet to serve more clients
- **Upgrade Tree**: Choose your path - Speed, Customer Service, or Eco-Friendly
- **Turn-Based Gameplay**: Plan your week carefully before executing
- **Challenges**: Handle seasonal surges, equipment failures, and competitors
- **Progression**: Build from a small startup to a pest control empire

## Tech Stack

- **Vanilla JavaScript** - No framework overhead, easy debugging
- **HTML5/CSS3** - Modern, responsive design
- **localStorage** - Client-side save/load system
- **No build step** - Just open index.html and play

## Development Status

🚧 **In Development** - See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for roadmap

### Planned Phases:
1. ⏳ Core Game Loop & Foundation
2. ⏳ Client Management System
3. ⏳ Employee & Truck System
4. ⏳ Equipment & Upgrades
5. ⏳ Events & Challenges
6. ⏳ Save/Load System
7. ⏳ UI Polish

## Getting Started

### Play the Game
```bash
# Simply open in browser
open index.html
# Or use a local server
npx serve .
```

### For Developers
1. Read [CLAUDE.md](CLAUDE.md) - Development guidelines
2. Check [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Detailed roadmap
3. Start with Phase 1 and work through each phase

## Project Structure

```
pest-control-empire/
├── index.html              # Main game page
├── styles/                 # CSS files
│   ├── main.css
│   └── components.css
├── js/                     # Game logic
│   ├── game.js            # Core state and loop
│   ├── client.js          # Client management
│   ├── employee.js        # Employee/truck system
│   ├── equipment.js       # Equipment and upgrades
│   ├── events.js          # Random events
│   ├── ui.js              # UI rendering
│   └── storage.js         # Save/load
├── data/                   # Game data (JSON)
│   ├── upgrades.json
│   ├── equipment.json
│   └── events.json
├── CLAUDE.md              # Development guide
├── IMPLEMENTATION_PLAN.md # Detailed roadmap
└── README.md              # This file
```

## Design Philosophy

- **Strategic Depth over Complexity**: Meaningful decisions without overwhelming the player
- **Turn-Based Thinking**: No reflexes required, just smart planning
- **Minimal but Polished**: Clean UI with clear feedback
- **Replayability**: Multiple viable strategies and upgrade paths

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

TBD

---

**Built with ☕ and strategic planning**
