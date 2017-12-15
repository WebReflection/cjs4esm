/*! (c) Andrea Giammarchi, ISC License */
function loadAsFile(e,t){let o,n;return["",".js",".json"].some(s=>(o=`${e}${DIR_SEPARATOR}${t}${s}`,0<(n=loadInfo(o)).type.length))?/^javascript|json$/.test(n.type)&&/\.(?:js|json)$/.test(o)?n.path:loadAsDirectory([e,t].join(DIR_SEPARATOR)):""}function loadAsDirectory(e){const t=loadInfo([e,"package.json"].join(DIR_SEPARATOR));if("json"===t.type){const o=JSON.parse(loadContent(t.path));return o.main?loadAsFile(e,o.main):loadIndex(e)}return loadIndex(e)}function loadIndex(e){const t=loadInfo([e,"index.js"].join(DIR_SEPARATOR));if("javascript"===t.type)return t.path;const o=loadInfo([e,"index.json"].join(DIR_SEPARATOR));return"json"===o.type?o.path:""}function resolve(e,t){const o=(isPath.test(t)?loadAsFile:loadAsModule)(e,t);if(!o)throw new Error(`${t} not found`);return o}const DIR_SEPARATOR="/",cache=Object.create(null),modules=Object.create(null),isPath=/^[./\\]/,cjs=e=>{function t(e){const o=t.resolve(e);if(!(o in cache)){if(!o)throw new Error(`${e} not found`);const t=loadContent(o);if(".json"===o.slice(-5))cache[o]=JSON.parse(t);else{const e={exports:{}},n=o.slice(0,o.lastIndexOf(DIR_SEPARATOR));cache[o]=e.exports,Function("exports","module","require","__dirname","__filename",t.toString().replace(/^#!.+[\r\n]+/,"")).call(e.exports,e.exports,e,cjs(n),n,o),cache[o]=e.exports}}return cache[o]}return t.cache=cache,t.resolve=resolve.bind(null,e),t};let loadContent,loadInfo,loadAsModule;try{new XMLHttpRequest,loadContent=(e=>{const t=new XMLHttpRequest;return t.open("GET",e,!1),t.send(null),t.responseText}),loadInfo=(e=>{const t=new XMLHttpRequest;try{return t.open("HEAD",e,!1),t.send(null),{type:t.status<400?t.getResponseHeader("content-type").replace(/^.+?\/([a-z_-]+).*$/,"$1"):"",path:t.responseURL}}catch(e){return{type:"",path:""}}}),loadAsModule=((e,t)=>{const o=[e,t].join(DIR_SEPARATOR);if(o in modules)return modules[o];do{const n=loadInfo([e,"package.json"].join(DIR_SEPARATOR));if("json"===n.type){const{dependencies:e,devDependencies:s}=JSON.parse(loadContent(n.path)),r=e&&e[t]||s&&s[t];if(r)return modules[o]=loadAsDirectory(`https://unpkg.com/${t}@${r.replace(/[~^]/g,"").replace(/\.[x*]/g,".0")}`)}}while(e=e.slice(0,e.lastIndexOf(DIR_SEPARATOR)))})}catch(e){if(loadAsModule=((e,t)=>{do{const o=[e,"node_modules"].join(DIR_SEPARATOR);if("dir"===loadInfo(o).type){const e=loadInfo([o,t].join(DIR_SEPARATOR));if("dir"===e.type)return loadAsDirectory(e.path)}}while(e=e.slice(0,e.lastIndexOf(DIR_SEPARATOR)));return""}),"function"!=typeof read||"object"!=typeof os||!os.system)throw new Error("Incompatible Platform");loadContent=(e=>read(e)),loadInfo=(e=>(e=(e=>e.replace(/(^|\/)\.\//g,"$1").replace(/([^/]+?)\/\.\.\//g,""))(e),0===os.system(`[ -f '${e}' ] || [ -d '${e}' ]`)?{type:/\.js$/.test(e)?"javascript":/\.json$/.test(e)?"json":"dir",path:e}:{type:"",path:""}))}export default cjs;