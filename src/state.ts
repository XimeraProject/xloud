import { Component } from './tea';
import Route from 'route-parser';

export default interface State {
  owner?: string;
  repo?: string;
  texFilename?: string;
  viewingSource?: boolean;
  
  branch?: string;
  loading?: string | boolean;
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
  dvi?: Map<string, Buffer>;

  component?: Component;
}

export function stateToPathname( state : State ) : string {
  if (state.owner && state.repo && state.texFilename)
    return `/${state.owner}/${state.repo}/${state.texFilename}`;

  return '';
}

