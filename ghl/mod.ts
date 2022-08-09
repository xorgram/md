import { Api } from "$grm";
import { MessageHandler, Module } from "$xor";
import { shortenURL } from "https://deno.land/x/ghl@1.0.0/mod.ts";

import { _fileToMedia } from "https://deno.land/x/grm@v0.3.0/src/client/utils.ts";
const ghl: Module = {
  name: "ghl",
  handlers: [
    new MessageHandler(async ({ event }) => {
      const { entities } = event.message;
      if (!entities) {
        return;
      }
      const urls: [
        string,
        string,
        number,
        number,
      ][] = entities.map((v, i) => [v, i] as [Api.TypeMessageEntity, number])
        .filter(([v]) => v instanceof Api.MessageEntityUrl)
        .map(([v, i]) =>
          [event.message.text.slice(v.offset, v.offset + v.length), v, i] as [
            string,
            Api.MessageEntityUrl,
            number,
          ]
        ).map(([s, e, i]) => {
          let shortened = "";
          let url: URL;
          try {
            url = new URL(s);
          } catch (_err) {
            url = new URL(`https://${s}`);
          }
          url.protocol = "https:";
          try {
            if (url.hostname == "github.com" && url.pathname != "/") {
              shortened = shortenURL(url.href)!.replace("<code>", "").replace(
                "</code>",
                "",
              );
            }
          } catch (_err) {
            //
          } finally {
            //
          }
          return [
            s,
            shortened,
            e.offset,
            i,
          ] as [
            string,
            string,
            number,
            number,
          ];
        }).filter((v) => v[1]);
      if (urls.length == 0) {
        return;
      }
      let text = event.message.text;
      const formattingEntities = new Array<Api.TypeMessageEntity>();
      for (const [url, shortened] of urls) {
        text = text.replace(url, shortened);
      }
      for (const [k, [url, shortened, offset]] of Object.entries(urls)) {
        const i = Number(k);
        formattingEntities.push(
          new Api.MessageEntityTextUrl({
            offset: offset == 0 || i == 0
              ? offset
              : offset - urls.slice(0, i).map(([url, shortened]) =>
                url.length - shortened.length
              ).reduce((a, b) => a + b, 0),
            length: shortened.length,
            url,
          }),
        );
        formattingEntities.push;
      }
      const otherEntities = entities.filter((v) =>
        !(v instanceof Api.MessageEntityUrl)
      );
      await event.message.edit({
        text,
        formattingEntities: [
          ...otherEntities.map((e) => {
            e.offset = e.offset == 0 ? e.offset : e.offset -
              urls.filter(([, , , i]) => i < entities.indexOf(e)).map((
                [url, shortened],
              ) => url.length - shortened.length).reduce((a, b) => a + b, 0);
            return e;
          }),
          ...formattingEntities,
        ],
        linkPreview: false,
      });
    }),
  ],
};

export default ghl;
