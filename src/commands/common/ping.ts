import type {Context} from 'detritus-client/lib/command';

/**
 * Simple ping reply command
 *
 * @param context Detritus Command context
 * @returns void
 */
const ping = (context: Context) => {
  context.reply(`${context.user.mention}: Pong!`);
};

export default ping;
