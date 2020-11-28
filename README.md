# keyboard-shortcuts-manager

### Note: Still in early development

## Installation

- Using yarn - `yarn add @micro-ux/keyboard-shortcuts-manager`
- Using npm - `npm i @micro-ux/keyboard-shortcuts-manager`

## Basic example

```
import {
  registerShortcuts,
  handleKeyboardEvent,
} from '@micro-ux/keyboard-shortcuts-manager';
```

```
const KeyboardShortcutsConfig = [{
    userAction: {
        id: "@example-app:save-n-close",
        scopes: ["@forms"],
        enabled: true,
    },
    keymap: {
        values: ["ctrl+alt+s"],
        defaultValues: ["ctrl+alt+s"],
        overidable: true,
    },
    display: {
        category: "forms",
        label: "Save and Close",
        description: "Save and Close",
    },
}, {
    userAction: {
        id: "@example-app:save-n-new",
        scopes: ["@forms"],
        enabled: true,
    },
    keymap: {
        values: ["ctrl+alt+n"],
        defaultValues: ["ctrl+alt+n"],
        overidable: true,
    },
    display: {
        category: "forms",
        label: "Save and New",
        description: "Save and New",
    },
}, {
    userAction: {
        id: '@example-app:show-keyboard-shortcuts',
        scopes: ['@global'],
        enabled: true,
    },
    keymap: {
        values: ['shift+/'],
        defaultValues: ['shift+/'],
        overidable: false,
    },
    display: {
        category: 'general',
        label: 'Show Keyboard Shortcuts',
        description: 'Show Keyboard Shortcuts Cheatsheet',
    },
}];
```

```
registerShortcuts(keyboardShortcutsConfig);
```

```
const handleKeyDown = (e) => {
    handleKeyboardEvent(e, {
      "@example-app:save-n-close": (event, shortCut) => {
        console.log("Save and close triggered!");
      },
      "@example-app:save-n-new": (event, shortCut) => {
        console.log("Save and New triggered!");
      },
    }, {
        userActionScopes: ['@global', '@forms'],
    });
};

window.addEventListener('keydown', handleKeyDown);
```

## API Reference

registerCallback

registerShortcuts

setSequenceMode

handleKeyboardEvent

isShortcutKeymapTaken

updateShortcutValue

updateShortcutValues

resetShortcutToDefaultValue

resetAllShortcutsToDefaultValue

getShortcut

getAllShortcuts

deleteShortcuts

deleteAllShortcuts

### Entity model

#### KeyboardShortcut

```
{
    readonly userAction: UserActionConfig;
    readonly keymap: KeymapConfig;
    readonly display?: DisplayConfig;
}
```

#### UserActionConfig

```
{
    readonly id: UserActionId;
    readonly scopes?: Array<UserActionScope>;
    /**
     * Optional. Default value is set to true.
     */
    readonly enabled?: boolean;

    /**
     * Optional. Default value is set to false.
     *
     * If this is set to true, this will not be managed by keyboard-shortcuts-manager,
     * i.e, handleKeyboardEvent() will ignore this keymap
     * However, getAllShortcuts() will include this while returning the list of keyboard shortcuts
     *
     * This will allow keydown event handling outside of the keyboard-shortcuts-manager &
     * still allow keyboard-shortcuts-manager to maintain complete list of all available keyboard shortcuts
     * for a given application.
     */
    readonly managedExternally?: boolean;
}
```

#### KeymapConfig

```
    /**
     * Represents the actual value (either the default value set by the app OR overriden by user at runtime)
     */
    values: Array<KeymapValue>;

    /**
     * Represents default value. This will not change at runtime.
     * This will be used to reset to default value when `overidable` is set to true
     */
    readonly defaultValues: Array<KeymapValue>;

    /**
     * Default value is set to true.
     *
     * If this is set to false, overriding keymap config at runtime is not allowed for given userActionId
     */
    readonly overidable?: boolean;

    /**
     * Optional. Default value is set to false.
     *
     * By default keyboard shortcuts are disabled when the focus is in an editable element like input, textarea.
     *
     * If this value is set to true, the keyboard shortcut will be enabled even in editable element.
     * Scenarios, where we would ideally want such behavior is when building a rich text area
     * (which can have shortcuts enabled even while working in the context of an editable textarea)
     */
    readonly allowShortcutOnEditableElements?: boolean;

    /**
     * Optional. Default value is set to false.
     *
     * By default event.stopPropagation() is called when a match is found for a keydown event
     * If this value is set to true, event.stopPropagation() will not be called.
     */
    readonly doNotStopPropagationOnMatch?: boolean;
```

#### DisplayConfig

```
    readonly category?: string;

    /**
     * Optional. No default value.
     *
     * Display label for the user action
     */
    readonly label?: string;

    /**
     * Optional. No default value.
     *
     * Description for the user action
     */
    readonly description?: string;
```

## Usage Examples

https://github.com/micro-ux/keyboard-shortcuts-examples
