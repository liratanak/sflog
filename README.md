#SFLog

#Installation

	npm -g install sflog

#Usage

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

#Usage Example

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
  "logPrefix": "SFLog ",
  "pullingInterval": 5000
}
```

	sflog -c ./config.json --org devOrg

	sflog -c ./config.json --org sandbox001



