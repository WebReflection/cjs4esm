import cjs from '../c.js';
const require = cjs(location.pathname.slice(0, -1));

// resolves ./demo/index.js
const demo = require('./demo');
console.log(demo.rand);
console.log(demo.CircularJSON.stringify);
