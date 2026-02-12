/**
 * Equipment & Upgrade Management System
 * Handles equipment purchases, upgrades, and their effects on gameplay
 */

const EquipmentManager = {
    // Equipment catalog
    equipment: {
        BASIC_SPRAYER: {
            id: 'BASIC_SPRAYER',
            name: 'Basic Sprayer',
            description: 'Standard pest control sprayer',
            cost: 500,
            satisfactionBonus: 5,
            speedBonus: 0,
            tier: 1,
            category: 'tool'
        },
        ADVANCED_SPRAYER: {
            id: 'ADVANCED_SPRAYER',
            name: 'Advanced Sprayer',
            description: 'Professional-grade sprayer with better coverage',
            cost: 1500,
            satisfactionBonus: 10,
            speedBonus: 5,
            tier: 2,
            category: 'tool',
            requires: 'BASIC_SPRAYER'
        },
        ECO_SPRAYER: {
            id: 'ECO_SPRAYER',
            name: 'Eco-Friendly Sprayer',
            description: 'Uses organic solutions, loved by eco-conscious clients',
            cost: 2000,
            satisfactionBonus: 15,
            speedBonus: 0,
            ecoBonus: 20,
            tier: 3,
            category: 'tool',
            requires: 'ADVANCED_SPRAYER'
        },
        BASIC_TRAP_KIT: {
            id: 'BASIC_TRAP_KIT',
            name: 'Basic Trap Kit',
            description: 'Humane traps for rodents and pests',
            cost: 400,
            satisfactionBonus: 5,
            speedBonus: 0,
            tier: 1,
            category: 'trap'
        },
        SMART_TRAP_SYSTEM: {
            id: 'SMART_TRAP_SYSTEM',
            name: 'Smart Trap System',
            description: 'IoT-enabled traps with remote monitoring',
            cost: 1800,
            satisfactionBonus: 12,
            speedBonus: 10,
            tier: 2,
            category: 'trap',
            requires: 'BASIC_TRAP_KIT'
        },
        PROTECTIVE_GEAR: {
            id: 'PROTECTIVE_GEAR',
            name: 'Protective Gear Set',
            description: 'Professional safety equipment',
            cost: 600,
            satisfactionBonus: 8,
            speedBonus: 0,
            tier: 1,
            category: 'safety'
        }
    },

    // Upgrade tree - permanent business improvements
    upgrades: {
        // Speed Path
        SPEED_1: {
            id: 'SPEED_1',
            name: 'Efficient Routing',
            description: 'Optimize travel routes between jobs',
            cost: 1000,
            path: 'speed',
            effects: { jobSpeed: 10 },
            tier: 1
        },
        SPEED_2: {
            id: 'SPEED_2',
            name: 'Quick Response Team',
            description: 'Faster job completion across all employees',
            cost: 2500,
            path: 'speed',
            effects: { jobSpeed: 20 },
            tier: 2,
            requires: 'SPEED_1'
        },
        SPEED_3: {
            id: 'SPEED_3',
            name: 'Express Service',
            description: 'Ultra-fast service for speed-focused clients',
            cost: 5000,
            path: 'speed',
            effects: { jobSpeed: 30, speedClientBonus: 15 },
            tier: 3,
            requires: 'SPEED_2'
        },

        // Customer Service Path
        SERVICE_1: {
            id: 'SERVICE_1',
            name: 'Customer Training',
            description: 'Train employees in customer relations',
            cost: 1200,
            path: 'service',
            effects: { satisfactionBonus: 5 },
            tier: 1
        },
        SERVICE_2: {
            id: 'SERVICE_2',
            name: 'Premium Service Package',
            description: 'Offer premium services that delight clients',
            cost: 3000,
            path: 'service',
            effects: { satisfactionBonus: 10, revenueBonus: 0.1 },
            tier: 2,
            requires: 'SERVICE_1'
        },
        SERVICE_3: {
            id: 'SERVICE_3',
            name: 'VIP Client Program',
            description: 'Exclusive benefits for high-value clients',
            cost: 6000,
            path: 'service',
            effects: { satisfactionBonus: 20, revenueBonus: 0.25 },
            tier: 3,
            requires: 'SERVICE_2'
        },

        // Eco-Friendly Path
        ECO_1: {
            id: 'ECO_1',
            name: 'Green Certification',
            description: 'Certified eco-friendly pest control methods',
            cost: 1500,
            path: 'eco',
            effects: { ecoClientBonus: 10 },
            tier: 1
        },
        ECO_2: {
            id: 'ECO_2',
            name: 'Organic Solutions',
            description: 'Use only organic, pet-safe products',
            cost: 3500,
            path: 'eco',
            effects: { ecoClientBonus: 20, satisfactionBonus: 5 },
            tier: 2,
            requires: 'ECO_1'
        },
        ECO_3: {
            id: 'ECO_3',
            name: 'Zero-Harm Initiative',
            description: 'Revolutionary humane pest management',
            cost: 7000,
            path: 'eco',
            effects: { ecoClientBonus: 35, satisfactionBonus: 10, revenueBonus: 0.15 },
            tier: 3,
            requires: 'ECO_2'
        }
    },

    // Check if equipment can be purchased (prerequisites met)
    canPurchaseEquipment(equipmentId, ownedEquipment) {
        const equipment = this.equipment[equipmentId];
        if (!equipment) return false;

        // Check if already owned
        if (ownedEquipment.includes(equipmentId)) {
            return false;
        }

        // Check prerequisites
        if (equipment.requires) {
            return ownedEquipment.includes(equipment.requires);
        }

        return true;
    },

    // Check if upgrade can be purchased (prerequisites met)
    canPurchaseUpgrade(upgradeId, ownedUpgrades) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return false;

        // Check if already owned
        if (ownedUpgrades.includes(upgradeId)) {
            return false;
        }

        // Check prerequisites
        if (upgrade.requires) {
            return ownedUpgrades.includes(upgrade.requires);
        }

        return true;
    },

    // Calculate total equipment bonuses
    calculateEquipmentBonuses(ownedEquipment) {
        let bonuses = {
            satisfactionBonus: 0,
            speedBonus: 0,
            ecoBonus: 0
        };

        ownedEquipment.forEach(equipId => {
            const equip = this.equipment[equipId];
            if (equip) {
                bonuses.satisfactionBonus += equip.satisfactionBonus || 0;
                bonuses.speedBonus += equip.speedBonus || 0;
                bonuses.ecoBonus += equip.ecoBonus || 0;
            }
        });

        return bonuses;
    },

    // Calculate total upgrade effects
    calculateUpgradeEffects(ownedUpgrades) {
        let effects = {
            jobSpeed: 0,
            satisfactionBonus: 0,
            revenueBonus: 0,
            ecoClientBonus: 0,
            speedClientBonus: 0
        };

        ownedUpgrades.forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && upgrade.effects) {
                Object.keys(upgrade.effects).forEach(key => {
                    effects[key] = (effects[key] || 0) + upgrade.effects[key];
                });
            }
        });

        return effects;
    },

    // Get available equipment for purchase
    getAvailableEquipment(ownedEquipment) {
        return Object.values(this.equipment).filter(equip =>
            this.canPurchaseEquipment(equip.id, ownedEquipment)
        );
    },

    // Get available upgrades for purchase
    getAvailableUpgrades(ownedUpgrades) {
        return Object.values(this.upgrades).filter(upgrade =>
            this.canPurchaseUpgrade(upgrade.id, ownedUpgrades)
        );
    },

    // Get upgrades by path for UI display
    getUpgradesByPath(path) {
        return Object.values(this.upgrades).filter(upgrade => upgrade.path === path);
    }
};

// Export for use in other modules
window.EquipmentManager = EquipmentManager;
