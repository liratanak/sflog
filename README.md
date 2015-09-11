# sflog
tail log for Force.com 


### What ?

`sflog` want to have feature like tail log in `apache`/`nginx`/`heroku` as currently(2015-09-10) Force.com CLI do not provide this feature yet.

Sample Output

    ➜  SomeMavensMateProject  sflog --mm | grep -E "sflog|USER|ERROR"
    sflog: info: Authenticating ...
    sflog: info: Authenticated as user@domain.com
    sflog: info: Pulling log every 5000ms ...
    sflog: info: got 1 new log
    sflog: info: id:  ["07L28000008eDCuEAM"]
    05:02:23.029 (29105519)|USER_DEBUG|[6]|DEBUG|Spd: startAction ApexPages.currentPage().getParameters()
    05:02:23.029 (29316609)|USER_DEBUG|[7]|DEBUG|{hello=world}
    
    sflog: info: got 1 new log
    sflog: info: id:  ["07L28000008eDDEEA2"]
    05:02:39.026 (26921190)|USER_DEBUG|[6]|DEBUG|Spd: startAction ApexPages.currentPage().getParameters()
    05:02:39.027 (27146967)|USER_DEBUG|[7]|DEBUG|{hello=speeder}

### Installation

	npm -g install sflog

### Usage

just add `Monitored User` as normal
     Setup => Logs => Debug Logs => Monitored Users => New 

    Usage: sflog [options]
    
    Options:
    
      -h, --help                        output usage information
      -V, --version                     output the version number
      -c, --config [path]               Custom config file
      -o, --org [org]                   Pro/Dev/Sandbox Org
      -u, --username [username]         Username
      -p, --password [password]         Password concat with token
      -i, --instance-url [instanceUrl]  jsforce's instanceUrl see: https://jsforce.github.io/document/#access-token
      -a, --access-token [accessToken]  jsforce's accessToken see: https://jsforce.github.io/document/#access-token
      -m, --mm [path]                   Using MaventsMate session file
      --pulling-interval [interval]     Pulling interval in milliseconds should >= 1000
      --silly                           Set log level to silly
      --verbose                         Set log level to verbose
      --silent                          Set log level to silent

### Usage Example

config.json
```json
{
  "devOrg": {
    "username": "dev001@dev-org.com",
    "password": "passwordWithToken"
  },
  "sandbox001": {
    "instanceUrl": "https://ap2.salesforce.com",
    "accessToken": "somevalidsessionid"
  },
  "pullingInterval": 5000
}
```

	sflog -c ./config.json --org devOrg

	sflog -c ./config.json --org sandbox001

If current directory is a MavensMate project ( `./config/.session` )

	sflog --mm



