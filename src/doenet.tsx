import { jsx } from "snabbdom";
import { login, getAccessToken } from "@doenet/cloud";

// FIXME: fetch ?error=access_denied and set a flash message

let token = undefined;

/*
try {
  token = getAccessToken();
  console.log('token=',token);
} catch (e) {
  console.log(e);
}*/

export function view( {  } ) {
  if (token) {
    return <p>You are logged in!</p>;
  }

  return <button on={{click: () => login()}}>Log in</button>;
}

export default view;
