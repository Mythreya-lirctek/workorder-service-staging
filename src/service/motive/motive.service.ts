import axios, {AxiosInstance} from 'axios';
import Database from '../database/database';

export class MotiveService {

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

	public async getMotiveDriverId(driverId: any): Promise<any> {
		return this.databaseget.query(`select MotiveId from driver where Id=${driverId}`);
	}

	public async getMotiveVehicleId(vehicleId: any): Promise<any> {
		return this.databaseget.query(`select MotiveVehicleId from truck where Id=${vehicleId}`);
	}

	public async updateMotiveId(motiveId: number, driverId: number) : Promise<any> {
		return this.db.query(`update driver set MotiveId=${motiveId} where Id=${driverId}`)
	}

	public async updateMotiveVehicleId(motiveVehicleId: number, vehicleId: number) : Promise<any> {
		return this.db.query(`update truck set MotiveVehicleId=${motiveVehicleId} where Id=${vehicleId}`)
	}

	public async updateMotiveAssetId(motiveAssetId: number, assetId: number) : Promise<any> {
		return this.db.query(`update trailer set MotiveAssetId=${motiveAssetId} where Id=${assetId}`)
	}

	public async isValidMotiveToken(body: any): Promise<any> {
		const { token } = body
		return this.client.get(`/integrations/api/motive/isValidMotiveToken`,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getUsers(token:string): Promise<any> {
		return this.client.get(`/integrations/api/motive/getUser`,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getUserWithExternalId(req: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getUserWithExternalId`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async updateUserWithExternalId(updateDriver: any, token:string): Promise<any> {
		return this.client.put(`/integrations/api/motive/updateUserWithExternalId`, updateDriver,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getVehicle(req: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getVehicle`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getVehicleWithExternalId(updateVehicle: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getVehicleWithExternalId`, updateVehicle,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async updateVehicleWithExternalId(updateVehicle: any, token:string): Promise<any> {
		return this.client.put(`/integrations/api/motive/updateVehicleWithExternalId`, updateVehicle,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getAssets(req: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getAssets`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getAssetWithExternalId(updateVehicle: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getAssetWithExternalId`, updateVehicle,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async updateAssetWithExternalId(updateAsset: any, token:string): Promise<any> {
		return this.client.put(`/integrations/api/motive/updateAssetWithExternalId`, updateAsset,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getAvailableTime(req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getAvailableTime`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getHoursOfService(req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getHoursOfService`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getVehicleLocation(req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getVehicleLocation`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getAssetLocation(assetId : string, req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getAssetLocation/${assetId}`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getIftaTrips(req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getIftaTrips`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

	public async getIftaSummary(req: any, token: string): Promise<any> {
		return this.client.post(`/integrations/api/motive/getIftaSummary`, req,{
			headers:{ 'accept': 'application/json', 'apikey': `${token}`}
		});
	}

}