#!/usr/bin/env node

import {
  CommandRegistry,
  CommandExecutor,
  HelpSystem,
} from './core/index';
import { WebSearchCommand } from './commands/WebSearchCommand';
import { AnalyzeMediaCommand } from './commands/AnalyzeMediaCommand';
import { ImageGeneratorCommand } from './commands/ImageGeneratorCommand';
import { ScreenshotCommand } from './commands/ScreenshotCommand';
import { HealthCheckCommand } from './commands/HealthCheckCommand';

/**
 * CLI Entry Point
 * 
 * Initializes the command registry and routes commands.
 * Architecture: SOLID principles with dependency inversion and composition.
 */

async function main(): Promise<void> {
  const registry = new CommandRegistry();
  const executor = new CommandExecutor();
  const helpSystem = new HelpSystem();

  // Register all available commands
  registry.register(new WebSearchCommand());
  registry.register(new AnalyzeMediaCommand());
  registry.register(new ImageGeneratorCommand());
  registry.register(new ScreenshotCommand());
  registry.register(new HealthCheckCommand());

  // Get command line arguments (skip 'node' and script name)
  const args = process.argv.slice(2);

  // Show help if no arguments provided
  if (args.length === 0) {
    const commands = registry.getAllCommands();
    console.log(helpSystem.showAllCommands(commands));
    process.exit(0);
  }

  // Check for global help flag
  if (args[0] === '--help' || args[0] === '-h' || args[0] === 'help') {
    if (args.length > 1) {
      // Show specific command help
      const commandName = args[1];
      if (registry.hasCommand(commandName)) {
        const command = registry.getCommand(commandName)!;
        console.log(command.showHelp());
      } else {
        console.error(`Unknown command: ${commandName}`);
        const commands = registry.getAllCommands();
        console.log(helpSystem.showAllCommands(commands));
        process.exit(1);
      }
    } else {
      // Show all commands help
      const commands = registry.getAllCommands();
      console.log(helpSystem.showAllCommands(commands));
    }
    process.exit(0);
  }

  const commandName = args[0];
  const commandArgs = args.slice(1);

  // Check if command exists
  if (!registry.hasCommand(commandName)) {
    console.error(`\n❌ Unknown command: ${commandName}\n`);
    const commands = registry.getAllCommands();
    console.log(helpSystem.showAllCommands(commands));
    process.exit(1);
  }

  // Check if command is asking for help
  if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
    const command = registry.getCommand(commandName)!;
    console.log(command.showHelp());
    process.exit(0);
  }

  // Execute the command
  const command = registry.getCommand(commandName)!;
  const result = await executor.execute(command, commandArgs);

  // Display result
  if (!result.success) {
    console.error(`\n❌ ${result.error}`);
    process.exit(result.status || 1);
  }

  // Print success data if available for user visibility
  if (result.data) {
    try {
      console.log('\n' + JSON.stringify(result.data, null, 2));
    } catch {
      console.log(result.data);
    }
  }

  // Success exit with status code
  process.exit(0);
}

// Run the CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
