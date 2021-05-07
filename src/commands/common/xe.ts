import type {Context} from 'detritus-client/lib/command';
import {readFile, writeFile} from 'fs/promises';
import fetch from 'node-fetch';

export interface XEFile {
  lastUpdated: number;
  users: XEUser[];
}

export interface XEUser {
  id: number;
  default: string;
}

export const CONFIG_FILE_PATH = './user/xe.json';

const CURRENCY_CODES = [
  'USD',
  'EUR',
  'JPY',
  'BGN',
  'BTC',
  'CZK',
  'DKK',
  'GBP',
  'HUF',
  'PLN',
  'RON',
  'SEK',
  'CHF',
  'ISK',
  'NOK',
  'RUB',
  'TRY',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'HKD',
  'IDR',
  'ILS',
  'INR',
  'KRW',
  'MXN',
  'MYR',
  'NZD',
  'PHP',
  'SGD',
  'THB',
  'ZAR',
];

/**
 * Default JSON string file for ensuring
 */
export const defaultJSON = JSON.stringify({
  lastUpdated: new Date().getTime(),
  users: [],
} as XEFile);

/**
 * Simple helper for reading the config
 */
const readConfig = async () =>
  JSON.parse(await (await readFile(CONFIG_FILE_PATH)).toString()) as XEFile;

/**
 * Simple helper for saving the modified config (overwrites)
 *
 * @param content TubbyFile to update the config with
 */
const saveConfig = async (content: XEFile) =>
  await writeFile(CONFIG_FILE_PATH, JSON.stringify(content));

/**
 * Fetcger helper for getting exchange rates
 *
 * @param content TubbyFile to update the config with
 */
const getExchangeRate = async (base: string, to: string) => {
  const token = process.env.CURR_CONV_TOKEN;
  const response = await fetch(
    `https://free.currconv.com/api/v7/convert?q=${base}_${to}&compact=ultra&apiKey=${token}`
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json())[`${base}_${to}`] as number;
};

/**
 * XE handler, handles command parsing
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */
const xeHandler = async (context: Context, args: {xe: string}) => {
  try {
    const posArguments = args.xe.split(' ');
    const remainingArgs = posArguments.slice(1).join(' ');

    switch (posArguments[0]) {
      case 'default': {
        await xeDefault(context, {xedefault: remainingArgs});
        break;
      }
      default: {
        await xe(context, {xe: args.xe});
      }
    }
  } catch (err) {
    context.reply({
      embed: {
        title: 'Exchange Rate',
        color: 16074050, // hex F54542
        description: err.message,
      },
    });
  }
};

/**
 * XE handler, handles getting currency conversion
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */
const xe = async (context: Context, args: {xe: string}) => {
  try {
    const posArguments = args.xe.split(' ').filter(arg => arg);
    const config = await readConfig();

    switch (posArguments.length) {
      case 3: {
        const base = posArguments[0].toUpperCase();
        const to = posArguments[1].toUpperCase();
        const amount = Number(posArguments[2]);

        if (base === to) {
          throw new Error(
            'Invalid Input, <base> and <to> currencies cannot be the same'
          );
        }

        if (!CURRENCY_CODES.includes(base) || !CURRENCY_CODES.includes(to)) {
          throw new Error(
            'Invalid input (currency code), Example !xe AUD JPY <amount>'
          );
        }

        const rate = await getExchangeRate(base, to);

        context.reply({
          embed: {
            title: 'Exchange Rate',
            color: 16095298, // hex F59842
            description: `${amount} ${base} --> ${to}: **${(
              rate * amount
            ).toFixed(4)}**`,
          },
        });

        break;
      }
      case 2: {
        const base = posArguments[0].toUpperCase();
        const to = posArguments[1].toUpperCase();

        if (base === to) {
          throw new Error(
            'Invalid Input, <base> and <to> currencies cannot be the same'
          );
        }

        if (!CURRENCY_CODES.includes(base) || !CURRENCY_CODES.includes(to)) {
          throw new Error(
            'Invalid input (currency code), Example !xe AUD JPY <amount>'
          );
        }

        const rate = await getExchangeRate(base, to);

        context.reply({
          embed: {
            title: 'Exchange Rate',
            color: 16095298, // hex F59842
            description: `${base} --> ${to}: **${rate.toFixed(4)}**`,
          },
        });

        break;
      }
      case 1: {
        const amount = Number(posArguments[0]);
        const base =
          config.users.find(user => user.id === Number(context.userId))
            ?.default ?? 'JPY';
        const to = 'JPY';

        if (base === to) {
          throw new Error(
            'Invalid Input, <base> and <to> currency cannot be the same'
          );
        }
        const rate = await getExchangeRate(base, to);

        context.reply({
          embed: {
            title: 'Exchange Rate',
            color: 16095298, // hex F59842
            description: `${amount} ${base} --> ${to}: **${(
              rate * amount
            ).toFixed(4)}**`,
          },
        });

        break;
      }
      case 0: {
        const base =
          config.users.find(user => user.id === Number(context.userId))
            ?.default ?? 'JPY';
        const to = 'JPY';

        if (base === to) {
          throw new Error(
            'Invalid Input, <base> and <to> currency cannot be the same'
          );
        }
        const rate = await getExchangeRate(base, to);

        context.reply({
          embed: {
            title: 'Exchange Rate',
            color: 16095298, // hex F59842
            description: `${base} --> ${to}: **${rate.toFixed(4)}**`,
          },
        });

        break;
      }
    }
  } catch (err) {
    context.reply({
      embed: {
        title: 'Exchange Rate',
        color: 16074050, // hex F54542
        description: err.message,
      },
    });
  }
};

/**
 * XE Default handler, handles setting and updating default
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */

const xeDefault = async (context: Context, args: {xedefault: string}) => {
  try {
    const posArguments = args.xedefault.split(' ');
    const config = await readConfig();
    const userIndex = config.users.findIndex(
      user => user.id === Number(context.user.id)
    );

    if (posArguments[0].toLowerCase() === 'remove') {
      if (userIndex) {
        throw new Error('No user to remove default from');
      }

      config.users.splice(userIndex, 1);

      await saveConfig(config);

      context.reply({
        embed: {
          title: 'Exchange Rate Default',
          color: 16095298, // hex F59842
          description: 'Your default exchange rate has been removed',
        },
      });

      return;
    }

    if (!CURRENCY_CODES.includes(posArguments[0].toUpperCase())) {
      throw new Error('Invalid input (currency code), Example !xedefault AUD');
    }

    if (userIndex !== -1) {
      config.users[userIndex].default = posArguments[0].toUpperCase();
    } else {
      config.users.push({
        id: Number(context.userId),
        default: posArguments[0].toUpperCase(),
      });
    }

    await saveConfig(config);

    context.reply({
      embed: {
        title: 'Exchange Rate Default',
        color: 16095298, // hex F59842
        description: 'Your default exchange rate has been updated',
      },
    });
  } catch (err) {
    context.reply({
      embed: {
        title: 'Exchange Rate Default',
        color: 16074050, // hex F54542
        description: err.message,
      },
    });
    return;
  }
};

export default {xeHandler, xe, xeDefault};
