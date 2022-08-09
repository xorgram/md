import { CommandHandler, updateMessage } from "$xor";

const kv = (key: string, value: string) =>
  `<b>${key} :</b> <code>${value}</code>\n`;

export default {
  name: "github",
  handlers: [
    new CommandHandler(
      "github",
      async ({ client, event, args }) => {
        const user = args[0];
        if (!user) {
          await updateMessage(event, "Username wasn't provided");
          return;
        }
        event.message.delete({ revoke: true });
        const res = await fetch(`https://api.github.com/users/${user}`);
        if (res.status === 404 || !res.ok) {
          await updateMessage(event, "No user found with username - " + user);
        }
        const data = await res.json();
        await client.sendFile(event.chatId!, {
          file: data.avatar_url,
          caption: kv("Username", data.login) +
            kv("Name", data.name) +
            kv("Bio", data.bio) +
            kv("Location", data.location) +
            kv("Public Repos", data.public_repos) +
            kv("Followers", data.followers) +
            kv("Following", data.following),
          forceDocument: true,
          thumb: data.avatar_url,
          parseMode: "html",
        });
      },
    ),
  ],
  help: `
**Introduction**
 
Fetch GitHub user information
 
**Commands**
 
- github <username>`,
};
