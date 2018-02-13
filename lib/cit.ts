#!/usr/bin/env node

import cli = require('commander')
import shell = require('shelljs')
const pkginfo = require('../package.json')

if (!shell.which('git')) {
  shell.echo('Cit requires Git.')
  shell.exit(0)
}

const exec = (cmd, isDev = false) => {
  shell.echo(`$ ${cmd}`)
  if (!isDev) {
    shell.exec(cmd)
  }
}

cli.version(pkginfo.version, '-v, --version')

cli.command('init')
  .description('`git init`')
  .action(() => {
    exec('git init')
  })

cli.command('clone <repo>')
  .description('`git clone <repo>`')
  .action((repo) => {
    exec(`git clone ${repo}`)
  }).on('--help', () => {
    shell.echo()
    shell.echo('  Example: cit clone https://github.com/shamofu/cit.git')
  })

cli.command('fetch [remote] [remoteBranch]')
  .description('`git fetch [remote] +refs/heads/[remoteBranch]:refs/remotes/[remote]/[remoteBranch]`')
  .action((remote, remoteBranch) => {
    if (!remote) {
      exec('git fetch')
    } else {
      if (!remoteBranch) {
        exec(`git fetch ${remote}`)
      } else {
        exec(`git fetch ${remote} +refs/heads/${remoteBranch}:refs/remotes/${remote}/${remoteBranch}`)
      }
    }
  })

cli.command('branch [newBranch] [originalBranch]')
  .description('`git branch [newBranch] [originalBranch]')
  .action((newBranch, originalBranch) => {
    if (!newBranch) {
      exec('git branch -vva')
    } else {
      if (!originalBranch) {
        exec(`git branch ${newBranch}`)
      } else {
        exec(`git branch ${newBranch} ${originalBranch}`)
      }
    }
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
