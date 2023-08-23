import axios, {AxiosInstance} from 'axios';

export class HeremapsService {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async calculateRoute(req:any): Promise<any> {
		return this.client.post(`/integrations/api/heremaps/calculateRoute`, req);
	}

}