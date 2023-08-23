import express from 'express';
import SearchFavouritesService from '../service/searchfavourites/searchfavourites.service';
import { BaseController } from './base_controller';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';

class SearchFavourites extends BaseController {
	private searchFavouritesService: SearchFavouritesService;
	private activityLogService: ActivityLogService;
	private pdfService: PDFService;
	constructor() {
		super();
		this.searchFavouritesService = new SearchFavouritesService();
		this.activityLogService = new ActivityLogService();
		this.pdfService = new PDFService();
	}

	public async getsearchFavouritesbyUserId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.searchFavouritesService.getsearchFavouritesbyUserId(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0]}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async validateFavourites(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			
			const result = await this.searchFavouritesService.validateFavourites(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async addSearchFavourites(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;     
			
			const result = await this.searchFavouritesService.addSearchFavourites(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'SearchFavourite',
				module_Id: result.data.insertId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveSearchFavourites(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;  
			
			const { searchFavouriteId } = req.params;
			req.body.searchFavouriteId = searchFavouriteId;
			
			const result = await this.searchFavouritesService.saveSearchFavourites(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'SearchFavourite',
				module_Id: searchFavouriteId,
				userId: req.body.userId,
			});
			res.send(this.getSuccessResponse({ result : 'Updated Successfully.' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
}

export default SearchFavourites;