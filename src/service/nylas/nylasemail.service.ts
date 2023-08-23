import axios, {AxiosInstance} from 'axios';

export class NylasEmailService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}
	
	public async login(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/login', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async getAccessToken(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/getAccessToken', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async sendEmail(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/sendEmail', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async getThreads(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/getThreads', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async getThreadById(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/getThreadById', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async getMessageById(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/getMessageById', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async sendAttachment(req: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/sendAttachment', req.body);
		} catch (e) {
			return e;
		}
	}

	public async deleteAttachment(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/deleteAttachment', bodyParam);
		} catch (e) {
			return e;
		}
	}

	public async readAttachment(bodyParam: any): Promise<any> {
		try {
			return await this.client.post('/integrations/api/nylas/readAttachment', bodyParam);
		} catch (e) {
			return e;
		}
	}

}