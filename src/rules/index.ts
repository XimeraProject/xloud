import youtube from './youtube';
import answer from './answer';
import freeresponse from './freeresponse';
import multiplechoice from './multiplechoice';
import selectall from './selectall';
import checkwork from './checkwork';

let handlers = {
  youtube,
  answer,
  multiplechoice,
  selectall,  
  freeresponse,
  checkwork,
};

export default handlers;
