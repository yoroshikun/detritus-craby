import {CommandClient} from 'detritus-client';
import {
  defaultJSON as defaultTubbyFile,
  CONFIG_FILE_PATH as TUBBY_CONFIG_FILE_PATH,
} from './commands/genshin/tubby';
import {
  defaultJSON as defaultXEFile,
  CONFIG_FILE_PATH as XE_CONFIG_FILE_PATH,
} from './commands/genshin/tubby';
import {ensureFile, setupCommands} from './utils';

// Get token and throw if not provided
const token =
  process.env.NODE_ENV === 'production'
    ? process.env.DISCORD_TOKEN
    : process.env.DISCORD_TOKEN_TEST;

if (!token) {
  throw new Error('Discord token is missing');
}

const commandClient = new CommandClient(token, {prefix: '!'});

setupCommands(commandClient);

/**
 * Start the main async loop
 */
(async () => {
  // Ensure FS
  ensureFile(XE_CONFIG_FILE_PATH, defaultXEFile);
  ensureFile(TUBBY_CONFIG_FILE_PATH, defaultTubbyFile);

  // Start the client
  const client = await commandClient.run();

  console.log(`Craby has loaded with a shard count of ${client.shardCount}`);
})();
