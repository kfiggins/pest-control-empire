/**
 * UI Management
 * Handles all UI rendering and user interactions
 */

const UI = {
    // DOM element references
    elements: {},

    // Initialize UI
    init() {
        console.log('🎨 UI initialized');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Setup tab navigation
        this.setupTabNavigation();

        // Note: UI.update() is called externally after Game.init() to ensure game state is loaded first
    },

    // Cache all DOM elements we'll use
    cacheElements() {
        this.elements = {
            // Header stats
            weekDisplay: document.getElementById('week-display'),
            moneyDisplay: document.getElementById('money-display'),

            // Overview stats
            clientCount: document.getElementById('client-count'),
            employeeCount: document.getElementById('employee-count'),
            truckCount: document.getElementById('truck-count'),

            // Weekly summary
            weeklyRevenue: document.getElementById('weekly-revenue'),
            weeklyExpenses: document.getElementById('weekly-expenses'),
            weeklyNet: document.getElementById('weekly-net'),

            // Lifetime stats
            totalRevenue: document.getElementById('total-revenue'),
            totalExpenses: document.getElementById('total-expenses'),
            totalProfit: document.getElementById('total-profit'),

            // Lists
            clientList: document.getElementById('client-list'),
            employeeList: document.getElementById('employee-list'),
            equipmentList: document.getElementById('equipment-list'),
            upgradeTree: document.getElementById('upgrade-tree'),

            // Action log
            actionLog: document.getElementById('action-log'),

            // Buttons
            acquireClientBtn: document.getElementById('acquire-client-btn'),
            hireEmployeeBtn: document.getElementById('hire-employee-btn'),
            nextWeekBtn: document.getElementById('next-week-btn'),
            newGameBtn: document.getElementById('new-game-btn'),
            saveGameBtn: document.getElementById('save-game-btn'),
            loadGameBtn: document.getElementById('load-game-btn'),
            helpBtn: document.getElementById('help-btn')
        };
    },

    // Set up all event listeners
    setupEventListeners() {
        // Acquire Client button
        this.elements.acquireClientBtn.addEventListener('click', () => {
            this.onAcquireClient();
        });

        // Hire Employee button
        this.elements.hireEmployeeBtn.addEventListener('click', () => {
            this.onHireEmployee();
        });

        // Next Week button
        this.elements.nextWeekBtn.addEventListener('click', () => {
            this.onNextWeek();
        });

        // New Game button
        this.elements.newGameBtn.addEventListener('click', () => {
            this.onNewGame();
        });

        // Save/Load buttons
        this.elements.saveGameBtn.addEventListener('click', () => {
            this.onSaveGame();
        });

        this.elements.loadGameBtn.addEventListener('click', () => {
            this.onLoadGame();
        });

        // Help button
        this.elements.helpBtn.addEventListener('click', () => {
            this.showHelpModal();
        });
    },

    // Setup tab navigation
    setupTabNavigation() {
        // Desktop tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        const tabContainer = document.querySelector('.tab-content-container');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;

                // Remove active from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active to clicked tab
                e.currentTarget.classList.add('active');
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Scroll to top of new tab
                if (tabContainer) {
                    tabContainer.scrollTop = 0;
                }
            });
        });

        // Mobile bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;

                // Trigger desktop tab button click
                const tabButton = document.querySelector(`.tab-button[data-tab="${targetTab}"]`);
                if (tabButton) {
                    tabButton.click();
                }

                // Update bottom nav active state
                bottomNavItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    },

    // Handle Acquire Client button click
    onAcquireClient() {
        const success = Game.acquireClient();
        if (success) {
            this.update();
        }
    },

    // Handle Hire Employee button click
    onHireEmployee() {
        const success = Game.hireEmployee();
        if (success) {
            this.update();
        }
    },

    // Handle Next Week button click
    onNextWeek() {
        // Add visual feedback
        this.elements.nextWeekBtn.classList.add('btn-processing');
        this.elements.nextWeekBtn.textContent = 'Processing...';

        // Execute turn
        setTimeout(() => {
            Game.executeTurn();
            this.update();

            // Reset button
            this.elements.nextWeekBtn.classList.remove('btn-processing');
            this.elements.nextWeekBtn.textContent = 'Next Week →';
        }, 300);
    },

    // Handle New Game button click
    onNewGame() {
        const confirmed = confirm('Start a new game? Current progress will be lost.');
        if (confirmed) {
            Game.newGame();
            this.update();
        }
    },

    // Handle Save Game button click
    onSaveGame() {
        Game.saveGame();
    },

    // Handle Load Game button click
    onLoadGame() {
        const confirmed = confirm('Load saved game? Current unsaved progress will be lost.');
        if (confirmed) {
            Game.loadGame();
        }
    },

    // Update all UI elements with current game state
    update() {
        const state = Game.getState();

        // Update header stats
        this.elements.weekDisplay.textContent = state.week;
        this.elements.moneyDisplay.textContent = Game.formatMoney(state.money);

        // Add color coding for money
        if (state.money < 0) {
            this.elements.moneyDisplay.classList.add('negative');
            this.elements.moneyDisplay.classList.remove('positive');
        } else {
            this.elements.moneyDisplay.classList.add('positive');
            this.elements.moneyDisplay.classList.remove('negative');
        }

        // Update overview stats
        this.elements.clientCount.textContent = state.clients.length;
        this.elements.employeeCount.textContent = state.employees.length;
        this.elements.truckCount.textContent = state.trucks.length;

        // Update client acquisition cost display (dynamic based on clients acquired)
        const costMultiplier = Game.getClientAcquisitionMultiplier();
        const minCost = Math.floor(350 * costMultiplier); // Residential base
        const maxCost = Math.floor(1000 * costMultiplier); // Commercial base

        // Hide acquire client section when costs become prohibitively expensive (10x multiplier)
        const acquireClientBtn = document.getElementById('acquire-client-btn');
        const acquireClientInfo = document.querySelector('#acquire-client-btn + .action-info');

        if (costMultiplier >= 10) {
            // Hide button and info when too expensive
            if (acquireClientBtn) acquireClientBtn.style.display = 'none';
            if (acquireClientInfo) acquireClientInfo.style.display = 'none';
        } else {
            // Show button and update cost display
            if (acquireClientBtn) acquireClientBtn.style.display = 'block';
            if (acquireClientInfo) acquireClientInfo.style.display = 'block';

            const clientCostInfo = acquireClientInfo?.querySelector('p:first-child');
            if (clientCostInfo) {
                if (costMultiplier > 1.2) {
                    clientCostInfo.innerHTML = `Cost: ${Game.formatMoney(minCost)} - ${Game.formatMoney(maxCost)} <span style="color: var(--color-accent);">(+${Math.round((costMultiplier - 1) * 100)}%)</span>`;
                } else {
                    clientCostInfo.textContent = `Cost: ${Game.formatMoney(minCost)} - ${Game.formatMoney(maxCost)}`;
                }
            }
        }

        // Update weekly summary
        this.elements.weeklyRevenue.textContent = Game.formatMoney(state.weeklyRevenue);
        this.elements.weeklyExpenses.textContent = Game.formatMoney(state.weeklyExpenses);

        const weeklyNet = state.weeklyRevenue - state.weeklyExpenses;
        this.elements.weeklyNet.textContent = Game.formatMoney(weeklyNet);

        // Color code weekly net
        if (weeklyNet < 0) {
            this.elements.weeklyNet.classList.add('negative');
            this.elements.weeklyNet.classList.remove('positive');
        } else if (weeklyNet > 0) {
            this.elements.weeklyNet.classList.add('positive');
            this.elements.weeklyNet.classList.remove('negative');
        }

        // Update lifetime stats
        this.elements.totalRevenue.textContent = Game.formatMoney(state.stats.totalRevenue);
        this.elements.totalExpenses.textContent = Game.formatMoney(state.stats.totalExpenses);
        this.elements.totalProfit.textContent = Game.formatMoney(state.stats.totalProfit);

        // Update victory progress
        this.updateVictoryProgress();

        // Update tab badges with contextual info
        this.updateTabBadges();

        // Check for active events and display notification
        this.displayEventNotification();

        // Render client list
        this.renderClientList();

        // Render employee list
        this.renderEmployeeList();

        // Render equipment shop
        this.renderEquipmentShop();

        // Render upgrade tree
        this.renderUpgradeTree();
    },

    // Update victory progress bars
    updateVictoryProgress() {
        const state = Game.getState();

        // Weekly profit progress (revenue - expenses for current week)
        const weeklyProfit = state.weeklyRevenue - state.weeklyExpenses;
        const profitGoal = 25000;
        const profitProgress = Math.min(100, (weeklyProfit / profitGoal) * 100);
        const profitEl = document.getElementById('victory-profit');
        const profitBarEl = document.getElementById('victory-profit-bar');
        if (profitEl) profitEl.textContent = `${Game.formatMoney(weeklyProfit)} / ${Game.formatMoney(profitGoal)}`;
        if (profitBarEl) {
            profitBarEl.style.width = `${profitProgress}%`;
            profitBarEl.style.backgroundColor = profitProgress >= 100 ? 'var(--color-primary)' : 'var(--color-secondary)';
        }

        // Clients progress
        const clientsGoal = 12;
        const clientsProgress = Math.min(100, (state.clients.length / clientsGoal) * 100);
        const clientsEl = document.getElementById('victory-clients');
        const clientsBarEl = document.getElementById('victory-clients-bar');
        if (clientsEl) clientsEl.textContent = `${state.clients.length} / ${clientsGoal}`;
        if (clientsBarEl) {
            clientsBarEl.style.width = `${clientsProgress}%`;
            clientsBarEl.style.backgroundColor = clientsProgress >= 100 ? 'var(--color-primary)' : 'var(--color-secondary)';
        }

        // Employees progress
        const employeesGoal = 6;
        const employeesProgress = Math.min(100, (state.employees.length / employeesGoal) * 100);
        const employeesEl = document.getElementById('victory-employees');
        const employeesBarEl = document.getElementById('victory-employees-bar');
        if (employeesEl) employeesEl.textContent = `${state.employees.length} / ${employeesGoal}`;
        if (employeesBarEl) {
            employeesBarEl.style.width = `${employeesProgress}%`;
            employeesBarEl.style.backgroundColor = employeesProgress >= 100 ? 'var(--color-primary)' : 'var(--color-secondary)';
        }
    },

    // Update tab badges with contextual information
    updateTabBadges() {
        const state = Game.getState();

        // Update Clients tab: Show assigned/total
        const clientsTabBtn = document.querySelector('.tab-button[data-tab="clients"]');
        const clientsBottomNav = document.querySelector('.bottom-nav-item[data-tab="clients"]');

        if (clientsTabBtn || clientsBottomNav) {
            // Count assigned clients (clients that have at least one employee assigned)
            const assignedCount = state.clients.filter(client => {
                return state.employees.some(emp => emp.assignedClients.includes(client.id));
            }).length;

            const totalCount = state.clients.length;

            if (clientsTabBtn) {
                // Remove existing badges
                const existingBadge = clientsTabBtn.querySelector('.tab-badge');
                if (existingBadge) existingBadge.remove();

                // Add new badge if needed
                if (totalCount > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'tab-badge';
                    badge.textContent = `${assignedCount}/${totalCount}`;
                    clientsTabBtn.appendChild(badge);
                }
            }
            if (clientsBottomNav) {
                const label = clientsBottomNav.querySelector('.label');
                if (label) {
                    label.innerHTML = totalCount > 0 ? `Clients <span class="nav-badge">${assignedCount}/${totalCount}</span>` : 'Clients';
                }
            }
        }

        // Update Employees tab: Show count + promotion notification
        const employeesTabBtn = document.querySelector('.tab-button[data-tab="employees"]');
        const employeesBottomNav = document.querySelector('.bottom-nav-item[data-tab="employees"]');

        if (employeesTabBtn || employeesBottomNav) {
            const employeeCount = state.employees.length;

            // Count employees eligible for promotion
            const promotableCount = state.employees.filter(emp => {
                const promotionInfo = EmployeeManager.getPromotionInfo(emp);
                return promotionInfo && promotionInfo.canPromote;
            }).length;

            if (employeesTabBtn) {
                // Remove existing badges
                const existingBadges = employeesTabBtn.querySelectorAll('.tab-badge, .tab-notification');
                existingBadges.forEach(b => b.remove());

                // Add count badge if needed
                if (employeeCount > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'tab-badge';
                    badge.textContent = employeeCount;
                    employeesTabBtn.appendChild(badge);
                }

                // Add promotion notification if needed
                if (promotableCount > 0) {
                    const notification = document.createElement('span');
                    notification.className = 'tab-notification';
                    notification.textContent = promotableCount;
                    employeesTabBtn.appendChild(notification);
                }
            }
            if (employeesBottomNav) {
                const label = employeesBottomNav.querySelector('.label');
                if (label) {
                    let badgeHTML = employeeCount > 0 ? ` <span class="nav-badge">${employeeCount}</span>` : '';
                    if (promotableCount > 0) {
                        badgeHTML += ` <span class="nav-notification">${promotableCount}</span>`;
                    }
                    label.innerHTML = `Team${badgeHTML}`;
                }
            }
        }
    },

    // Add entry to action log
    addLogEntry(message) {
        const entry = document.createElement('p');
        entry.className = 'log-entry';
        entry.textContent = `Week ${Game.getState().week}: ${message}`;

        this.elements.actionLog.appendChild(entry);

        // Auto-scroll to bottom
        this.elements.actionLog.scrollTop = this.elements.actionLog.scrollHeight;

        // Limit log entries to prevent memory issues
        const maxEntries = 50;
        while (this.elements.actionLog.children.length > maxEntries) {
            this.elements.actionLog.removeChild(this.elements.actionLog.firstChild);
        }
    },

    // Clear action log
    clearLog() {
        this.elements.actionLog.innerHTML = '';
    },

    // Display event notification if there's an active event
    displayEventNotification() {
        if (!window.EventManager) return;

        const event = EventManager.getActiveEvent();

        // Find or create event notification area
        let eventNotification = document.getElementById('event-notification');
        if (!eventNotification) {
            eventNotification = document.createElement('div');
            eventNotification.id = 'event-notification';
            eventNotification.className = 'event-notification';
            document.body.appendChild(eventNotification);
        }

        if (event) {
            // Determine event class based on type
            let eventClass = 'event-neutral';
            if (event.type === 'positive') eventClass = 'event-positive';
            if (event.type === 'negative') eventClass = 'event-negative';

            eventNotification.innerHTML = `
                <div class="event-content ${eventClass}">
                    <div class="event-header">
                        <span class="event-icon">${event.type === 'positive' ? '✨' : event.type === 'negative' ? '⚠️' : 'ℹ️'}</span>
                        <span class="event-name">${event.name}</span>
                    </div>
                    <div class="event-message">${event.message}</div>
                    <button class="btn btn-primary event-dismiss" onclick="UI.dismissEvent()">OK</button>
                </div>
            `;
            eventNotification.style.display = 'flex';
            document.body.classList.add('modal-open');
        } else {
            eventNotification.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    },

    // Dismiss the active event notification
    dismissEvent() {
        if (window.EventManager) {
            EventManager.clearActiveEvent();
        }
        const eventNotification = document.getElementById('event-notification');
        if (eventNotification) {
            eventNotification.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    },

    // Render client list
    renderClientList() {
        const state = Game.getState();
        const clientList = this.elements.clientList;

        // Clear existing content
        clientList.innerHTML = '';

        // Show empty state if no clients
        if (state.clients.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No clients yet. Acquire your first client to start generating revenue!';
            clientList.appendChild(emptyState);
            return;
        }

        // Render each client
        state.clients.forEach(client => {
            const clientCard = document.createElement('div');
            clientCard.className = 'client-card';

            const satisfactionStatus = ClientManager.getSatisfactionStatus(client.satisfaction);
            const weeklyRevenue = ClientManager.calculateRevenue(client);

            clientCard.innerHTML = `
                <div class="client-header">
                    <div class="client-name">${client.name}</div>
                    <div class="client-type" style="color: ${client.typeData.color}">
                        ${client.typeData.name}
                    </div>
                </div>
                <div class="client-stats">
                    <div class="client-stat">
                        <span class="client-stat-label">Satisfaction:</span>
                        <span class="client-stat-value" style="color: ${satisfactionStatus.color}">
                            ${Math.floor(client.satisfaction)}% - ${satisfactionStatus.text}
                        </span>
                    </div>
                    <div class="client-stat">
                        <span class="client-stat-label">Weekly Revenue:</span>
                        <span class="client-stat-value positive">
                            ${Game.formatMoney(weeklyRevenue)}
                        </span>
                    </div>
                    <div class="client-stat">
                        <span class="client-stat-label">Weeks Active:</span>
                        <span class="client-stat-value">
                            ${client.weeksActive}
                        </span>
                    </div>
                    <div class="client-stat">
                        <span class="client-stat-label">Total Revenue:</span>
                        <span class="client-stat-value">
                            ${Game.formatMoney(client.totalRevenue)}
                        </span>
                    </div>
                </div>
                <div class="client-demands">
                    ${client.demands.map(demand => `<span class="demand-tag">${demand}</span>`).join('')}
                </div>
            `;

            // Add satisfaction bar
            const satisfactionBar = document.createElement('div');
            satisfactionBar.className = 'satisfaction-bar';
            satisfactionBar.innerHTML = `
                <div class="satisfaction-fill" style="width: ${client.satisfaction}%; background-color: ${satisfactionStatus.color}"></div>
            `;
            clientCard.appendChild(satisfactionBar);

            clientList.appendChild(clientCard);
        });
    },

    // Render employee list
    renderEmployeeList() {
        const state = Game.getState();
        const employeeList = this.elements.employeeList;

        // Clear existing content
        employeeList.innerHTML = '';

        // Show empty state if no employees
        if (state.employees.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No employees yet. Hire your first employee to service clients!';
            employeeList.appendChild(emptyState);
            return;
        }

        // Render each employee
        state.employees.forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.className = 'employee-card';

            // Build assigned clients list
            let assignedClientsHTML = '';
            if (employee.assignedClients.length === 0) {
                assignedClientsHTML = '<span class="no-assignments">No clients assigned</span>';
            } else {
                assignedClientsHTML = '<div class="assigned-clients">';
                employee.assignedClients.forEach(clientId => {
                    const client = state.clients.find(c => c.id === clientId);
                    if (client) {
                        assignedClientsHTML += `
                            <div class="assigned-client-tag">
                                ${client.name}
                                <button class="unassign-client-btn" data-employee-id="${employee.id}" data-client-id="${clientId}">×</button>
                            </div>
                        `;
                    }
                });
                assignedClientsHTML += '</div>';
            }

            const availableSlots = employee.maxClients - employee.assignedClients.length;

            employeeCard.innerHTML = `
                <div class="employee-header">
                    <div class="employee-name">${employee.name}</div>
                    <div class="employee-skill" style="color: ${employee.skillData.color}">
                        ${employee.skillData.name}
                    </div>
                </div>
                <div class="employee-stats">
                    <div class="employee-stat">
                        <span class="employee-stat-label">Weekly Salary:</span>
                        <span class="employee-stat-value negative">
                            ${Game.formatMoney(employee.salary)}
                        </span>
                    </div>
                    <div class="employee-stat">
                        <span class="employee-stat-label">Capacity:</span>
                        <span class="employee-stat-value ${availableSlots === 0 ? 'negative' : 'positive'}">
                            ${employee.assignedClients.length}/${employee.maxClients} clients
                        </span>
                    </div>
                    <div class="employee-stat">
                        <span class="employee-stat-label">Jobs Done:</span>
                        <span class="employee-stat-value">
                            ${employee.totalJobsCompleted}
                        </span>
                    </div>
                    <div class="employee-stat">
                        <span class="employee-stat-label">Weeks Employed:</span>
                        <span class="employee-stat-value">
                            ${employee.weeksEmployed}
                        </span>
                    </div>
                    ${this.renderXPProgress(employee)}
                </div>
                <div class="assigned-clients-section">
                    <span class="employee-stat-label">Assigned Clients:</span>
                    ${assignedClientsHTML}
                </div>
                <div class="employee-actions">
                    ${this.renderEmployeeAssignmentControls(employee, state.clients, state.employees)}
                </div>
                ${this.renderPromotionButton(employee, state)}
            `;

            employeeList.appendChild(employeeCard);
        });

        // Add event listeners to assignment buttons
        this.setupEmployeeAssignmentListeners();
    },

    // Render assignment controls for an employee
    renderEmployeeAssignmentControls(employee, clients, allEmployees) {
        if (clients.length === 0) {
            return '<p class="assignment-hint">No clients to assign</p>';
        }

        // Check if employee is at capacity
        if (!EmployeeManager.canAssign(employee)) {
            return '<p class="assignment-hint">At full capacity</p>';
        }

        // Get all assigned client IDs from ALL employees
        const allAssignedClientIds = new Set();
        allEmployees.forEach(emp => {
            emp.assignedClients.forEach(clientId => allAssignedClientIds.add(clientId));
        });

        // Filter out clients that are assigned to ANY employee
        const availableClients = clients.filter(c => !allAssignedClientIds.has(c.id));

        if (availableClients.length === 0) {
            return '<p class="assignment-hint">All clients already assigned</p>';
        }

        // Create dropdown of available clients
        let html = `<select class="client-select" data-employee-id="${employee.id}">`;
        html += '<option value="">Select Client...</option>';

        availableClients.forEach(client => {
            html += `<option value="${client.id}">${client.name}</option>`;
        });

        html += '</select>';
        html += `<button class="btn btn-small btn-primary assign-btn" data-employee-id="${employee.id}">Assign</button>`;

        return html;
    },

    // Render XP progress for employee
    renderXPProgress(employee) {
        const promotionInfo = EmployeeManager.getPromotionInfo(employee);

        // Don't show XP for max level employees
        if (!promotionInfo) {
            return '';
        }

        const xp = employee.xp || 0;
        const xpProgress = Math.min(100, (xp / promotionInfo.xpRequired) * 100);

        return `
            <div class="employee-stat">
                <span class="employee-stat-label">XP Progress:</span>
                <div class="xp-progress-bar">
                    <div class="xp-progress-fill" style="width: ${xpProgress}%"></div>
                </div>
                <span class="employee-stat-value">${xp} / ${promotionInfo.xpRequired}</span>
            </div>
        `;
    },

    // Render promotion button for employee
    renderPromotionButton(employee, state) {
        const promotionInfo = EmployeeManager.getPromotionInfo(employee);

        // Don't show button if max level or not ready for promotion
        if (!promotionInfo || !promotionInfo.canPromote) {
            return '';
        }

        const canAfford = state.money >= promotionInfo.cost;

        return `
            <div class="promotion-section">
                <button class="btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}"
                        data-promote-id="${employee.id}"
                        ${!canAfford ? 'disabled' : ''}>
                    ⭐ Promote to ${promotionInfo.nextLevel} (${Game.formatMoney(promotionInfo.cost)})
                </button>
            </div>
        `;
    },

    // Set up event listeners for employee assignment controls
    setupEmployeeAssignmentListeners() {
        // Assign buttons
        const assignBtns = document.querySelectorAll('.assign-btn');
        assignBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                const select = document.querySelector(`.client-select[data-employee-id="${employeeId}"]`);
                const clientId = select.value;

                if (clientId) {
                    Game.assignEmployee(employeeId, clientId);
                    this.update();
                }
            });
        });

        // Unassign client buttons (the × buttons on assigned client tags)
        const unassignClientBtns = document.querySelectorAll('.unassign-client-btn');
        unassignClientBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                const clientId = e.target.dataset.clientId;
                Game.unassignEmployee(employeeId, clientId);
                this.update();
            });
        });

        // Promotion buttons
        const promoteButtons = document.querySelectorAll('button[data-promote-id]');
        promoteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.promoteId;
                const success = Game.promoteEmployee(employeeId);
                if (success) {
                    this.update();
                }
            });
        });
    },

    // Render equipment shop
    renderEquipmentShop() {
        const state = Game.getState();
        const equipmentList = this.elements.equipmentList;

        if (!equipmentList) return;

        // Clear existing content
        equipmentList.innerHTML = '';

        // Get available equipment
        const available = EquipmentManager.getAvailableEquipment(state.ownedEquipment);

        // Show owned equipment
        if (state.ownedEquipment.length > 0) {
            const ownedSection = document.createElement('div');
            ownedSection.className = 'owned-equipment';
            ownedSection.innerHTML = '<h3>Owned Equipment</h3>';

            state.ownedEquipment.forEach(equipId => {
                const equip = EquipmentManager.equipment[equipId];
                if (equip) {
                    const equipTag = document.createElement('div');
                    equipTag.className = 'equipment-tag owned';
                    equipTag.textContent = equip.name;
                    ownedSection.appendChild(equipTag);
                }
            });

            equipmentList.appendChild(ownedSection);
        }

        // Show available equipment for purchase
        if (available.length === 0) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-state';
            emptyState.textContent = state.ownedEquipment.length > 0 ?
                'All available equipment purchased!' :
                'No equipment available yet.';
            equipmentList.appendChild(emptyState);
            return;
        }

        // Check for active discount
        const activeEvent = window.EventManager ? EventManager.getActiveEvent() : null;
        const discount = activeEvent?.discount || 0;

        available.forEach(equip => {
            const equipCard = document.createElement('div');
            equipCard.className = 'equipment-card';

            // Calculate actual cost with discount
            let actualCost = equip.cost;
            if (discount > 0) {
                actualCost = Math.floor(equip.cost * (1 - discount));
            }

            const canAfford = state.money >= actualCost;

            // Build price display
            let priceHTML;
            if (discount > 0) {
                priceHTML = `
                    <span class="equipment-cost ${canAfford ? 'positive' : 'negative'}">
                        <span style="text-decoration: line-through; opacity: 0.6; font-size: 0.9em;">${Game.formatMoney(equip.cost)}</span>
                        <span style="color: var(--color-accent); font-weight: 700;">${Game.formatMoney(actualCost)}</span>
                        <span style="font-size: 0.8em; color: var(--color-accent);">(${Math.round(discount * 100)}% OFF)</span>
                    </span>
                `;
            } else {
                priceHTML = `<span class="equipment-cost ${canAfford ? 'positive' : 'negative'}">${Game.formatMoney(equip.cost)}</span>`;
            }

            equipCard.innerHTML = `
                <div class="equipment-header">
                    <div class="equipment-name">${equip.name}</div>
                    <div class="equipment-tier">Tier ${equip.tier}</div>
                </div>
                <div class="equipment-description">${equip.description}</div>
                <div class="equipment-stats">
                    ${equip.satisfactionBonus ? `<span>+${equip.satisfactionBonus} Satisfaction</span>` : ''}
                    ${equip.speedBonus ? `<span>+${equip.speedBonus}% Speed</span>` : ''}
                    ${equip.ecoBonus ? `<span>+${equip.ecoBonus} Eco Bonus</span>` : ''}
                </div>
                <div class="equipment-footer">
                    ${priceHTML}
                    <button class="btn btn-small ${canAfford ? 'btn-primary' : 'btn-disabled'}"
                            data-equipment-id="${equip.id}"
                            ${!canAfford ? 'disabled' : ''}>
                        Purchase
                    </button>
                </div>
            `;

            equipmentList.appendChild(equipCard);
        });

        // Add event listeners to purchase buttons
        const purchaseButtons = equipmentList.querySelectorAll('button[data-equipment-id]');
        purchaseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const equipmentId = e.target.dataset.equipmentId;
                const success = Game.purchaseEquipment(equipmentId);
                if (success) {
                    this.update();
                }
            });
        });
    },

    // Render upgrade tree
    renderUpgradeTree() {
        const state = Game.getState();
        const upgradeTree = this.elements.upgradeTree;

        if (!upgradeTree) return;

        // Clear existing content
        upgradeTree.innerHTML = '';

        // Create sections for each upgrade path
        const paths = ['speed', 'service', 'eco', 'operations'];
        const pathNames = {
            speed: 'Speed Path',
            service: 'Customer Service Path',
            eco: 'Eco-Friendly Path',
            operations: 'Operations Automation'
        };

        paths.forEach(path => {
            const pathSection = document.createElement('div');
            pathSection.className = 'upgrade-path';

            // Use applause logo for operations path
            const pathTitle = path === 'operations'
                ? `<h3><img src="applause.svg" alt="Operations Automation" class="path-logo"></h3>`
                : `<h3>${pathNames[path]}</h3>`;

            pathSection.innerHTML = pathTitle;

            const upgrades = EquipmentManager.getUpgradesByPath(path);

            upgrades.forEach(upgrade => {
                const owned = state.ownedUpgrades.includes(upgrade.id);
                const canPurchase = EquipmentManager.canPurchaseUpgrade(upgrade.id, state.ownedUpgrades);
                const canAfford = state.money >= upgrade.cost;

                const upgradeCard = document.createElement('div');
                upgradeCard.className = `upgrade-card ${owned ? 'owned' : ''} ${!canPurchase && !owned ? 'locked' : ''}`;

                // Build effects display
                let effectsHTML = '';
                if (upgrade.effects) {
                    Object.keys(upgrade.effects).forEach(key => {
                        const value = upgrade.effects[key];
                        const displayValue = key.includes('Bonus') && value < 1 ?
                            `+${Math.round(value * 100)}%` :
                            `+${value}`;
                        effectsHTML += `<span>${displayValue} ${key.replace(/([A-Z])/g, ' $1').trim()}</span>`;
                    });
                }

                // Add automation toggle for operations upgrades (if owned)
                let automationToggleHTML = '';
                if (owned && path === 'operations') {
                    let toggleSetting = null;
                    let toggleLabel = '';

                    // Determine which toggle to show based on upgrade effects
                    if (upgrade.effects.autoHire) {
                        toggleSetting = 'autoHireEnabled';
                        toggleLabel = 'Auto-Hire';
                    } else if (upgrade.effects.autoPromote) {
                        toggleSetting = 'autoPromoteEnabled';
                        toggleLabel = 'Auto-Promote';
                    } else if (upgrade.effects.autoAssign) {
                        toggleSetting = 'autoAssignEnabled';
                        toggleLabel = 'Auto-Assign';
                    }

                    if (toggleSetting) {
                        const isEnabled = state.automationSettings[toggleSetting];
                        automationToggleHTML = `
                            <div class="automation-toggle">
                                <label class="toggle-label">
                                    <input type="checkbox"
                                           data-automation-toggle="${toggleSetting}"
                                           ${isEnabled ? 'checked' : ''}>
                                    <span class="toggle-text">${toggleLabel}: ${isEnabled ? 'ON' : 'OFF'}</span>
                                </label>
                            </div>
                        `;
                    }
                }

                upgradeCard.innerHTML = `
                    <div class="upgrade-header">
                        <div class="upgrade-name">${upgrade.name} ${owned ? '✓' : ''}</div>
                        <div class="upgrade-tier">Tier ${upgrade.tier}</div>
                    </div>
                    <div class="upgrade-description">${upgrade.description}</div>
                    <div class="upgrade-effects">${effectsHTML}</div>
                    ${automationToggleHTML}
                    ${!owned ? `
                        <div class="upgrade-footer">
                            <span class="upgrade-cost ${canAfford ? 'positive' : 'negative'}">${Game.formatMoney(upgrade.cost)}</span>
                            <button class="btn btn-small ${canPurchase && canAfford ? 'btn-primary' : 'btn-disabled'}"
                                    data-upgrade-id="${upgrade.id}"
                                    ${!canPurchase || !canAfford ? 'disabled' : ''}>
                                ${!canPurchase ? 'Locked' : 'Purchase'}
                            </button>
                        </div>
                    ` : ''}
                `;

                pathSection.appendChild(upgradeCard);
            });

            upgradeTree.appendChild(pathSection);
        });

        // Add event listeners to purchase buttons
        const purchaseButtons = upgradeTree.querySelectorAll('button[data-upgrade-id]');
        purchaseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeId = e.target.dataset.upgradeId;
                const success = Game.purchaseUpgrade(upgradeId);
                if (success) {
                    this.update();
                }
            });
        });

        // Add event listeners to automation toggle checkboxes
        const toggleCheckboxes = upgradeTree.querySelectorAll('input[data-automation-toggle]');
        toggleCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const setting = e.target.dataset.automationToggle;
                const isEnabled = e.target.checked;

                // Update game state
                const state = Game.getState();
                if (state.automationSettings) {
                    state.automationSettings[setting] = isEnabled;

                    // Log the change
                    const settingNames = {
                        autoAssignEnabled: 'Auto-Assign',
                        autoPromoteEnabled: 'Auto-Promote',
                        autoHireEnabled: 'Auto-Hire'
                    };
                    Game.logAction(`⚙️ ${settingNames[setting]} ${isEnabled ? 'enabled' : 'disabled'}`);

                    // Update UI
                    this.update();

                    // Save game state
                    if (window.StorageManager) {
                        StorageManager.autoSave(state);
                    }
                }
            });
        });
    },

    // Show game over modal
    showGameOverModal(title, message, reason) {
        // Create or get game over modal
        let modal = document.getElementById('game-over-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'game-over-modal';
            modal.className = 'game-over-modal';
            document.body.appendChild(modal);
        }

        const isVictory = reason === 'victory';
        const modalClass = isVictory ? 'modal-victory' : 'modal-defeat';

        modal.innerHTML = `
            <div class="game-over-content ${modalClass}">
                <div class="game-over-header">
                    <span class="game-over-icon">${isVictory ? '🎉' : '💀'}</span>
                    <h2 class="game-over-title">${title}</h2>
                </div>
                <div class="game-over-message">${message.replace(/\n/g, '<br>')}</div>
                <div class="game-over-actions">
                    <button class="btn btn-primary btn-large" onclick="UI.closeGameOverModal(); Game.newGame();">
                        New Game
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    },

    // Close game over modal
    closeGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    },

    // Show help modal
    showHelpModal() {
        let modal = document.getElementById('help-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'help-modal';
            modal.className = 'help-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="help-content">
                <div class="help-header">
                    <h2>📖 How to Play</h2>
                    <button class="help-close" onclick="UI.closeHelpModal()">×</button>
                </div>
                <div class="help-body">
                    <section class="help-section">
                        <h3>🎯 Goal</h3>
                        <p>Build a successful pest control empire! Reach <strong>$25,000 weekly profit</strong> with <strong>12+ clients</strong> and <strong>6+ employees</strong> to win.</p>
                    </section>

                    <section class="help-section">
                        <h3>🏁 Starting the Game</h3>
                        <p>You begin as the <strong>owner</strong> with Junior-level skills and <strong>$2,000</strong> in starting capital. You can service up to 3 clients per week on your own.</p>
                    </section>

                    <section class="help-section">
                        <h3>🔄 Turns</h3>
                        <p>The game is turn-based. Each turn represents <strong>1 week</strong>. Click "Next Week" to execute your planned actions and advance time.</p>
                    </section>

                    <section class="help-section">
                        <h3>👥 Clients</h3>
                        <p><strong>Base Cost:</strong> $350-$1,000 to acquire (varies by type)</p>
                        <p><strong>⚠️ Important:</strong> Acquisition costs increase exponentially (1.3x multiplier per client acquired)</p>
                        <p><strong>Revenue:</strong> $255-$680/week when serviced</p>
                        <p><strong>Satisfaction:</strong> Starts at 85-95%, decays 5-9 points/week depending on type</p>
                        <ul>
                            <li><strong>Types:</strong> Residential (easiest), Speed-Focused, Eco-Focused, Commercial (hardest)</li>
                            <li>Serviced clients generate full revenue and gain satisfaction</li>
                            <li>Unserviced clients generate NO revenue and lose satisfaction faster</li>
                            <li>Clients leave if satisfaction drops below 20%</li>
                            <li><strong>Referrals:</strong> Clients with 80+ satisfaction have 3% chance to refer a free client each week</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>🚚 Employees</h3>
                        <p><strong>Cost:</strong> $1,800-$3,500 (includes truck)</p>
                        <p><strong>Salary:</strong> $500-$1,500/week (based on skill level)</p>
                        <p><strong>Capacity:</strong> Can service 2-5 clients per week (based on skill)</p>
                        <p><strong>Skill Levels:</strong> Trainee, Junior, Experienced, Expert</p>
                        <ul>
                            <li>Assign employees to clients to service them</li>
                            <li>Employee skill level significantly affects client satisfaction restoration</li>
                            <li>Better employees cost more but perform better (essential for harder client types)</li>
                            <li><strong>Tip:</strong> Match employee skill to client difficulty (e.g., Expert for Commercial)</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>🔧 Equipment & Upgrades</h3>
                        <p>Purchase equipment and upgrades to improve your operations:</p>
                        <ul>
                            <li><strong>Equipment:</strong> One-time purchases that boost job quality and satisfaction</li>
                            <li><strong>Upgrade Paths:</strong> Four paths with tier progression</li>
                            <li><strong>Speed Path:</strong> Faster job completion for speed-focused clients</li>
                            <li><strong>Service Path:</strong> Increases revenue and satisfaction bonuses</li>
                            <li><strong>Eco Path:</strong> Bonuses for Eco-Focused clients</li>
                            <li><strong>Operations Path:</strong> Automates tedious management tasks (see below)</li>
                            <li>Upgrades become essential in mid-to-late game for maintaining large client bases</li>
                            <li>Unlocks require prerequisites and progress through tiers</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>🤖 Operations Automation</h3>
                        <p>The Operations upgrade path reduces micromanagement as your business grows:</p>
                        <ul>
                            <li><strong>Tier 1 - Auto-Assign ($2,000):</strong> Automatically assigns available employees to unserviced clients</li>
                            <li><strong>Tier 2 - Smart Scheduling ($5,000):</strong> Optimizes assignments by matching employee skill to client difficulty</li>
                            <li><strong>Tier 3 - Promotion Manager ($8,000):</strong> Auto-promotes eligible employees when funds are available</li>
                            <li><strong>Tier 4 - Full Automation ($15,000):</strong> Auto-hires employees when needed and funds permit</li>
                            <li>Each automation feature has a toggle switch - you stay in control</li>
                            <li>Cash buffers prevent automation from bankrupting you ($3k for hire, $2k for promote)</li>
                            <li>All automation actions are logged so you can see what happened</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>🎲 Events</h3>
                        <p>Random events occur each turn:</p>
                        <ul>
                            <li><strong>Positive:</strong> New client referrals, equipment deals, cash bonuses</li>
                            <li><strong>Negative:</strong> Pest surges, equipment breakdowns, competitor actions, regulation fines</li>
                            <li>Some events are more likely in certain seasons</li>
                            <li>Negative events can significantly impact your finances - keep a cash buffer</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>💡 Strategy Tips</h3>
                        <ul>
                            <li>Start by acquiring 1-2 clients with your owner skills</li>
                            <li>Client costs increase exponentially - rely on referrals for growth in mid-game</li>
                            <li>Keep satisfaction above 80% to trigger referrals (free clients!)</li>
                            <li>Match employee skill level to client difficulty to avoid satisfaction losses</li>
                            <li>Watch your cash flow - weekly overhead ($300) starts at Week 5</li>
                            <li>Invest in equipment and upgrades early - they're essential, not optional</li>
                            <li>Diversify client types for stable revenue</li>
                            <li>Game auto-saves after each turn</li>
                        </ul>
                    </section>

                    <section class="help-section">
                        <h3>💀 Game Over</h3>
                        <p><strong>Bankruptcy:</strong> Cash drops below $0</p>
                        <p><strong>Victory:</strong> $25,000 weekly profit + 12 clients + 6 employees</p>
                        <p><strong>Expected Completion:</strong> 40-60+ weeks with good strategy</p>
                    </section>
                </div>
                <div class="help-footer">
                    <button class="btn btn-primary" onclick="UI.closeHelpModal()">Got it!</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    },

    // Close help modal
    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
};

// Export for console debugging
window.UI = UI;
