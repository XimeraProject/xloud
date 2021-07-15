import { jsx, VNode } from "snabbdom";

import logo from '../public/logo/logo.svg';

export default function Brand() : VNode {
  const brandStyle = { maxHeight: "1rem", opacity: "0.5", verticalAlign: "baseline"};
  
  return <img attrs={{src: logo}} style={brandStyle}/>;
}
