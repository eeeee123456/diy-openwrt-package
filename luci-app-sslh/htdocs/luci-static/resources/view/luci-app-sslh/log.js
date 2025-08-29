'use strict';
'require dom';
'require fs';
'require poll';
'require view';

return view.extend({
	render: function () {
		var css = `
			/* 日志框文本区域 */
			#log_textarea {
				margin-top: 10px;
			}
			#log_textarea pre {
				padding: 10px; /* 内边距 */
				border: 1px solid #ddd; /* 边框颜色 */
				border-radius: 6px; /* 边框圆角 */
				font-family: Consolas, Menlo, Monaco, monospace;
				font-size: 14px;
				line-height: 1.6; /* 行高 */
				white-space: pre-wrap;
				word-wrap: break-word;
				overflow-y: auto;
				max-height: 600px;
			}
			/* 5s 自动刷新文字 */
			.cbi-section small {
				margin-left: 5px;
				font-size: 12px; 
				color: #666; /* 深灰色文字 */
			}
		`;

		var log_textarea = E('div', { 'id': 'log_textarea' },
			E('img', {
				'src': L.resource('icons/loading.gif'),
				'alt': _('Loading...'),
				'style': 'vertical-align:middle'
			}, ' ', _('Collecting data...'))
		);

		var log_path = '/var/log/luci-app-sslh/sslh.log';
		var lastLogContent = '';

		poll.add(function () {
			//  -l 100 参数来限制最多只显示 100 条
			return fs.exec('logread', ['-e', 'sslh', '-l', '300'])
				.then(function (res) {
					if (res && typeof res.stdout === 'string') {
						var newContent = res.stdout.trim();
						var displayContent = newContent || _('No sslh related entries found in system log.');

						if (displayContent !== lastLogContent) {
							var log = E('pre', { 'wrap': 'pre' }, [displayContent]);
							dom.content(log_textarea, log);
							// 滚动到底部，以便用户能看到最新的日志
							log.scrollTop = log.scrollHeight;
							lastLogContent = displayContent;
						}
					} else {
						dom.content(log_textarea, E('pre', {}, [_('Failed to read system log.')]));
					}
				}).catch(function (err) {
					var log = E('pre', { 'wrap': 'pre' }, [_('Unknown error: %s').format(err)]);
					dom.content(log_textarea, log);
				});
		}, 5);

		return E('div', { 'class': 'cbi-map' }, [
			E('style', [css]),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('SSLH Log')),
				log_textarea,
				E('small', { 'style': 'display: block; margin-top: 10px;' }, _('Auto-refresh every 5 seconds.'))
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});