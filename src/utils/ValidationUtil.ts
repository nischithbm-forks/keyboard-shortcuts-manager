import _isEmpty from "lodash/isEmpty";
import _isArray from "lodash/isArray";
import _isBoolean from "lodash/isBoolean";
import _keys from "lodash/keys";
import * as KSMTypes from "../@types/ksm/index";
import * as KSMEnums from "../@types/ksm/enums";

export const shouldNotBeEmpty = (value: any, validationKey: string) => {
    if (value === undefined || value === null) {
        throw new Error(`${validationKey} cannot be empty`);
    }
};

export const shouldBeAnArray = (value: any, validationKey: string) => {
    if (!_isArray(value)) {
        throw new Error(`${validationKey} should an array`);
    }
};

export const shouldBeBoolean = (value: any, validationKey: string) => {
    if (!_isBoolean(value)) {
        throw new Error(`${validationKey} should a boolean`);
    }
};

export const shouldBeAFunction = (value: any, validationKey: string) => {
    if (typeof value !== "function") {
        throw new Error(`${validationKey} should a function`);
    }
};

export const validateShortcutKeymapValues = (keymapValues: Array<KSMTypes.KeymapValue> | KSMTypes.KeymapValuesJson, validationKey: string) => {
    shouldNotBeEmpty(keymapValues, validationKey);

    let invalidType = true;
    if (_isArray(keymapValues)) {
        invalidType = false;
    } else if (keymapValues && typeof keymapValues === 'object') {
        if (!_isEmpty(_keys(keymapValues).filter((k) => k in KSMTypes.KeymapValuesMode))) {
            invalidType = false;
        }
    }
    if (invalidType) {
        throw new Error(`${validationKey} is not valid`);
    }
}

export const validateShortcut = (shortcut: KSMTypes.KeyboardShortcut) => {
    shouldNotBeEmpty(shortcut, 'shortcut');

    const { userAction, keymap, display = {} } = shortcut;
    // TODO: Validate allowed values, length restrictions, etc
    shouldNotBeEmpty(userAction.id, 'shortcut.userAction.id');
    validateShortcutKeymapValues(keymap.values, 'shortcut.keymap.values');
    validateShortcutKeymapValues(keymap.defaultValues, 'shortcut.keymap.defaultValues');

    // validate optional attributes
    if (!_isEmpty(userAction.scopes)) {
        shouldBeAnArray(userAction.scopes, 'shortcut.userAction.scopes');
    }
};
