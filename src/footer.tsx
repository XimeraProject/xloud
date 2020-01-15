import Snabbdom from 'snabbdom-pragma';
import Cmd from './cmd';

function Award( { id } ) {
  return <a href={`http://www.nsf.gov/awardsearch/showAward?AWD_ID=${id}`}>DUE-{id}</a>;
}

function Responsive( { long, short } ) {
  return <span><span className="d-none d-md-inline">{ long }</span><span className="d-inline d-md-none">{ short }</span></span>;
}

export function view( { state, dispatch } ) {
  return <footer className="footer mt-auto py-3 bg-dark text-white">
       <div className="container">
    <span className="text-muted">Built at <a href="http://www.osu.edu/"><Responsive long="The Ohio State University" short="OSU"/></a> with <a href="/about/support">support from</a>&nbsp;the <Responsive long="National Science Foundation" short="NSF"/> (<Award id="1245433"/>, <Award id="1915294"/>, <Award id="1915363"/>, <Award id="1915438"/>), <span className="d-none d-md-inline">the</span> <a href="/about/support"><Responsive long="Shuttleworth Foundation" short="Shuttleworth"/></a>, <Responsive long="the" short=""/> <a href="http://math.osu.edu/"><Responsive long="Department of Mathematics" short="Math Department"/></a>, and <Responsive long="the" short=""/> <a href="https://affordablelearning.osu.edu/"><Responsive long="Affordable Learning Exchange" short="ALX"/></a>.  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.</span>
       </div>
    </footer>;
}

export default view;
