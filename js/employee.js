/**
 * Employee & Truck Management System
 * Handles employee hiring, skills, job assignments, and truck management
 */

const EmployeeManager = {
    // Employee name pool for variety
    firstNames: [
        'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
        'Riley', 'Jamie', 'Quinn', 'Avery', 'Charlie',
        'Sam', 'Drew', 'Reese', 'Parker', 'Skyler'
    ],

    lastNames: [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
        'Garcia', 'Martinez', 'Davis', 'Rodriguez', 'Wilson',
        'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'
    ],

    // Skill level definitions
    skillLevels: {
        TRAINEE: {
            name: 'Trainee',
            multiplier: 0.7,
            hireCost: 800,
            weeklySalary: 400,
            color: '#94a3b8',
            satisfactionBonus: 10
        },
        JUNIOR: {
            name: 'Junior',
            multiplier: 1.0,
            hireCost: 1200,
            weeklySalary: 600,
            color: '#60a5fa',
            satisfactionBonus: 15
        },
        EXPERIENCED: {
            name: 'Experienced',
            multiplier: 1.3,
            hireCost: 1800,
            weeklySalary: 900,
            color: '#34d399',
            satisfactionBonus: 20
        },
        EXPERT: {
            name: 'Expert',
            multiplier: 1.6,
            hireCost: 2500,
            weeklySalary: 1200,
            color: '#a78bfa',
            satisfactionBonus: 25
        }
    },

    // Generate a new employee
    generateEmployee(skillKey = null) {
        // Random skill level if not specified (weighted towards lower tiers)
        if (!skillKey) {
            const rand = Math.random();
            if (rand < 0.5) skillKey = 'TRAINEE';
            else if (rand < 0.8) skillKey = 'JUNIOR';
            else if (rand < 0.95) skillKey = 'EXPERIENCED';
            else skillKey = 'EXPERT';
        }

        const skill = this.skillLevels[skillKey];
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];

        return {
            id: this.generateId(),
            name: `${firstName} ${lastName}`,
            skillLevel: skillKey,
            skillData: skill,
            salary: skill.weeklySalary,
            assignedClient: null, // Client ID they're assigned to
            weeksEmployed: 0,
            totalJobsCompleted: 0,
            truckId: null // Will be assigned when hired
        };
    },

    // Generate a new truck
    generateTruck() {
        return {
            id: this.generateId(),
            condition: 100, // 0-100
            assignedEmployee: null, // Employee ID
            maintenanceCost: 0, // Weekly maintenance
            totalMileage: 0
        };
    },

    // Generate unique ID
    generateId() {
        return `emp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },

    // Calculate total hire cost (employee + truck)
    getHireCost(skillKey) {
        const skill = this.skillLevels[skillKey];
        const truckCost = 1000; // Base truck cost
        return skill.hireCost + truckCost;
    },

    // Get random hire cost for display
    getRandomHireCost() {
        const skills = Object.keys(this.skillLevels);
        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
        return this.getHireCost(randomSkill);
    },

    // Service a client (called during turn)
    serviceClient(employee, client) {
        const skill = employee.skillData;

        // Base satisfaction restoration
        let satisfactionGain = skill.satisfactionBonus;

        // Match employee skill to client demands
        const clientType = client.typeData;

        // Speed-focused clients benefit from experienced+ employees
        if (client.type === 'SPEED_FOCUSED' &&
            (employee.skillLevel === 'EXPERIENCED' || employee.skillLevel === 'EXPERT')) {
            satisfactionGain += 5;
        }

        // Eco-focused clients benefit from expert employees
        if (client.type === 'ECO_FOCUSED' && employee.skillLevel === 'EXPERT') {
            satisfactionGain += 5;
        }

        // Restore satisfaction
        const oldSatisfaction = client.satisfaction;
        client.satisfaction = Math.min(100, client.satisfaction + satisfactionGain);

        // Mark as serviced
        client.serviced = true;

        // Track job
        employee.totalJobsCompleted++;

        return {
            satisfactionGain: client.satisfaction - oldSatisfaction,
            success: true
        };
    },

    // Get skill level distribution for new hires
    getSkillDistribution() {
        return {
            TRAINEE: 50,
            JUNIOR: 30,
            EXPERIENCED: 15,
            EXPERT: 5
        };
    },

    // Check if employee can be assigned to more clients
    canAssign(employee) {
        return employee.assignedClient === null;
    },

    // Assign employee to client
    assignToClient(employee, clientId) {
        if (!this.canAssign(employee)) {
            return false;
        }
        employee.assignedClient = clientId;
        return true;
    },

    // Unassign employee from client
    unassign(employee) {
        employee.assignedClient = null;
    }
};

// Export for use in other modules
window.EmployeeManager = EmployeeManager;
