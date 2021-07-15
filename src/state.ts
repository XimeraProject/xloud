import { Component } from './tea';
import Route from 'route-parser';

export default interface State {
  owner?: string;
  repo?: string;
  texFilename?: string;
  
  branch?: string;
  loading?: string;
  source?: string;

  title?: string;    

  terminal?: string;

  dropdown?: boolean;
  flashDanger?: boolean;

  routeParams?: ReturnType<Route.match>;

  doenetToken?: string;

  score?: number;
  
  component?: Component;
}
