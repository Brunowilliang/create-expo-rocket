import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import {
  promptAppName,
  execCommand,
  updateJsonFile,
  printError,
  Starting,
} from './utils'

export async function createApp(): Promise<void> {
  const appName = await promptAppName()

  const slug = appName.toLowerCase().replace(/\s+/g, '-')

  Starting()

  // Resolve the path to the new app directory
  const appDir = path.resolve(process.cwd(), appName)

  const directoryExists = await fs.pathExists(appDir)
  if (directoryExists) {
    printError(`Error: The directory ${appDir} already exists.`)
    process.exit(1)
  }

  // Create the directory
  await execCommand({
    command: `mkdir ${appName}`,
    message: 'Creating the directory...',
    errorMessage: `Error: Failed to create the directory ${appName}.`,
  })

  // download and extract the project files
  await execCommand({
    command: `git clone git@github.com:Brunowilliang/rn-expo-starter.git ${appName}`,
    message: 'Downloaded and extracted project files',
    errorMessage: `Error: Failed to download and extract the project files.`,
  })

  // update the package.json
  await updateJsonFile(path.join(appDir, 'package.json'), (data) => {
    data.name = appName
  })

  // update the app.json
  await updateJsonFile(path.join(appDir, 'app.json'), (data) => {
    data.expo.name = appName
    data.expo.slug = slug
  })

  // remove the .git directory
  await execCommand({
    command: `cd ${appDir} && rm -rf .git`,
    errorMessage: `Error: Failed to remove the .git directory.`,
  })

  // install dependencies
  await execCommand({
    command: `cd ${appDir} && yarn install`,
    message: 'Installing dependencies...',
    errorMessage: `Error: Failed to install dependencies.`,
  })

  // App created successfully
  console.log(chalk.green.bold(`\n✅ Application created successfully!\n`))

  // instructions for starting the app
  console.log(
    chalk.bold(`
To get started, run the following commands:\n
- cd ${appName}
- npx expo start
- npx expo start --ios
- npx expo start --android
  `),
  )
}

if (process.argv.length > 2) {
  console.error(
    'Error: Extra arguments provided. Usage: npx create-expo-rocket',
  )
  process.exit(1)
}

createApp()
