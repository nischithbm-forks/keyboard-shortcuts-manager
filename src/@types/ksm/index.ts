import { CallbackHandlerEventTypeEnum } from "./enums";

export type UserActionId = string;
export type UserActionScope = string;
export type KeymapValue = string;

/**
 * Follows the following syntax
 * UserActionScope:KeymapValuesMode:KeymapValue OR
 * UserActionScopeEnum.DEFAULT_SCOPE:KeymapValuesMode:KeymapValue
 */
export type ScopedKeymapValue = string;

export interface UserActionConfig {
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

export enum KeymapValuesMode {
  always = "always",
  windowsOnly = "windowsOnly",
  macintoshOnly = "macintoshOnly",
  sequenceModeOnly = "sequenceModeOnly",
}

export type KeymapValuesJson = Record<KeymapValuesMode, KeymapValue>;

export interface KeymapConfig {
  /**
   * Represents the actual value (either the default value set by the app OR overriden by user at runtime)
   */
  values: Array<KeymapValue> | KeymapValuesJson;

  /**
   * Represents default value. This will not change at runtime.
   * This will be used to reset to default value when `overidable` is set to true
   */
  readonly defaultValues: Array<KeymapValue> | KeymapValuesJson;

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
}

export interface DisplayConfig {
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
}

export interface KeyboardShortcut {
  readonly userAction: UserActionConfig;
  readonly keymap: KeymapConfig;
  readonly display?: DisplayConfig;
}

export interface AnyKeyboardEvent extends KeyboardEvent {
  target: {
    readonly tagName: string;
    addEventListener(): void;
    removeEventListener(): boolean;
    dispatchEvent(event: Event): boolean;
    getAttribute(attr: string): string | null;
  };
}

export interface CallbackHandler {
  (
    eventType: CallbackHandlerEventTypeEnum,
    shortcuts: Array<KeyboardShortcut>
  ): void;
}

export interface KeyboardShortcutActionValue {
  readonly userActionId: UserActionId;
  readonly keymapValues: Array<KeymapValue>;
}

export interface KeyboardShortcutHandler {
  (keyboardEvent: AnyKeyboardEvent, shortcut: KeyboardShortcut): void;
}

export interface isKeyboardEventHandlerEnabledFunction {
  (): boolean;
}

export interface HandleKeyboardEventOptions {
  readonly userActionScopes?: Array<UserActionScope>;
  readonly isKeyboardEventHandlerEnabled?: isKeyboardEventHandlerEnabledFunction;
}
