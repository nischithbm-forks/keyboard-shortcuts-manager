import _keys from "lodash/keys";
import _merge from "lodash/merge";
import _isEmpty from "lodash/isEmpty";
import _isArray from "lodash/isArray";
import _cloneDeep from "lodash/cloneDeep";

import * as KSMTypes from "./@types/ksm/index";
import * as KSMEnums from "./@types/ksm/enums";
import { isFocusInInputElement, eventToShortcut } from "./utils/KeyboardUtil";
import { isArrayNotEmpty } from "./utils/GenericUtil";
import { isMacintosh, isWindows } from "./utils/PlatformUtil";
import { shouldNotBeEmpty, shouldBeAnArray, shouldBeAFunction, validateShortcut } from "./utils/ValidationUtil";

import { isSequenceModeEnabled, pushKeyStrokes, getKeyStrokes } from './sequence';

/**
 * Private in memory store to hold details like flags, registry, indexes, etc.
 */
const KSMStore: {
    shortcutsRegistry: Array<KSMTypes.KeyboardShortcut>;
    callbackHandlerRegistry: Array<KSMTypes.CallbackHandler>;
    shortcutsIndexByUserActionId: Record<KSMTypes.UserActionId, KSMTypes.KeyboardShortcut>;
    shortcutsIndexByScopedKeymapValue: Record<KSMTypes.ScopedKeymapValue, KSMTypes.KeyboardShortcut>;
} = {
    shortcutsRegistry: [],
    callbackHandlerRegistry: [],
    shortcutsIndexByUserActionId: {},
    shortcutsIndexByScopedKeymapValue: {},
};

/**
 * There should be no filter applied while indexing by userActionId.
 * For example, even disabled shortcut objects should be part of this index.
 * So that when we try to retrieve a shortcut details by userActionId, 
 * we never fail to return the details as long as it was ever registered.
 */
const updateShortcutsIndexByUserActionId = (): void => {
    const localShortcutsIndexByUserActionId = {};
    KSMStore.shortcutsRegistry
        .forEach((shortcut) => {
            const { userAction } = shortcut;
            localShortcutsIndexByUserActionId[userAction.id] = shortcut;
        });
    KSMStore.shortcutsIndexByUserActionId = localShortcutsIndexByUserActionId;
};

const updateShortcutsIndexByScopedKeymapValue = (): void => {
    const activeShortcuts = KSMStore.shortcutsRegistry.filter(
        ({ userAction }): boolean => {
            return userAction.enabled && !userAction.managedExternally;
        }
    );

    const localShortcutsIndexByScopedKeymapValue = {};
    activeShortcuts.forEach((shortcut: KSMTypes.KeyboardShortcut): void => {
        const { userAction, keymap } = shortcut;

        if (_isEmpty(keymap.values)) {
            // TODO: handle errror
            return;
        }
        let formattedValues = [];
        if (_isArray(keymap.values)) {
            keymap.values.forEach((v) => {
                formattedValues.push(`${KSMTypes.KeymapValuesMode["@always"]}:${v}`);
            });
        } else if (keymap.values && typeof keymap.values === 'object') {
            _keys(keymap.values)
                .filter((k) => k in KSMTypes.KeymapValuesMode)
                .forEach((k) => {
                    formattedValues.push(`${k}:${keymap.values[k]}`);
                });
        }
        
        formattedValues.forEach((formattedValue) => {
            // update index without scope prefix
            localShortcutsIndexByScopedKeymapValue[`${KSMEnums.UserActionScopeEnum.DEFAULT_SCOPE}:${formattedValue}`] = shortcut;
                
            if (isArrayNotEmpty(userAction.scopes)) {
                userAction.scopes.forEach((userActionScope) => {
                    // update index with scope prefix
                    localShortcutsIndexByScopedKeymapValue[`${userActionScope}:${formattedValue}`] = shortcut;
                });
            }
        });
    });

    KSMStore.shortcutsIndexByScopedKeymapValue = localShortcutsIndexByScopedKeymapValue;
};

const updateIndexes = (): void => {
    updateShortcutsIndexByUserActionId();
    updateShortcutsIndexByScopedKeymapValue();
};

const notifyCallbackHandlers = (eventType: KSMEnums.CallbackHandlerEventTypeEnum, shortcuts: Array<KSMTypes.KeyboardShortcut>) => {
    if (_isEmpty(KSMStore.callbackHandlerRegistry) || !_isArray(KSMStore.callbackHandlerRegistry)) {
        return;
    }
    setTimeout(() => {
        KSMStore.callbackHandlerRegistry.forEach((callbackHandler) => {
            callbackHandler(eventType, shortcuts);
        });
    }, 10);
};

export const registerCallback = (callbackHandler: KSMTypes.CallbackHandler) => {
    shouldNotBeEmpty(callbackHandler, 'callbackHandler');
    shouldBeAFunction(callbackHandler, 'callbackHandler');
    KSMStore.callbackHandlerRegistry.push(callbackHandler);
};


/**
 * registerShortcuts is typically called at the application start
 * But, it can also be called at runtime, few scenarios where this would be useful is
 * - if you want to optionally register keyboard shortcuts based on specific conditions.
 * - if you are allowing the user to choose set of keyboard shortcuts at runtime and would like to instantly register the same
 * 
 * @param shortcuts 
 */
export const registerShortcuts = (shortcuts: Array<KSMTypes.KeyboardShortcut>): void => {
    shouldNotBeEmpty(shortcuts, 'shortcuts');
    shouldBeAnArray(shortcuts, 'shortcuts');
    shortcuts.forEach((shortcut) => {
        validateShortcut(shortcut);
    });

    // TOOD: Need to revisit to handle mutliple calls to this method.
    if (_isEmpty(KSMStore.shortcutsRegistry)) {
        KSMStore.shortcutsRegistry = _merge([], KSMStore.shortcutsRegistry, shortcuts.filter(shortcut => shortcut.userAction.enabled));
    }
    else {
        const filteredShortcuts = shortcuts; // TODO: update logic to avoid duplicates.
        KSMStore.shortcutsRegistry = _merge([], KSMStore.shortcutsRegistry, filteredShortcuts);
    }
    updateIndexes();
    notifyCallbackHandlers(KSMEnums.CallbackHandlerEventTypeEnum.REGISTERED, shortcuts);
};

/**
 * 
 * @param userActionIds 
 */
export const deleteShortcuts = (userActionIds: Array<KSMTypes.UserActionId>): void => {
    // TODO: Validate input
    // TODO: Implementation
};

/**
 * 
 * @param userActionScope 
 */
export const deleteAllShortcuts = (userActionScope?: KSMTypes.UserActionScope): void => {
    // TODO: Validate input
    // TODO: Implementation
};

/**
 * 
 * @param userActionId 
 */
export const isShortcutRegistered = (userActionId: KSMTypes.UserActionId): boolean => {
    // TODO: Validate input
    // TODO: Implementation
    return KSMStore.shortcutsIndexByUserActionId[userActionId] !== undefined;
};

const validateShortcutShouldBeRegistered = (userActionId: KSMTypes.UserActionId) => {
    if (!isShortcutRegistered(userActionId)) {
        throw new Error(`shortcut not registered for userActionId=${userActionId}`);
    }
};

/**
 * 
 * @param keymapValue 
 */
export const isShortcutKeymapTaken = (keymapValue: KSMTypes.KeymapValue): boolean => {
    // TODO: Validate input
    // TODO: Implementation
    return KSMStore.shortcutsIndexByScopedKeymapValue[keymapValue] !== undefined;
};

/**
 * Helps in implementing custom keyboard shortcuts (user overriding the default keymap value)
 * 
 * @param actionKeymapValue
 */
export const updateShortcutValue = (actionKeymapValue: KSMTypes.KeyboardShortcutActionValue): void => {
    shouldNotBeEmpty(actionKeymapValue, 'actionKeymapValue');
    shouldNotBeEmpty(actionKeymapValue.userActionId, 'actionKeymapValue.userActionId');
    shouldNotBeEmpty(actionKeymapValue.keymapValues, 'actionKeymapValue.keymapValues');
    shouldBeAnArray(actionKeymapValue.keymapValues, 'actionKeymapValue.keymapValues');
    validateShortcutShouldBeRegistered(actionKeymapValue.userActionId);

    // TODO: Implementation
    actionKeymapValue.keymapValues.forEach((keymapValue) => {
        if (isShortcutKeymapTaken(keymapValue)) {
            throw new Error("keymap value already in use");
        }
    });
    const shortcut: KSMTypes.KeyboardShortcut = KSMStore.shortcutsIndexByUserActionId[actionKeymapValue.userActionId];
    if (!shortcut.keymap.overidable) {
        throw new Error(`keymap value for shortcut with userActionId=${actionKeymapValue.userActionId}`);
    }
    shortcut.keymap.values = actionKeymapValue.keymapValues;

    updateIndexes();
    notifyCallbackHandlers(KSMEnums.CallbackHandlerEventTypeEnum.UPDATED_VALUE, [shortcut]);
};

/**
 * Helps in implementing custom keyboard shortcuts (user overriding the default keymap value)
 * 
 * @param actionKeymapValues 
 */
export const updateShortcutValues = (actionKeymapValues: Array<KSMTypes.KeyboardShortcutActionValue>): void => {
    // TODO: Validate input
    actionKeymapValues.forEach((actionKeymapValue) => {
        updateShortcutValue(actionKeymapValue);
    });
};

/**
 * 
 * @param userActionId 
 */
export const resetShortcutToDefaultValue = (userActionId: KSMTypes.UserActionId): void => {
    // TODO: Validate input
    // TODO: Implementation
};

/**
 * 
 * @param userActionScope 
 */
export const resetAllShortcutsToDefaultValue = (userActionScopes?: Array<KSMTypes.UserActionScope>): void => {
    // TODO: Validate input
    // TODO: Implementation
};

/**
 * 
 * @param userActionId 
 */
export const getShortcut = (userActionId: KSMTypes.UserActionId): KSMTypes.KeyboardShortcut | undefined => {
    if (_isEmpty(userActionId)) {
        return undefined;
    }
    const shortcut = KSMStore.shortcutsIndexByUserActionId[userActionId];
    return (shortcut) ? _cloneDeep(shortcut) : undefined;
};

/**
 * 
 * @param userActionScope 
 */
export const getAllShortcuts = (userActionScopes?: Array<KSMTypes.UserActionScope>): Array<KSMTypes.KeyboardShortcut> => {
    let shorcuts: Array<KSMTypes.KeyboardShortcut>;
    if (_isEmpty(userActionScopes) || !_isArray(userActionScopes)) {
        shorcuts = KSMStore.shortcutsRegistry;
    } else {
        shorcuts = KSMStore.shortcutsRegistry.filter((shorcut) => {
            let matchFound = false;
            shorcut.userAction.scopes.forEach(shorcutScope => {
                if (userActionScopes.includes(shorcutScope)) {
                    matchFound = true;
                }
            });
            return matchFound;
        });
    }
    return (shorcuts) ? _cloneDeep(shorcuts) : [];
};

const getMatchedShortcut = (keyboardEvent: KSMTypes.AnyKeyboardEvent, userActionScopes: Array<KSMTypes.UserActionScope>): KSMTypes.KeyboardShortcut => {
    // TODO: Validate input
    const eventToKeysStr = eventToShortcut(keyboardEvent);
    if (_isEmpty(eventToKeysStr)) {
        return;
    }
    const macintoshMode = isMacintosh();
    const windowMode = isWindows();
    const sequenceModeEnabled = isSequenceModeEnabled();
    const defaultUserActionScope = KSMEnums.UserActionScopeEnum.DEFAULT_SCOPE;

    if (eventToKeysStr.length === 1) { // TODO: Revisit this logic - Idea is to push only single keystrokes
        pushKeyStrokes(eventToKeysStr);
    }
    const sequenceKeysStr = getKeyStrokes().join(" ");

    console.log("eventToKeysStr", eventToKeysStr);
    let lookupKeys = [];
    if (_isEmpty(userActionScopes) || !_isArray(userActionScopes)) {
        lookupKeys = [`${defaultUserActionScope}:${KSMTypes.KeymapValuesMode.always}:${eventToKeysStr}`];
        if (macintoshMode) {
            lookupKeys.push(`${defaultUserActionScope}:${KSMTypes.KeymapValuesMode.macintoshOnly}:${eventToKeysStr}`);
        }
        if (windowMode) {
            lookupKeys.push(`${defaultUserActionScope}:${KSMTypes.KeymapValuesMode.windowsOnly}:${eventToKeysStr}`);
        }
        if (sequenceModeEnabled) {
            lookupKeys.push(`${defaultUserActionScope}:${KSMTypes.KeymapValuesMode.sequenceModeOnly}:${sequenceKeysStr}`);
        }
    } else {
        userActionScopes.forEach((userActionScope) => {
            lookupKeys.push(`${userActionScope}:${KSMTypes.KeymapValuesMode.always}:${eventToKeysStr}`);
            if (macintoshMode) {
                lookupKeys.push(`${userActionScope}:${KSMTypes.KeymapValuesMode.macintoshOnly}:${eventToKeysStr}`);
            }
            if (windowMode) {
                lookupKeys.push(`${userActionScope}:${KSMTypes.KeymapValuesMode.windowsOnly}:${eventToKeysStr}`);
            }
            if (sequenceModeEnabled) {
                lookupKeys.push(`${userActionScope}:${KSMTypes.KeymapValuesMode.sequenceModeOnly}:${sequenceKeysStr}`);
            }
        });
    }
    let shortcut: KSMTypes.KeyboardShortcut;
    lookupKeys.some((lookupKey) => {
        const lookupVal = KSMStore.shortcutsIndexByScopedKeymapValue[lookupKey];
        if (lookupVal) {
            shortcut = lookupVal;
        }
        return shortcut;
    });
    return shortcut;
}

/**
 * 
 * @param keyboardEvent 
 * @param handlers 
 */
export const handleKeyboardEvent = (keyboardEvent: KSMTypes.AnyKeyboardEvent, handlers: Record<KSMTypes.UserActionId, KSMTypes.KeyboardShortcutHandler>, options?: KSMTypes.HandleKeyboardEventOptions) => {
    const { userActionScopes = [], isKeyboardEventHandlerEnabled } = options || {};

    if (keyboardEvent.repeat) {
        // Note: avoid multiple keyboard events
        // Ref: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat
        return;
    }

    const shortcut = getMatchedShortcut(keyboardEvent, userActionScopes);
    if (!shortcut) {
        return;
    }
    const { id: shortcutUserActionId } = shortcut.userAction || {};
    const handler = handlers[shortcutUserActionId];
    if (!handler) {
        return;
    }

    if (isKeyboardEventHandlerEnabled &&
        typeof isKeyboardEventHandlerEnabled === 'function' &&
        !isKeyboardEventHandlerEnabled()) {
        return;
    }

    const {
        allowShortcutOnEditableElements = false,
        doNotStopPropagationOnMatch = false
    } = shortcut.keymap || {};
    if (!allowShortcutOnEditableElements && isFocusInInputElement(keyboardEvent)) {
        return;
    }
    if (!doNotStopPropagationOnMatch) {
        keyboardEvent.stopPropagation && keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault && keyboardEvent.preventDefault();
    }

    handler(keyboardEvent, shortcut);
    notifyCallbackHandlers(KSMEnums.CallbackHandlerEventTypeEnum.CALLED_SHORCUT_HANDLER, [shortcut]);
};
