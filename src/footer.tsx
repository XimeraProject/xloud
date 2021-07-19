import { jsx, VNode } from "snabbdom";
import { State, Dispatcher } from './tea';
import moment from 'moment';

function Award( { id } ): VNode {
  return <a attrs={{href: `http://www.nsf.gov/awardsearch/showAward?AWD_ID=${id}`}}>DUE-{id}</a>;
}

function Responsive( { long, short } ): VNode {
  return <span><span class={{"d-none":true, "d-md-inline":true}}>{ long }</span><span class={{"d-inline":true, "d-md-none":true}}>{ short }</span></span>;
}

export function view( { state, dispatch } : { state : State, dispatch : Dispatcher } ): VNode {
  let repositoryInformation : VNode[] = [];

  // FIXME: confirm that this matches what is being displayed
  if (state.details) {
    let branch = state.details.branch;
    console.log(branch);
    console.log(state.details);
    
    let sha = branch.commit.sha;
    let author = branch.commit.author;    
    let branchName = branch.name;
    let shortSha = sha.slice(0,7) + '…';

    let avatarStyle = {
      "max-width":"20pt",
      "max-height":"20pt",
      "width": "auto",
      "height": "auto"
    };

    let date = moment(branch.commit.commit.author.date);

    repositoryInformation.push(
        <div style={{"margin-bottom": "12pt"}} class={{"text-muted":true}}><Responsive long="You are viewing branch" short="Branch"/> <a
      attrs={{href:branch._links.html}}>{branchName}</a> <Responsive long="of the GitHub repository" short="of"/> <a
      attrs={{href:state.details.html_url}}>{state.details.name}</a> <Responsive long="last updated" short="updated"/> {date.fromNow()} <Responsive long="via commit" short="via"/> <a
      attrs={{href:branch.commit.html_url}}><code>{shortSha}</code></a> <Responsive long="by author" short="by"/> <a style={{display: "inline-block"}}
        attrs={{href:author.html_url}}>
        <img style={avatarStyle} attrs={{src:branch.commit.author.avatar_url}}/> {author.login}</a>.
        </div>
    );    
  }
  
  return <footer class={{"footer":true, "mt-auto":true, "py-3":true, "bg-dark":true, "text-white":true}}>
    <div class={{"container":true}}>
    { repositoryInformation }
    <div class={{"text-muted":true}}><Responsive long="The Ximera platform was built" short="Built"/> with <a attrs={{href: "/about/support"}}>support from</a>&nbsp;the <Responsive long="National Science Foundation" short="NSF"/> (<Award id="1245433"/>, <Award id="1915294"/>, <Award id="1915363"/>, <Award id="1915438"/>), <span class={{"d-none":true, "d-md-inline":true}}>the</span> <a attrs={{href: "/about/support"}}><Responsive long="Shuttleworth Foundation" short="Shuttleworth"/></a>, <Responsive long="the" short=""/> <a attrs={{href: "http://math.osu.edu/"}}><Responsive long="Department of Mathematics" short="Math Department"/></a>, and <Responsive long="the" short=""/> <a attrs={{href: "https://affordablelearning.osu.edu/"}}><Responsive long="Affordable Learning Exchange" short="ALX"/></a>.  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.</div>
       </div>
    </footer>;
}

export default view;
