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
        ownedEquipment: [],
        ownedUpgrades: [],

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

        // Game state
        gameOver: false,
        gameOverReason: null,

        // Settings
        settings: {
            difficulty: 'normal'
        }
    },

    // Initialize game
    init() {
        console.log('🎮 Game initialized');

        // Try to load saved game
        if (window.StorageManager && StorageManager.hasSavedGame()) {
            const savedState = StorageManager.loadGame();
            if (savedState) {
                this.state = savedState;
                this.logAction(`Game loaded from ${StorageManager.getFormattedSaveTime()}`);
                console.log('📂 Loaded saved game');
            }
        }

        this.resetWeeklyStats();
    },

    // Reset weekly revenue/expenses tracking
    resetWeeklyStats() {
        this.state.weeklyRevenue = 0;
        this.state.weeklyExpenses = 0;
    },

    // Main turn execution - this is where the magic happens each week
    executeTurn() {
        // Don't allow turns if game is over
        if (this.state.gameOver) {
            console.log('⚠️ Cannot execute turn - game is over');
            return;
        }

        console.log(`📅 Executing Week ${this.state.week}`);

        // Reset weekly tracking
        this.resetWeeklyStats();

        // Phase 0: Process jobs (employees service clients)
        this.processJobs();

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

        // Auto-save after each turn
        if (window.StorageManager) {
            StorageManager.autoSave(this.state);
        }
    },

    // Process jobs (employees service clients)
    processJobs() {
        let jobsCompleted = 0;

        // Get equipment and upgrade bonuses
        const equipmentBonuses = EquipmentManager.calculateEquipmentBonuses(this.state.ownedEquipment);
        const upgradeEffects = EquipmentManager.calculateUpgradeEffects(this.state.ownedUpgrades);

        // Process each employee's assignments
        this.state.employees.forEach(employee => {
            // Service all assigned clients
            employee.assignedClients.forEach(clientId => {
                const client = this.state.clients.find(c => c.id === clientId);

                if (client) {
                    // Service the client with bonuses
                    const result = EmployeeManager.serviceClient(employee, client, equipmentBonuses, upgradeEffects);

                    if (result.success) {
                        jobsCompleted++;
                        this.state.stats.totalJobs++;
                    }
                }
            });

            // Increment weeks employed
            employee.weeksEmployed++;
        });

        if (jobsCompleted > 0) {
            this.logAction(`✅ Completed ${jobsCompleted} service jobs`);
        }
    },

    // Process all revenue sources
    processRevenue() {
        // Get upgrade effects for revenue bonuses
        const upgradeEffects = EquipmentManager.calculateUpgradeEffects(this.state.ownedUpgrades);

        // Process client revenue
        let clientRevenue = 0;
        let servicedClients = 0;
        let unservicedClients = 0;

        this.state.clients.forEach(client => {
            // Check if client has an employee assigned
            const hasEmployee = this.state.employees.some(emp => emp.assignedClients.includes(client.id));

            let revenue = ClientManager.calculateRevenue(client, hasEmployee);

            // Apply revenue bonus from upgrades
            if (revenue > 0 && upgradeEffects.revenueBonus > 0) {
                revenue *= (1 + upgradeEffects.revenueBonus);
                revenue = Math.floor(revenue);
            }

            clientRevenue += revenue;
            client.totalRevenue += revenue;
            client.weeksActive++;

            if (hasEmployee) {
                servicedClients++;
            } else {
                unservicedClients++;
            }
        });

        if (clientRevenue > 0) {
            this.logAction(`Client revenue: ${this.formatMoney(clientRevenue)} from ${servicedClients} serviced clients`);
        }

        if (unservicedClients > 0) {
            this.logAction(`⚠️ ${unservicedClients} unserviced clients (no revenue, double satisfaction decay)`);
        }

        this.addRevenue(clientRevenue);
    },

    // Process all expenses
    processExpenses() {
        let totalSalaries = 0;

        // Calculate employee salaries
        this.state.employees.forEach(employee => {
            totalSalaries += employee.salary;
        });

        if (totalSalaries > 0) {
            this.logAction(`Employee salaries: ${this.formatMoney(totalSalaries)} for ${this.state.employees.length} employees`);
        }

        this.addExpense(totalSalaries);
    },

    // Process random events
    processEvents() {
        // Clean up any effects from previous turn (e.g., restore sick employees)
        if (window.EventManager) {
            EventManager.processTurnCleanup(this.state);
        }

        // Check for new events
        if (window.EventManager) {
            const event = EventManager.checkForEvent(this.state);
            if (event) {
                EventManager.triggerEvent(this.state, event);
            }
        }
    },

    // Update overall game state after turn
    updateGameState() {
        // Update client satisfaction
        const clientsToRemove = [];

        this.state.clients.forEach((client, index) => {
            const oldSatisfaction = client.satisfaction;
            ClientManager.updateSatisfaction(client);

            // Check if client should be lost
            if (ClientManager.shouldLoseClient(client)) {
                clientsToRemove.push(index);
                this.logAction(`❌ Lost client: ${client.name} (satisfaction too low)`);
                this.state.stats.clientsLost++;
            } else if (Math.floor(oldSatisfaction / 20) !== Math.floor(client.satisfaction / 20)) {
                // Log significant satisfaction changes
                const status = ClientManager.getSatisfactionStatus(client.satisfaction);
                this.logAction(`${client.name} satisfaction: ${status.text} (${Math.floor(client.satisfaction)}%)`);
            }
        });

        // Remove lost clients (in reverse order to maintain indices)
        for (let i = clientsToRemove.length - 1; i >= 0; i--) {
            this.state.clients.splice(clientsToRemove[i], 1);
        }

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
            return;
        }

        // Check for victory conditions
        this.checkVictoryConditions();
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

        // Mark game as over in state
        this.state.gameOver = true;
        this.state.gameOverReason = reason;

        // Build game over message
        let message = '';
        let title = '';

        if (reason === 'bankruptcy') {
            title = '💀 GAME OVER - Bankruptcy';
            message = `Your business went bankrupt in week ${this.state.week}!\n\n`;
            message += `Final Statistics:\n`;
            message += `• Total Revenue: ${this.formatMoney(this.state.stats.totalRevenue)}\n`;
            message += `• Total Expenses: ${this.formatMoney(this.state.stats.totalExpenses)}\n`;
            message += `• Clients Acquired: ${this.state.stats.clientsAcquired}\n`;
            message += `• Jobs Completed: ${this.state.stats.totalJobs}\n\n`;
            message += `Better luck next time!`;
        } else if (reason === 'victory') {
            title = '🎉 VICTORY!';
            message = `Congratulations! You've built a successful pest control empire!\n\n`;
            message += `Final Statistics:\n`;
            message += `• Weeks Survived: ${this.state.week}\n`;
            message += `• Total Profit: ${this.formatMoney(this.state.stats.totalProfit)}\n`;
            message += `• Clients: ${this.state.clients.length}\n`;
            message += `• Employees: ${this.state.employees.length}\n`;
            message += `• Jobs Completed: ${this.state.stats.totalJobs}`;
        }

        this.logAction(`${title}: ${reason}`);

        // Show game over modal via UI
        if (window.UI && UI.showGameOverModal) {
            setTimeout(() => {
                UI.showGameOverModal(title, message, reason);
            }, 500);
        } else {
            // Fallback to alert if UI not available
            alert(`${title}\n\n${message}`);
        }

        // Disable further turns
        const nextWeekBtn = document.getElementById('next-week-btn');
        if (nextWeekBtn) {
            nextWeekBtn.disabled = true;
            nextWeekBtn.textContent = 'Game Over';
        }
    },

    // Check for victory conditions
    checkVictoryConditions() {
        // Victory condition: reach $50,000 profit with 10+ clients and 5+ employees
        if (this.state.stats.totalProfit >= 50000 &&
            this.state.clients.length >= 10 &&
            this.state.employees.length >= 5) {
            this.gameOver('victory');
            return true;
        }
        return false;
    },

    // Start new game
    newGame() {
        console.log('🔄 Starting new game');

        // Delete any existing save
        if (window.StorageManager) {
            StorageManager.deleteSave();
        }

        // Reset state
        this.state = {
            week: 1,
            money: 5000,
            clients: [],
            employees: [],
            trucks: [],
            ownedEquipment: [],
            ownedUpgrades: [],
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
            gameOver: false,
            gameOverReason: null,
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

        // Save initial state
        if (window.StorageManager) {
            StorageManager.saveGame(this.state);
        }
    },

    // Get current game state (for debugging and save/load)
    getState() {
        return this.state;
    },

    // Manual save game
    saveGame() {
        if (window.StorageManager) {
            const success = StorageManager.saveGame(this.state);
            if (success) {
                this.logAction('💾 Game saved successfully!');
                return true;
            } else {
                this.logAction('❌ Failed to save game');
                return false;
            }
        }
        return false;
    },

    // Manual load game
    loadGame() {
        if (window.StorageManager) {
            const savedState = StorageManager.loadGame();
            if (savedState) {
                this.state = savedState;
                this.logAction(`📂 Game loaded from ${StorageManager.getFormattedSaveTime()}`);

                // Refresh UI
                if (window.UI && UI.update) {
                    UI.update();
                }

                return true;
            } else {
                this.logAction('❌ No saved game found');
                return false;
            }
        }
        return false;
    },

    // Acquire a new client
    acquireClient(typeKey = null) {
        const client = ClientManager.generateClient(typeKey);
        const cost = client.typeData.acquisitionCost;

        // Check if we can afford it
        if (this.state.money < cost) {
            this.logAction(`❌ Cannot acquire ${client.name} - insufficient funds (need ${this.formatMoney(cost)})`);
            return false;
        }

        // Deduct cost
        this.state.money -= cost;

        // Add client
        this.state.clients.push(client);
        this.state.stats.clientsAcquired++;

        this.logAction(`✅ Acquired client: ${client.name} (${client.typeData.name}) - Cost: ${this.formatMoney(cost)}`);

        console.log(`🤝 New client: ${client.name}`, client);
        return true;
    },

    // Hire a new employee (includes truck)
    hireEmployee(skillKey = null) {
        const employee = EmployeeManager.generateEmployee(skillKey);
        const truck = EmployeeManager.generateTruck();
        const cost = EmployeeManager.getHireCost(employee.skillLevel);

        // Check if we can afford it
        if (this.state.money < cost) {
            this.logAction(`❌ Cannot hire ${employee.name} - insufficient funds (need ${this.formatMoney(cost)})`);
            return false;
        }

        // Link employee and truck
        employee.truckId = truck.id;
        truck.assignedEmployee = employee.id;

        // Deduct cost
        this.state.money -= cost;

        // Add employee and truck
        this.state.employees.push(employee);
        this.state.trucks.push(truck);

        this.logAction(`✅ Hired ${employee.name} (${employee.skillData.name}) with truck - Cost: ${this.formatMoney(cost)}`);

        console.log(`👷 New employee: ${employee.name}`, employee);
        return true;
    },

    // Assign employee to client
    assignEmployee(employeeId, clientId) {
        const employee = this.state.employees.find(e => e.id === employeeId);
        const client = this.state.clients.find(c => c.id === clientId);

        if (!employee || !client) {
            return false;
        }

        // Check if employee can be assigned
        if (!EmployeeManager.canAssign(employee)) {
            this.logAction(`❌ ${employee.name} is at full capacity (${employee.maxClients} clients)`);
            return false;
        }

        // Check if already assigned to this client
        if (EmployeeManager.isAssignedToClient(employee, clientId)) {
            this.logAction(`❌ ${employee.name} is already assigned to ${client.name}`);
            return false;
        }

        // Assign employee to client
        const success = EmployeeManager.assignToClient(employee, clientId);
        if (success) {
            this.logAction(`📋 Assigned ${employee.name} to ${client.name} (${employee.assignedClients.length}/${employee.maxClients})`);
        }

        return success;
    },

    // Unassign employee from specific client
    unassignEmployee(employeeId, clientId) {
        const employee = this.state.employees.find(e => e.id === employeeId);

        if (!employee) {
            return false;
        }

        const client = this.state.clients.find(c => c.id === clientId);
        const success = EmployeeManager.unassignFromClient(employee, clientId);

        if (success && client) {
            this.logAction(`📋 Unassigned ${employee.name} from ${client.name} (${employee.assignedClients.length}/${employee.maxClients})`);
        }

        return success;
    },

    // Purchase equipment
    purchaseEquipment(equipmentId) {
        const equipment = EquipmentManager.equipment[equipmentId];

        if (!equipment) {
            return false;
        }

        // Check if can purchase (prerequisites)
        if (!EquipmentManager.canPurchaseEquipment(equipmentId, this.state.ownedEquipment)) {
            this.logAction(`❌ Cannot purchase ${equipment.name} - prerequisites not met or already owned`);
            return false;
        }

        // Check if we can afford it
        if (this.state.money < equipment.cost) {
            this.logAction(`❌ Cannot purchase ${equipment.name} - insufficient funds (need ${this.formatMoney(equipment.cost)})`);
            return false;
        }

        // Deduct cost
        this.state.money -= equipment.cost;

        // Add equipment
        this.state.ownedEquipment.push(equipmentId);

        this.logAction(`✅ Purchased ${equipment.name} - Cost: ${this.formatMoney(equipment.cost)}`);

        console.log(`🔧 New equipment: ${equipment.name}`, equipment);
        return true;
    },

    // Purchase upgrade
    purchaseUpgrade(upgradeId) {
        const upgrade = EquipmentManager.upgrades[upgradeId];

        if (!upgrade) {
            return false;
        }

        // Check if can purchase (prerequisites)
        if (!EquipmentManager.canPurchaseUpgrade(upgradeId, this.state.ownedUpgrades)) {
            this.logAction(`❌ Cannot purchase ${upgrade.name} - prerequisites not met or already owned`);
            return false;
        }

        // Check if we can afford it
        if (this.state.money < upgrade.cost) {
            this.logAction(`❌ Cannot purchase ${upgrade.name} - insufficient funds (need ${this.formatMoney(upgrade.cost)})`);
            return false;
        }

        // Deduct cost
        this.state.money -= upgrade.cost;

        // Add upgrade
        this.state.ownedUpgrades.push(upgradeId);

        this.logAction(`✅ Purchased ${upgrade.name} - Cost: ${this.formatMoney(upgrade.cost)}`);

        console.log(`⬆️ New upgrade: ${upgrade.name}`, upgrade);
        return true;
    }
};

// Export for console debugging
window.Game = Game;
