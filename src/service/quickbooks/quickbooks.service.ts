import axios, {AxiosInstance} from 'axios';
import Database from '../database/database';

export class QuickBooksService {

	private client: AxiosInstance;
	private db: Database;

	constructor() {
		this.db = new Database();
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async getAccessTokenFromRefreshToken(refreshToken: any): Promise<any> {
		return this.client.post('/integrations/api/quickbooks/getAccessTokenFromRefreshToken', { refreshToken });
	}

	public async syncInvoices(bodyParam: any): Promise<any> {
		return this.client.post('/integrations/api/quickbooks/syncInvoices', bodyParam);
	}

	public async updateAccessTokenForQuickBook(response: any) : Promise<any> {
		let text = '';
		const lineFields: any = [
			'refreshToken', 'expiresOn', 'accessToken'];
		Object.keys(response).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof response[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(response[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${response[key]}` + ',';
				}
			}
		});
		if (text && response.integrationId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${response.userId}`;
			return this.db.query(`
                UPDATE
					companyintegrations
                SET
                    ${text}
                WHERE
                    Id = ${response.integrationId}
            `);
		} else {
			return null
		}
	}
}