import { jsx, VNode } from "snabbdom";
import { State, Dispatcher } from '../tea';

export default function(data : string, block : any,
                        options : any, _children : VNode[]) : VNode
{
  return <iframe style={{...options.style}} attrs={{width: "100%", height: "100%",
                                                 frameborder: "0",
                                                 allowfullscreen: true,
                                                 src: `https://www.youtube.com/embed/${data}`}}/>
}
