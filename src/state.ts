import { Component } from './tea';
import Route from 'route-parser';

export default interface State {
  owner?: string;
  repo?: string;
  branch?: string;
  loading?: string;
  source?: string;  
  texFilename?: string;
  terminal?: string;

  dropdown?: boolean;
  flashDanger?: boolean;

  routeParams?: ReturnType<Route.match>;
  
  component?: Component;
}
