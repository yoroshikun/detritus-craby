import type {Context} from 'detritus-client/lib/command';
import {readFile, writeFile} from 'fs/promises';

export interface TubbyFile {
  lastUpdated: number;
  users: TubbyUser[];
}

export interface TubbyUser {
  name: string;
  timeout: number;
  completed: boolean;
}

export const CONFIG_FILE_PATH = './user/xe.json';

/**
 * Default JSON string file for ensuring
 */
export const defaultJSON = JSON.stringify({
  lastUpdated: new Date().getTime(),
  users: [],
} as TubbyFile);

/**
 * Simple helper for reading the config
 */
const readConfig = async () =>
  JSON.parse(await (await readFile(CONFIG_FILE_PATH)).toString()) as TubbyFile;

/**
 * Simple helper for saving the modified config (overwrites)
 *
 * @param content TubbyFile to update the config with
 */
const saveConfig = async (content: TubbyFile) =>
  await writeFile(CONFIG_FILE_PATH, JSON.stringify(content));

/**
 * Checks and prunes config if required, returns new config
 *
 * @param current The current TubbyFile
 * @returns TubbyFile
 */
const pruneConfig = async (current: TubbyFile) => {
  const prunedUsers = current.users.filter(
    user => user.timeout >= new Date().getTime()
  );

  if (prunedUsers.length !== current.users.length) {
    const newConfig = {...current, users: prunedUsers} as TubbyFile;
    await saveConfig(newConfig);
    return newConfig;
  }

  return current;
};

/**
 * Tubby List handler, handles listing of all requests
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */
const tubbyList = async (context: Context) => {
  try {
    const config = await pruneConfig(await readConfig());

    if (config.users && config.users.length <= 0) {
      throw new Error('no_users');
    }

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16095298, // hex F59842
        description: `**Requests** \n ${config.users
          .map(
            user =>
              `${user.name} -> Remaining ${(
                (user.timeout - new Date().getTime()) /
                60 /
                60 /
                1000
              ).toFixed(2)}h`
          )
          .join('\n')}`,
      },
    });
    return;
  } catch (err) {
    if (err.message === 'no_users') {
      context.reply({
        embed: {
          title: 'Tubby Manager',
          color: 16074050, // hex F54542
          description: 'No Users with requests',
        },
      });

      return;
    }

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16074050, // hex F54542
        description: 'Something went wrong when trying to list requests',
      },
    });
    return;
  }
};

/**
 * Tubby Request handler, handles requesting tubby construction speed ups
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */
const tubbyRequest = async (context: Context, args: {tubbyrequest: string}) => {
  try {
    const posArguments = args.tubbyrequest.split(' ').map(arg => Number(arg));
    const config = await pruneConfig(await readConfig());
    const username = context.user.username;
    const offset = posArguments[0]
      ? posArguments[0] * (1000 * 60 * 60)
      : 12 * (1000 * 60 * 60);

    if (config.users.findIndex(user => user.name === username) !== -1) {
      throw new Error('already_requested');
    }

    const updatedConfig = {
      ...config,
      users: [
        ...config.users,
        {
          name: username,
          timeout: new Date().getTime() + offset,
          completed: false,
        } as TubbyUser,
      ],
    };

    await saveConfig(updatedConfig);

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16095298, // hex F59842
        description: `A new request was made for ${username}`,
      },
    });
    return;
  } catch (err) {
    if (err.message === 'already_requested') {
      context.reply({
        embed: {
          title: 'Tubby Manager',
          color: 16074050, // hex F54542
          description:
            'You cannot make another request until your previous request is completed',
        },
      });

      return;
    }

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16074050, // hex F54542
        description: 'Something went wrong when trying to make a request',
      },
    });
    return;
  }
};

/**
 * Tubby Complete handler, handles completing of a request
 *
 * @param context Detritus Command context
 * @param args Extra line arguments
 * @returns void
 */
const tubbyComplete = async (
  context: Context,
  args: {tubbycomplete: string}
) => {
  try {
    const posArguments = args.tubbycomplete
      .split(' ')
      .map(arg => arg.toLowerCase());
    const config = await pruneConfig(await readConfig());
    const username = posArguments[0] && posArguments[0];

    const removeUserIndex = username
      ? config.users.findIndex(user => user.name.toLowerCase() === username)
      : -1;

    if (removeUserIndex) {
      throw new Error('no_user');
    }

    // Mutates the current and removes the user
    config.users.splice(removeUserIndex, 1);

    await saveConfig(config);

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16095298, // hex F59842
        description: `The request for ${username} has been completed successfully`,
      },
    });
    return;
  } catch (err) {
    if (err.message === 'no_user') {
      context.reply({
        embed: {
          title: 'Tubby Manager',
          color: 16074050, // hex F54542
          description: 'The user does not exist to complete',
        },
      });

      return;
    }

    context.reply({
      embed: {
        title: 'Tubby Manager',
        color: 16074050, // hex F54542
        description: 'Something went wrong when trying to complete a request',
      },
    });
    return;
  }
};

// TODO tubby crafts

export default {tubbyList, tubbyRequest, tubbyComplete};
