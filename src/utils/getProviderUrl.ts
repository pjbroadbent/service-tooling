import {existsSync} from 'fs';
import {join} from 'path';

import {getProjectConfig} from './getProjectConfig';
import {getRootDirectory} from './getRootDirectory';

let url: string|null = null;

/**
 * Returns the URL of the manifest file for the requested version of the service.
 *
 * @param {string} version Version number of the service, or a channel
 * @param {string} manifestUrl The URL that was set in the application manifest (if any). Any querystring arguments will be persisted, but the rest of the URL will be ignored.
 */
export function getProviderUrl(version: string, manifestUrl?: string) {
    if (url) {
        return url;
    }
    const {PORT, CDN_LOCATION} = getProjectConfig();
    const index = (manifestUrl && manifestUrl.indexOf('?')) || -1;
    const query = manifestUrl && index >= 0 ? manifestUrl.substr(index) : '';

    if (version === 'local') {
        const demoProviderResponse = existsSync(join(getRootDirectory(), 'res/demo/provider.json'));

        if (demoProviderResponse) {
            return url = `http://localhost:${PORT}/demo/provider.json${query}`;
        } else {
            return url = `http://localhost:${PORT}/provider/app.json${query}`;
        }
    } else if (version === 'stable') {
        // Use the latest stable version
        return url = `${CDN_LOCATION}/app.json${query}`;
    } else if (version === 'staging') {
        // Use the latest staging build
        return url = `${CDN_LOCATION}/app.staging.json${query}`;
    } else if (version === 'testing') {
        // Use the optional testing provider if exists.
        const testingProviderResponse = existsSync(join(getRootDirectory(), 'res/test/provider.json'));

        if (testingProviderResponse) {
            return url = `http://localhost:${PORT}/test/provider.json${query}`;
        } else {
            return url = `http://localhost:${PORT}/provider/app.json${query}`;
        }
    } else if (version.indexOf('://') > 0) {
        // Looks like an absolute URL to an app.json file
        return url = version;
    } else if (/\d+\.\d+\.\d+/.test(version)) {
        // Use a specific public release of the service
        return url = `${CDN_LOCATION}/${version}/app.json${query}`;
    } else {
        throw new Error(`Not a valid version number or channel: ${version}`);
    }
}
