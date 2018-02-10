const program = require('commander');

const pkginfo = require('./package.json');

program
  .version(pkginfo.version, '-v, --version')
  .parse(process.argv);
