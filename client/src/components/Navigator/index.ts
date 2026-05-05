/**
 * Navigator component barrel export.
 *
 * The Navigator wraps Three.js OrbitControls with custom constraints defined
 * in `./constraints`.  The constraint logic is exported separately so it can
 * be unit-tested without a WebGL context.
 */
export * from './constraints';
