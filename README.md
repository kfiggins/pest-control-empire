# 🐛 Pest Empire Tycoon

A strategic turn-based business simulation game where you build and manage a pest control empire from the ground up.

## Game Overview

Start with nothing but your skills and $2,000 in startup capital. Acquire clients, hire employees, purchase equipment, and make strategic upgrades as you grow from a one-person operation to a thriving pest control empire. Every week presents new challenges and opportunities—can you reach $25,000 in weekly profit and achieve victory?

## Core Features

### 📊 Business Management
- **Turn-Based Strategy**: Plan each week carefully—assign employees, make purchases, then execute
- **Client Portfolio**: Four distinct client types (Residential, Commercial, Speed-Focused, Eco-Focused)
- **Dynamic Satisfaction**: Keep clients happy or risk losing them to competitors
- **Referral System**: Satisfied clients (80%+ satisfaction) can refer new business for free

### 👷 Employee Management
- **Skill Progression**: Four skill levels (Trainee → Junior → Experienced → Expert)
- **XP & Promotions**: Employees gain experience and can be promoted for better performance
- **Smart Assignment**: Match employees to clients based on their skills and client needs
- **Automation**: Unlock auto-assign, auto-promote, and auto-hire features

### 🔧 Equipment & Upgrades
- **Equipment Shop**: Sprayers, traps, safety gear—each providing bonuses to job performance
- **Upgrade Paths**: Four strategic paths to develop your business
  - **Speed**: Faster job completion and routing efficiency
  - **Customer Service**: Higher satisfaction and revenue bonuses
  - **Eco-Friendly**: Organic solutions for environmentally conscious clients
  - **Operations**: Automation and business efficiency improvements

### 🎲 Events & Challenges
- **Random Events**: Equipment sales, pest surges, employee illness, referral bonuses
- **Seasonal Variation**: Market conditions change over time
- **Strategic Trade-offs**: Balance speed vs. quality, growth vs. stability

### 💾 Save System
- **Auto-Save**: Game automatically saves after each turn
- **Manual Save/Load**: Save and load your progress at any time
- **Persistent State**: Pick up right where you left off

## Victory & Game Over

**Victory Conditions** (all must be met):
- Weekly Profit: $25,000 or more
- Active Clients: 12 or more
- Employees: 6 or more

**Game Over**: Go bankrupt (cash drops below $0)

## Tech Stack

- **Vanilla JavaScript** - Zero dependencies, easy to understand and modify
- **HTML5/CSS3** - Responsive design that works on desktop and mobile
- **localStorage** - Client-side persistence
- **No build step** - Just open `index.html` and play

## Getting Started

### Play the Game

**Option 1: Direct File Open**
```bash
# Just open the HTML file in your browser
open index.html
```

**Option 2: Local Server** (recommended for development)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### How to Play

1. **Week 1**: You start with $2,000 and your own skills
2. **Acquire Clients**: Get your first client to start generating revenue (costs increase exponentially)
3. **Assign Yourself**: Assign yourself to service your clients
4. **Execute Turn**: Click "Next Week" to process the week
5. **Expand**: Hire employees, buy equipment, and unlock upgrades
6. **Grow**: Keep clients satisfied, manage cash flow, and scale your operation
7. **Win**: Reach $25k weekly profit with 12+ clients and 6+ employees

### Tips for Success

- **Start Small**: Get 2-3 clients before hiring your first employee
- **Watch Cash Flow**: Don't expand too fast—bankruptcy ends the game
- **Keep Clients Happy**: Service all clients or they'll leave (unserviced clients lose satisfaction 2x faster)
- **Upgrade Strategically**: Choose upgrade paths that match your strategy
- **Leverage Referrals**: Keep satisfaction above 80% for free client referrals (3% chance per week)
- **Promote Employees**: Experienced employees perform better and can handle more clients

## Project Structure

```
pest-control-empire/
├── index.html              # Main game page
├── title.svg               # Game logo
├── *.svg                   # Tab icons
├── styles/
│   └── main.css           # All game styles
├── js/
│   ├── game.js            # Core game loop, state management, turn execution
│   ├── client.js          # Client types, satisfaction, revenue calculation
│   ├── employee.js        # Skills, assignments, promotions, XP
│   ├── equipment.js       # Equipment catalog, upgrade tree, bonuses
│   ├── events.js          # Random events, challenges
│   ├── ui.js              # DOM manipulation, rendering, modals
│   └── storage.js         # localStorage save/load system
├── CLAUDE.md              # Development philosophy and guidelines
└── README.md              # This file
```

## Game Mechanics Deep Dive

### Client Types

- **Residential** ($350/week): Basic clients, easiest to satisfy
- **Commercial** ($600/week): High-paying but demanding, require skilled employees
- **Speed-Focused** ($450/week): Value fast service over everything else
- **Eco-Focused** ($500/week): Want organic solutions, benefit from eco equipment

### Employee Skill Levels

| Level | Max Clients | Salary | Success Rate | XP to Promote |
|-------|------------|--------|--------------|---------------|
| Trainee | 2 | $250/wk | ~70% | 20 |
| Junior | 3 | $400/wk | ~80% | 30 |
| Experienced | 4 | $600/wk | ~90% | 40 |
| Expert | 5 | $800/wk | ~95% | Max Level |

### Economics

- **Starting Cash**: $2,000
- **Business Overhead**: $300/week (starts Week 5)
- **Client Acquisition**: $200-600 base (increases exponentially with each client acquired)
- **Hiring Cost**: $1,800-3,500 (includes employee + truck)
- **Equipment**: $400-2,000
- **Upgrades**: $1,000-5,000

### Satisfaction System

- Base decay: -3 to -5 per week (varies by client type)
- Unserviced penalty: 2x decay rate
- Service quality affects satisfaction gain
- Below 50%: Client leaves your business
- Above 80%: 3% chance to refer new client each week

## Design Philosophy

- **Strategic Depth over Complexity**: Every decision matters, but the rules are clear
- **Turn-Based Thinking**: No reflexes or quick reactions—just thoughtful planning
- **Progression Systems**: Multiple paths to victory through different upgrade strategies
- **Risk vs Reward**: Balance aggressive growth with financial stability
- **Vanilla JavaScript**: No frameworks, no dependencies, no build process—just code

## Development

### Architecture

The game uses a modular architecture with clear separation of concerns:

- **game.js**: Game state, turn execution, core logic
- **client.js**: Client types, satisfaction mechanics
- **employee.js**: Skill system, assignments, XP
- **equipment.js**: Equipment catalog, upgrade trees
- **events.js**: Random event system
- **ui.js**: Rendering and DOM manipulation
- **storage.js**: Persistence layer

### Making Changes

1. Edit the relevant `.js` file in the `js/` directory
2. Increment the version number in `index.html` script tags (`?v=XX`) to bust browser cache
3. Refresh the browser to see your changes
4. Game state is auto-saved—use "New Game" to reset if needed

### Adding New Features

- **New Client Type**: Add to `CLIENT_TYPES` in `client.js`
- **New Equipment**: Add to `equipment` object in `equipment.js`
- **New Upgrade**: Add to `upgrades` object in `equipment.js`
- **New Event**: Add to `eventTypes` in `events.js`

## Contributing

This is a personal learning project, but feedback and suggestions are welcome! Feel free to:
- Open an issue for bugs or suggestions
- Fork and experiment with your own mechanics
- Share interesting strategies you discover

## License

MIT License - Feel free to learn from, modify, and build upon this code.

---

**Built with vanilla JavaScript and strategic thinking** ☕
