import type {CommandClient} from 'detritus-client';

import ping from '../commands/common/ping';
import xe from '../commands/common/xe';
import tubby from '../commands/genshin/tubby';
import slashCommands from '../commands/slashCommands';

/**
 * Add commands to the Detritus Command Client
 *
 * @param client Detritus Command Client Instance
 * @returns void
 */
const setupCommands = (client: CommandClient) => {
  // Common
  client.add({name: 'ping', run: async context => ping(context)});
  client.add({name: 'xe', run: async (context, args) => xe.xe(context, args)});
  client.add({
    name: 'xedefault',
    run: async (context, args) => xe.xeDefault(context, args),
  });
  // Genshin
  // Tubby Manager
  client.add({
    name: 'tubby',
    aliases: ['t', 'tl', 'tubbylist'],
    run: async context => tubby.tubbyList(context),
  });

  client.add({
    args: [{name: 'offset', type: 'number'}],
    name: 'tubbyrequest',
    aliases: ['tr'],
    run: async (context, args) => tubby.tubbyRequest(context, args),
  });

  client.add({
    args: [{name: 'user', type: 'string'}],
    name: 'tubbycomplete',
    aliases: ['tc'],
    run: async (context, args) => tubby.tubbyComplete(context, args),
  });

  // Slash Commands
  client.add({
    name: 'commands',
    metadata: {
      description: 'Set slash Commands',
      examples: ['commands'],
      type: 'admin',
      usage: 'commands',
      adminOnly: true,
    },
    run: async (context, args) => slashCommands.setup(context, args),
  });
};

export default setupCommands;
