import { Router } from "../../../deps.ts";
import { kv } from "../../global.ts";
import { IsolateEntity, IsolateEntityList } from "../../interfaces.ts";

export const isolatesRouter = new Router()
  .get("/", async (context) => {
    const list = kv.list<string>({ prefix: ["isolates"] });
    const isolates: IsolateEntityList = {};
    for await (const res of list) {
      isolates[res.key[1] as string] = res
        .value as unknown as IsolateEntity;
    }
    context.response.body = isolates;
  })
  .get("/:id", async (context) => {
    const res = await kv.get(["isolates", context.params.id]);
    context.response.body = {
      ...res.value as unknown as IsolateEntity,
    };
  })
  .post("/", async (context) => {
    const uuid = crypto.randomUUID();
    const body = await context.request.body().value;
    const result = await kv.set(["isolates", uuid], {
      uuid,
      ...body,
    });

    context.response.body = {
      uuid,
      ...result,
    };
  })
  .put("/:id", async (context) => {
    const uuid = context.params.id;
    const body = await context.request.body().value;
    const result = await kv.set(["isolates", uuid], {
      uuid,
      ...body,
    });

    context.response.body = {
      uuid,
      ...result,
    };
  })
  .delete("/:id", async (context) => {
    const uuid = context.params.id;
    await kv.delete(["isolates", uuid]);
    context.response.body = {
      uuid,
      "ok": true,
    };
  });
