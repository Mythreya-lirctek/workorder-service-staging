import axios, {AxiosInstance} from 'axios';
import Database from '../database/database';

export class Project44Service {
	private db: Database;
	private databaseget: Database;
	private client: AxiosInstance;

	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async registerClientApplication(req: any): Promise<any> {
		return this.client.post(`/integrations/api/project44/registerClientApplication`, req,{
			headers:{ 'accept': 'application/json' }
		});
	}

	public async generateClientSecret(req: any): Promise<any> {
		return this.client.post(`/integrations/api/project44/generateClientSecret`, req,{
			headers:{ 'accept': 'application/json' }
		});
	}

	public async grantAccessToken(req: any): Promise<any> {
		return this.client.post(`/integrations/api/project44/grantAccessToken`, req,{
			headers:{ 'accept': 'application/json' }
		});
	}

	public async createTlShipment(req: any): Promise<any> {
		return this.client.post(`/integrations/api/project44/createTlShipment`, req,{
			headers:{ 'accept': 'application/json' }
		});
	}

	public async updateTlShipment(req: any): Promise<any> {
		return this.client.post(`/integrations/api/project44/updateTlShipment/${req.shipmentId}`, req,{
			headers:{ 'accept': 'application/json' }
		});
	}

	public async deleteTlShipment(req: any): Promise<any> {
		return this.client.get(`/integrations/api/project44/deleteTlShipment/${req.shipmentId}`, {
			headers:{ 'accept': 'application/json', 'authorization': req.accessToken }
		});
	}

	public async getEventHistory(req: any): Promise<any> {
		return this.client.get(`/integrations/api/project44/getEventHistory/${req.shipmentId}`,{
			headers:{ 'accept': 'application/json', 'authorization': req.accessToken }
		});
	}

	public async getPositionHistory(req: any): Promise<any> {
		return this.client.get(`/integrations/api/project44/getPositionHistory/${req.shipmentId}`,{
			headers:{ 'accept': 'application/json', 'authorization': req.accessToken }
		});
	}

	public async getCustomerOrderLoadDetailsForCreatingOrder(coId: any, coRelayId: any): Promise<any> {
		return this.databaseget.query(`
			CALL getCustomerOrderLoadDetailsForCreatingOrder(
				${coId ? coId : null}, 
				${coRelayId ? coRelayId: null}
			)`
		);
	}

	public async updateOrderId(orderId: any, coId: any, coRelayId: any): Promise<any> {
		if (coRelayId > 0){
			return this.db.query(`update corelay set VisibilityOrderId = ${orderId ? this.db.connection.escape(orderId) : null } 
               WHERE Id = ${coRelayId}`);
		} else {
			return this.db.query(`update customerorder set VisibilityOrderId = ${orderId ? this.db.connection.escape(orderId) : null } 
                     WHERE Id = ${coId}`);
		}
	}

	public async insertProject44Credentials(reqBody: any): Promise<any> {
		return this.db.query(`
			Insert into companyintegrations(
			    IntegrationType, 
			    Partner, 
			    UserName, 
			    Password, 
			    createdAt, 
			    createdUserId, 
			    Company_Id,
				ClientId,
				ClientSecret,
				ExpiresOn,
				AccessToken
			)
			values(
					  'visibility',
					  'project44',
					  ${reqBody.userName ? this.db.connection.escape(reqBody.userName) : null},
					  ${reqBody.password ? this.db.connection.escape(reqBody.password) : null},
					  UTC_TIMESTAMP,
					  ${reqBody.userId},
					  ${reqBody.companyId},
					  ${reqBody.clientId ? this.db.connection.escape(reqBody.clientId) : null},
					  ${reqBody.clientSecret ? this.db.connection.escape(reqBody.clientSecret) : null},
					  ${reqBody.expiresOn ? this.db.connection.escape(reqBody.expiresOn) : null},
					  ${reqBody.accessToken ? this.db.connection.escape(reqBody.accessToken) : null}
				  )
		`);
	}

	public async updateProject44Credentials(reqBody: any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'userName', 'password', 'company_Id', 'apiKey', 'accessToken', 'clientSecret', 'clientId', 'expiresOn'];
		Object.keys(reqBody).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof reqBody[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(reqBody[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${reqBody[key]}` + ',';
				}
			}
		});
		if (text && reqBody.integrationId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${reqBody.userId}`;
			return this.db.query(`
                UPDATE
					companyintegrations
                SET
                    ${text}
                WHERE
                    Id = ${reqBody.integrationId}
            `);
		} else {
			return null
		}
	}
}