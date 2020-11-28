import * as KSMTypes from "./@types/ksm/index";
import * as KSMEnums from "./@types/ksm/enums";

import {
    registerCallback,
    registerShortcuts,
    handleKeyboardEvent,

    isShortcutKeymapTaken,
    updateShortcutValue,
    updateShortcutValues,
    resetShortcutToDefaultValue,
    resetAllShortcutsToDefaultValue,

    getShortcut,
    getAllShortcuts,

    deleteShortcuts,
    deleteAllShortcuts,
} from "./ksm";

import { setSequenceMode, isSequenceModeEnabled } from './sequence';

/**
 * KSM stands for Keyboard Shortcuts Manager
 */
export { KSMTypes }; // Allow consumers to import type definitions
export { KSMEnums };
export const KSM = {
    registerCallback,
    registerShortcuts,
    setSequenceMode,
    handleKeyboardEvent,

    isShortcutKeymapTaken,
    updateShortcutValue,
    updateShortcutValues,
    resetShortcutToDefaultValue,
    resetAllShortcutsToDefaultValue,

    isSequenceModeEnabled,
    getShortcut,
    getAllShortcuts,

    deleteShortcuts,
    deleteAllShortcuts,
};

// Export individual methods
export { registerCallback };
export { registerShortcuts };
export { setSequenceMode };
export { handleKeyboardEvent };

export { isShortcutKeymapTaken };
export { updateShortcutValue };
export { updateShortcutValues };
export { resetShortcutToDefaultValue };
export { resetAllShortcutsToDefaultValue };

export { isSequenceModeEnabled };
export { getShortcut };
export { getAllShortcuts };

export { deleteShortcuts };
export { deleteAllShortcuts };
