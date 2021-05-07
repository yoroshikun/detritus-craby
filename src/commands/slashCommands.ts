import {Context} from 'detritus-client/lib/command';

interface Command {
  id: string;
}

const setup = async (context: Context, args: {commands: string}) => {
  try {
    const message = context.message;
    const cc = message?.client.commandClient;
    const posArgs: string[] = args['commands'].split(' ').filter(a => a);

    const commands = (await (
      await message.client.rest.raw.get({
        route: {
          path: '/applications/:applicationId/commands',
          params: {
            applicationId: message.client.userId,
          },
        },
      })
    ).json()) as Command[];

    console.log({
      message: `Retrieved global commands from ${message.client.userId}`,
      returned: commands,
    });

    if (commands) {
      for (const command of commands) {
        const response = await message.client.rest.raw.delete({
          route: {
            path: '/applications/:applicationId/commands/:commandId',
            params: {
              applicationId: message.client.userId,
              commandId: command.id,
            },
          },
        });

        console.log({
          message: `Deleted command ${command.id}`,
          returned: response,
        });
      }
    }

    const choices = [
      {name: 'List', value: 'list'},
      {name: 'Complete', value: 'complete'},
      {name: 'Request', value: 'request'},
    ];

    await message.client.rest.raw.post({
      body: {
        name: 'tubby',
        description: 'Tubby Manager',
        options: [
          {
            name: 'action',
            description: 'Action to complete',
            type: 3,
            required: true,
            choices: choices,
          },
        ],
      },
      route: {
        path: '/applications/:applicationId/commands',
        params: {
          applicationId: message.client.userId,
        },
      },
    });

    message.reply(`Inserted ${choices.length} commands into interations.`);
  } catch (e) {
    if (e.response) {
      console.error(JSON.parse(e.response.request.body.toString()));
    } else {
      console.log(e);
    }
  }
};

export default {setup};
