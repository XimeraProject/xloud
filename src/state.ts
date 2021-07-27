import { Component } from './tea';
import Route from 'route-parser';
import { GithubRepository } from './github';
import { BackgroundProcess } from './background-process';

export default interface State {
  time ?: Date;
  
  routeNonce?: string;
  
  backgroundProcess ?: BackgroundProcess;
  
  repository ?: GithubRepository;
  
  texFilename?: string;
  viewingSource?: boolean;

  source?: string;

  title?: string;    

  terminal?: string;

  dropdown?: boolean;
  flashDanger?: boolean;

  routeParams?: ReturnType<Route.match>;

  doenetToken?: string;

  scores?: Map<string, number>;
  
  databases?: Map<string, any>;
  shadows?: Map<string, any>;
  saving?: Map<string, boolean>;
  //dvi?: Map<string, Buffer>;
  dvi ?: Buffer;

  component?: Component;

  hsize ?: number;
}

export function stateToPathname( state : State ) : string {
  if (state.repository && state.repository.owner && state.repository.name && state.texFilename)
    return `/${state.repository.owner}/${state.repository.name}/${state.texFilename}`;

  return '';
}

