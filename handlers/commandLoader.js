const fs = require('node:fs');
const path = require('node:path');

function loadCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const cmd = require(path.join(commandsPath, file));
    if (!cmd?.data?.name || typeof cmd.execute !== 'function') continue;
    commands.set(cmd.data.name, cmd);
  }
  return commands;
}

module.exports = { loadCommands };
