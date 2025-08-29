module("luci.controller.sslh", package.seeall)

function index()
    -- Define the parent node
    entry({"admin", "services", "sslh"}, firstchild(), _("SSLH"), 80).dependent = true
    
    -- Define the 'Config' child page
    entry({"admin", "services", "sslh", "config"}, view("luci-app-sslh/config"), _("Config"), 1)
    
    -- Define the 'Log' child page
    entry({"admin", "services", "sslh", "log"}, view("luci-app-sslh/log"), _("Log"), 2)
end