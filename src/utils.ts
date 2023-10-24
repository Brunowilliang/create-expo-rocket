import { exec, ExecOptions } from 'child_process'
import ora, { Ora } from 'ora'
import chalk from 'chalk'
import { input } from '@inquirer/prompts'
import fs from 'fs-extra'

export function printLogo() {
  console.log(`
┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐  ┬─┐┌─┐┌─┐┬┌─┌─┐┌┬┐  ┌─┐┌─┐┌─┐
│  ├┬┘├┤ ├─┤ │ ├┤   ├┬┘│ ││  ├┴┐├┤  │   ├─┤├─┘├─┘
└─┘┴└─└─┘┴ ┴ ┴ └─┘  ┴└─└─┘└─┘┴ ┴└─┘ ┴   ┴ ┴┴  ┴  
`)
}

export function isError(err: any): err is Error {
  return err instanceof Error
}

export async function promptAppName(): Promise<string> {
  try {
    const appName = await input({
      message: 'Please provide a name for your application:',
      validate(value: string) {
        if (!value) {
          return 'The application name cannot be empty.'
        }
        if (value[0] !== value[0].toLowerCase()) {
          return 'The first character of the application name must be lowercase.'
        }
        if (!/^[a-z][a-zA-Z0-9-]*$/.test(value) || /[_\s]/.test(value)) {
          return 'The application name can only contain alphanumeric characters and hyphens, and cannot contain underscores or spaces.'
        }
        return true
      },
    })
    return appName
  } catch (error) {
    if (
      isError(error) &&
      error.message.includes('User force closed the prompt')
    ) {
      process.exit(0)
    } else {
      console.error(error)
      process.exit(1)
    }
  }
}

interface ExecCommandOptions {
  command: string
  message?: string
  options?: ExecOptions
  errorMessage?: string // nova propriedade para mensagem de erro personalizada
}

export async function execCommand(args: ExecCommandOptions): Promise<void> {
  const { command, message, options = {}, errorMessage } = args
  let spinner: Ora | undefined
  if (message) {
    spinner = ora(message).start()
  }
  return new Promise((resolve, reject) => {
    exec(command, options, (error) => {
      if (error) {
        const errorMsg = errorMessage || error.message // use errorMessage se fornecido, senão use error.message
        if (spinner) {
          spinner.fail(errorMsg)
        }
        console.error(chalk.red(errorMsg))
        reject(new Error(errorMsg))
      } else {
        if (spinner) {
          spinner.succeed()
        }
        resolve()
      }
    })
  })
}

export async function updateJsonFile(
  filePath: string,
  updater: (data: any) => void,
): Promise<void> {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
  updater(data)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}
