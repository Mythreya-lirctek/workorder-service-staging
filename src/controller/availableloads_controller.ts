import express from 'express';
import { BaseController } from './base_controller';
import AvailableLoadsService from '../service/availableloads/availableloads.service';
import WorkorderService from '../service/workorder/workorder.service';

class AvailableLoadsController extends BaseController {
	private availableLoadsService: AvailableLoadsService;
	private workorderService: WorkorderService;

	constructor() {
		super();
		this.availableLoadsService = new AvailableLoadsService();
		this.workorderService = new WorkorderService();
	}

	public async getAvailableLoads(req: express.Request, res: express.Response): Promise<any> {
		
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.availableLoadsService.getAvailableLoads(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async addALSplits(req: express.Request, res: express.Response): Promise<any> {
		
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			const aLoad = await this.availableLoadsService.getALById(req.body);

			const { data: alNumbers } = await this.availableLoadsService.getALNumbers(req.body.al_Id);

			let pCount = 0
			if(alNumbers.length ){
				alNumbers.forEach((element: any) => {
					if(element?.alNumber && element.alNumber[element.alNumber.length - 1] === 'P') {
						pCount += 1
					}
				});
			}
	
			if(aLoad.data.length > 0) {
				const newAL = aLoad.data[0];
	
				newAL.pallets = req.body.pallets;
				newAL.pieceCount = req.body.pieceCount;
				newAL.weight = req.body.weight;
				newAL.alNumber = `${newAL.alNumber}-${pCount ? pCount + 1 : '1'}P`;
				newAL.parentAvailableloads_Id = req.body.al_Id;
				newAL.origin_Id = newAL.origin_Id;
				newAL.destination_Id = newAL.destination_Id;
				newAL.workOrder_Id = newAL.workOrder_Id;
				newAL.dispatchOrder_Id = null; 
				newAL.userId = req.body.userId;

				await this.availableLoadsService.addAvailableLoad(newAL);
				
				const availableLoad = { 
					availableLoad_Id: req.body.al_Id,
					pallets: req.body.oldALPallets,			
					parentDestination_Id: newAL.destination_Id,
					parentOrigin_Id: newAL.origin_Id,
					pieceCount: req.body.oldALPieceCount,	
					userId: req.body.userId,
					weight: req.body.oldALWeight
				}

				await this.workorderService.saveAvailableLoad(availableLoad);
				
				res.send(this.getSuccessResponse({result: 'Split Added Successfully!' }));
			}
			

		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async mergeALs(req: express.Request, res: express.Response): Promise<any> {
		
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;
			
			const availableLoad = { 
				availableLoad_Id: req.body.al_Id,
				length: req.body.length,
				pallets: req.body.pallets,
				pieceCount: req.body.pieceCount,		
				userId: req.body.userId,
				weight: req.body.weight,
			}

			await this.workorderService.saveAvailableLoad(availableLoad);

			for (const item of req.body.deleteALIds) {
				await this.availableLoadsService.deleteAvailableLoad(item);
			}
			res.send(this.getSuccessResponse({result: 'Merged Successfully!' }));
			
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async deleteTerminal(req: express.Request, res: express.Response): Promise<any> {
		
		try {
			for (const item of req.body.deleteALIds) {
				await this.availableLoadsService.deleteTerminal(req.body.al_Id,item);
			}
			res.send(this.getSuccessResponse({result: 'Deleted Successfully!' }));
			
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getStopsforAvailableLoads(req: express.Request, res: express.Response): Promise<any> {
		
		try {
			const result = await this.availableLoadsService.getStopsforAvailableLoads(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async saveAvailableLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const {availableLoad_Id} = req.params;

			const user = req.user as any;
			req.body.userId = user.id;
			req.body.availableLoad_Id = availableLoad_Id;

			const resultt = await this.workorderService.saveAvailableLoad(req.body);
			res.send(this.getSuccessResponse({result: 'updated successfully'}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async addAvailableLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.availableLoadsService.addAvailableLoad(req.body);
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async deleteAvailableLoad(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			
			const result = await this.availableLoadsService.deleteAvailableLoad(req.body.al_Id);
			res.send(this.getSuccessResponse({ result: 'Deleted Successfully. '}));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getALsByDOId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.availableLoadsService.getALsByDOId(req.body.doId);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getALItemsbywostopsId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const result = await this.availableLoadsService.getALItemsbywostopsId(req.body.woStop_Id);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}

export default AvailableLoadsController;