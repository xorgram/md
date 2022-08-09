import {
  bold,
  CommandHandler,
  fmt,
  italic,
  Module,
  underline,
  updateMessage,
} from "$xor";

const API_URL = new URL("https://dsp.roj.im");

const sc: Module = {
  name: "sc",
  handlers: [
    new CommandHandler("sc", async ({ event, input, args }) => {
      if (!input || args.length != 0) {
        return;
      }
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const fs =
        `The spell checking server returned status ${response.status}.`;
      switch (response.status) {
        case 400:
          await updateMessage(
            event,
            `${fs} The input might be invalid or contain unsupported characters.`,
          );
          return;
        case 500:
          await updateMessage(
            event,
            `${fs} You might have exceeded the rate limits.`,
          );
          return;
        default:
          await updateMessage(event, fs);
          return;
        case 200:
          break;
      }
      const results: Array<[string, { correct: boolean; note?: string }]> =
        await response.json();
      const noMisspellings = results.every((v) => v[1].correct);
      if (noMisspellings) {
        await updateMessage(event, "No misspellings were found.");
        return;
      }
      const misspellings = results.filter((v) => !v[1].correct).length;
      await updateMessage(
        event,
        `${misspellings} misspelling${
          misspellings == 1 ? " was" : "s were"
        } found.`,
      );
      await event.message.reply(
        fmt([
          "",
          ...results.map(() => ""),
        ], ...results.map((v) => v[1].correct ? v[0] : underline(v[0]))).send,
      );
    }, { aliases: ["cs", "spell", "spellcheck"] }),
  ],
  help: fmt`${italic("SC - Spell Checker")}
  
  ${bold("Synopsis")}
  
  >sc
  
  ${bold("Aliases")}
  
  - cs
  - spellcheck
  
  ${bold("Description")}
  
  SC is a module with a single command that takes in text input and searches for misspellings in it. The input can be provided by using the input prefix, followed by "sc" or one of the aliases pointed above, and then replying to a message that has text. It can also be the lines after the command in the command message.
  
  - The input may only contain ASCII characters.
  - The spell checking is done using an open-source SaaS: dsp.roj.im.`,
};

export default sc;
