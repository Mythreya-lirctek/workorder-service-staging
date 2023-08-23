import axios, {AxiosInstance} from 'axios';
import Database from '../database/database';

export class SamsaraService {
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

	public async getSamsaraDriverId(driverId: any): Promise<any> {
		return this.databaseget.query(`select SamsaraId from driver where Id=${driverId}`);
	}

	public async getSamsaraVehicleId(vehicleId: any): Promise<any> {
		return this.databaseget.query(`select SamsaraVehicleId from truck where Id=${vehicleId}`);
	}

	public async getSamsaraMotiveToken(companyId: number): Promise<any> {
		return this.databaseget.query(`select samsaraToken, MotiveApiKey  from company where Id=${companyId}`);
	}

	public async getDriversList(companyId: any) : Promise<any> {
		return this.databaseget.query(`select Id, FirstName, LastName, DrivingLicense from driver where Company_Id = ${companyId} And IsDeleted = 0`)
	}

	public async getVehiclesList(companyId: any) : Promise<any> {
		return this.databaseget.query(`select Id, TruckNumber, VIN from truck where Company_Id = ${companyId} And IsDeleted = 0`)
	}

	public async getAssetsList(companyId: any) : Promise<any> {
		return this.databaseget.query(`select Id, TrailerNumber, TrailerNumber from trailer where Company_Id = ${companyId} And IsDeleted = 0`)
	}

	public async updateSamsaraId(samsaraId: number, driverId: number) : Promise<any> {
		return this.db.query(`update driver set SamsaraId=${samsaraId} where Id=${driverId}`)
	}

	public async updateSamsaraVehicleId(samsaraVehicleId: number, vehicleId: number) : Promise<any> {
		return this.db.query(`update truck set SamsaraVehicleId=${samsaraVehicleId} where Id=${vehicleId}`)
	}

	public async updateSamsaraAssetId(samsaraAssetId: number, assetId: number) : Promise<any> {
		return this.db.query(`update trailer set SamsaraAssetId=${samsaraAssetId} where Id=${assetId}`)
	}

	public async isValidSamsaraToken(body: any): Promise<any> {
		const { token } = body
		return this.client.get(`/integrations/api/samsara/isValidSamsaraToken`,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getUsersSamasara(token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/getUsers`,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async updateDriverWithExternalId(updateDriver: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/updateDriverWithExternalId`, updateDriver,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getVehicle(_body: any, token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/getVehicles`,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getAssets(_body: any, token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/getAssetsList`,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getAvailableTime(req:any,token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getAvailableTime`,req,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}` }
		});
	}

	public async getHoursOfService(req:any,token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getHoursOfService`,req,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${token}` }
		});
	}

	public async getVehicleLocation(req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getVehicleLocation`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}` }
		});
	}

	public async getVehicleLocationRoute(req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getVehicleLocationRoute`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}` }
		});
	}

	public async getAssetLocation(assetId: string, req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getLocationsByAssetId/${assetId}`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getIftaReports(req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/getIftaReports`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getStopDetailsByDoId(doId: any): Promise<any>{
		return this.databaseget.query(
			`select a.latitude,a.longitude from dostops dos
                    LEFT JOIN wostops wos on wos.Id = dos.WOStops_Id
                    LEFT JOIN contact c ON c.Id = wos.Contact_Id
                    LEFT JOIN address a ON a.Id = c.Address_Id
                    where dos.DispatchOrder_Id = ${doId} and dos.Relay_Id is NULL and (dos.ArrivedDate IS NULL or dos.arriveddate = '0000-00-00 00:00:00')`
		)
	}

	public async getStopDetailsByRelayId(relayId: any): Promise<any>{
		return this.databaseget.query(
			`select a.latitude,a.longitude from dostops dos
                    LEFT JOIN wostops wos on wos.Id = dos.WOStops_Id
                    LEFT JOIN contact c ON c.Id = wos.Contact_Id
                    LEFT JOIN address a ON a.Id = c.Address_Id
                    where dos.Relay_Id = ${relayId} and (dos.ArrivedDate IS NULL or dos.arriveddate = '0000-00-00 00:00:00')`
		)
	}

	public async getVehicleRouteHistory(vehicleHistoryRequest: any, samsaraId: any): Promise<any>{
		return this.client.post(`/integrations/api/samsara/getVehicleRouteHistory`, vehicleHistoryRequest,{
			headers:{ 'accept': 'application/json', 'authorization': `Bearer samsara_api_${samsaraId}`}
		});
	}

	public async updateEta(eta: any, id: any): Promise<any>{
		return this.db.query(`update dostops set ETA = ${eta ? this.db.connection.escape(eta) : null} where Id=${id}`)
	}

	public async updateArrivedDate(arrivedDate: any, id: any): Promise<any>{
		return this.db.query(`update dostops set ArrivedDate = ${arrivedDate ? this.db.connection.escape(arrivedDate) : null} where Id=${id}`)
	}

	public async updateLeavedDate(leavedDate: any, id: any): Promise<any>{
		return this.db.query(`update dostops set leftdate = ${leavedDate ? this.db.connection.escape(leavedDate) : null} where Id=${id}`)
	}

	public async addAddress(req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/addAddress`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async createRoute(req:any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/createRoute`,req,{
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async getLoadDetailsForRouteCreation(doId: any, relayId: any): Promise<any> {
		return this.databaseget.query(`
			CALL getAvailableLoadsForETACalculations(
				${doId ? doId : null}, 
				${relayId ? relayId: null}
			)`
		);
	}

	public async getRouteIdAndSamsaraToken(doId: any, relayId: any): Promise<any> {
		return this.databaseget.query(`
			CALL getTripsSamsaratokenId(
				${doId ? doId : null}, 
				${relayId ? relayId: null}
			)`
		);
	}

	public async getRouteUpdates(token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/getRouteUpdates`,{
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async updateRoute(id: any, req: any, token:string): Promise<any> {
		return this.client.post(`/integrations/api/samsara/updateRoute/${id}`, req, {
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async deleteRoute(id:any, token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/deleteRoute/${id}`, {
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async fetchRoute(id:any, token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/fetchRoute/${id}`, {
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async deleteAddress(id:any, token:string): Promise<any> {
		return this.client.get(`/integrations/api/samsara/deleteAddress/${id}`, {
			headers:{ 'authorization': `Bearer samsara_api_${token}`}
		});
	}

	public async updateRouteId(routeId: any, doId: any, relayId: any): Promise<any> {
		if (relayId > 0){
			return this.db.query(`update relay set SamsaraRouteId = ${routeId ? this.db.connection.escape(routeId) : null } WHERE Id = ${relayId}`);
		} else {
			return this.db.query(`update dispatchorder set SamsaraRouteId = ${routeId ? this.db.connection.escape(routeId) : null } WHERE Id = ${doId}`);
		}
	}
}