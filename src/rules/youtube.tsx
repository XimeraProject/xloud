import { jsx, VNode } from "snabbdom";
import { State, Dispatcher } from '../tea';

export default function(data : string, block : any,
                        _localState : any,
                        _update : (( value : any ) => void) ) : VNode {
  return <iframe attrs={{width: "100%", height: "100%",
                         frameborder: "0",
                         allowfullscreen: true,
                         src: `https://www.youtube.com/embed/${data}`}}/>
}
