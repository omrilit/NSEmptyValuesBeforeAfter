/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @author pmiller
 */
define(
	[
		'../adapter/psa_racg_ad_log',
		'../adapter/psa_racg_ad_file',
		'../adapter/psa_racg_ad_url',
		'../adapter/psa_racg_ad_runtime',
		'../adapter/psa_racg_ad_record',
		'../adapter/psa_racg_ad_cache'
	],

	function (rLog, rFile, rUrl, rRuntime, rRecord, rCache) {
		var module = {
			template: {
				src: {
					path: '{bundleFolderName}/Bundle {bundleId}/src/',
					url: 'https://{domain}/c.{accountId}/suitebundle{bundleId}/src/'
				}
			}
		};

		module.getBundleFoldername = function () {
			rLog.startMethod('getBundleFoldername');

			var urlCache = rCache.getCache('PSA_RACG_URL');

			var bundleFolderName = urlCache.get({
				key: 'BUNDLE_FOLDER_NAME'
			});

			if (!bundleFolderName) {
				bundleFolderName = rRecord.load({
					type: rRecord.getTypes().FOLDER,
					id: -16
				}).getValue({
					fieldId: 'name'
				});

				urlCache.put({
					key: 'BUNDLE_FOLDER_NAME',
					value: bundleFolderName
				});
			}

			rLog.endMethod();
			return bundleFolderName;
		};

		module.getSrcPath = function () {
			rLog.startMethod('getSrcPath');

			var bundleFolderName = this.getBundleFoldername(),
				bundleId = this.template.src.path.replace('{bundleFolderName}', bundleFolderName).replace('{bundleId}', rRuntime.getBundleId());

			rLog.endMethod();
			return bundleId;
		};

		module.getSrcUrl = function () {
			rLog.startMethod('getSrcUrl');

			var accountId = rRuntime.getAccountId(),
				bundleId = rRuntime.getBundleId();

			var domain = rUrl.resolveDomain({
				hostType: rUrl.getHostTypes().APPLICATION,
				accountId: accountId
			});

			var srcUrl = this.template.src.url.replace('{domain}', domain).replace('{accountId}', accountId).replace('{bundleId}', bundleId);

			rLog.endMethod();
			return srcUrl;
		};

		module.getFileUrl = function (options) {
			rLog.startMethod('getFileUrl');

			var file = rFile.load({
				id: this.getSrcPath() + options.filePath
			});

			var fileUrl = file.url;

			rLog.endMethod();
			return fileUrl;
		};

		return module;
	}
);