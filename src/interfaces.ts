export interface IsolateEntity {
  uuid: string;
  url: string;
  name: string;
  version: string;
}

export interface IsolateEntityList {
  [uuid: string]: IsolateEntity;
}

export interface IsolateProcessesList {
  [uuid: string]: {
    port: number;
    last_request_timestamp: number;
    process: Deno.ChildProcess;
  };
}
