export class NavigationMessage {
  type: "navigate-to" = "navigate-to";
  constructor(public path : string) {};
}

export class ResizeMessage {
  type: "window-resize" = "window-resize";
  constructor(public width : number, public height : number ) {};
}

export class ViewSourceMessage {
  type: "view-source" = "view-source";
  constructor(public url : string, public source : string ) {};
}

export class SetRepositoryDetailsMessage {
  type: "set-repository-details" = "set-repository-details";
  constructor(public owner : string, public repo : string, public details : any ) {};
}

export class DoenetDisconnectMessage {
  type: "doenet-disconnect" = "doenet-disconnect";
  constructor() {};
}

export class SetDoenetTokenMessage {
  type: "set-doenet-token" = "set-doenet-token";
  constructor(public token : string ) {};
}

export class ErrorMessage {
  type: "error" = "error";
  constructor(public error : string ) {};
}

export type Message =
  NavigationMessage |
  ResizeMessage |
  ViewSourceMessage |
  SetRepositoryDetailsMessage |
  DoenetDisconnectMessage |
  SetDoenetTokenMessage | 
  ErrorMessage;


