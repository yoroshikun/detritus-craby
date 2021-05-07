import type {CommandClient} from 'detritus-client';

import ping from '../commands/common/ping';
import xe from '../commands/common/xe';
import tubby from '../commands/genshin/tubby';

/**
 * Add commands to the Detritus Command Client
 *
 * @param client Detritus Command Client Instance
 * @returns void
 */
const setupCommands = (client: CommandClient) => {
  // Common
  client.add({name: 'ping', run: async context => ping(context)});
  client.add({
    name: 'xe',
    run: async (context, args) => xe.xeHandler(context, args),
  });

  // Genshin
  // Tubby Manager
  client.add({
    name: 'tubby',
    aliases: ['t'],
    run: async (context, args) => tubby.tubbyHandler(context, args),
  });

  client.add({
    name: 'tubbylist',
    aliases: ['tl'],
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
};

export default setupCommands;
