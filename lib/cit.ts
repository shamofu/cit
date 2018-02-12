#!/usr/bin/env node

import cli = require('commander')
import shell = require('shelljs')
const pkginfo = require('../package.json')

if (!shell.which('git')) {
  shell.echo('Cit requires Git.')
  shell.exit(0)
}

const exec = (cmd) => {
  shell.echo(`$ ${cmd}`)
  shell.exec(cmd)
}

cli.version(pkginfo.version, '-v, --version')

cli.command('init')
  .description('equivalent to `git init`')
  .action(() => {
    exec('git init')
  })

cli.command('clone <repo>')
  .description('equivalent to `git clone <repo>`')
  .action((repo) => {
    exec(`git clone ${repo}`)
  }).on('--help', () => {
    shell.echo()
    shell.echo('  Example: cit clone https://github.com/shamofu/cit.git')
  })

cli.command('*', null, { noHelp: true })
  .description('default')
  .action(() => {
    shell.echo()
    shell.echo(`  Cannot find that command.`)
    shell.echo('  Run `cit` to see all available commands.')
  })

cli.parse(process.argv)

if (!process.argv.slice(2).length) {
  cli.help()
}
