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

export class ErrorMessage {
  type: "error" = "error";
  constructor(public error : string ) {};
}

export type Message =
  NavigationMessage |
  ResizeMessage |
  ViewSourceMessage |
  ErrorMessage;


