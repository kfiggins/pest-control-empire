/**
 * Events System
 * Manages random events and challenges that occur during gameplay
 */

const EventManager = {
    // Currently active event (displayed to player)
    activeEvent: null,

    // Event history (for tracking what's happened)
    eventHistory: [],

    // Event definitions (loaded from data/events.json or defined here)
    eventTypes: {
        // Positive Events
        NEW_CLIENT_OPPORTUNITY: {
            id: 'new_client_opportunity',
            name: 'New Client Opportunity',
            description: 'A potential client heard about your excellent service and wants to sign up!',
            type: 'positive',
            baseChance: 0.15, // 15% base chance per turn
            effect: (gameState) => {
                // Free client acquisition
                const client = ClientManager.generateClient();
                gameState.clients.push(client);
                gameState.stats.clientsAcquired++;
                return {
                    success: true,
                    message: `✨ ${client.name} (${client.typeData.name}) joined as a new client!`
                };
            }
        },

        EQUIPMENT_DEAL: {
            id: 'equipment_deal',
            name: 'Equipment Sale',
            description: 'A supplier is offering a 30% discount on equipment this week!',
            type: 'positive',
            baseChance: 0.10, // 10% base chance per turn
            effect: (gameState) => {
                // Enable discount for next purchase (this will be implemented via a flag)
                return {
                    success: true,
                    message: '🛍️ Equipment prices reduced by 30% this week!',
                    discount: 0.3
                };
            }
        },

        REFERRAL_BONUS: {
            id: 'referral_bonus',
            name: 'Referral Bonus',
            description: 'A satisfied customer referred you to others, earning you a bonus payment!',
            type: 'positive',
            baseChance: 0.12,
            minWeek: 5, // Only after week 5
            requiresClients: true,
            effect: (gameState) => {
                const bonus = Math.floor(Math.random() * 300) + 200; // $200-$500
                gameState.money += bonus;
                return {
                    success: true,
                    message: `💰 Received referral bonus of ${Game.formatMoney(bonus)}!`
                };
            }
        },

        // Negative Events
        PEST_SURGE: {
            id: 'pest_surge',
            name: 'Pest Surge',
            description: 'A sudden infestation outbreak has increased demand across the city!',
            type: 'negative',
            baseChance: 0.08,
            seasonal: true, // More likely in certain seasons
            effect: (gameState) => {
                // Increase client satisfaction decay if they're not serviced
                let affectedClients = 0;
                gameState.clients.forEach(client => {
                    const hasEmployee = gameState.employees.some(emp => emp.assignedClients.includes(client.id));
                    if (!hasEmployee) {
                        client.satisfaction -= 15; // Extra penalty
                        affectedClients++;
                    }
                });

                return {
                    success: true,
                    message: `🦗 Pest surge! ${affectedClients} unserviced clients are extremely unhappy.`
                };
            }
        },

        EQUIPMENT_BREAKDOWN: {
            id: 'equipment_breakdown',
            name: 'Equipment Breakdown',
            description: 'One of your trucks needs emergency repairs!',
            type: 'negative',
            baseChance: 0.10,
            requiresTrucks: true,
            effect: (gameState) => {
                if (gameState.trucks.length === 0) {
                    return { success: false };
                }

                // Random truck breaks down
                const truck = gameState.trucks[Math.floor(Math.random() * gameState.trucks.length)];
                const repairCost = Math.floor(Math.random() * 400) + 400; // $400-$800

                gameState.money -= repairCost;
                truck.condition = Math.max(50, truck.condition - 20);

                return {
                    success: true,
                    message: `🔧 Truck ${truck.id} broke down! Repair cost: ${Game.formatMoney(repairCost)}`
                };
            }
        },

        COMPETITOR_POACHING: {
            id: 'competitor_poaching',
            name: 'Competitor Poaching',
            description: 'A competitor is trying to steal your clients with aggressive marketing!',
            type: 'negative',
            baseChance: 0.08,
            minWeek: 8,
            requiresClients: true,
            effect: (gameState) => {
                if (gameState.clients.length === 0) {
                    return { success: false };
                }

                // Reduce satisfaction of 1-3 random clients
                const numAffected = Math.min(gameState.clients.length, Math.floor(Math.random() * 3) + 1);
                const affectedClients = [];

                for (let i = 0; i < numAffected; i++) {
                    const randomClient = gameState.clients[Math.floor(Math.random() * gameState.clients.length)];
                    if (!affectedClients.includes(randomClient)) {
                        randomClient.satisfaction -= 20;
                        affectedClients.push(randomClient);
                    }
                }

                return {
                    success: true,
                    message: `🎯 Competitor targeted ${affectedClients.length} of your clients! Satisfaction decreased.`
                };
            }
        },

        EMPLOYEE_SICK: {
            id: 'employee_sick',
            name: 'Employee Sick Day',
            description: 'One of your employees is sick and cannot work this week!',
            type: 'negative',
            baseChance: 0.12,
            requiresEmployees: true,
            effect: (gameState) => {
                if (gameState.employees.length === 0) {
                    return { success: false };
                }

                // Random employee can't work (clear their assignments for this turn)
                const employee = gameState.employees[Math.floor(Math.random() * gameState.employees.length)];
                const assignedCount = employee.assignedClients.length;

                // Store original assignments to restore next turn
                employee.temporarilyUnassigned = [...employee.assignedClients];
                employee.assignedClients = [];

                return {
                    success: true,
                    message: `🤒 ${employee.name} is sick! ${assignedCount} clients won't be serviced this week.`,
                    restoreNextTurn: employee.id
                };
            }
        },

        REGULATION_FINE: {
            id: 'regulation_fine',
            name: 'Regulatory Fine',
            description: 'A compliance inspection found minor violations. Pay the fine!',
            type: 'negative',
            baseChance: 0.06,
            minWeek: 10,
            effect: (gameState) => {
                const fine = Math.floor(Math.random() * 1000) + 500; // $500-$1500
                gameState.money -= fine;

                return {
                    success: true,
                    message: `⚖️ Regulatory fine: ${Game.formatMoney(fine)}`
                };
            }
        },

        // Neutral/Choice Events
        BUSINESS_LOAN_OFFER: {
            id: 'business_loan_offer',
            name: 'Business Loan Offer',
            description: 'A bank is offering you a business loan. Accept for immediate cash but pay interest later.',
            type: 'neutral',
            baseChance: 0.05,
            minWeek: 6,
            effect: (gameState) => {
                // This could be enhanced to be a choice event in the future
                const loanAmount = 2000;
                gameState.money += loanAmount;

                return {
                    success: true,
                    message: `🏦 Accepted business loan of ${Game.formatMoney(loanAmount)} (future feature: repayment system)`
                };
            }
        }
    },

    /**
     * Check if an event should trigger this turn
     * Returns the event to trigger, or null
     */
    checkForEvent(gameState) {
        const week = gameState.week;
        const possibleEvents = [];

        // Evaluate each event type
        for (const eventKey in this.eventTypes) {
            const event = this.eventTypes[eventKey];

            // Check prerequisites
            if (event.minWeek && week < event.minWeek) continue;
            if (event.requiresClients && gameState.clients.length === 0) continue;
            if (event.requiresEmployees && gameState.employees.length === 0) continue;
            if (event.requiresTrucks && gameState.trucks.length === 0) continue;

            // Calculate actual chance (can be modified by season, etc.)
            let chance = event.baseChance;

            // Seasonal modifier for pest surges (higher in summer/fall)
            if (event.seasonal && event.id === 'pest_surge') {
                const season = this.getSeason(week);
                if (season === 'summer' || season === 'fall') {
                    chance *= 1.5; // 50% more likely
                }
            }

            // Add to possible events with their weighted chance
            possibleEvents.push({ event, chance });
        }

        // Roll for an event (only one event per turn max)
        for (const { event, chance } of possibleEvents) {
            if (Math.random() < chance) {
                return event;
            }
        }

        return null; // No event this turn
    },

    /**
     * Trigger an event and apply its effects
     */
    triggerEvent(gameState, event) {
        if (!event) return null;

        console.log(`🎲 Event triggered: ${event.name}`);

        // Execute event effect
        const result = event.effect(gameState);

        if (result.success) {
            // Store as active event (for UI display)
            this.activeEvent = {
                ...event,
                message: result.message,
                week: gameState.week,
                discount: result.discount || null,
                restoreNextTurn: result.restoreNextTurn || null
            };

            // Add to history
            this.eventHistory.push({
                eventId: event.id,
                week: gameState.week,
                message: result.message
            });

            // Log to game
            Game.logAction(`🎲 EVENT: ${result.message}`);

            return this.activeEvent;
        }

        return null;
    },

    /**
     * Get current season based on week number
     */
    getSeason(week) {
        const weekInYear = week % 52;
        if (weekInYear >= 1 && weekInYear <= 13) return 'spring';
        if (weekInYear >= 14 && weekInYear <= 26) return 'summer';
        if (weekInYear >= 27 && weekInYear <= 39) return 'fall';
        return 'winter';
    },

    /**
     * Clear active event (called after player acknowledges)
     */
    clearActiveEvent() {
        this.activeEvent = null;
    },

    /**
     * Get active event (for UI display)
     */
    getActiveEvent() {
        return this.activeEvent;
    },

    /**
     * Get event history
     */
    getHistory() {
        return this.eventHistory;
    },

    /**
     * Process turn cleanup (restore sick employees, clear previous events, etc.)
     */
    processTurnCleanup(gameState) {
        // Clear previous turn's active event (so discounts/effects only last one week)
        this.clearActiveEvent();

        // Restore sick employees from last turn
        gameState.employees.forEach(employee => {
            if (employee.temporarilyUnassigned) {
                // Restore assignments
                employee.assignedClients = [...employee.temporarilyUnassigned];
                delete employee.temporarilyUnassigned;
                console.log(`${employee.name} recovered from sick day`);
            }
        });
    }
};

// Export for use in other modules
window.EventManager = EventManager;
