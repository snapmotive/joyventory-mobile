// This file adds necessary polyfills for compatibility
// It should be imported early in the app lifecycle

// Polyfill for Symbol.asyncIterator
if (typeof Symbol === 'function' && !Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol('Symbol.asyncIterator');
}

// Polyfill for Object.fromEntries
if (typeof Object.fromEntries !== 'function') {
  Object.fromEntries = function fromEntries(entries: any) {
    if (!entries || !entries[Symbol.iterator]) {
      throw new Error('Object.fromEntries requires an iterable object');
    }
    
    return [...entries].reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
  };
}

export default {
  // This is just a placeholder to ensure the file is imported
  initialized: true
}; 