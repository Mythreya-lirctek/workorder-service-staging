import axios, {AxiosInstance} from 'axios';
import moment from 'moment';
import momenttimezone from 'moment-timezone'
import express from 'express';
import equipmentTypes from '../dat/equipment.type';
export class TruckStopsService {
	private client: AxiosInstance;
	constructor() {
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		});
	}
	public validateLoad(req:any):any{
		const loadInfo =  this.getLoadInfo(req.stops);
		const errors = [] as any;
		if(loadInfo.length ===0){
			errors.push({fields:'length',message:'Please added length in Stop Items'})
		}
		if(loadInfo.length > 999){
			errors.push({fields:'length',message:'Please added length in between 1-999 in Stop Items'})
		}
		if(loadInfo.weight ===0){
			errors.push({fields:'weight',message:'Please added weight in Stop Items'})
		}
		if(loadInfo.palletCount > 99){
			errors.push({fields:'length',message:'Please added Pallet Count in between 1-99 in Stop Items'})
		}

		req.stops.map((stop: any) => {
			const dates = this.getFormatDate(stop)
			if(dates.earlyDateTime && dates.earlyDateTime !== ''){
				const earlyDateTime = momenttimezone.tz(dates.earlyDateTime,'America/Los_Angeles').clone().utc()
				if(earlyDateTime.isBefore(moment().utc())){
					errors.push({fields:'fromDate',message:`For the load stop at index ${stop.stopNumber}, EarlyDateTime cannot be in the past then ${moment().utc()}.`})
				}
			}
			if(dates.lateDateTime && dates.lateDateTime !== ''){
				const lateDateTime = momenttimezone.tz(dates.lateDateTime,'America/Los_Angeles').clone().utc()
				if(lateDateTime.isBefore(moment().utc())){
					errors.push({fields:'toDate',message:`For the load stop at index ${stop.stopNumber}, LateDateTime cannot be in the past then ${moment().utc()}.`})
				}
			}

		});
		return errors;
	}
	public async getAccessToken(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/truckstop/getAccessToken`,req.body);
	}

	public async getRefreshToken(req: express.Request): Promise<any> {
		return this.client.post(`/integrations/api/truckstop/getRefreshToken`,req.body);
	}
	public async loginTruckStops(): Promise<any> {
		return this.client.get(`/integrations/api/truckstop/loginTruckStops`);
	}

	public async deleteLoad(loadIdToDelete:any,auth:any): Promise<any> {
		return this.client.delete(`/integrations/api/truckstop/load/${loadIdToDelete}`,{
			headers: {
				'Content-Type':'application/json',
				'authorization': `Bearer ${auth}`
			}
		});
	}
	public getLoadInfo(stops:any):any{
		const pickups = stops.filter((stop:any)=>{
			return stop.stopType ==='Pickup'
		})
		const commodities = [] as any;
		const weights = [] as any;
		const lengths = [] as any;
		const pallets = [] as any;
		const pieceCounts = [] as any;
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
				const palletsItems	= stop.stopItems.map((stopItem:any)=>{
					return stopItem.pallets?stopItem.pallets:0;
				});
				const pieceCountsItems	= stop.stopItems.map((stopItem:any)=>{
					return stopItem.pieceCount?stopItem.pieceCount:0;
				});
				commodities.push(...commoditiesItems);
				weights.push(...weightItems);
				lengths.push(...lengthItems);
				pallets.push(...palletsItems);
				pieceCounts.push(...pieceCountsItems);
			}
		})


		return {
			commodity:commodities.filter((com:any)=>{
				return com.length !== 0
			}).join(','),
			length:lengths.length>0?lengths.reduce((total:any,lenght:any)=>{
				return total+lenght;
			}):0,
			palletCount:pallets.length>0?pallets.reduce((total:any,pallet:any)=>{
				return total+pallet;
			}):0,
			pieceCount:pieceCounts.length>0?pieceCounts.reduce((total:any,pieceCount:any)=>{
				return total+pieceCount;
			}):0,
			weight:weights.length>0?weights.reduce((total:any,weight:any)=>{
				return total+weight;
			}):0
		}
	}
	public getStopInfo(stop:any):any{
		const commodities = [] as any;
		if(stop.stopItems){
			const commoditiesItems	= stop.stopItems.map((stopItem:any)=>{
				return stopItem.commodity?stopItem.commodity:'';
			});
			commodities.push(...commoditiesItems);
		}


		return {
			commodity:commodities.filter((com:any)=>{
				return com.length !== 0
			}).join(',')
		}
	}

	public  getFormatDate(stop:any):any{

		return {
			earlyDateTime:(stop.fromDate !== '0000-00-00 00:00:00' && stop.fromDate !== '')?moment(`${moment(stop.fromDate).format('YYYY-MM-DD')} ${(stop.fromTime !== '0000-00-00 00:00:00' && stop.fromTime !== '') ?moment(stop.fromTime).format('HH:mm:ss'):'00:00:00'}`).format('YYYY-MM-DD HH:mm:ss'):'',
			lateDateTime:(stop.toDate !== '0000-00-00 00:00:00' && stop.toDate !== '')?moment(`${moment(stop.toDate).format('YYYY-MM-DD')} ${(stop.toTime !== '0000-00-00 00:00:00' && stop.toTime !== '')?moment(stop.toTime).format('HH:mm:ss'):'00:00:00'}`).format('YYYY-MM-DD HH:mm:ss'):''
		}
	}


	public async postLoad(req:any,auth:any):Promise<any>{
		const loadInfo = this.getLoadInfo(req.stops);
		const equipmentDetails = equipmentTypes.find((equip:any)=>{
			return  equip.value===req.equipmentType_Id;
		})
		// If data not mapped setting default to Flatbed, Van or Reefer
		const equipmentType= equipmentDetails ? (equipmentDetails.truckStops ? equipmentDetails.truckStops:17):17
		const data = {
			'customData': [
				{
					'key': 'LoadNumber',
					'value': req.coNumber
				},
				{
					'key': 'LoadId',
					'value': req.id
				}
			],
			'dimensional': {
				'length': loadInfo.length,
				'palletCount': loadInfo.palletCount,
				'pieceCount': loadInfo.pieceCount,
				'weight': loadInfo.weight,
			},
			'equipmentAttributes': {
				'equipmentOptions':  [
					2,
					3
				],
				'equipmentTypeId': equipmentType,
				'transportationModeId': 1 // full load
			},
			'loadActionAttributes': {
				'loadActionId': '4',
				'loadActionOption': 'PostOnly'
			},
			'loadNumber': req.coNumber.toString(),
			'loadReferenceNumbers': [req.referenceNumber.toString()],
			'loadStops': req.stops.map((stop: any) => {
				const dates = this.getFormatDate(stop)
				const stopData = this.getStopInfo(stop);
				const refNumbers = []
				if(stop.poNumber){
					refNumbers.push(stop.poNumber)
				}
				return {
					'contactName': stop.name ? stop.name : '',
					'contactPhone': stop.phone ? stop.phone.replace(/[^\d]/g, '') : '',
					'earlyDateTime': dates.earlyDateTime,
					'lateDateTime': dates.lateDateTime,
					'location': {
						'city': stop.city ? stop.city : '',
						'countryCode': 'USA',
						'latitude':stop.latitude,
						'locationName': stop.name ? stop.name : '',
						'longitude':stop.longitude,
						'postalCode': stop.zip ? stop.zip : '',
						'state': stop.state ? stop.state : '',
						'streetAddress1': stop.address1 ? stop.address1 : '',
						'streetAddress2': stop.address2 ? stop.address2 : ''
					},
					'referenceNumbers': refNumbers,
					'sequence': stop.stopNumber,
					'stopNotes': stopData.commodity ? stopData.commodity : '',
					'type': stop.stopType === 'Pickup' ? 1 : 2

				}
			}),
			'loadTrackingRequired': false,

			'note': req.specialInstruction ? req.specialInstruction : '',
			'rateAttributes': {
				'postedAllInRate': {
					'amount': req.loadAmount ? req.loadAmount : 0,
					'currencyCode': 'USD'
				},
				'tenderAllInRate': {
					'amount':  0,
					'currencyCode': 'USD'
				}
			}

		}

		return this.client.post(`/integrations/api/truckstop/load`,data,{
			headers:{
				'authorization': `Bearer ${auth}`
			}
		});

	}
	public async updatePostedLoad(req:any,auth:any):Promise<any>{
		const loadInfo = this.getLoadInfo(req.stops);

		const equipmentDetails = equipmentTypes.find((equip:any)=>{
			return  equip.value===req.equipmentType_Id;
		})
		// If data not mapped setting default to Flatbed, Van or Reefer
		const equipmentType= equipmentDetails ? (equipmentDetails.truckStops ? equipmentDetails.truckStops:17):17
		const data = {
			'customData': [
				{
					'key': 'LoadNumber',
					'value': req.coNumber
				},
				{
					'key': 'LoadId',
					'value': req.id
				}
			],
			'dimensional': {
				'length': loadInfo.length,
				'palletCount': loadInfo.palletCount,
				'pieceCount': loadInfo.pieceCount,
				'weight': loadInfo.weight
			},
			'equipmentAttributes': {
				'equipmentOptions': [
					2,
					3
				],
				'equipmentTypeId': equipmentType,
				'otherEquipmentNeeds': 'Pallet return',
				'transportationModeId': 1 // full load
			},
			'loadActionAttributes': {
				'loadActionId': '4',
				'loadActionOption': 'PostOnly'
			},
			'loadNumber': req.coNumber.toString(),
			'loadReferenceNumbers': [req.referenceNumber.toString()],
			'loadStops': req.stops.map((stop: any) => {
				const dates = this.getFormatDate(stop);
				const stopData = this.getStopInfo(stop);
				const refNumbers = []
				if(stop.poNumber){
					refNumbers.push(stop.poNumber)
				}
				return {
					'contactName': stop.name ? stop.name : '',
					'contactPhone': stop.phone ? stop.phone.replace(/[^\d]/g, '') : '',
					'earlyDateTime': dates.earlyDateTime,
					'lateDateTime': dates.lateDateTime,
					'location': {
						'city': stop.city ? stop.city : '',
						'countryCode': 'USA',
						'latitude':stop.latitude,
						'locationName': stop.name ? stop.name : '',
						'longitude':stop.longitude,
						'postalCode': stop.zip ? stop.zip : '',
						'state': stop.state ? stop.state : '',
						'streetAddress1': stop.address1 ? stop.address1 : '',
						'streetAddress2': stop.address2 ? stop.address2 : ''
					},
					'referenceNumbers': refNumbers,
					'sequence': stop.stopNumber,
					'stopNotes': stopData.commodity ? stopData.commodity : '',
					'type': stop.stopType === 'Pickup' ? 1 : 2

				}
			}),
			'loadTrackingRequired': false,
			'note': req.specialInstruction ? req.specialInstruction : '',
			'rateAttributes': {
				'postedAllInRate': {
					'amount': req.loadAmount? req.loadAmount : 0,
					'currencyCode': 'USD'
				},
				'tenderAllInRate': {
					'amount': 0,
					'currencyCode': 'USD'
				}
			}
		}

		return this.client.put(`/integrations/api/truckstop/load/${req.truckStopsLoadId}`, data, {
			headers: {
				'authorization': `Bearer ${auth}`
			}
		});

	}
	public async refreshPostedLoad(req:any,auth:any):Promise<any>{
		return this.client.post(`/integrations/api/truckstop/refreshLoads` ,req,	{
			headers:{
				'authorization': `Bearer ${auth}`
			}
		});

	}

	public async getLoad(req:any,auth:any):Promise<any>{
		return this.client.get(`/integrations/api/truckstop/getLoad/${req.loadPostingId}`,	{
			headers:{
				'authorization': `Bearer ${auth}`
			}
		});

	}

}