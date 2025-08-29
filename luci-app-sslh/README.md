luci-app-sslh/
├── Makefile
├── root/
│   ├── etc/
│   │   ├── config/
│   │   │   └── sslh
│   │   └── uci-defaults/
│   │       └── 90-luci-sslh
│   ├── usr/
│       ├── lib/
│       │   └── lua/
│       │       └── luci/
│       │           └── controller/
│       │               └── sslh.lua
│       └── share/
│           ├── luci/
│           │   └── menu.d/
│           │       └── luci-app-sslh.json
│           └── rpcd/
│               └── acl.d/
│                   └── luci-app-sslh.json
└── htdocs/
    └── luci-static/
        └── resources/
            └── view/
                └── luci-app-sslh/
                    ├── config.js
                    └── log.js