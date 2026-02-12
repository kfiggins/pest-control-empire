/**
 * Client Management System
 * Handles client generation, satisfaction, revenue, and retention
 */

const ClientManager = {
    // Client type definitions
    clientTypes: {
        RESIDENTIAL: {
            name: 'Residential',
            baseRevenue: 300,
            acquisitionCost: 200,
            satisfactionDecay: 3,
            demands: ['affordable', 'reliable'],
            color: '#94a3b8'
        },
        SPEED_FOCUSED: {
            name: 'Speed Priority',
            baseRevenue: 450,
            acquisitionCost: 350,
            satisfactionDecay: 5,
            demands: ['fast', 'responsive'],
            color: '#f59e0b'
        },
        ECO_FOCUSED: {
            name: 'Eco-Conscious',
            baseRevenue: 500,
            acquisitionCost: 400,
            satisfactionDecay: 4,
            demands: ['eco-friendly', 'humane'],
            color: '#10b981'
        },
        COMMERCIAL: {
            name: 'Commercial',
            baseRevenue: 800,
            acquisitionCost: 600,
            satisfactionDecay: 6,
            demands: ['professional', 'discreet'],
            color: '#8b5cf6'
        }
    },

    // Pool of client names for variety
    namePool: {
        residential: [
            'Johnson Family',
            'Martinez Residence',
            'Chen Household',
            'Smith Home',
            'Garcia Family',
            'Patel Residence',
            'Williams Home',
            'Brown Family',
            'Davis Household',
            'Rodriguez Home',
            'Wilson Estate',
            'Anderson Residence',
            'Taylor Home',
            'Thomas Family',
            'Moore Household',
            'Jackson Residence',
            'Lee Family',
            'White Home',
            'Harris Residence',
            'Clark Family',
            'Lewis Household',
            'Walker Home',
            'Hall Residence',
            'Allen Family',
            'Young Household',
            'King Residence',
            'Wright Home',
            'Lopez Family',
            'Hill Residence',
            'Green Household',
            'Adams Family',
            'Baker Residence',
            'Nelson Home',
            'Carter Household',
            'Mitchell Residence'
        ],
        commercial: [
            'Sunrise Cafe',
            'Metro Office Plaza',
            'Green Valley Apartments',
            'Downtown Restaurant',
            'Riverside Hotel',
            'Oak Street Bakery',
            'Maple Grove Mall',
            'City Center Gym',
            'Harbor View Condos',
            'Westside Warehouse',
            'Pinewood Medical Center',
            'Summit Tech Building',
            'Lakeside Bistro',
            'Parkview Shopping Center',
            'Grand Hotel & Suites',
            'Main Street Deli',
            'Cornerstone Office Park',
            'Sunset Apartments',
            'Valley View Restaurant',
            'Hillside Dental Clinic',
            'Eastside Fitness Club',
            'Pioneer Business Center',
            'Bayshore Condominiums',
            'Crossroads Cafe',
            'Heritage Office Tower',
            'Mountain View Lodge',
            'Central Storage Facility',
            'Northgate Shopping Plaza',
            'Riverside Veterinary Clinic',
            'Skyline Office Complex',
            'Oceanfront Resort',
            'Broadway Theater',
            'Industrial Park East',
            'Gateway Conference Center',
            'Lakeview Retirement Home'
        ]
    },

    // Generate a new client
    generateClient(typeKey = null) {
        // Random type if not specified
        if (!typeKey) {
            const types = Object.keys(this.clientTypes);
            typeKey = types[Math.floor(Math.random() * types.length)];
        }

        const type = this.clientTypes[typeKey];
        const isCommercial = typeKey === 'COMMERCIAL';

        // Generate unique name
        const nameList = isCommercial ? this.namePool.commercial : this.namePool.residential;
        const name = nameList[Math.floor(Math.random() * nameList.length)];

        // Create client object
        return {
            id: this.generateId(),
            name: name,
            type: typeKey,
            typeData: type,
            satisfaction: 100,
            baseRevenue: type.baseRevenue,
            weeksActive: 0,
            totalRevenue: 0,
            serviced: false, // Will be used in Phase 3 when employees service clients
            demands: [...type.demands]
        };
    },

    // Generate unique ID
    generateId() {
        return `client_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },

    // Calculate client revenue for the week
    calculateRevenue(client, wasServiced = true) {
        // Unserviced clients don't pay (no employee assigned)
        if (!wasServiced) {
            return 0;
        }

        // Base revenue
        let revenue = client.baseRevenue;

        // Bonus for high satisfaction
        if (client.satisfaction >= 80) {
            revenue *= 1.2; // 20% bonus
        }

        // Penalty for low satisfaction
        if (client.satisfaction < 50) {
            revenue *= 0.7; // 30% penalty
        }

        return Math.floor(revenue);
    },

    // Update client satisfaction
    updateSatisfaction(client) {
        // If serviced this week, restore satisfaction
        if (client.serviced) {
            client.satisfaction = Math.min(100, client.satisfaction + 15);
            client.serviced = false;
        } else {
            // Unserviced clients get double decay penalty
            const decayAmount = client.typeData.satisfactionDecay * 2;
            client.satisfaction -= decayAmount;
        }

        // Clamp between 0-100
        client.satisfaction = Math.max(0, Math.min(100, client.satisfaction));

        return client.satisfaction;
    },

    // Check if client should be lost
    shouldLoseClient(client) {
        return client.satisfaction < 20;
    },

    // Get satisfaction status text
    getSatisfactionStatus(satisfaction) {
        if (satisfaction >= 80) return { text: 'Excellent', color: '#10b981' };
        if (satisfaction >= 60) return { text: 'Good', color: '#94a3b8' };
        if (satisfaction >= 40) return { text: 'Fair', color: '#f59e0b' };
        if (satisfaction >= 20) return { text: 'Poor', color: '#f97316' };
        return { text: 'Critical', color: '#ef4444' };
    },

    // Get acquisition cost for a client type
    getAcquisitionCost(typeKey) {
        return this.clientTypes[typeKey].acquisitionCost;
    },

    // Get random acquisition cost (for UI display)
    getRandomAcquisitionCost() {
        const types = Object.keys(this.clientTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.clientTypes[randomType].acquisitionCost;
    }
};

// Export for use in other modules
window.ClientManager = ClientManager;
