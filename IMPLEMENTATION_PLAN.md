# Pest Empire Tycoon - Implementation Plan

## Technology Stack

### Core Technology: **Vanilla JavaScript**
**Rationale**:
- Turn-based game with simple UI - no need for framework overhead
- Immediate execution - no build step
- Easy debugging and state inspection
- Fast iteration
- Can always refactor to React later if state management becomes unwieldy

### Tech Choices:
- **HTML5**: Structure
- **CSS3**: Styling (CSS Grid/Flexbox for layout)
- **Vanilla JavaScript (ES6+)**: Game logic and interactivity
- **localStorage**: Save/load game state
- **No bundler**: Direct script tags (for now)
- **No backend**: Fully client-side

### File Structure:
```
/
├── index.html           # Main game page
├── styles/
│   ├── main.css        # Global styles
│   └── components.css  # Reusable component styles
├── js/
│   ├── game.js         # Core game state and loop
│   ├── client.js       # Client management
│   ├── employee.js     # Employee/truck management
│   ├── equipment.js    # Equipment and upgrades
│   ├── events.js       # Random events/challenges
│   ├── ui.js           # UI rendering and interactions
│   └── storage.js      # Save/load functionality
├── data/
│   ├── upgrades.json   # Upgrade tree data
│   ├── equipment.json  # Equipment definitions
│   └── events.json     # Event definitions
├── CLAUDE.md           # Development guide
└── README.md           # Project documentation
```

---

## Development Phases (Session-Sized Chunks)

### **Phase 1: Core Game Loop & Foundation** ⏱️ ~1 session
**Goal**: Playable skeleton - you can advance turns and see basic state

**Files**: `index.html`, `js/game.js`, `js/ui.js`, `styles/main.css`

**Features**:
- Basic HTML structure with game area
- Game state object (money, week number, basic stats)
- Turn advancement button
- Simple UI rendering (display money, week, basic info)
- Week progression logic
- Basic CSS layout (header, main area, sidebar)

**Success Criteria**: You can click "Next Week" and see the week counter increment

---

### **Phase 2: Client Management System** ⏱️ ~1 session
**Goal**: Clients generate revenue and have satisfaction levels

**Files**: `js/client.js`, update `js/game.js`, update `js/ui.js`

**Features**:
- Client data structure (name, type, satisfaction, revenue, demands)
- Generate random clients with different types (speed-focused, eco-focused, budget)
- "Acquire Client" button (costs money)
- Display client list with stats
- Basic satisfaction decay over time
- Revenue generation each turn
- Client loss when satisfaction drops too low

**Success Criteria**: You can acquire clients, they generate income, and satisfaction affects retention

---

### **Phase 3: Employee & Truck System** ⏱️ ~1 session
**Goal**: Employees perform jobs to service clients

**Files**: `js/employee.js`, update `js/game.js`, update `js/ui.js`, update `js/client.js`

**Features**:
- Employee data structure (name, skill level, salary, assigned truck)
- Truck data structure (condition, assigned employee)
- "Hire Employee" button (costs money, includes truck)
- Assign employees to service clients
- Job execution during turn (employee skill affects client satisfaction)
- Employee salaries deducted each turn
- Display employee roster and assignment interface

**Success Criteria**: You can hire employees, assign them to clients, and jobs affect client satisfaction

---

### **Phase 4: Equipment & Basic Upgrades** ⏱️ ~1 session
**Goal**: Purchase equipment and upgrades to improve operations

**Files**: `js/equipment.js`, `data/equipment.json`, update `js/employee.js`, update `js/ui.js`

**Features**:
- Equipment data structure (name, cost, effects, tier)
- Equipment shop interface
- Equipment effects on job performance (speed, quality, eco-rating)
- Basic upgrade tree (3-5 simple upgrades)
- Upgrade purchase and effects on game state
- Display owned equipment and available upgrades

**Success Criteria**: You can buy equipment, and it improves employee performance

---

### **Phase 5: Events & Challenges** ⏱️ ~1 session
**Goal**: Random events add variety and challenge

**Files**: `js/events.js`, `data/events.json`, update `js/game.js`, update `js/ui.js`

**Features**:
- Event system (random chance each turn)
- Event types:
  - Seasonal pest surges (demand spike)
  - Equipment breakdowns (repair costs)
  - Competitor actions (client poaching)
  - Positive events (new client opportunities, equipment deals)
- Event notification UI
- Event effects on game state
- Simple event probability based on week/season

**Success Criteria**: Events trigger randomly and affect gameplay meaningfully

---

### **Phase 6: Save/Load & Game Balance** ⏱️ ~1 session
**Goal**: Persistent progress and balanced gameplay

**Files**: `js/storage.js`, update all relevant files, add `styles/components.css`

**Features**:
- Save game state to localStorage
- Load game state on page load
- Auto-save after each turn
- Manual save button
- Reset/new game functionality
- Balance pass on all costs/revenues/progression
- Add game over conditions (bankruptcy)
- Add win conditions or endless mode structure

**Success Criteria**: Game progress persists across browser sessions

---

### **Phase 7: UI Polish & Advanced Features** ⏱️ ~1 session
**Goal**: Make it feel polished and add depth

**Files**: Update CSS files, add animations, enhance all UI components

**Features**:
- Improved CSS styling (cohesive theme, better colors)
- Smooth transitions for turn execution
- Client/employee detail modals or panels
- Tooltips for game mechanics
- Statistics screen (total revenue, clients served, etc.)
- Achievement system (optional)
- Advanced upgrade tree branches
- Tutorial/help section

**Success Criteria**: Game feels polished and is easy to understand

---

## State Management Strategy

### Core Game State Object:
```javascript
const gameState = {
  week: 1,
  money: 5000,
  clients: [],
  employees: [],
  trucks: [],
  equipment: [],
  upgrades: [],
  stats: {
    totalRevenue: 0,
    totalJobs: 0,
    clientsLost: 0,
    clientsAcquired: 0
  },
  settings: {
    difficulty: 'normal'
  }
}
```

### Update Pattern:
- All state changes go through game.js functions
- UI re-renders after state changes
- No direct DOM manipulation from game logic
- Clear separation: game logic vs UI rendering

---

## Session Optimization Notes

### To Minimize Token Usage:
1. **Complete one phase per session** - don't jump around
2. **Read only files you're modifying** - avoid reading whole codebase
3. **Use data files for configuration** - easier to update without context
4. **Keep functions small and focused** - easier to modify parts
5. **Comment key sections** - helps next session understand without re-reading everything

### Handoff Between Sessions:
- At end of each phase, test the feature works
- Commit working code
- Note any known issues or next steps
- Start next session by reading CLAUDE.md and the specific files you'll modify

---

## Testing Approach

### Manual Testing Checklist:
- [ ] Can start new game
- [ ] Can advance turns
- [ ] Can acquire clients
- [ ] Can hire employees
- [ ] Can assign employees to clients
- [ ] Revenue/costs calculate correctly
- [ ] Client satisfaction changes appropriately
- [ ] Can purchase equipment/upgrades
- [ ] Events trigger and affect game
- [ ] Can save and load game
- [ ] Game over conditions work

### Balance Testing:
- [ ] Starting money allows meaningful choices
- [ ] Progression feels rewarding
- [ ] Challenge increases appropriately
- [ ] Multiple viable strategies exist

---

## Future Enhancements (Post-MVP)

- More complex upgrade trees
- Multiple regions/markets to expand into
- Seasonal system with calendar
- Staff training and specialization
- Marketing campaigns to attract clients
- Loan system for capital
- Leaderboard (requires backend)
- Different game modes (endless, challenge, scenarios)

---

## Key Design Decisions

### Why Turn-Based?
- Fits "thoughtful strategy" goal
- Easier to implement than real-time
- Better for web (no performance concerns)
- Mobile-friendly (tap to play)

### Why Vanilla JS?
- Fast development for this scope
- No build complexity
- Easy debugging
- Can refactor later if needed

### Why No Backend?
- Game is single-player
- localStorage is sufficient for saves
- Reduces complexity dramatically
- Can add backend later for leaderboards

---

## Getting Started

**Next Step**: Begin Phase 1 - Core Game Loop & Foundation

Run this in a new session:
```
Let's start building Pest Empire Tycoon. Please read CLAUDE.md and implement Phase 1 from IMPLEMENTATION_PLAN.md
```
