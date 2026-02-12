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

        // Initial render
        this.update();
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

            // Action log
            actionLog: document.getElementById('action-log'),

            // Buttons
            acquireClientBtn: document.getElementById('acquire-client-btn'),
            hireEmployeeBtn: document.getElementById('hire-employee-btn'),
            nextWeekBtn: document.getElementById('next-week-btn'),
            newGameBtn: document.getElementById('new-game-btn'),
            saveGameBtn: document.getElementById('save-game-btn'),
            loadGameBtn: document.getElementById('load-game-btn')
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

        // Save/Load buttons (disabled for now, will be implemented in Phase 6)
        this.elements.saveGameBtn.addEventListener('click', () => {
            this.addLogEntry('Save feature coming in Phase 6!');
        });

        this.elements.loadGameBtn.addEventListener('click', () => {
            this.addLogEntry('Load feature coming in Phase 6!');
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

        // Render client list
        this.renderClientList();

        // Render employee list
        this.renderEmployeeList();
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

            // Find assigned client if any
            let assignedClientName = 'None';
            if (employee.assignedClient) {
                const client = state.clients.find(c => c.id === employee.assignedClient);
                if (client) {
                    assignedClientName = client.name;
                }
            }

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
                    <div class="employee-stat">
                        <span class="employee-stat-label">Assigned To:</span>
                        <span class="employee-stat-value">
                            ${assignedClientName}
                        </span>
                    </div>
                </div>
                <div class="employee-actions">
                    ${this.renderEmployeeAssignmentControls(employee, state.clients)}
                </div>
            `;

            employeeList.appendChild(employeeCard);
        });

        // Add event listeners to assignment buttons
        this.setupEmployeeAssignmentListeners();
    },

    // Render assignment controls for an employee
    renderEmployeeAssignmentControls(employee, clients) {
        if (clients.length === 0) {
            return '<p class="assignment-hint">No clients to assign</p>';
        }

        if (employee.assignedClient) {
            return `<button class="btn btn-small btn-secondary unassign-btn" data-employee-id="${employee.id}">Unassign</button>`;
        }

        // Create dropdown of available clients
        let html = `<select class="client-select" data-employee-id="${employee.id}">`;
        html += '<option value="">Select Client...</option>';

        clients.forEach(client => {
            html += `<option value="${client.id}">${client.name}</option>`;
        });

        html += '</select>';
        html += `<button class="btn btn-small btn-primary assign-btn" data-employee-id="${employee.id}">Assign</button>`;

        return html;
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

        // Unassign buttons
        const unassignBtns = document.querySelectorAll('.unassign-btn');
        unassignBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const employeeId = e.target.dataset.employeeId;
                Game.unassignEmployee(employeeId);
                this.update();
            });
        });
    }
};

// Export for console debugging
window.UI = UI;
