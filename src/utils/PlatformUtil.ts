
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID/platform
export const isMacintosh = () => window.navigator.platform.indexOf('Mac') > -1;
export const isWindows = () => window.navigator.platform.indexOf('Win') > -1;
