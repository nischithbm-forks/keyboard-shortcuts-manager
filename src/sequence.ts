import _debounce from "lodash/debounce";
import _memoize from "lodash/memoize";
import _cloneDeep from "lodash/cloneDeep";
// import { debounce } from "./utils/GenericUtil";
import { shouldNotBeEmpty, shouldBeBoolean } from "./utils/ValidationUtil";

/**
 * Private in memory store
 */
const SequenceModeStore: {
    enabled: boolean;
    /**
     * Array of keyStrokes pressed in the current window
     */
    keyStrokes: Array<string>;

    /**
     * Active window time in milliseconds after which keyStrokes array will be cleared 
     */
    windowTimeInMillis: number;
} = {
    enabled: false,
    keyStrokes: [],
    windowTimeInMillis: 1000,
};

/**
 * Default value is false.
 * 
 * If set to true, allows keybord shortcuts which are scoped under 'sequenceModeOnly'
 */
export const setSequenceMode = (sequenceModeEnabled: boolean, windowTimeInMillis?: number): void => {
    shouldNotBeEmpty(sequenceModeEnabled, 'sequenceMode');
    shouldBeBoolean(sequenceModeEnabled, 'sequenceMode');
    SequenceModeStore.enabled = sequenceModeEnabled;
    if (windowTimeInMillis !== undefined && windowTimeInMillis > 0) {
        SequenceModeStore.windowTimeInMillis = windowTimeInMillis;
    }
};

export const isSequenceModeEnabled = (): boolean => {
    return SequenceModeStore.enabled;
};

export const clearKeyStrokes = () => {
    SequenceModeStore.keyStrokes = [];
};

const clearKeyStrokesDebounced = _memoize((timeoutInMillis) => {
    return _debounce(() => {
        console.log("clearKeyStrokes", timeoutInMillis);
        clearKeyStrokes();
    }, timeoutInMillis);
});

export const pushKeyStrokes = (keyStroke: string) => {
    console.log("pushKeyStrokes", keyStroke);
    clearKeyStrokesDebounced(SequenceModeStore.windowTimeInMillis)();

    SequenceModeStore.keyStrokes = SequenceModeStore.keyStrokes || [];
    SequenceModeStore.keyStrokes.push(keyStroke);

    console.log("SequenceModeStore.keyStrokes", SequenceModeStore.keyStrokes);
};

export const getKeyStrokes = (): Array<string> => _cloneDeep(SequenceModeStore.keyStrokes);
