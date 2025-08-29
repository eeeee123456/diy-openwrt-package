'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require poll';

'require ui';
'require tools.widgets as widgets';
'require tools.firewall as fwtool';

// 用于获取主机列表 (用于“目标主机”下拉菜单)
var callHostHints = rpc.declare({
	object: 'luci-rpc',
	method: 'getHostHints',
	expect: { '': {} }
});

// 用于检查 sslh 服务状态
var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('sslh'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['sslh']['instances']['instance1']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('sslh'), _('RUNNING'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('sslh'), _('NOT RUNNING'));
	}
	return renderHTML;
}

return view.extend({
	load: function () {
		return Promise.all([
			uci.load('sslh'),
			callHostHints()
		]);
	},

	render: function (data) {
		var hosts = data[1];
		var m, s, o;

		m = new form.Map('sslh',
			_('luci-app-sslh'),
			_('The simple sslh luci app'));

		// --- 服务状态 ---
		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			var statusView = E('p', { id: 'service_status' }, _('Collecting data...'));
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					statusView.innerHTML = renderStatus(res);
				});
			});
			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				statusView
			]);
		};

		// --- 全局设置 ---
		s = m.section(form.NamedSection, 'global', 'sslh', _('General Settings'));
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;

		o = s.option(form.Value, 'listen_host', _('Listen Host'));
		o.datatype = 'host';
		o.placeholder = '0.0.0.0';
		o.description = _('Set to 0.0.0.0 to listen on all interfaces.');

		o = s.option(form.Value, 'listen_port', _('Listen Port'));
		o.datatype = 'port';
		o.placeholder = '12345';
		o.description = _('The main port sslh will listen on for incoming connections.');

		// --- 协议转发规则 ---
		s = m.section(form.GridSection, 'protocol', _('Protocol Forwarding Rules'));
		s.addremove = true;
		s.sortable = true;
		s.nodescriptions = true;
		s.anonymous = true;
		s.modaltitle = _('Edit Protocol Rule');


		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;
		o.default = '1';
		o.editable = true;


		o = s.option(form.ListValue, 'name', _('Protocol'));
		o.value('ssh', 'SSH');
		o.value('tls', 'HTTPS/TLS'); // 'https' is an alias for 'tls' in sslh
		o.value('openvpn', 'OpenVPN');
		o.value('tinc', 'Tinc');
		o.value('wireguard', 'WireGuard');
		o.value('xmpp', 'XMPP');
		o.value('http', 'HTTP');
		o.value('adb', 'ADB');
		o.value('socks5', 'Socks5');
		o.value('syslog', 'Syslog');
		o.value('msrdp', 'MS RDP');
		o.value('anyprot', 'Any Protocol');
		o.rmempty = false;
		o.validate = function(section_id, value) {
    		// section_id 是当前正在编辑的行的 UCI ID, e.g., 'cfg02c497'
    		// value 是用户在下拉框中新选择的协议, e.g., 'ssh'

    		// 获取所有已存在的协议规则
    		var sections = uci.sections('sslh', 'protocol');

    		// 遍历所有规则
    		for (var i = 0; i < sections.length; i++) {
        		var section = sections[i];

        		// 如果我们正在检查的规则不是当前正在编辑的这一条
        		// 并且它的协议名称和用户新选择的协议名称相同
        		if (section['.name'] !== section_id && section.name === value) {
          		  // 发现重复，返回错误信息，阻止保存
          		  return _('This protocol is already in use. Please choose another one.');
       		 }
    		}

    		// 没有发现重复，校验通过
    		return true;
		};

		o = s.option(form.Value, 'target_host', _('Target Host'));
		o.datatype = 'host';
		o.rmempty = false;
		o.default = '127.0.0.1';
		// 填充局域网设备IP到下拉列表
		Object.keys(hosts).forEach(function (mac) {
			var hint = hosts[mac];
			var ip = hint.ipaddrs[0] || '?';
			var name = hint.name || mac;
			o.value(ip, '%s (%s)'.format(name, ip));
		});


		o = s.option(form.Value, 'target_port', _('Target Port'));
		o.datatype = 'port';
		o.rmempty = false;

		return m.render();
	}
});