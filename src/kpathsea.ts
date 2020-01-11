import * as path from 'path';
import Kpathsea from '@ximeraproject/kpathsea';
import pako from 'pako';

interface Kpathsea {
  findMatch(string) : Promise<string|undefined>;
}

let kpathsea : Kpathsea | undefined = undefined;

export default async function findMatch( partialPath : string ) : Promise<string|undefined> {
  if (kpathsea === undefined) {
    const response = await fetch('/ls-R.json.gz');
    const body = await response.arrayBuffer();    
    const result = JSON.parse(pako.inflate(body, { to: 'string' }));
    kpathsea = new Kpathsea({ db: result });
  }

  if (kpathsea)
    return kpathsea.findMatch( partialPath );
  else
    return undefined;
}
