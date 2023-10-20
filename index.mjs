#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import inquirer from 'inquirer';



function execCommand(command, spinner, message, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error) => {
      if (error) {
        console.error(error.message);
        spinner.fail(message);
        reject(error);
      } else {
        spinner.succeed(message);
        resolve();
      }
    });
  });
}

async function promptAppName() {
  const { appName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Please provide a name for your application:',
      validate: function(value) {
        if (value[0] !== value[0].toLowerCase()) {
          return 'The first character of the application name must be lowercase.';
        }
        if (!/^[a-z][a-zA-Z0-9-]*$/.test(value) || /[_\s]/.test(value)) {
          return 'The application name can only contain alphanumeric characters and hyphens, and cannot contain underscores or spaces.';
        }
        return true;
      }
    }
  ]);
  return appName;
}

async function createApp() {
  const appName = await promptAppName();

  const slug = appName.toLowerCase().replace(/\s+/g, '-');

console.log(`
┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐  ┬─┐┌─┐┌─┐┬┌─┌─┐┌┬┐  ┌─┐┌─┐┌─┐
│  ├┬┘├┤ ├─┤ │ ├┤   ├┬┘│ ││  ├┴┐├┤  │   ├─┤├─┘├─┘
└─┘┴└─└─┘┴ ┴ ┴ └─┘  ┴└─└─┘└─┘┴ ┴└─┘ ┴   ┴ ┴┴  ┴  
`);

  console.log(`\x1b[1m🚀 Creating a rocket app...\x1b[0m`);

  let spinner = ora('Starting...').start();
  spinner.succeed('Starting...');

  // Resolve the path to the new app directory
  const appDir = path.resolve(process.cwd(), appName);

  spinner = ora('Creating the directory...').start();
  await execCommand(`mkdir ${appName}`, spinner, 'Creating the directory...');

  spinner = ora('Downloaded and extracted project files').start();
  await execCommand(`git clone git@github.com:Brunowilliang/rn-expo-starter.git ${appName}`, spinner, 'Downloaded and extracted project files');

  spinner = ora('Updating package.json...').start();
  const packageJsonPath = path.join(appDir, 'package.json');
  const packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJsonData.name = appName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonData, null, 2));
  spinner.succeed('Updating package.json...');

  spinner = ora('Updating app.json...').start();
  const appJsonPath = path.join(appDir, 'app.json');
  const appJsonData = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
  appJsonData.expo.name = appName;
  appJsonData.expo.slug = slug;  // Usa o slug corrigido
  fs.writeFileSync(appJsonPath, JSON.stringify(appJsonData, null, 2));
  spinner.succeed('Updating app.json...');

  spinner = ora('Installing dependencies...').start();
  await execCommand(`cd ${appDir} && yarn install`, spinner, `Installing dependencies...\n\n`);
  spinner.succeed(`\x1b[1mApplication created successfully!\n\n\x1b[0m`);

  
  // instructions for starting the app
  console.log(`To get started, run the following commands:\n`);

  console.log(`\x1b[1m- cd ${appName}\x1b[0m`);
  console.log(`\x1b[1m- npx expo start\x1b[0m`);
  console.log(`\x1b[1m- npx expo start --ios\x1b[0m`);
  console.log(`\x1b[1m- npx expo start --android\x1b[0m`);

}

if (process.argv.length > 2) {
  console.error('Error: Extra arguments provided. Usage: npx create-expo-rocket');
  process.exit(1);
}


createApp();

