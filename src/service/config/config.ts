import axios, { AxiosInstance, AxiosResponse } from 'axios';
import debugModule from 'debug';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://dev-api-service.taraiwa.com';
const CONFIG_USERNAME = process.env.CONFIG_USERNAME || 'prime-dev';
const CONFIG_PASSWORD = process.env.CONFIG_PASSWORD || 'u=7zdMcukBzwHdF-';

const debug = debugModule('api:config-loader');

const auth = Buffer.from(`${CONFIG_USERNAME}:${CONFIG_PASSWORD}`).toString('base64');
const httpClient: AxiosInstance = axios.create({
	baseURL: `${GATEWAY_URL}/config`,
	headers: {
		'Authorization': `Basic ${auth}`,
		'Content-Type': 'application/json'
	}
});

class ConfigService {
	public static configs: any;
	public static async loadConfig(application: string = 'default', profile: string = 'default'): Promise<any> {
		debug(`loading configuration from config server /config/${application}/${profile}`);
		const configResponse: AxiosResponse = await httpClient.get(`/${application}/${profile}`);
		ConfigService.configs = configResponse.data.config;
		debug('configuration loaded');
		return configResponse.data.config;
	}

	private constructor() {}
}

export default ConfigService;