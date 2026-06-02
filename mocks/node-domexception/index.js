// Native DOMException mock to avoid deprecated NPM packages in newer Node.js environments.
const NativeDOMException = typeof globalThis !== 'undefined' ? globalThis.DOMException : undefined;
module.exports = NativeDOMException;
module.exports.default = NativeDOMException;
