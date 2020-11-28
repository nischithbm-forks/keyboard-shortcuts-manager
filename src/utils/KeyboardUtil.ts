import keycode from 'keycode';
import _isArray from "lodash/isArray";
import _isEmpty from "lodash/isEmpty";

import * as KSMTypes from "../@types/ksm/index";

export const isFocusInInputElement = (event: KSMTypes.AnyKeyboardEvent) => {
  return (
    /input|textarea/i.test(event.target.tagName) ||
    event.target.getAttribute('contenteditable') !== null
  );
}

/*
 * Map a keyboard event to a keyboard shortcut
 * TODO: Handle function keys?
 * Ref: https://github.com/storybookjs/storybook/blob/v6.0.0-rc.14/lib/api/src/lib/shortcut.ts#L17
 */
export const eventToShortcutArray = (e: KSMTypes.AnyKeyboardEvent): any => {
    // Meta key only doesn't map to a shortcut
    if (['Meta', 'Alt', 'Control', 'Shift'].includes(e.key)) {
      return [];
    }
  
    const keys = [];
    if (e.ctrlKey) {
      keys.push('ctrl');
    }
    if (e.altKey) {
      keys.push('alt');
    }
    if (e.metaKey) {
      keys.push('meta');
    }
    if (e.shiftKey) {
      keys.push('shift');
    }
  
    if (e.key && e.key.length === 1 && e.key !== ' ') {
      keys.push(keycode(e));
    //   keys.push(e.key.toUpperCase()); // TODO: understand this better
    }
    if (e.key === ' ') {
      keys.push('spacebar');
    }
    if (e.key === 'Escape') {
      keys.push('esc');
    }
    if (e.key === 'ArrowRight') {
      keys.push('arrowRight');
    }
    if (e.key === 'ArrowDown') {
      keys.push('arrowDown');
    }
    if (e.key === 'ArrowUp') {
      keys.push('arrowUp');
    }
    if (e.key === 'ArrowLeft') {
      keys.push('arrowLeft');
    }
  
    return keys.length > 0 ? keys : null;
};

export const eventToShortcut = (e: KSMTypes.AnyKeyboardEvent): any => {
  let eventToKeysStr;
  const eventToKeys = eventToShortcutArray(e);
    if (!_isEmpty(eventToKeys) && _isArray(eventToKeys)) {
      eventToKeysStr = eventToKeys.join("+");
    }
    return !_isEmpty(eventToKeysStr) ? eventToKeysStr : undefined;
};
