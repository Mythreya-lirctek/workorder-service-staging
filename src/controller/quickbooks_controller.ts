import express from 'express';
import { BaseController } from './base_controller';
import { QuickBooksService } from '../service/quickbooks/quickbooks.service';
import WOInvoiceService from '../service/woinvoice/woinvoice.service';
import ActivityLogService from '../service/activitylog/activitylog.service';
import moment from 'moment';
import CompanyService from '../service/checkhq/company.service';

class QuickbooksController extends BaseController {

	private quickBooksService: QuickBooksService;
	private woInvoiceService: WOInvoiceService;
	private activityLogService: ActivityLogService;
	private companyService:CompanyService

	constructor() {
		super();
		this.quickBooksService = new QuickBooksService();
		this.woInvoiceService = new WOInvoiceService();
		this.activityLogService = new ActivityLogService();
		this.companyService = new CompanyService()
	}

	public async getInvoicesAndSync(req: express.Request, res: express.Response): Promise<void> {
		try {

			const user = req.user as any;
			const userId = user.id;
			const requestBuilder = {
				'companyId' : user.companyId,
				'fromDate': moment().utc().subtract(1, 'days').format('YYYY-MM-DD'),
				'pageIndex': 0,
				'pageSize': 500,
				'toDate': moment().utc().format('YYYY-MM-DD')
			}

			const companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'invoice', 'quickbook', false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0
				&& companyIntegrationDetails.data[0].AccessToken
				&& companyIntegrationDetails.data[0].RefreshToken) {

				let accessToken = companyIntegrationDetails.data[0].AccessToken;
				let refreshToken = companyIntegrationDetails.data[0].RefreshToken;

				const tokenResult = await this.getAccessTokenFromRefreshToken(refreshToken, userId, companyIntegrationDetails.data[0].Id);

				if (tokenResult.accessToken && tokenResult.refreshToken){
					accessToken = tokenResult.accessToken
					refreshToken = tokenResult.refreshToken
				}

				const result = await this.woInvoiceService.getInvoiceToSyncToQuickBook(requestBuilder);
				if (result.data
					&& result.data.length > 0
					&& result.data[0]){
					const invoiceList = result.data[0]

					const invoiceData = [] as any;
					for(const invoice of invoiceList){

						const rateDetails = invoice.rateDetails ? JSON.parse(`[${invoice.rateDetails}]`) : [];

						const rateDetailsData = [] as any;
						for (const rateDetail of rateDetails){
							if (rateDetail.amount && rateDetail.misc) {
								rateDetailsData.push(
									{
										'Amount': rateDetail.amount,
										'DetailType': 'SalesItemLineDetail',
										'SalesItemLineDetail': {
											'ItemRef': {
												'name': rateDetail.misc
											},
											'Qty': rateDetail.units ? Math.floor(rateDetail.units) : 0
										}
									}
								)
							}
						}

						if (rateDetailsData.length > 0
							&& invoice.brokerInfo
							&& invoice.invoiceNumber
							&& invoice.id
							&& invoice.billingAddress1
							&& invoice.billingCity){

							invoiceData.push(
								{
									'customer': {
										'billingAddress': {
											'City': invoice.billingCity,
											'Country': null,
											'CountrySubDivisionCode': invoice.billingState,
											'Line1': `${invoice.billingAddress1}, ${invoice.billingAddress2}`,
											'PostalCode': invoice.billingZip
										},
										'displayName': invoice.brokerInfo,
										'givenName': invoice.brokerInfo,
										'notes': invoice.notes ? invoice.notes : null,
									},
									'invoice': {
										'DocNumber': invoice.invoiceNumber,
										'Line': rateDetailsData,
										'invoiceId': invoice.id,
									}
								}
							)

						}
					}

					const invoiceRequest = {
						'data' : invoiceData,
						'refresh_token': refreshToken,
						'token': accessToken
					}

					const invoiceResult = await this.quickBooksService.syncInvoices(invoiceRequest)
					if(invoiceResult.data && invoiceResult.data.data) {
						await this.updateInvoiceData(invoiceResult.data.data, userId)
						res.send(this.getSuccessResponse(invoiceResult.data));
					}else {
						if (Object.prototype.hasOwnProperty.call(result.response.data, 'error')) {
							res.status(406).send(result.response.data);
						} else {
							res.status(500).send(result.response.data);
						}
					}
				} else {
					res.status(200).send( { message : 'Invoice list is empty'} );
				}

			} else {
				res.status(200).send( { message : 'Please login to Quickbook'} );
			}

		} catch (error) {
			if (error.response.data){
				res.status(error.response.status).send(error.response.data);
			} else {
				res.status(500).send(this.getErrorResponse(error));
			}
		}
	}

	public async syncInvoices(req: express.Request, res: express.Response): Promise<void> {
		try{
			const user = req.user as any;
			const userId = user.id;

			const companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'invoice', 'quickbook', false);

			if(companyIntegrationDetails.data
				&& companyIntegrationDetails.data.length>0
				&& companyIntegrationDetails.data[0].AccessToken
				&& companyIntegrationDetails.data[0].RefreshToken) {

				req.body.token = companyIntegrationDetails.data[0].AccessToken;
				req.body.refresh_token = companyIntegrationDetails.data[0].RefreshToken;

				const tokenResult = await this.getAccessTokenFromRefreshToken(req.body.refresh_token, userId, companyIntegrationDetails.data[0].Id);

				if (tokenResult.accessToken && tokenResult.refreshToken){
					req.body.token = tokenResult.accessToken
					req.body.refresh_token = tokenResult.refreshToken
				}

				const result = await this.quickBooksService.syncInvoices(req.body)
				if(result.data && result.data.data) {
					await this.updateInvoiceData(result.data.data, userId)
					res.send(this.getSuccessResponse(result.data));
				}else {
					if (Object.prototype.hasOwnProperty.call(result.response.data, 'error')) {
						res.status(406).send(result.response.data);
					} else {
						res.status(500).send(result.response.data);
					}
				}

			} else {
				res.status(406).send( { message : 'Please login to Quickbook'} );
			}

		}catch(error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getAccessTokenFromRefreshToken(refreshToken : any, userId: any, id : any): Promise<any> {
		try {
			const result = await this.quickBooksService.getAccessTokenFromRefreshToken(refreshToken)
			if (result.data){
				const tokenType = result.data.token_type
				const accessToken = result.data.access_token
				const refreshTokenExpiresIn = result.data.x_refresh_token_expires_in
				const newRefreshToken = result.data.refresh_token
				const expiresOn = result.data.expires_in

				const response = {
					accessToken,
					expiresOn,
					integrationId: id,
					refreshToken : newRefreshToken,
					refreshTokenExpiresIn,
					tokenType,
					userId
				}

				await this.quickBooksService.updateAccessTokenForQuickBook(response)
				return response as any
			} else {
				const response = {
					message : 'Failed to get access token'
				}
				return response as any
			}
		} catch (error) {
			const response = {
				message : 'Unable To get access token please try again / Refresh has expired please login through web'
			}
			return response as any
		}
	}

	private async updateInvoiceData(invoiceData: any, userId: any): Promise<any> {
		for (const responseData of invoiceData){
			if (Object.prototype.hasOwnProperty.call(responseData, 'success')) {
				const invoiceId = responseData.success.invoice.invoiceId
				const quickBookId = responseData.success.invoice.quickBookId
				const request = {
					qbRefId: quickBookId,
					quickBookError: '',
					quickBookLastSyncedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
					userId,
					woInvoiceId: invoiceId,
				}
				await this.woInvoiceService.saveWOInvoice(request)
				this.activityLogService.addActivityLog({
					activityType: 'QuickBook Synced',
					description: JSON.stringify(request),
					module: 'WOinvoice',
					module_Id: invoiceId,
					userId,
				});
			}else if (Object.prototype.hasOwnProperty.call(responseData, 'error')) {
				const invoiceId = responseData.invoiceId
				const errorMessage = responseData.error[0].Message
				const request = {
					quickBookError: errorMessage,
					userId,
					woInvoiceId: invoiceId,
				}
				await this.woInvoiceService.saveWOInvoice(request)
				this.activityLogService.addActivityLog({
					activityType: 'QuickBook Sync Failed',
					description: JSON.stringify(request),
					module: 'WOinvoice',
					module_Id: invoiceId,
					userId,
				});
			}
		}
		return
	}
}

export default QuickbooksController;