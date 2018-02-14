#!/usr/bin/env node

import cli = require('commander')
import shell = require('shelljs')
import inquirer = require('inquirer')
import fuzzy = require('fuzzy')

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
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

function fuzzySearch(fuzzyList) {
  return (_, input) => {
    input = input || ''
    return new Promise((resolve) => {
      setTimeout(() => {
        const fuzzyResult = fuzzy.filter(input, fuzzyList)
        resolve(fuzzyResult.map((el) => {
          return el.original
        }))
      }, 500)
    })
  }
}

async function acInquirer(fuzzyList, question = 'What do you want?') {
  const result = await inquirer.prompt([{
    type: 'autocomplete',
    name: 'answer',
    message: question,
    source: fuzzySearch(fuzzyList)
  }])
  return result.answer
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
  .option('-p, --prune', '`--prune`')
  .action((remote, remoteBranch, cmd) => {
    const flag = cmd.prune ? '--prune' : ''
    if (!remote) {
      exec(`git fetch ${flag}`)
    } else {
      if (!remoteBranch) {
        exec(`git fetch ${remote} ${flag}`)
      } else {
        exec(`git fetch ${remote} +refs/heads/${remoteBranch}:refs/remotes/${remote}/${remoteBranch} ${flag}`)
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

cli.command('interactive').alias('i')
  .description('interactive mode')
  .action(async () => {
    const command = await acInquirer(['init', 'clone', 'branch', 'checkout'])
    shell.echo(command)
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
