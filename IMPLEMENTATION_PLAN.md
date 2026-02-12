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

### **Phase 8: Employee Progression & Promotion System** ⏱️ ~1 session
**Goal**: Employees gain experience and can be promoted to higher skill levels

**Why This Feature?**
- Current system: Employees are hired at a skill level and never improve
- Problem: No incentive to keep employees long-term vs constantly hiring/firing
- Solution: Add XP system where employees naturally progress through skill tiers
- Benefits: Adds strategic depth, rewards loyalty, makes `totalJobsCompleted` stat meaningful

**Files**: Update `js/employee.js`, `js/game.js`, `js/ui.js`

**Features**:
- XP tracking per employee (gained from completing jobs)
- Promotion system with thresholds:
  - Trainee → Junior (50 XP / ~25 jobs)
  - Junior → Experienced (100 XP / ~33 jobs)
  - Experienced → Expert (200 XP / ~50 jobs)
- Promotion costs money (training/certification fee)
- Promotion UI (notification when eligible, promotion button)
- Visual indicators for promotion progress
- Auto-increment employee stats when promoted (salary, maxClients, multiplier, satisfactionBonus)
- Balance: Make progression meaningful but not too fast/slow

**Success Criteria**: Employees gain XP from jobs and can be promoted through skill tiers, creating long-term investment value

---

### **Phase 9: Game Balance Overhaul - Making It Challenging** ⏱️ ~1 session
**Goal**: Rebalance the entire game to make it actually challenging and require strategic use of upgrades

**Why This Feature?**
- Current game: Too easy, can win without upgrades in 15-20 weeks
- User feedback: "I didn't use any of the upgrades because it was way too easy"
- Problem: No resource pressure, client retention trivial, upgrades optional
- Solution: Comprehensive rebalancing to make upgrades essential for victory

**Files**: Update `js/client.js`, `js/employee.js`, `js/game.js`, `js/equipment.js`, `js/events.js`, `js/ui.js`, `index.html`

**Changes Made**:

**1. Client Economics (Tighter Margins)**
- Acquisition costs increased 50-75%: Residential $200→$350, Speed $350→$550, Eco $400→$650, Commercial $600→$1,000
- Base revenue reduced 15%: Residential $300→$255, Speed $450→$380, Eco $500→$425, Commercial $800→$680
- Satisfaction decay increased 50-60%: Residential 3→5, Speed 5→8, Eco 4→6, Commercial 6→9
- Impact: Clients now take 4 weeks to break even vs 2 weeks

**2. Employee Costs (Higher Operating Expenses)**
- Salaries increased 25%: Trainee $400→$500, Junior $600→$750, Experienced $900→$1,125, Expert $1,200→$1,500
- Satisfaction bonuses reduced: Trainee 10→8, Junior 15→10, Experienced 20→12, Expert 25→15
- Impact: Without upgrades, employees barely maintain client satisfaction

**3. Game State Changes**
- Starting money reduced: $5,000→$3,000 (forces tighter early decisions)
- Weekly overhead added: $300/week starting Week 5 (constant burn rate)
- Victory conditions increased: $50k→$75k profit, 10→12 clients, 5→6 employees
- Impact: 50% harder to win, takes 40-50 weeks vs 15-20

**4. Equipment & Upgrade Nerfs (Still Useful, Not Game-Breaking)**
- Equipment satisfaction bonuses reduced ~30%: Basic Sprayer 5→3, Advanced 10→7, Eco 15→10, Trap Kit 5→3, Smart Traps 12→8, Gear 8→5
- Service Path revenue bonuses reduced: Tier 2 10%→8%, Tier 3 25%→12%
- Service Path satisfaction bonuses reduced: Tier 2 10→5, Tier 3 20→8
- Eco Path adjusted: Tier 3 satisfaction 10→6, revenue 15%→10%
- Impact: Upgrades transform from "game-breaking" to "essential but balanced"

**5. Event Adjustments (More Punishing)**
- Negative events hit harder: Equipment breakdowns $200-500→$400-800, Regulation fines $300-1,000→$500-1,500, Competitor poaching -10→-20 satisfaction
- Positive events less generous: Referral bonuses $300-800→$200-500, Equipment deals 50%→30% off
- Impact: Events create real challenges, not just flavor

**New Game Flow**:
- **Weeks 1-5**: Survival mode - tight money, tough decisions
- **Weeks 6-15**: Growth phase - overhead kicks in, need Tier 1 upgrades
- **Weeks 16-30**: Scaling challenge - need Tier 2 upgrades to handle more clients
- **Weeks 30-45**: Victory push - only with Tier 3 upgrades can you maintain 12+ clients

**Success Criteria**:
- Early game feels tight (every decision matters)
- Upgrades are essential to reach victory (not optional)
- Victory takes 40-50 weeks with good strategy
- Multiple viable paths (speed/service/eco all work)

---

### **Phase 10: Radical Difficulty Overhaul** ⏱️ ~1 session
**Goal**: Make game extremely challenging by forcing reliance on referrals and weekly profit targets

**Why This Feature?**
- User feedback: "It's still too easy. I didn't have to buy any upgrades again"
- Problem: Even after Phase 9 balance, game was still too easy to beat
- Solution: Exponential client costs, referral-based growth, weekly profit win condition, massive satisfaction nerf

**Files**: Update `js/employee.js`, `js/game.js`, `js/ui.js`, `index.html`

**Changes Made**:

**1. Satisfaction Restoration Massive Nerf (60% reduction)**
- Only Expert employees can maintain Commercial clients without upgrades
- Trainee: 8→3, Junior: 10→5, Experienced: 12→7, Expert: 15→9
- Forces players to match employee skill to client difficulty
- Makes equipment/upgrades absolutely essential for lower-tier employees

**2. Exponential Client Acquisition Costs**
- Cost multiplier: 1.3 ^ clientsAcquired
- First few clients affordable ($350-$1,000)
- By 10th client: Costs increase 13.8x (~$4,800-$13,800)
- Forces reliance on referrals for growth instead of buying all clients

**3. Referral System**
- Happy clients (satisfaction ≥ 80) have 15% chance to refer new client each week
- Referrals are FREE (no acquisition cost)
- Rewards maintaining high satisfaction
- Becomes primary growth mechanism in mid/late game

**4. Victory Condition: Weekly Profit**
- Changed from $75k total profit to $25k weekly profit
- Requires ~50+ clients with full upgrade paths
- Victory only achievable in very late game (40-60+ weeks)
- Tests sustained profitability, not just accumulation

**5. UI Updates**
- Victory progress shows "Weekly Profit" instead of "Total Profit"
- Client acquisition button shows dynamic cost with % increase indicator
- Victory goals: $25k/week, 12 clients, 6 employees

**New Game Balance**:
- Commercial client + Trainee: -6 net satisfaction/week (will lose client)
- Commercial client + Junior: -4 net satisfaction/week
- Commercial client + Experienced: -2 net satisfaction/week
- Commercial client + Expert: 0 net (perfect balance!)
- With upgrades/equipment: Lower tiers can maintain harder clients

**Expected Progression**:
- Weeks 1-10: Survive with starter clients, hire employees carefully
- Weeks 11-25: Scale via referrals, invest in Tier 1-2 upgrades
- Weeks 26-40: Build referral engine with high satisfaction
- Weeks 41-60+: Reach $25k/week with 50+ clients and full upgrades

**Success Criteria**:
- Early game requires careful resource management
- Mid game growth depends on referrals (buying clients becomes prohibitively expensive)
- Late game requires full upgrade investment to maintain large client base
- Victory feels truly earned

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
