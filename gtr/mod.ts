import { CustomFile } from "$grm";
import { Buffer } from "$grm-deps";
import { bold, CommandHandler, fmt, Module, updateMessage } from "$xor";
import { GTR } from "https://deno.land/x/gtr@v0.0.1/mod.ts";

const i = new GTR();

const gtr: Module = {
  name: "gtr",
  handlers: [
    new CommandHandler(
      "t",
      async ({ event, args, input }) => {
        if (!input) {
          return;
        }
        const result = await i.translate(input, {
          targetLang: args[0],
          sourceLang: args[1],
        });
        await updateMessage(event, result.lang);
        await event.message.reply({ message: result.trans });
      },
    ),
    new CommandHandler(
      "s",
      async ({ event, args, input }) => {
        const targetLang = args[0];
        if (!input || !targetLang) {
          return;
        }
        const b = Buffer.from(
          await (await i.tts(input, { targetLang }))
            .arrayBuffer(),
        );
        const file = new CustomFile(
          "s.mp3",
          b.byteLength,
          "",
          b,
        );
        await event.message.reply({ file });
      },
    ),
    new CommandHandler(
      "d",
      async ({ event, input }) => {
        if (!input) {
          return;
        }
        const lang = await i.detect(input);
        await updateMessage(event, lang);
      },
    ),
  ],
  help: fmt`${bold("Introduction")}

Translate messages and convert text to speech.

${bold("Commands")}

- t (<target_lang>) (<source_lang>)

Takes the input as <source_lang> or detect it if not provided, and then translates it to <target_lang> or en if not provided.

- s <target_lang>

Converts the input in <target_lang> to speech.

- d

Detects the language of the input.`,
};

export default gtr;
