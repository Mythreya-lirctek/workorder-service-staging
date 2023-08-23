import axios, {AxiosInstance} from 'axios';
import Database from '../database/database';

export class TruckXService {
	private client: AxiosInstance;
	private db: Database;
	private databaseget: Database;

	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async getCarrierList(): Promise<any>{
		return this.client.get(`/integrations/api/truckx/getCarrierList`,{
			headers:{ 'Content-Type': 'application/json' }
		});
	}

	public async getTrucksList(carrierId: any): Promise<any>{
		return this.client.get(`/integrations/api/truckx/getTrucksList/${carrierId}`,{
			headers:{ 'Content-Type': 'application/json' }
		});
	}

	public async getLocation(truckIds: any, carrierId: any): Promise<any>{
		return this.client.post(`/integrations/api/truckx/getLocation/${carrierId}`, truckIds, {
			headers:{ 'Content-Type': 'application/json' }
		});
	}

	public async getDriversList(carrierId: any): Promise<any>{
		return this.client.get(`/integrations/api/truckx/getDriversList/${carrierId}`, {
			headers:{ 'Content-Type': 'application/json' }
		});
	}

	public async getHosStatus(userIds: any, carrierId: any): Promise<any>{
		return this.client.post(`/integrations/api/truckx/getHosStatus/${carrierId}`, userIds, {
			headers:{ 'Content-Type': 'application/json' }
		});
	}

	public async updateTruckXDriverId(motiveId: any, driverId: any) : Promise<any> {
		return this.db.query(`update driver set ELDDriverId=${this.db.connection.escape(motiveId)} where Id=${driverId}`)
	}

	public async getTruckXDriverId(driverId: any) : Promise<any> {
		return this.databaseget.query(`select ELDDriverId from driver where Id=${driverId}`);
	}

	public async updateTruckXVehicleId(truckXId: any, vehicleId: any) : Promise<any> {
		return this.db.query(`update truck set ELDVehicleId=${this.db.connection.escape(truckXId)} where Id=${vehicleId}`)
	}

	public async getTruckXVehicleId(vehicleId: any) : Promise<any> {
		return this.databaseget.query(`select ELDVehicleId from truck where Id=${vehicleId}`);
	}

}