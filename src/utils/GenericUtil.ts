import _isEmpty from 'lodash/isEmpty';
import _isArray from 'lodash/isArray';

export const isArrayNotEmpty = (inputArray?: any): boolean => _isArray(inputArray) && !_isEmpty(inputArray);

export const debounce = (func: Function, wait: number, immediate?: boolean) => {
    let timeout;
  
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
  
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
  
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
};
