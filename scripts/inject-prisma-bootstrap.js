// This script injects Prisma bootstrap code at the very beginning of the main process bundle
// It runs BEFORE any requires, ensuring the module resolution hook is in place

const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'out', 'main', 'index.js');

const prismaBanner = `// Prisma bootstrap - runs before any module requires
(function() {
  var electron = require('electron');
  var path = require('path');
  var Module = require('module');

  if (electron.app.isPackaged) {
    var unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');
    var prismaClientPath = path.join(unpackedPath, '.prisma', 'client');

    // Set query engine path
    var engineName;
    if (process.platform === 'darwin') {
      engineName = process.arch === 'arm64' ? 'libquery_engine-darwin-arm64.dylib.node' : 'libquery_engine-darwin.dylib.node';
    } else if (process.platform === 'win32') {
      engineName = 'query_engine-windows.dll.node';
    } else {
      engineName = process.arch === 'arm64' ? 'libquery_engine-linux-arm64-openssl-3.0.x.so.node' : 'libquery_engine-linux-musl-openssl-3.0.x.so.node';
    }
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(prismaClientPath, engineName);

    // Hook require to redirect .prisma imports
    var originalRequire = Module.prototype.require;
    Module.prototype.require = function(id) {
      if (id === '.prisma/client/default') {
        return originalRequire.call(this, path.join(prismaClientPath, 'default.js'));
      }
      if (id === '.prisma/client') {
        return originalRequire.call(this, path.join(prismaClientPath, 'index.js'));
      }
      return originalRequire.apply(this, arguments);
    };
  }
})();
`;

console.log('[inject-prisma-bootstrap] Reading:', mainJsPath);

let content = fs.readFileSync(mainJsPath, 'utf8');

// Insert banner right after "use strict"; if present, otherwise at the very start
if (content.startsWith('"use strict";')) {
  content = '"use strict";\n' + prismaBanner + content.slice('"use strict";'.length);
} else {
  content = prismaBanner + content;
}

fs.writeFileSync(mainJsPath, content);
console.log('[inject-prisma-bootstrap] Bootstrap code injected successfully');
