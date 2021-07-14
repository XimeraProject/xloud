import { jsx, VNode } from "snabbdom";
import { icon, library, findIconDefinition, 
         Icon, IconDefinition, IconLookup, IconName } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

export default function Icon( { fa } : { fa : string } ) : VNode {
  const lookup : IconLookup = {
    prefix: 'fas',
    iconName: fa as IconName
  };
  
  const definition : IconDefinition = findIconDefinition(lookup);

  const i : Icon = icon(definition);

  return <i props={{innerHTML: i.html[0]}}></i>;
}
