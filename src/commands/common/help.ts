import type {Context} from 'detritus-client/lib/command';

/**
 * Parse and return specific help for commands
 *
 * @param command string | undefined Command to check
 * @returns string
 */
const helpCommand = (command: string | undefined) => {
  switch (command) {
    case 'jisho':
      return 'Search for a specified word or phrase \n\n**Usage** !jisho <word> \n**Example** !jisho hello \n**Alias**: j, J';
    case 'xe':
      return 'Check current exchange rates \n\n**Usage** !xe <from> <to> <amount> \n**Example** !xe AUD JPY 800 \n**Alias**: xe \n**Set Default** !exdefault AUD \n**Shorthand (uses default)** !xe or !xe <from> \n to currency is always JPY';
    case 'tubby':
      return 'Organize Genshin Tubby requests \n\n**Usage** !tubby <request | complete | list>? <user>?\n**Alias**: t, tl, tr, tc';
    case 'waifu':
      return 'Generate a waifu with AI \n\n**Usage** !waifu \n**Alias**: w, uwu';
    case undefined:
    default:
      return 'List of available commands \n**jisho**: Search Jisho for a word or phrase \n**xe**: Check current exchange rates \n **tubby**: Organize Genshin Tubby requests \n**waifu**: Generate a waifu with AI';
  }
};

/**
 * Command for handling help
 *
 * @param context Detritus Command context
 * @param args Detritus Arguments
 * @returns void
 */
const handler = (context: Context, args: {help: string}) => {
  const posArguments = args.help.split(' ');
  const response = helpCommand(posArguments[0]);

  context.reply({
    embed: {
      title: 'Help',
      color: 16074050, // hex F54542
      description: response,
    },
  });
};

export default {handler};
