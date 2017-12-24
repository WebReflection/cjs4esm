import cjs from '../c.js';
const require = cjs(`./test`);

const demo = require('./demo');
print(demo.rand);
print(demo.CircularJSON.stringify);
