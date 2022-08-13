import { bold, CommandHandler, fmt, Module, updateMessage } from "$xor";
import { Api } from "$grm";

const I_PTO = "purge__purge_to";
const I_PFROM = "purge__purge_from";

const cleaner: Module = {
  name: "cleaner",
  handlers: [
    new CommandHandler("purge", async ({ event, client, args }) => {
      let purgeTo = Number(sessionStorage.getItem(I_PTO));
      const purgeFrom = Number(sessionStorage.getItem(I_PFROM));
      if (!purgeTo) {
        const reply = await event.message.getReplyMessage();
        if (!reply) {
          await updateMessage(
            event,
            "Reply a message to purge to or mark with pto (and pfrom).",
          );
          return;
        }
        purgeTo = reply.id;
      }
      sessionStorage.removeItem(I_PTO);
      sessionStorage.removeItem(I_PFROM);
      let messages = new Array<Api.Message>();
      const self = args[0]?.startsWith("s");
      const all = args[1] == "ALL" && self;
      for await (
        const message of client.iterMessages(event.chatId, {
          minId: all ? undefined : purgeTo - 1,
          maxId: all ? undefined : purgeFrom == 0 ? undefined : purgeFrom + 1,
          fromUser: args[0]?.startsWith("s") ? "me" : undefined,
        })
      ) {
        messages.push(message);
        if (messages.length == 100) {
          await client.deleteMessages(event.chat, messages, { revoke: true });
          messages = [];
        }
      }
      if (messages.length > 0) {
        await client.deleteMessages(event.chatId, messages, { revoke: true });
      }
    }),
    new CommandHandler("pfrom", async ({ event }) => {
      const reply = await event.message.getReplyMessage();
      if (!reply) {
        await updateMessage(
          event,
          "Reply a message to mark.",
        );
        return;
      }
      const purgeTo = Number(sessionStorage.getItem(I_PTO));
      if (purgeTo > reply.id) {
        await updateMessage(
          event,
          "Cannot purge from a message older than the purge to message.",
        );
        return;
      }
      sessionStorage.setItem(I_PFROM, String(reply.id));
      await updateMessage(event, "Marked.");
    }),
    new CommandHandler("pto", async ({ event }) => {
      const reply = await event.message.getReplyMessage();
      if (!reply) {
        await updateMessage(
          event,
          "Reply a message to mark.",
        );
        return;
      }
      const purgeFrom = Number(sessionStorage.getItem(I_PFROM));
      if (reply.id > purgeFrom) {
        await updateMessage(
          event,
          "Cannot purge to a message newer than the purge from message.",
        );
        return;
      }
      sessionStorage.setItem(I_PTO, String(reply.id));
      await updateMessage(event, "Marked.");
    }),
    new CommandHandler("del", async ({ event }) => {
      await event.message.delete();
      const reply = await event.message.getReplyMessage();
      if (reply) {
        await reply.delete();
      }
    }, { aliases: ["d"] }),
  ],
  help: fmt`${bold("Introduction")}

The cleaner module lets you delete large numbers of messages easily.

${bold("Commands")}

> purge (s (ALL))

Purges messages from the latest until the replied one, or as you mark with pto and/or pfrom. When the "s" flag is used, only messages sent by you will be deleted. You can also do "s ALL" to delete all of the messages sent by you.

> pfrom

Marks a message to purge from.

> pto

Marks a message to purge to.

> del, d

Deletes the replied message.`,
};

export default cleaner;
