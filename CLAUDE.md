# Pest Empire Tycoon - Development Guide

## Game Overview
A turn-based business simulation where you build and manage a pest control empire. Focus on strategic planning over reflexes, with minimal graphics and maximum strategic depth.

## Core Mechanics

### Client Management
- Onboard new clients (revenue streams)
- Each client has satisfaction level
- Different client types with varying demands (speed, ethics, cost)
- Client retention depends on service quality

### Turn-Based System
- Each turn = 1 week
- Plan jobs, assign employees, make decisions
- Execute turn to see results
- No real-time pressure - thoughtful strategy

### Resources
- **Money**: Revenue from jobs, costs for expenses
- **Employees**: Need skills, salaries, assigned to jobs
- **Trucks**: 1 per employee, required for jobs
- **Equipment**: Tools that affect job quality/speed

### Progression
- Upgrade tree with multiple paths:
  - Speed (faster job completion)
  - Customer Service (higher satisfaction)
  - Eco-Friendly (ethical pest removal)
- Unlock new equipment tiers
- Expand service coverage area

### Challenges
- Seasonal pest surges (demand spikes)
- Staff skill variability (can fail jobs)
- Equipment breakdowns
- Competitor pressure
- Client demands (speed vs ethics trade-offs)

## Technical Principles

### Keep It Simple
- **No over-engineering**: Build only what's needed for the current feature
- **No premature abstraction**: Three similar lines > complex abstraction
- **Vanilla first**: Use frameworks only if justified
- **Local storage**: No backend until absolutely necessary
- **Static assets**: No build step unless needed

### What to Build
- Clean, minimal UI (buttons, lists, stats)
- Clear game state management
- Save/load system (localStorage)
- Turn execution system
- Upgrade tree logic
- Event/challenge system

### What NOT to Build
- Fancy animations (unless trivial)
- Complex graphics/canvas
- Multiplayer features
- Real-time elements
- Authentication system
- Backend API (initially)

## User Experience Goals
- Immediately playable (no tutorial overload)
- Clear feedback on decisions
- Strategic depth > complexity
- Satisfying progression curve
- Replayability through different strategies

## Development Approach
- Start with core game loop (turn execution)
- Add one system at a time
- Test each feature works before moving on
- Keep state simple and inspectable
- Make it fun before making it pretty
