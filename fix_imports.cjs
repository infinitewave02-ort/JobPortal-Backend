const fs = require('fs');
const path = require('path');
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      let orig = c;
      c = c.replace(/response\.util\.js/g, 'Response.js');
      c = c.replace(/\/([a-zA-Z0-9]+)\.service\.js/g, (m, p1) => {
          return '/' + p1.charAt(0).toUpperCase() + p1.slice(1) + 'Service.js';
      });
      if (orig !== c) {
        fs.writeFileSync(p, c);
        console.log('Updated ' + p);
      }
    }
  });
}
walk('./src');
