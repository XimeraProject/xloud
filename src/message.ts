import { GithubRepository } from './github';

export class NavigationMessage {
  type: "navigate-to" = "navigate-to";
  constructor(public path : string) {};
}

export class SetDviMessage {
  type: "set-dvi" = "set-dvi";
  constructor(public dvi : Buffer, public hsize : number ) {};  
}

export class ResizeMessage {
  type: "window-resize" = "window-resize";
  constructor(public width : number, public height : number ) {};
}

export class UpdateTimeMessage {
  type: "update-time" = "update-time";
  constructor() {};
}

export class ViewSourceMessage {
  type: "view-source" = "view-source";
  constructor(public url : string, public source : string ) {};
}

export class TerminalLogMessage {
  type: "terminal-log" = "terminal-log";
  constructor(public text : string) {};
}

export class SetRepositoryMessage {
  type: "set-repository" = "set-repository";
  constructor(public repository : GithubRepository ) {};
}

export class DoenetDisconnectMessage {
  type: "doenet-disconnect" = "doenet-disconnect";
  constructor() {};
}

export class SetDoenetTokenMessage {
  type: "set-doenet-token" = "set-doenet-token";
  constructor(public token : string ) {};
}

export class SetDoenetScoreMessage {
  type: "set-doenet-score" = "set-doenet-score";
  constructor(public score : number, public pathname : string ) {};
}

export class SetDoenetDatabaseMessage {
  type: "set-doenet-database" = "set-doenet-database";
  constructor(public db : any, public pathname : string ) {};
}

export class PatchDoenetDatabaseMessage {
  type: "patch-doenet-database" = "patch-doenet-database";
  constructor(public pathname : string, public key : string, public value : any ) {};
}

export class SetDoenetShadowMessage {
  type: "set-doenet-shadow" = "set-doenet-shadow";
  constructor(public db : any, public pathname : string ) {};
}

export class DoenetSavingMessage {
  type: "doenet-saving" = "doenet-saving";
  constructor(public pathname : string ) {};
}

export class WrappedMessage {
  type: "wrapped-message" = "wrapped-message";
  constructor(public message : Message, public nonce : string ) {};
}

export class ErrorMessage {
  type: "error" = "error";
  constructor(public error : string ) {};
}

export type Message =
  NavigationMessage |
  SetDviMessage |
  UpdateTimeMessage |
  ResizeMessage |
  ViewSourceMessage |
  TerminalLogMessage |  
  SetRepositoryMessage |
  DoenetDisconnectMessage |
  SetDoenetTokenMessage |
  SetDoenetScoreMessage |
  PatchDoenetDatabaseMessage |  
  SetDoenetDatabaseMessage |
  SetDoenetShadowMessage |
  DoenetSavingMessage |
  WrappedMessage |
  ErrorMessage;


