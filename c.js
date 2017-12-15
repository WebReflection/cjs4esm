/*! (c) Andrea Giammarchi, ISC License */

const DIR_SEPARATOR = '/';
const cache = Object.create(null);
const modules = Object.create(null);
const isPath = /^[./\\]/;

const cjs = base => {
  require.cache = cache;
  require.resolve = resolve.bind(null, base);
  function require(module) {
    const path = require.resolve(module);
    if (!(path in cache)) {
      if (!path) throw new Error(`${module} not found`);
      const content = loadContent(path);
      if (path.slice(-5) === '.json') {
        cache[path] = JSON.parse(content);
      } else {
        const object = {exports: {}};
        const dirname = path.slice(0, path.lastIndexOf(DIR_SEPARATOR));
        // avoid circular dependencies mess
        cache[path] = object.exports;
        Function(
          'exports',
          'module',
          'require',
          '__dirname',
          '__filename',
          content.toString().replace(/^#!.+[\r\n]+/, '')
        ).call(
          object.exports,
          object.exports,
          object,
          cjs(dirname),
          dirname,
          path
        );
        cache[path] = object.exports;
      }
    }
    return cache[path];
  }
  return require;
};

let loadContent, loadInfo, loadAsModule;

try {

  // Front End

  new XMLHttpRequest;

  loadContent = path => {
    const xhr = new XMLHttpRequest;
    xhr.open('GET', path, false);
    xhr.send(null);
    return xhr.responseText;
  };

  loadInfo = path => {
    const xhr = new XMLHttpRequest;
    try {
      xhr.open('HEAD', path, false);
      xhr.send(null);
      return {
        type: xhr.status < 400 ?
          xhr.getResponseHeader('content-type')
            .replace(/^.+?\/([a-z_-]+).*$/, '$1') :
          '',
        path: xhr.responseURL
      };
    } catch(nope) {
      return {
        type: '',
        path: ''
      };
    }
  };

  loadAsModule = (dir, module) => {
    const uid = [dir, module].join(DIR_SEPARATOR);
    if (uid in modules) return modules[uid];
    do {
      const info = loadInfo([dir, 'package.json'].join(DIR_SEPARATOR));
      if (info.type === 'json') {
        const {
          dependencies,
          devDependencies
        } = JSON.parse(loadContent(info.path));
        const version = (dependencies && dependencies[module]) ||
                        (devDependencies && devDependencies[module]);
        if (version) {
          return (modules[uid] = loadAsDirectory(
            `https://unpkg.com/${module}@${
              version.replace(/[~^]/g, '').replace(/\.[x*]/g, '.0')
            }`
          ));
        }
      }
    } while((
      dir = dir.slice(0, dir.lastIndexOf(DIR_SEPARATOR))
    ));
  };

} catch (notABrowser) {

  // Back End

  // common module loader
  loadAsModule = (dir, module) => {
    let path = '';
    do {
      const modules = [dir, 'node_modules'].join(DIR_SEPARATOR);
      if (loadInfo(modules).type === 'dir') {
        const info = loadInfo([modules, module].join(DIR_SEPARATOR));
        if (info.type === 'dir') {
          return loadAsDirectory(info.path);
        } 
      }
    } while((
      dir = dir.slice(0, dir.lastIndexOf(DIR_SEPARATOR))
    ));
    return path;
  };

  // SpiderMonkey
  if (
    typeof read === 'function' &&
    typeof os === 'object' &&
    !!os.system
  ) {

    const normalize = path => path.replace(/(^|\/)\.\//g, '$1')
                                  .replace(/([^/]+?)\/\.\.\//g, '');

    loadContent = path => read(path);
    loadInfo = path => {
      path = normalize(path);
      if (
        // if it's a file or a folder, it's OK
        os.system(`[ -f '${path}' ] || [ -d '${path}' ]`) === 0
      ) {
        return {
          type: /\.js$/.test(path) ?
            'javascript' :
            (/\.json$/.test(path) ?
              'json' : 'dir'),
          path: path
        };
      } else {
        return {
          type: '',
          path: ''
        };
      }
    };
  }
  // JSC, Nexusjs, and NodeJS coming soon
  else {
    throw new Error('Incompatible Platform');
  }
}

function loadAsFile(dir, file) {
  let name, info;
  if (['', '.js', '.json'].some(
    ext => {
      name = `${dir}${DIR_SEPARATOR}${file}${ext}`;
      info = loadInfo(name);
      return 0 < info.type.length;
    }
  )) {
    return /^javascript|json$/.test(info.type) && /\.(?:js|json)$/.test(name) ?
      info.path :
      loadAsDirectory([dir, file].join(DIR_SEPARATOR));
  }
  return '';
}

function loadAsDirectory(dir) {
  const info = loadInfo([dir, 'package.json'].join(DIR_SEPARATOR));
  if (info.type === 'json') {
    const pkg = JSON.parse(loadContent(info.path));
    return pkg.main ? loadAsFile(dir, pkg.main) : loadIndex(dir);
  }
  return loadIndex(dir);
}

function loadIndex(dir) {
  const js = loadInfo([dir, 'index.js'].join(DIR_SEPARATOR));
  if (js.type === 'javascript') return js.path;
  const json = loadInfo([dir, 'index.json'].join(DIR_SEPARATOR));
  if (json.type === 'json') return json.path;
  return '';
}

function resolve(base, module) {
  const resolver = isPath.test(module) ? loadAsFile : loadAsModule;
  const resolved = resolver(base, module);
  if (!resolved) throw new Error(`${module} not found`);
  return resolved;
}

export default cjs;
