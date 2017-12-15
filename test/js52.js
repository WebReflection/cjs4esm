import cjs from './c.js';
const require = cjs(`${getModuleLoadPath()}/test`);

// resolves ./demo/index.js
const demo = require('./demo');
console.log(demo.rand);
console.log(demo.CircularJSON.stringify);
