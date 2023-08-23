import {BaseController} from './base_controller';
import {DatService} from '../service/dat/dat.service';
import {TruckStopsService} from '../service/truckstops/truckstops.service';
import CompanyService from '../service/checkhq/company.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import express from 'express';
import COStopService from '../service/costop/costop.service';

export default class LoadBoardController extends BaseController {
	private datService:DatService;
	private truckStopsService:TruckStopsService;
	private companyService:CompanyService
	private customerOrderService: CustomerOrderService;
	private coStopService: COStopService;
	constructor() {
		super();
		this.customerOrderService = new CustomerOrderService();
		this.datService= new DatService();
		this.truckStopsService= new TruckStopsService();
		this.companyService= new CompanyService();
		this.coStopService = new COStopService();
	}

	public async deletePostedLoad(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		req.body.userId = user.id;
		try{
			const auth =  await this.getAuthInfo(req.body)
			let responseData:any
			if(auth){

				if(req.body.postTo==='DAT'){
					const response= await this.datService.deleteLoad(req.body.loadPostingId,auth)
					responseData=response.data
					await this.customerOrderService.saveCustomerOrder({
						customerOrderId:req.body.co_Id,
						datLoadId:null,
						userId:user.id
					});
				}
				else {
					const response= await this.truckStopsService.deleteLoad(req.body.loadPostingId,auth)
					responseData=response.data
					await this.customerOrderService.saveCustomerOrder({
						customerOrderId:req.body.co_Id,
						truckStopsLoadId:null,
						userId:user.id
					});
				}
				await this.customerOrderService.addLoadBoardLogs({
					activityType:'Deleted',
					company_Id:user.companyId,
					customerOrder_Id:req.body.co_Id,
					loadBordLoadId:req.body.loadPostingId,
					loadType:req.body.postTo,
					success:1,
					userId:user.id
				});
				res.send(this.getSuccessResponse({message: `Load Deleted successfully to ${req.body.postTo}` , status: 'Success',data:responseData}));
			}
			else {
				res.status(500).send({message:`Unable to delete in ${req.body.postTo} Please verify integration`});
			}
		}
		catch (error) {
			if(error.response){
				await this.customerOrderService.addLoadBoardLogs({
					activityType:'Deleting',
					company_Id:user.companyId,
					customerOrder_Id:req.body.co_Id,
					error:JSON.stringify(error.response.data),
					loadBordLoadId:req.body.loadPostingId,
					loadType:req.body.postTo,
					success:0,
					userId:user.id
				});
				res.status(406).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async getAuthInfo(req:any):Promise<any>{
		if(req.postTo==='DAT'){
			return `Bearer ${req.accessToken}`
		}
		else {
			return req.accessToken
		}
	}

	public async getLoadBoardReport(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const reports =  await this.customerOrderService.getLoadBoardReport(req.body);
			res.send(this.getSuccessResponse({ data: reports.data[0], totalRecords: reports.data[1][0].totalRecords}));

		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async updatePostedLoads(req: express.Request, res: express.Response): Promise<any> {
		try{
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			const auth =  await this.getAuthInfo(req.body)
			const responseData=[] as any
			if(auth){
				for (const load of req.body.loads){
					load.coId=load.co_Id;
					load.userId= user.id;
					load.companyId=user.companyId;
					const legs = [] as any;
					let result = await this.customerOrderService.getCOdetailsbyCOId(load);
					result = result.data;
					try {
						const stopsResult = await this.coStopService.getCOStopsByCOId(load.co_Id)
						result[0][0].stops = stopsResult.data[0]
						for (const stop of result[0][0].stops) {
							stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						}
					} catch(e) {
						result[0][0].stops = [];
					}
					const customerOrder = result[0][0];
					if(req.body.postTo==='DAT'){
						try{
							const response= await this.datService.updatePostedLoad(customerOrder,auth)
							responseData.push({id:response.data.id,co_Id:load.co_Id})
							await this.customerOrderService.addLoadBoardLogs({
								activityType:'Updated',
								company_Id:user.companyId,
								customerOrder_Id:load.co_Id,
								loadBordLoadId:customerOrder.datLoadId,
								loadType:'DAT',
								success:1,
								userId:user.id
							})
						}
						catch (e){

							if(e.response){
								responseData.push({error:e.response.data,co_Id:load.co_Id})
								this.customerOrderService.addLoadBoardLogs({
									activityType:'Updating',
									company_Id:user.companyId,
									customerOrder_Id:load.co_Id,
									error:JSON.stringify(e.response.data),
									loadBordLoadId:customerOrder.datLoadId,
									loadType:'TruckStops',
									success:0,
									userId:user.id
								})
							} else {
								responseData.push({error:`Unknown Error ${e.message}`,co_Id:load.co_Id})
							}
						}
					}
					else {
						try{
							const response= await this.truckStopsService.updatePostedLoad(customerOrder,auth)
							responseData.push({id:response.data.loadId,co_Id:load.co_Id})
							await this.customerOrderService.addLoadBoardLogs({
								activityType:'Updated',
								company_Id:user.companyId,
								customerOrder_Id:load.co_Id,
								loadBordLoadId:customerOrder.truckStopsLoadId,
								loadType:'DAT',
								success:1,
								userId:user.id
							})
						}
						catch (e){
							if(e.response){
								this.customerOrderService.addLoadBoardLogs({
									activityType:'Updating',
									company_Id:user.companyId,
									customerOrder_Id:load.co_Id,
									error:JSON.stringify(e.response.data),
									loadBordLoadId:customerOrder.truckStopsLoadId,
									loadType:'TruckStops',
									success:0,
									userId:user.id
								})
								responseData.push({error:e.response.data,co_Id:load.co_Id})
							} else {
								responseData.push({error:`Unknown Error ${e.message}`,co_Id:load.co_Id})
							}
						}
					}
				}
				res.send(this.getSuccessResponse({message: `Load Post successfully to ${req.body.postTo}` , status: 'Success',data:responseData}));
			}
			else {
				res.status(500).send({message:`Unable to post to ${req.body.postTo} Please verify integration`});
			}
		}
		catch (error) {
			if(error.response){
				res.status(406).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async refreshPostedLoads(req: express.Request, res: express.Response): Promise<any> {
		const user = req.user as any;
		req.body.companyId = user.companyId;
		req.body.userId = user.id;
		try{
			const auth =  await this.getAuthInfo(req.body)
			let responseData:any
			if(auth){

				if(req.body.postTo==='DAT'){
					const loadPostingIds =  req.body.loads.map((load:any)=>{
						return load.loadPostingId;
					});
					const response= await this.datService.refreshPostedLoad(loadPostingIds,auth)
					responseData=response.data
				}
				else {
					const loadPostingIds =  req.body.loads.map((load:any)=>{
						return {
							'loadId': load.loadPostingId
						};
					});
					const response= await this.truckStopsService.refreshPostedLoad(loadPostingIds,auth)
					responseData=response.data
				}
				for(const load of req.body.loads){
					await this.customerOrderService.addLoadBoardLogs({
						activityType:'Refreshed',
						company_Id:user.companyId,
						customerOrder_Id:load.co_Id,
						loadBordLoadId:load.loadPostingId,
						loadType:req.body.postTo,
						success:1,
						userId:user.id
					})
				}
				res.send(this.getSuccessResponse({message: `Load Post successfully to ${req.body.postTo}` , status: 'Success',data:responseData}));
			}
			else {
				res.status(500).send({message:`Unable to post to ${req.body.postTo} Please verify integration`});
			}
		}
		catch (error) {
			if(error.response){
				for(const load of req.body.loads){
					await this.customerOrderService.addLoadBoardLogs({
						activityType:'Refreshing',
						company_Id:user.companyId,
						customerOrder_Id:load.co_Id,
						error:JSON.stringify(error.response.data),
						loadBordLoadId:load.loadPostingId,
						loadType:req.body.postTo,
						success:0,
						userId:user.id
					})
				}
				res.status(406).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}
	public async validateLoadPosting(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {co_Id}=req.params
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			req.body.coId=co_Id;
			let result = await this.customerOrderService.getCOdetailsbyCOId(req.body);
			result = result.data;
			try {
				const stopsResult = await this.coStopService.getCOStopsByCOId(req.body.coId)
				result[0][0].stops = stopsResult.data[0]
				for (const stop of result[0][0].stops) {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
				}
			} catch(e) {
				result[0][0].stops = [];
			}
			const customerOrder = result[0][0];
			const  dat = this.datService.validateLoad(customerOrder)
			const  truckstops = this.truckStopsService.validateLoad(customerOrder)
			res.status(200).send({dat,truckstops})
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async postLoads(req: express.Request, res: express.Response): Promise<any> {
		try{
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			const auth =  await this.getAuthInfo(req.body)
			const responseData=[] as any
			if(auth){
				for (const load of req.body.loads){
					load.coId=load.co_Id;
					load.userId= user.id;
					load.companyId=user.companyId;
					let result = await this.customerOrderService.getCOdetailsbyCOId(load);
					result = result.data;
					try {
						const stopsResult = await this.coStopService.getCOStopsByCOId(load.co_Id)
						result[0][0].stops = stopsResult.data[0]
						for (const stop of result[0][0].stops) {
							stop.stopItems = (stop.stopItems ? JSON.parse(`[ ${stop.stopItems} ]`) : []);
						}
					} catch(e) {
						result[0][0].stops = [];
					}
					const customerOrder = result[0][0];
					if(req.body.postTo==='DAT'){
						try{
							const response= await this.datService.postLoad(customerOrder,auth)
							await this.customerOrderService.saveCustomerOrder({
								customerOrderId:load.coId,
								datLoadId:response.data.id,
								userId:user.id
							})
							await this.customerOrderService.addLoadBoardLogs({
								activityType:'Posted',
								company_Id:user.companyId,
								customerOrder_Id:load.coId,
								loadBordLoadId:response.data.id,
								loadType:'DAT',
								success:1,
								userId:user.id
							})
							responseData.push({id:response.data.id,co_Id:load.co_Id})
						}
						catch (e){
							if(e.response){
								this.customerOrderService.addLoadBoardLogs({
									company_Id:user.companyId,
									customerOrder_Id:load.coId,
									error:JSON.stringify(e.response.data),
									loadType:'DAT',
									success:0,
									userId:user.id
								})
								responseData.push({error:e.response.data,co_Id:load.co_Id})
							} else {
								responseData.push({error:`Unknown Error ${e.message}`,co_Id:load.co_Id})
							}
						}
					}
					else {
						try{
							const response= await this.truckStopsService.postLoad(customerOrder,auth)
							await this.customerOrderService.saveCustomerOrder({
								customerOrderId:load.coId,
								truckStopsLoadId:response.data.loadId,
								userId:user.id
							})
							await this.customerOrderService.addLoadBoardLogs({
								activityType:'Posted',
								company_Id:user.companyId,
								customerOrder_Id:load.coId,
								loadBordLoadId:response.data.loadId,
								loadType:'TruckStops',
								success:1,
								userId:user.id
							})
							responseData.push({id:response.data.loadId,co_Id:load.co_Id})
						}
						catch (e){
							if(e.response){
								this.customerOrderService.addLoadBoardLogs({
									activityType:'Posting',
									company_Id:user.companyId,
									customerOrder_Id:load.coId,
									error:JSON.stringify(e.response.data),
									loadType:'TruckStops',
									success:0,
									userId:user.id
								})
								responseData.push({error:e.response.data,co_Id:load.co_Id})
							} else {
								responseData.push({error:`Unknown Error ${e.message}`,co_Id:load.co_Id})
							}
						}
					}
				}
				res.send(this.getSuccessResponse({message: `Load Post successfully to ${req.body.postTo}` , status: 'Success',data:responseData}));
			}
			else {
				res.status(500).send({message:`Unable to post to ${req.body.postTo} Please verify integration`});
			}
		}
		catch (error) {
			if(error.response){
				res.status(406).send(error.response.data)
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

}