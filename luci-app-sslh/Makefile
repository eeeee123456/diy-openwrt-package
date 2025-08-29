include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for sslh
LUCI_DEPENDS:=+sslh
LUCI_PKGARCH:=all
PKG_NAME:=luci-app-sslh

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(INSTALL_DATA) ./root/usr/lib/lua/luci/controller/sslh.lua $(1)/usr/lib/lua/luci/controller/

	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/view
	# No view files for modern JS app

	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/luci-app-sslh
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/luci-app-sslh/*.js $(1)/www/luci-static/resources/view/luci-app-sslh/

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./root/etc/config/sslh $(1)/etc/config/

	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_DATA) ./root/etc/uci-defaults/90-luci-sslh $(1)/etc/uci-defaults/

	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-sslh.json $(1)/usr/share/luci/menu.d/

	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-sslh.json $(1)/usr/share/rpcd/acl.d/

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./root/etc/init.d/sslh $(1)/etc/init.d/
endef

# call BuildPackage - OpenWrt buildroot signature