import { Api } from "$grm";
import { CommandHandler, updateMessage } from "$xor";

export default {
  name: "paste",
  handlers: [
    new CommandHandler(
      "paste",
      async ({ client, event }) => {
        const reply = await event.message.getReplyMessage();
        const media = reply?.media;
        if (!reply || (!media && !reply?.message)) {
          await updateMessage(event, "Reply to a text message or a text file.");
          return;
        }

        let content: string;

        if (
          media instanceof Api.MessageMediaDocument &&
          media.document instanceof Api.Document &&
          (["video/mpeg", "video/mp2t"].includes(media.document.mimeType) ||
            media.document.mimeType.startsWith("text/") ||
            media.document.mimeType.startsWith("application/")) &&
          media.document.size.lt(65537)
        ) {
          const result = await client.downloadMedia(media);
          if (!result) {
            await updateMessage(event, "Failed to download the text file.");
            return;
          }
          content = typeof result === "string" ? result : result.toString();
        } else {
          if (reply?.message) {
            content = reply.message;
          } else {
            await updateMessage(event, "Invalid data");
            return;
          }
        }

        const response = await fetch("https://nekobin.com/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content }),
        });

        const data = await response.json();
        if (!data.ok) {
          await client.sendMessage(event.chatId!, {
            replyTo: event.message.id,
            message: `Error: ${data.error}`,
            linkPreview: false,
          });
          return;
        }

        await client.sendMessage(event.chatId!, {
          replyTo: reply.id,
          message: `https://nekobin.com/${data.result.key}`,
          linkPreview: false,
        });
      },
    ),
  ],
  help: `
**Introduction**

Paste messages and text files to nekobin.com.

**Commands**

- paste`,
};
