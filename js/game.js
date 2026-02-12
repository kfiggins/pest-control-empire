/**
 * Core Game State and Logic
 * Manages the main game loop, state, and turn progression
 */

const Game = {
    // Game State
    state: {
        week: 1,
        money: 5000,
        clients: [],
        employees: [],
        trucks: [],
        equipment: [],
        upgrades: [],

        // Weekly tracking
        weeklyRevenue: 0,
        weeklyExpenses: 0,

        // Lifetime stats
        stats: {
            totalRevenue: 0,
            totalExpenses: 0,
            totalProfit: 0,
            clientsAcquired: 0,
            clientsLost: 0,
            totalJobs: 0
        },

        // Settings
        settings: {
            difficulty: 'normal'
        }
    },

    // Initialize game
    init() {
        console.log('🎮 Game initialized');
        this.resetWeeklyStats();
    },

    // Reset weekly revenue/expenses tracking
    resetWeeklyStats() {
        this.state.weeklyRevenue = 0;
        this.state.weeklyExpenses = 0;
    },

    // Main turn execution - this is where the magic happens each week
    executeTurn() {
        console.log(`📅 Executing Week ${this.state.week}`);

        // Reset weekly tracking
        this.resetWeeklyStats();

        // Phase 1: Process revenue (jobs, clients)
        this.processRevenue();

        // Phase 2: Process expenses (salaries, maintenance)
        this.processExpenses();

        // Phase 3: Process events
        this.processEvents();

        // Phase 4: Update state
        this.updateGameState();

        // Phase 5: Advance week
        this.state.week++;

        // Log turn results
        const netProfit = this.state.weeklyRevenue - this.state.weeklyExpenses;
        this.logAction(`Week ${this.state.week - 1} complete. Net: ${this.formatMoney(netProfit)}`);

        console.log(`✅ Week ${this.state.week - 1} complete. Cash: ${this.formatMoney(this.state.money)}`);
    },

    // Process all revenue sources
    processRevenue() {
        // Currently no revenue sources (clients will be added in Phase 2)
        // Placeholder for future revenue logic

        // Example: Base weekly revenue just to show the system works
        const baseRevenue = 0; // Will come from clients later
        this.addRevenue(baseRevenue);
    },

    // Process all expenses
    processExpenses() {
        // Currently no expenses (employees will be added in Phase 3)
        // Placeholder for future expense logic

        const baseExpenses = 0; // Will come from salaries, maintenance later
        this.addExpense(baseExpenses);
    },

    // Process random events
    processEvents() {
        // Placeholder for Phase 5 - Events & Challenges
        // Random events will be processed here
    },

    // Update overall game state after turn
    updateGameState() {
        // Calculate net profit for the week
        const netProfit = this.state.weeklyRevenue - this.state.weeklyExpenses;

        // Update cash
        this.state.money += netProfit;

        // Update lifetime stats
        this.state.stats.totalRevenue += this.state.weeklyRevenue;
        this.state.stats.totalExpenses += this.state.weeklyExpenses;
        this.state.stats.totalProfit = this.state.stats.totalRevenue - this.state.stats.totalExpenses;

        // Check for game over conditions
        if (this.state.money < 0) {
            this.gameOver('bankruptcy');
        }
    },

    // Add revenue to weekly total
    addRevenue(amount) {
        this.state.weeklyRevenue += amount;
    },

    // Add expense to weekly total
    addExpense(amount) {
        this.state.weeklyExpenses += amount;
    },

    // Log action to action log
    logAction(message) {
        if (window.UI && UI.addLogEntry) {
            UI.addLogEntry(message);
        }
    },

    // Format money for display
    formatMoney(amount) {
        const formatted = Math.abs(amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return amount < 0 ? `-$${formatted}` : `$${formatted}`;
    },

    // Game over handling
    gameOver(reason) {
        console.log(`💀 Game Over: ${reason}`);
        this.logAction(`GAME OVER: ${reason === 'bankruptcy' ? 'Your business went bankrupt!' : 'Unknown reason'}`);

        // Disable further turns
        const nextWeekBtn = document.getElementById('next-week-btn');
        if (nextWeekBtn) {
            nextWeekBtn.disabled = true;
            nextWeekBtn.textContent = 'Game Over';
        }
    },

    // Start new game
    newGame() {
        console.log('🔄 Starting new game');

        // Reset state
        this.state = {
            week: 1,
            money: 5000,
            clients: [],
            employees: [],
            trucks: [],
            equipment: [],
            upgrades: [],
            weeklyRevenue: 0,
            weeklyExpenses: 0,
            stats: {
                totalRevenue: 0,
                totalExpenses: 0,
                totalProfit: 0,
                clientsAcquired: 0,
                clientsLost: 0,
                totalJobs: 0
            },
            settings: {
                difficulty: 'normal'
            }
        };

        // Re-enable turn button
        const nextWeekBtn = document.getElementById('next-week-btn');
        if (nextWeekBtn) {
            nextWeekBtn.disabled = false;
            nextWeekBtn.textContent = 'Next Week →';
        }

        // Clear and reset action log
        if (window.UI && UI.clearLog) {
            UI.clearLog();
            this.logAction('New game started! Build your pest control empire.');
        }

        // Refresh UI
        if (window.UI && UI.update) {
            UI.update();
        }
    },

    // Get current game state (for debugging and save/load)
    getState() {
        return this.state;
    }
};

// Export for console debugging
window.Game = Game;
