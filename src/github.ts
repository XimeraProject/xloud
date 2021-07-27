import { State, Message, Dispatcher } from './tea';
import { SetRepositoryMessage, ErrorMessage } from './message';

export interface GithubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface GithubMinimalUser {
  name: string;
  email: string;
  date : Date;
}

export interface GithubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: GithubMinimalUser;
    committer: GithubMinimalUser;
    message: string;
    tree: {
      sha: string,
      url: string
    },
    url: string,
    comment_count: number,
    verification: {
      verified: boolean,
      reason: string
    }
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GithubUser;
  committer: GithubUser;
}

export interface GithubBranch {
  name: string;
  commit : GithubCommit;
  _links: {
    self: string;
    html: string;
  };
  protected: boolean;
  protection: {
    enabled: boolean;
  };
  protection_url: string;
}

export class GithubRepository {
  owner : GithubUser;
  branch : GithubBranch;
  name : string;
  details : any;
  sha : string;
  
  constructor( details : { html_url : string, name : string, owner : GithubUser, branch : GithubBranch } ) {
    this.details = details;
    this.name = details.name;
    this.branch = details.branch;
    this.owner = details.owner;
    this.sha = this.branch.commit.sha;
  }

  htmlUrl() : string {
    return this.details.html_url;
  }

  blobLink( filename : string ) : string {
    return `https://github.com/${this.owner.login}/${this.name}/blob/${this.branch.name}/${filename}`;
  }

  editLink( filename : string ) : string {
    return `https://github.com/${this.owner.login}/${this.name}/edit/${this.branch.name}/${filename}`;
  }  
  
  issueLink( filename : string, title : string ) : string {
    const directLink = this.blobLink( filename );
    return `https://github.com/${this.owner.login}/${this.name}/issues/new?title=${title}&body=%0A%0ASee%20[${filename}](${directLink})`;
  } 
  
  url( filename : string ) : string {
    const url = `/github/${this.owner.login}/${this.name}/${this.sha}/${filename}`;
    return url;
  }
}

export function updateRepository(message: Message, state: State, _dispatch: Dispatcher) : State {
  if (message.type === 'set-repository') {
    return {...state,
            repository: message.repository
           };
  }
  
  return state;
}

export async function requestRepository(owner : string, repo : string, dispatch : Dispatcher) : Promise<GithubRepository | undefined> {
  let url = `/github/${owner}/${repo}.json`;

  try {
    let response = await fetch(url);
    if (!(response.ok)) {
      dispatch( new ErrorMessage(response.statusText) );
      return;
    }

    let json = await response.json();

    let result = new GithubRepository(json);
    dispatch( new SetRepositoryMessage(result) );
    return result;
  } catch (error) {
    dispatch( new ErrorMessage(error.toString()) );    
  }

  return undefined;
}
