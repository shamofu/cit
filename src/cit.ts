#!/usr/bin/env node

import cli = require('commander')
import shell = require('shelljs')
import inquirer = require('inquirer')
import fuzzy = require('fuzzy')
import isOnline = require('is-online')

const pkginfo = require('../package.json')

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

{(async () => {
  if (!shell.which('git')) {
    shell.echo('Cit requires Git.')
    shell.exit(1)
  }

  const connectivity = await isOnline()
  if (!connectivity) {
    shell.echo('Cit requires the Internet.')
    shell.exit(1)
  }

  const exec = (cmd, isDev = false) => {
    shell.echo(`$ ${cmd}`)
    if (!isDev) {
      if (shell.exec(cmd).code !== 0) {
        shell.echo('Error: exec failed')
        shell.exit(1)
      }
    }
  }

  const fuzzySearch = (fuzzyList) => {
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

  const acInquirer = async (fuzzyList, question = 'What do you want?') => {
    const result = await inquirer.prompt([{
      type: 'autocomplete',
      name: 'answer',
      message: question,
      source: fuzzySearch(fuzzyList)
    }])
    return result.answer
  }

  cli.command('add <files...>')
  .description('`git add <files...>`')
  .action((files) => {
    exec(`git add ${files.join(' ')}`)
  })

  cli.command('branch [newBranch] [originalBranch]')
  .description('`git branch [newBranch] [originalBranch]`')
  .action((newBranch, originalBranch) => {
    if (!newBranch) {
      exec('git branch -vva')
    } else {
      if (!originalBranch) {
        exec(`git branch ${newBranch}`)
        exec(`git push -u origin ${newBranch}`)
      } else {
        exec(`git branch ${newBranch} ${originalBranch}`)
        exec(`git push -u origin ${newBranch}`)
      }
    }
  })

  cli.command('checkout <branch>')
  .description('`git checkout <branch>`')
  .action((branch) => {
    exec(`git checkout ${branch}`)
  })

  cli.command('clone <repo>')
  .description('`git clone <repo>`')
  .action((repo) => {
    exec(`git clone ${repo}`)
  }).on('--help', () => {
    shell.echo()
    shell.echo('  Example: cit clone https://github.com/shamofu/cit.git')
  })

  cli.command('commit [message]')
  .description('`git commit`')
  .action((message) => {
    if (!message) {
      exec(`git commit`)
      exec(`git pull --rebase`)
      exec('git push')
    } else {
      exec(`git commit -m "${message}"`)
      exec(`git pull --rebase`)
      exec('git push')
    }
  })

  cli.command('fetch [remote] [remoteBranch]')
  .description('`git fetch [remote] +refs/heads/[remoteBranch]:refs/remotes/[remote]/[remoteBranch]`')
  .option('-p, --prune', '`--prune`')
  .action((remote, remoteBranch, options) => {
    const flags = options.prune ? '--prune' : ''
    if (!remote) {
      exec(`git fetch ${flags}`)
    } else {
      if (!remoteBranch) {
        exec(`git fetch ${remote} ${flags}`)
      } else {
        exec(`git fetch ${remote} +refs/heads/${remoteBranch}:refs/remotes/${remote}/${remoteBranch} ${flags}`)
      }
    }
  })

  cli.command('init')
  .description('`git init`')
  .action(() => {
    exec('git init')
  })

  cli.command('merge <branch>')
  .description('`git merge <branch>`')
  .action((branch) => {
    exec(`git merge ${branch}`)
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

  cli.version(pkginfo.version, '-v, --version')
  cli.parse(process.argv)

  if (!process.argv.slice(2).length) {
    cli.help()
  }
})()}
