import axios, {AxiosInstance} from 'axios';
import express from 'express';
import moment from 'moment';
import equipmentTypes from './equipment.type';

export class DatService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}

	public async getOrganizationAccessToken(req:any): Promise<any> {
		return this.client.post(`/integrations/api/dat/token/getOrganizationAccessToken`,req);
	}
	public async getUserAccessTokenInfo(req: any): Promise<any> {
		return this.client.post(`/integrations/api/dat/token/getUserAccessToken`,{'username': req.username},{
			headers:{
				'Content-Type':'application/json',
				'authorization': req.accesstoken,
			}
		});
	}
	public async getUserAccessToken(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/token/getUserAccessToken`,req.body,{
			headers:{
				'Content-Type':'application/json',
				'authorization': req.headers.accesstoken
			}
		});
	}
	public  getFormatDate(stop:any):any{

		return {
			earlyDateTime: (stop.fromDate !== '0000-00-00 00:00:00' && stop.fromDate !== '') ? moment(`${moment(stop.fromDate).format('YYYY-MM-DD')} ${(stop.fromTime !== '0000-00-00 00:00:00' && stop.fromTime !== '') ? moment(stop.fromTime).format('HH:mm:ss') : '00:00:00'}`).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
			fromTime: (stop.fromTime !== '0000-00-00 00:00:00' && stop.fromTime !== '') ? moment(stop.fromTime).format('hh:mm a') : undefined,
			lateDateTime: (stop.toDate !== '0000-00-00 00:00:00' && stop.toDate !== '') ? moment(`${moment(stop.toDate).format('YYYY-MM-DD')} ${(stop.toTime !== '0000-00-00 00:00:00' && stop.toTime !== '') ? moment(stop.toTime).format('HH:mm:ss') : '00:00:00'}`).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
			toTime: (stop.toTime !== '0000-00-00 00:00:00' && stop.toTime !== '') ? moment(stop.toTime).format('hh:mm a') : undefined
		}
	}
	public getLoadInfo(stops:any):any{
		const pickups = stops.filter((stop:any)=>{
			return stop.stopType ==='Pickup'
		})
		const commodities = [] as any;
		const weights = [] as any;
		const lenghts = [] as any;
		pickups.forEach((stop:any)=>{
			if(stop.stopItems){
			const commoditiesItems	= stop.stopItems.map((stopItem:any)=>{
				return stopItem.commodity?stopItem.commodity:'';
			});
			const weightItems	= stop.stopItems.map((stopItem:any)=>{
					return stopItem.weight?stopItem.weight:0;
			});
			const lengthItems	= stop.stopItems.map((stopItem:any)=>{
					return stopItem.length?stopItem.length:0;
			});
			 commodities.push(...commoditiesItems);
			 weights.push(...weightItems);
			 lenghts.push(...lengthItems)
			}
		})
		const pickUpStop = this.getFormatDate(stops[0])
		const deliveryStop = this.getFormatDate(stops[stops.length-1])
		return {
			commodity: commodities.filter((com: any) => {
				return com.length !== 0
			}).join(','),
			dropOffHours:
				deliveryStop.fromTime ? `${deliveryStop.fromTime} ${(deliveryStop.toTime ? `- ${deliveryStop.toTime}` : '')}` : deliveryStop.toTime,
			earliestAvailabilityWhen: pickUpStop.earlyDateTime,
			endWhen: deliveryStop.earlyDateTime,
			latestAvailabilityWhen: pickUpStop.lateDateTime,
			length: lenghts.length > 0 ? lenghts.reduce((total: any, lenght: any) => {
				return total + lenght;
			}) : 0,
			pickupHours: pickUpStop.fromTime ? `${pickUpStop.fromTime} ${(pickUpStop.toTime ? `- ${pickUpStop.toTime}` : '')}` : pickUpStop.toTime,
			weight: weights.length > 0 ? weights.reduce((total: any, weight: any) => {
				return total + weight;
			}) : 0

		}
	}

	public validateLoad(req:any):any{
		const loadInfo =  this.getLoadInfo(req.stops);
		const errors = [] as any;
		if(loadInfo.length ===0){
			errors.push({fields:'length',message:'Please added length in Stop Items'})
		}
		if(loadInfo.weight ===0){
			errors.push({fields:'weight',message:'Please added weight in Stop Items'})
		}
		return errors;
	}
	public async postLoad(req:any,auth:any):Promise<any>{
		const loadInfo =  this.getLoadInfo(req.stops);
		const equipmentDetails = equipmentTypes.find((equip:any)=>{
			return  equip.value===req.equipmentType_Id;
		})
		// If data not mapped setting default to reefer
		const equipmentType= equipmentDetails ? (equipmentDetails.dat ? equipmentDetails.dat:'R'):'R'
		const data ={
			'exposure': {
				'audience': {
					'loadBoard': true
				},
				'earliestAvailabilityWhen': loadInfo.earliestAvailabilityWhen,
				'latestAvailabilityWhen': loadInfo.latestAvailabilityWhen
			},
			'freight': {
				'comments': req.specialInstruction?[
					{
						'comment': req.specialInstruction
					}
				]:[],
				'commodity':{
					'details':loadInfo.commodity
				},
				'dropOffHours':loadInfo.dropOffHours,
				'equipmentType': equipmentType,
				'fullPartial': 'FULL',
				'lengthFeet': loadInfo.length,
				'pickupHours':loadInfo.pickupHours,
				'weightPounds': loadInfo.weight
			},
			'lane': {
				'destination': {
					'city': req.stops[req.stops.length-1].city,
					'postalCode': req.stops[req.stops.length-1].zip,
					'stateProv': req.stops[req.stops.length-1].state
				},
				'origin': {
					'city': req.stops[0].city,
					'postalCode': req.stops[0].zip,
					'stateProv': req.stops[0].state
				}
			},
			'referenceId':req.coNumber+1,
			'shipmentId':req.id.toString(),
			'webhooks':{  // todo need to replace webhooks
				'authenticationHeader':'378ueyjhdhjhdjhjd',
				'authenticationKey':'authorization',
				'url':'https://api.taraiawa.com',
			}

		}
		return this.client.post(`/integrations/api/dat/loads/createLoad`,data,{
			headers:{
				'Content-Type':'application/json',
				'authorization': auth
			}
		});

	}
	public async updatePostedLoad(req:any,auth:any):Promise<any>{
		const loadInfo =  this.getLoadInfo(req.stops);
		const equipmentDetails = equipmentTypes.find((equip:any)=>{
			return  equip.value===req.equipmentType_Id;
		})
		const equipmentType= equipmentDetails ? (equipmentDetails.dat ? equipmentDetails.dat:'R'):'R' // If data not mapped setting default reefer
		const data ={
			'exposure': {
				'audience': {
					'loadBoard': true
				},
				'earliestAvailabilityWhen': loadInfo.earliestAvailabilityWhen,
				'latestAvailabilityWhen': loadInfo.latestAvailabilityWhen
			},
			'freight': {
				'comments': req.specialInstruction?[
					{
						'comment': req.specialInstruction
					}
				]:[],
				'commodity':{
					'details':loadInfo.commodity
				},
				'dropOffHours':loadInfo.dropOffHours,
				'equipmentType': equipmentType,
				'fullPartial': 'FULL',
				'lengthFeet': loadInfo.length,
				'pickupHours':loadInfo.pickupHours,
				'weightPounds': loadInfo.weight
			}
		}

		return this.client.put(`/integrations/api/dat/loads/${req.datLoadId}` ,data,	{
			headers:{
				'authorization': auth
			}
		});

	}

	public async refreshPostedLoad(req:any,auth:any):Promise<any>{
		return this.client.post(`/integrations/api/dat/loads/refresh` ,{ids:req},	{
			headers:{
				'Content-Type':'application/json',
				'authorization': auth
			}
		});

	}

	public async createLoad(req: express.Request): Promise<any> {

		return this.client.post(`/integrations/api/dat/loads/createLoad`,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getLoads(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/loads/getLoads` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async deleteAsync(req:express.Request): Promise<any> {
		const {referenceId}=req.params;
		return this.client.delete(`/integrations/api/dat/loads/deleteAsync/${referenceId}` ,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async deleteLoad(loadPostingId:any,auth:any): Promise<any> {
		return this.client.delete(`/integrations/api/dat/loads/${loadPostingId}` ,{
			headers:{
				'authorization': auth
			}
		});
	}
	public async delete(req:express.Request): Promise<any> {
		const {loadPostingId}=req.params;
		return this.client.delete(`/integrations/api/dat/loads/${loadPostingId}` ,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getLoadById(req:express.Request): Promise<any> {
		const {loadPostingId}=req.params;
		return this.client.get(`/integrations/api/dat/loads/${loadPostingId}` ,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async updateLoad(req:express.Request): Promise<any> {
		const {loadPostingId}=req.params;
		return this.client.put(`/integrations/api/dat/loads/${loadPostingId}` ,req.body,	{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async refreshLoads(req:express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/loads/refresh` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async refreshLoad(req:express.Request): Promise<any> {
		const {loadPostingId}=req.params;
		return this.client.post(`/integrations/api/dat/loads/refresh/${loadPostingId}` ,null,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
   public async createBid(req:express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/loads/bids/createBid` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}

	public async getBids(req:express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/loads/bids/getBids` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async bulkUpdateBids(req:express.Request): Promise<any> {
		return this.client.put(`/api/dat/loads/bids/bulkUpdateBids` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getBid(req:express.Request): Promise<any> {
		const {bidId}=req.params;
		return this.client.get(`integrations/api/dat/loads/bids/${bidId}` ,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async updateBid(req:express.Request): Promise<any> {
		const {bidId}=req.params;
		return this.client.put(`/integrations/api/dat/loads/bids/${bidId}` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getBidCounts(req:express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/loads/bids/getBidCounts` ,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async createNewAssetQuery(req: express.Request): Promise<any> {

		return this.client.post(`/integrations/api/dat/search/createNewAssetQuery`,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getAssetQueriesByUser(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/search/getQueriesByUser`,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getAssetQueryById(req: express.Request): Promise<any> {
		const {queryId} = req.params
		return this.client.get(`/integrations/api/dat/search/getAssetQueryById/${queryId}`,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async deleteAssetQueryById(req: express.Request): Promise<any> {
		const {queryId} = req.params
		return this.client.delete(`/integrations/api/dat/search/deleteAssetQueryById/${queryId}`,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getAssetsByQueryId(req: express.Request): Promise<any> {
		const {queryId} = req.params
		return this.client.post(`/integrations/api/dat/search/getAssetsByQueryId/${queryId}`,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}
	public async getDetailsInformationByMatchId(req: express.Request): Promise<any> {
		const {matchId} = req.params
		return this.client.get(`/integrations/api/dat/search/getDetailsInformationByMatchId/${matchId}`,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}

	public async rateLookUp(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/dat/rateLookUp`,req.body,{
			headers:{
				'authorization': req.headers.accesstoken
			}
		});
	}


	private dictToURI(dict: any) : Promise<any> {
		const str = [];
		for(const p in dict) {
			if(p !== '') {
				str.push(`${encodeURIComponent(p)}=${encodeURIComponent(dict[p])}`);
			}
		}
		return str.join('&') as any;
	}

}