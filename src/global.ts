import { IsolateProcessesList } from "./interfaces.ts";

export const kv = await Deno.openKv();
export const processes: IsolateProcessesList = {};
