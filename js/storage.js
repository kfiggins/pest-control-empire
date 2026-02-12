/**
 * Storage Manager
 * Handles saving and loading game state to/from localStorage
 */

const StorageManager = {
    // Storage key for the game state
    SAVE_KEY: 'pest_empire_save',

    // Storage key for auto-save timestamp
    TIMESTAMP_KEY: 'pest_empire_save_timestamp',

    /**
     * Save game state to localStorage
     * Returns true if save was successful
     */
    saveGame(gameState) {
        try {
            // Create a save object with timestamp
            const saveData = {
                version: '1.0',
                timestamp: Date.now(),
                state: gameState
            };

            // Serialize and save to localStorage
            const serialized = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, serialized);
            localStorage.setItem(this.TIMESTAMP_KEY, saveData.timestamp.toString());

            console.log('💾 Game saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    },

    /**
     * Load game state from localStorage
     * Returns the game state or null if no save exists
     */
    loadGame() {
        try {
            const serialized = localStorage.getItem(this.SAVE_KEY);

            if (!serialized) {
                console.log('ℹ️ No saved game found');
                return null;
            }

            const saveData = JSON.parse(serialized);

            // Validate save data
            if (!saveData.state) {
                console.error('❌ Invalid save data');
                return null;
            }

            console.log('📂 Game loaded successfully');
            console.log(`   Saved on: ${new Date(saveData.timestamp).toLocaleString()}`);
            console.log(`   Week: ${saveData.state.week}`);

            return saveData.state;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    },

    /**
     * Check if a saved game exists
     */
    hasSavedGame() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    /**
     * Get save timestamp
     */
    getSaveTimestamp() {
        const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
        return timestamp ? parseInt(timestamp) : null;
    },

    /**
     * Get formatted save time
     */
    getFormattedSaveTime() {
        const timestamp = this.getSaveTimestamp();
        if (!timestamp) return 'No save found';

        const date = new Date(timestamp);
        return date.toLocaleString();
    },

    /**
     * Delete saved game
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            localStorage.removeItem(this.TIMESTAMP_KEY);
            console.log('🗑️ Save deleted');
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    },

    /**
     * Export save data as JSON (for backup/sharing)
     */
    exportSave() {
        const serialized = localStorage.getItem(this.SAVE_KEY);
        if (!serialized) return null;

        return serialized;
    },

    /**
     * Import save data from JSON
     */
    importSave(jsonData) {
        try {
            // Validate JSON
            const saveData = JSON.parse(jsonData);
            if (!saveData.state) {
                throw new Error('Invalid save data format');
            }

            // Save to localStorage
            localStorage.setItem(this.SAVE_KEY, jsonData);
            localStorage.setItem(this.TIMESTAMP_KEY, saveData.timestamp.toString());

            console.log('📥 Save imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            return false;
        }
    },

    /**
     * Auto-save the game
     */
    autoSave(gameState) {
        const success = this.saveGame(gameState);
        if (success) {
            console.log('💾 Auto-saved');
        }
        return success;
    }
};

// Export for use in other modules
window.StorageManager = StorageManager;
