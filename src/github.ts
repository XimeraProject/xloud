import { State, Message, Dispatcher } from './tea';
import { SetRepositoryDetailsMessage, ErrorMessage } from './message';

export function updateRepositoryDetails(message: Message, state: State, _dispatch: Dispatcher) : State {
  if (message.type === 'set-repository-details') {
    let details = message.details;
    if (details.full_name === `${state.owner}/${state.repo}`) {
      return {...state,
              branch: details.default_branch as string,
              details: details
             };
    }
  }
  
  return state;
}

export function requestRepositoryDetails(owner : string, repo : string, dispatch : Dispatcher) : void {
  let url = `/github/${owner}/${repo}.json`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        dispatch( new ErrorMessage(response.statusText) );
      } 
      return response.json();
    })
    .then(data =>
      dispatch( new SetRepositoryDetailsMessage(owner, repo, data) ) )
    .catch((error) => {
      dispatch( new ErrorMessage(error.toString()) );
    });  

  return;
}
