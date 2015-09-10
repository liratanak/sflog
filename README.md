#sflog

##What ?

`sflog` want to have feature like tail log in apache/nginx/heroku as currently(2015-09-10) Force.com cli do not provide this feature yet.

##Installation

	npm -g install sflog

##Usage

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

##Usage Example

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



