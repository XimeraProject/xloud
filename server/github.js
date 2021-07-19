import https from 'https';
import redis from 'redis';

const client = redis.createClient();

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
});

export async function findRepository(req, res, next) {
  let key = `repo:${req.params.owner}/${req.params.repo}`;

  client.get( key, async function(err, repoData) {
    if (repoData) {
      req.repository = JSON.parse(repoData);
    } else if (err || (repoData === null)) {
      try {
        let repo = await octokit.repos.get({
          owner: req.params.owner,
          repo: req.params.repo,
        });

        if (repo.data) {
          let branch = await octokit.rest.repos.getBranch({
            owner: req.params.owner,
            repo: req.params.repo,
            branch: repo.data.default_branch
          });

          let result = {...repo.data,
                        branch: branch.data};
          client.setex( key, 300, JSON.stringify(result) );
          req.repository = result;
        }
      } catch (e) {
        // ignore the fact that we can't get the repo, but don't check again for a little while
        client.setex( key, 300, JSON.stringify(null) );
      }
    }

    next();
  });
}

export async function getRepository(req, res, next) {
  if (req.repository) 
    res.json( req.repository );
  else
    res.sendStatus( 404 );
}

export async function get(req, res, next) {
  if (req.repository) {
    const path = `${req.repository.full_name}/${req.repository.default_branch}/${req.params.path}`;
  
    let options = {
      host: 'raw.githubusercontent.com',
      port: 443,
      path,
      headers: {
        'Authorization': 'Basic ' + process.env.GITHUB_ACCESS_TOKEN
      }   
    };
  
    const request = https.get(options, function(response) {
      const contentType = response.headers['content-type'];

      if (response.statusCode === 200) {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=600');
        response.pipe(res);
      } else {
        res.sendStatus(response.statusCode);
      }
    });

    request.on('error', function(e){
      res.sendStatus(500);
    });
  } else {
    res.sendStatus(404);    
  }
}
