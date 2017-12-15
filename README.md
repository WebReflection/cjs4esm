# cjs4esm [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate)

CommonJS `require` via ESM import for Front End and Back End.

```js
// grab the CJS initializer
import cjs from './c.js';

// create a require entry point
// specifying the current module folder
// i.e. import.meta.directory
const require = cjs('.');

// use require to bring in CommonJS based modules/files
const local = require('./demo');
const fromNodeModules = require('circular-json');

// also available
require.cache;
require.resolve('./demo'); // i.e. ./demo/index.js
```


### Compatibility

While it is planned to make this module work on [JSC](https://trac.webkit.org/wiki/JavaScriptCore), [NexusJS](https://github.com/voodooattack/nexusjs), and [NodeJS](https://nodejs.org/en/) too,
you can use it already today in **SpiderMonkey**.

You can test the demo via `npm run test-js52` as long as you have SpiderMonkey installed as `js52` executable.

If you are using this with **browsers**, it is strongly suggested you do that **only during development** because the CommonJS resolution procedure is everything but HTTP friendly so performance, and useless network requests, might happen.

You can, however, test this module on your browser through the [test page](https://webreflection.github.io/cjs4esm/test/).


### Goal / Use case

The goal of this project is to help migrating to fully standard ESM, no matter which target you are using.

As example, SpiderMonkey is now compatible with standard ESM, but it has no mechanism to require CommonJS modules from [npm registry](https://www.npmjs.com). Well, it does now, while it can keep using modern JS and standard ESM too.

On browser side, there are numerous solutions to bring CommonJS to the browser and none of them actually resolves at runtime.

Still on browsers, it is strongly discouraged to use this script in production.
Always bundle your projects, and use this only as debugging helper.
