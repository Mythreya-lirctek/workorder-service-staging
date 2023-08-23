import express from 'express';
import { BaseController } from './base_controller';
import Ten99Service from '../service/ten99/ten99.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';
import AddressService from '../service/address/address.service';
import {ten99HTML} from '../service/pdf/templates/ten99.template';

class Ten99Controller extends BaseController {
	private ten99Service: Ten99Service;
	private pdfService: PDFService;
	private activityLogService: ActivityLogService;
	private addressService: AddressService;
	constructor() {
		super();
		this.ten99Service = new Ten99Service();
		this.pdfService = new PDFService();
		this.activityLogService = new ActivityLogService();
		this.addressService = new AddressService();
	}

	public async addTen99(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.companyId = user.companyId;

			if (req.body.payersAddress && !req.body.payersAddress_Id && req.body.payersAddress.zip) {
				req.body.payersAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.payersAddress);
				req.body.payersAddress_Id = mainingAddressResult.data.insertId;
			}				
			
			if (req.body.recepientsAddress && !req.body.recepientsAddress_Id && req.body.recepientsAddress.zip) {
				req.body.recepientsAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.recepientsAddress);
				req.body.recepientsAddress_Id = mainingAddressResult.data.insertId;
			}			
			
			const result = await this.ten99Service.addTen99(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'Ten99', 
				module_Id: result.data.insertId, 
				userId: user.id 
			});
			res.send(this.getSuccessResponse({ id: result.data.insertId }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async saveTen99(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		try {
			const {ten99Id} = req.params;
			
			const user= req.user as any;
			req.body.userId = user.id;
			
			req.body.ten99Id = 	ten99Id;
			req.body.companyId = user.companyId;

			if (req.body.payersAddress && req.body.payersAddress_Id && req.body.payersAddress.zip) {
				req.body.payersAddress.addressId = req.body.payersAddress_Id;
				req.body.payersAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.payersAddress);
			}
			
			if (req.body.payersAddress && !req.body.payersAddress_Id && req.body.payersAddress.zip) {
				req.body.payersAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.payersAddress);
				req.body.payersAddress_Id = mainingAddressResult.data.insertId;
			}				
			
			if (req.body.recepientsAddress && req.body.recepientsAddress_Id && req.body.recepientsAddress.zip) {
				req.body.recepientsAddress.addressId = req.body.recepientsAddress_Id;
				req.body.recepientsAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.saveAddress(req.body.recepientsAddress);
			}
			
			if (req.body.recepientsAddress && !req.body.recepientsAddress_Id && req.body.recepientsAddress.zip) {
				req.body.recepientsAddress.userId = user.id;
				const mainingAddressResult = await this.addressService.addAddress(req.body.recepientsAddress);
				req.body.recepientsAddress_Id = mainingAddressResult.data.insertId;
			}			
			
			const result = await this.ten99Service.saveTen99(req.body);
			const activity = await this.activityLogService.addActivityLog({ 
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'Ten99',
				module_Id: ten99Id,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async get1099HistoryNotCreated(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ten99Service.get1099HistoryNotCreated(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async get1099HistoryNotCreatedExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			const result = await this.ten99Service.get1099HistoryNotCreated(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLNotHistoryReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['recepientsName', 'type', 'year','grossAmount', 'dispatchFee'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('NotHistoryCreatedDetails.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async get1099Summary(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ten99Service.get1099Summary(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async print1099Details(req: express.Request, res: express.Response): Promise<any> {
		try {
			const test=req.body.data;
			const bulkData=[] ;
			let finalresult;
			for (const ten99 of test) {
				const user = req.user as any;
				ten99.companyId = user.companyId;
				ten99.isDeleted = 0;
				const  result =  await this.ten99Service.get1099History(ten99);
				bulkData.push(result.data[0]);

			}
				finalresult = await Promise.all(bulkData);
				const pdfResponse = await this.pdfService.generatePdf(ten99HTML(finalresult));
				pdfResponse.pipe(res);
			}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async get1099History(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ten99Service.get1099History(req.body);
			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords}));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async get1099Details(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ten99Service.get1099Details(req.body);
			res.send(this.getSuccessResponse(result.data[0]));
		}
		catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	
	public async get1099HistoryExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.ten99Service.get1099History(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLHistoryReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['recepientsName', 'payersName', 'type', 'year',
				'grossAmount', 'dispatchFee', 'isDeductDispatchFee', 'totalAmount'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('HistoryDetails.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	
	public async get1099SummaryExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;
			
			const result = await this.ten99Service.get1099Summary(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLSummaryReport(result.data[0]));
				pdfResponse.pipe(res);
			} else {
				const fields = ['settlementNumber', 'paidDate', 'grossAmount', 'DispatchFee'];
				const opts = { fields };
				const csv = parse(result.data[0], opts);
				res.attachment('SummaryDetails.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
	public async addBulkTen99(
		req: express.Request,
		res: express.Response
	): Promise<any> {
		const ten99s = req.body.ten99s as any;
		const user = req.user as any;
		try {
			for (const ten99 of ten99s) {
				ten99.userId = user.id;
				ten99.companyId = user.companyId;
				const ten99Details = await this.ten99Service.get1099Details({
							fromDate:`${ten99.year}-01-01`, 
							toDate:`${ten99.year}-12-31`,
							type: ten99.type, 
							type_Id: ten99.type_Id}) as any;
				ten99Details.data = ten99Details.data[0][0];
				ten99.payersAddress_Id = ten99Details.data.companyAddress_Id;
				ten99.payersName = ten99Details.data.payersName;
				ten99.payersStateTaxId = ten99Details.data.payersStateTaxId;
				ten99.payersTIN = ten99Details.data.payersTin;
				ten99.recepientsAddress_Id = ten99Details.data.address_Id;
				ten99.recepientsName = ten99Details.data.recepientsName;
				ten99.recepientsTIN = ten99Details.data.recepientsTin;
				const result = this.ten99Service.addTen99(ten99);
				const activity = this.activityLogService.addActivityLog({
																		description: JSON.stringify(req.body),
																		module: 'Ten99', 
																		module_Id: ten99.ten99Id, 				
																		userId: user.id 
																	});
			};
			res.send(this.getSuccessResponse({ result: 'Added Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	
}


const exportHTMLHistoryReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `1099 Created History Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>Recepients Name</td><td>Payers Name</td><td>Type</td><td>Year</td><td>Gross Amount</td><td>Dispatch Fee</td><td>isDeduct DispatchFee</td><td>Total Amount</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.recepientsName}</td><td>${item.payersName}</td><td>${item.type}</td><td>${item.year}</td><td>${item.grossAmount ? item.grossAmount : 0}</td><td>${item.dispatchFee ? item.dispatchFee : 0}</td><td>${item.isDeductDispatchFee}</td><td>${item.totalAmount ? item.totalAmount : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLNotHistoryReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `1099 Not Created History Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>Recepients Name</td><td>Type</td><td>Year</td><td>Gross Amount</td><td>Dispatch Fee</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.recepientsName}</td><td>${item.type}</td><td>${item.year}</td><td>${item.grossAmount ? item.grossAmount : 0}</td><td>${item.dispatchFee ? item.dispatchFee : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};

const exportHTMLSummaryReport = (result: any) => {
	let htmlString ='';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `1099 Summary Report<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>settlementNumber</td><td>paidDate</td><td>grossAmount</td><td>dispatchFee</td></tr>';
	
	for (const item of result) {
		htmlString += `<tr><td>${item.settlementNumber}</td><td>${item.paidDate}</td><td>${item.grossAmount ? item.grossAmount : 0}</td><td>${item.dispatchFee ? item.dispatchFee : 0}</td></tr>`;
	}
	
	htmlString += `</tr></table></body></html>`;
	
	return htmlString;
};
export default Ten99Controller;

