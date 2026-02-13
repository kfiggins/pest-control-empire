/**
 * Core Game State and Logic
 * Manages the main game loop, state, and turn progression
 */

const Game = {
    // Game State
    state: {
        week: 1,
        money: 2000,
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
        },

        // Automation settings (controlled by upgrades and user toggles)
        automationSettings: {
            autoAssignEnabled: true,  // Toggle for auto-assign (requires OPS_1 upgrade)
            autoPromoteEnabled: true, // Toggle for auto-promote (requires OPS_3 upgrade)
            autoHireEnabled: true,    // Toggle for auto-hire (requires OPS_4 upgrade)
            autoHireCashBuffer: 3000, // Don't auto-hire if cash would drop below this
            autoPromoteCashBuffer: 2000 // Don't auto-promote if cash would drop below this
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
        } else {
            // No saved game - start a new game
            this.newGame();
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

        // Phase -1: Automation (run before jobs are processed)
        this.autoHireEmployees();    // Hire first if needed
        this.autoPromoteEmployees(); // Promote next
        this.autoAssignClients();    // Then assign to clients

        // Phase 0: Process jobs (employees service clients)
        this.processJobs();

        // Phase 0.5: Process referrals (happy clients refer new clients)
        this.processReferrals();

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

    // Process client referrals (happy clients refer new clients)
    processReferrals() {
        const REFERRAL_SATISFACTION_THRESHOLD = 80;
        const REFERRAL_CHANCE = 0.03; // 3% chance per week if satisfied

        let referralsThisWeek = 0;

        this.state.clients.forEach(client => {
            // Only satisfied clients can refer (>= 80 satisfaction)
            if (client.satisfaction >= REFERRAL_SATISFACTION_THRESHOLD) {
                // Random chance to refer
                if (Math.random() < REFERRAL_CHANCE) {
                    // Generate a new random client for free
                    const newClient = ClientManager.generateClient();
                    this.state.clients.push(newClient);
                    this.state.stats.clientsAcquired++;
                    referralsThisWeek++;

                    this.logAction(`🎉 ${client.name} referred a new client: ${newClient.name}!`);
                    console.log(`👥 Referral from ${client.name} → ${newClient.name}`);
                }
            }
        });

        if (referralsThisWeek > 0) {
            console.log(`📞 ${referralsThisWeek} referral(s) this week`);
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

        // Business overhead (rent, insurance, utilities, licensing)
        // Starts from Week 5 to give early game breathing room
        if (this.state.week >= 5) {
            const overhead = 300;
            this.addExpense(overhead);
            this.logAction(`Business overhead: ${this.formatMoney(overhead)} (rent, insurance, utilities)`);
        }
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

    // === AUTOMATION FUNCTIONS ===

    // Auto-assign available employees to unserviced clients
    autoAssignClients() {
        const upgradeEffects = EquipmentManager.calculateUpgradeEffects(this.state.ownedUpgrades);

        // Check if auto-assign is enabled (upgrade + user setting)
        if (!upgradeEffects.autoAssign || !this.state.automationSettings.autoAssignEnabled) {
            return;
        }

        // Find unserviced clients
        const unservicedClients = this.state.clients.filter(client => {
            const assignedEmployees = this.state.employees.filter(emp =>
                emp.assignedClients.includes(client.id)
            );
            return assignedEmployees.length === 0;
        });

        if (unservicedClients.length === 0) {
            return;
        }

        // Find available employees (those with capacity for more clients)
        const availableEmployees = this.state.employees.filter(emp =>
            emp.assignedClients.length < emp.maxClients
        );

        if (availableEmployees.length === 0) {
            return;
        }

        let assignedCount = 0;

        // Use smart matching if available (OPS_2+)
        if (upgradeEffects.smartMatching) {
            // Sort clients by difficulty (Commercial > Eco > Speed > Residential)
            const clientDifficulty = { 'COMMERCIAL': 3, 'ECO_FOCUSED': 2, 'SPEED_FOCUSED': 1, 'RESIDENTIAL': 0 };
            unservicedClients.sort((a, b) =>
                (clientDifficulty[b.type] || 0) - (clientDifficulty[a.type] || 0)
            );

            // Sort employees by skill level (Expert > Experienced > Junior > Trainee)
            const skillRanking = { 'EXPERT': 3, 'EXPERIENCED': 2, 'JUNIOR': 1, 'TRAINEE': 0 };
            availableEmployees.sort((a, b) =>
                (skillRanking[b.skillLevel] || 0) - (skillRanking[a.skillLevel] || 0)
            );

            // Match hardest clients to best employees
            for (const client of unservicedClients) {
                const employee = availableEmployees.find(emp =>
                    emp.assignedClients.length < emp.maxClients
                );

                if (employee) {
                    employee.assignedClients.push(client.id);
                    assignedCount++;
                    this.logAction(`🤖 Auto-assigned ${employee.name} to ${client.name}`);
                }
            }
        } else {
            // Simple assignment: first available employee
            for (const client of unservicedClients) {
                const employee = availableEmployees.find(emp =>
                    emp.assignedClients.length < emp.maxClients
                );

                if (employee) {
                    employee.assignedClients.push(client.id);
                    assignedCount++;
                    this.logAction(`🤖 Auto-assigned ${employee.name} to ${client.name}`);
                }
            }
        }

        if (assignedCount > 0) {
            console.log(`🤖 Auto-assigned ${assignedCount} client(s)`);
        }
    },

    // Auto-promote eligible employees
    autoPromoteEmployees() {
        const upgradeEffects = EquipmentManager.calculateUpgradeEffects(this.state.ownedUpgrades);

        // Check if auto-promote is enabled (upgrade + user setting)
        if (!upgradeEffects.autoPromote || !this.state.automationSettings.autoPromoteEnabled) {
            return;
        }

        const cashBuffer = this.state.automationSettings.autoPromoteCashBuffer;
        let promotedCount = 0;

        for (const employee of this.state.employees) {
            // Get promotion info
            const promotionInfo = EmployeeManager.getPromotionInfo(employee);

            // Skip if not eligible or at max level
            if (!promotionInfo || !promotionInfo.canPromote) {
                continue;
            }

            // Check if we have enough cash (with buffer)
            if (this.state.money >= promotionInfo.cost + cashBuffer) {
                // Use existing promoteEmployee method (it handles all the logic)
                const success = this.promoteEmployee(employee.id);

                if (success) {
                    promotedCount++;
                    // Override the log message to show it was automated
                    this.logAction(`🤖 Auto-promoted ${employee.name} to ${employee.skillData.name}`);
                }
            }
        }

        if (promotedCount > 0) {
            console.log(`🤖 Auto-promoted ${promotedCount} employee(s)`);
        }
    },

    // Auto-hire employees when needed
    autoHireEmployees() {
        const upgradeEffects = EquipmentManager.calculateUpgradeEffects(this.state.ownedUpgrades);

        // Check if auto-hire is enabled (upgrade + user setting)
        if (!upgradeEffects.autoHire || !this.state.automationSettings.autoHireEnabled) {
            return;
        }

        // Check if there are unserviced clients
        const unservicedClients = this.state.clients.filter(client => {
            const assignedEmployees = this.state.employees.filter(emp =>
                emp.assignedClients.includes(client.id)
            );
            return assignedEmployees.length === 0;
        });

        // Check if existing employees have capacity
        const hasCapacity = this.state.employees.some(emp =>
            emp.assignedClients.length < emp.maxClients
        );

        // Only hire if there are unserviced clients and no capacity
        if (unservicedClients.length === 0 || hasCapacity) {
            return;
        }

        const cashBuffer = this.state.automationSettings.autoHireCashBuffer;

        // Try to hire a Junior employee (good balance of cost and capability)
        const hireCost = EmployeeManager.getHireCost('JUNIOR');

        if (this.state.money >= hireCost + cashBuffer) {
            const success = this.hireEmployee('JUNIOR');
            if (success) {
                this.logAction(`🤖 Auto-hired new employee`);
                console.log(`🤖 Auto-hired employee`);
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
            const clientIndex = clientsToRemove[i];
            const lostClient = this.state.clients[clientIndex];

            // Clean up employee assignments for this lost client
            if (lostClient) {
                this.state.employees.forEach(employee => {
                    const assignedIndex = employee.assignedClients.indexOf(lostClient.id);
                    if (assignedIndex !== -1) {
                        employee.assignedClients.splice(assignedIndex, 1);
                    }
                });
            }

            this.state.clients.splice(clientIndex, 1);
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
            message += `• Total Revenue: ${this.formatMoney(this.state.stats.totalRevenue)}\n`;
            message += `• Weekly Profit: ${this.formatMoney(this.state.weeklyRevenue - this.state.weeklyExpenses)}/week\n`;
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
        // Calculate weekly profit
        const weeklyProfit = this.state.weeklyRevenue - this.state.weeklyExpenses;

        // Victory condition: reach $25,000 WEEKLY profit with 12+ clients and 6+ employees
        if (weeklyProfit >= 25000 &&
            this.state.clients.length >= 12 &&
            this.state.employees.length >= 6) {
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
            money: 2000,
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
            },
            automationSettings: {
                autoAssignEnabled: true,
                autoPromoteEnabled: true,
                autoHireEnabled: true,
                autoHireCashBuffer: 3000,
                autoPromoteCashBuffer: 2000
            }
        };

        // Create starting employee (the owner - Junior level)
        const owner = EmployeeManager.generateEmployee('JUNIOR');
        owner.name = 'You (Owner)'; // Special name for the owner
        const ownerTruck = EmployeeManager.generateTruck();
        ownerTruck.assignedEmployee = owner.id;
        owner.truckId = ownerTruck.id;

        this.state.employees.push(owner);
        this.state.trucks.push(ownerTruck);

        // Re-enable turn button
        const nextWeekBtn = document.getElementById('next-week-btn');
        if (nextWeekBtn) {
            nextWeekBtn.disabled = false;
            nextWeekBtn.textContent = 'Next Week →';
        }

        // Clear and reset action log
        if (window.UI && UI.clearLog) {
            UI.clearLog();
            this.logAction('🏢 Welcome to your new pest control business! You start with $2,000 and your skills.');
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

    // Calculate exponential cost multiplier for client acquisition
    // Cost increases with each client acquired to encourage referrals
    getClientAcquisitionMultiplier() {
        const clientsAcquired = this.state.stats.clientsAcquired || 0;
        // Exponential formula: 1.3 ^ clientsAcquired
        // First few clients affordable, but gets expensive fast
        return Math.pow(1.3, clientsAcquired);
    },

    // Acquire a new client (cost increases exponentially)
    acquireClient(typeKey = null) {
        const client = ClientManager.generateClient(typeKey);
        const baseCost = client.typeData.acquisitionCost;
        const multiplier = this.getClientAcquisitionMultiplier();
        const cost = Math.floor(baseCost * multiplier);

        // DEBUG LOGGING
        console.log('🔍 ACQUIRE CLIENT DEBUG:');
        console.log('  Client type:', client.type);
        console.log('  Base cost:', baseCost);
        console.log('  Multiplier:', multiplier);
        console.log('  Final cost:', cost);
        console.log('  Money BEFORE:', this.state.money);
        console.log('  Clients acquired so far:', this.state.stats.clientsAcquired);

        // Check if we can afford it
        if (this.state.money < cost) {
            this.logAction(`❌ Cannot acquire ${client.name} - insufficient funds (need ${this.formatMoney(cost)})`);
            return false;
        }

        // Deduct cost
        this.state.money -= cost;

        console.log('  Money AFTER deduction:', this.state.money);
        console.log('  Expected money:', 3000 - cost);

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

        // Check if employee is sick
        if (employee.temporarilyUnassigned) {
            this.logAction(`❌ ${employee.name} is sick and cannot be assigned to clients`);
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

        // Calculate actual cost (with discount if active)
        let actualCost = equipment.cost;
        const activeEvent = window.EventManager ? EventManager.getActiveEvent() : null;
        const discount = activeEvent?.discount || 0;

        if (discount > 0) {
            actualCost = Math.floor(equipment.cost * (1 - discount));
        }

        // Check if we can afford it
        if (this.state.money < actualCost) {
            this.logAction(`❌ Cannot purchase ${equipment.name} - insufficient funds (need ${this.formatMoney(actualCost)})`);
            return false;
        }

        // Deduct cost
        this.state.money -= actualCost;

        // Add equipment
        this.state.ownedEquipment.push(equipmentId);

        const costMessage = discount > 0
            ? `${this.formatMoney(actualCost)} (${Math.round(discount * 100)}% off!)`
            : this.formatMoney(actualCost);
        this.logAction(`✅ Purchased ${equipment.name} - Cost: ${costMessage}`);

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
    },

    // Promote employee to next skill level
    promoteEmployee(employeeId) {
        const employee = this.state.employees.find(emp => emp.id === employeeId);

        if (!employee) {
            return false;
        }

        // Get promotion info
        const promotionInfo = EmployeeManager.getPromotionInfo(employee);

        // VALIDATION: Check if promotable
        if (!promotionInfo || !promotionInfo.canPromote) {
            this.logAction(`❌ ${employee.name} is not ready for promotion`);
            return false;
        }

        // VALIDATION: Check affordability
        if (this.state.money < promotionInfo.cost) {
            this.logAction(`❌ Cannot afford promotion (${this.formatMoney(promotionInfo.cost)})`);
            return false;
        }

        // DEDUCTION: Subtract cost
        this.state.money -= promotionInfo.cost;

        // UPDATE: Promote employee
        const oldSkill = employee.skillLevel;
        employee.skillLevel = promotionInfo.nextLevel;
        employee.skillData = EmployeeManager.skillLevels[promotionInfo.nextLevel];
        employee.salary = employee.skillData.weeklySalary;
        employee.maxClients = employee.skillData.maxClients;
        employee.xp = 0; // Reset XP

        // LOG: Success message
        this.logAction(`⭐ ${employee.name} promoted from ${oldSkill} to ${promotionInfo.nextLevel}!`);

        console.log(`⭐ Employee promoted: ${employee.name}`, { from: oldSkill, to: promotionInfo.nextLevel });
        return true;
    }
};

// Export for console debugging
window.Game = Game;
