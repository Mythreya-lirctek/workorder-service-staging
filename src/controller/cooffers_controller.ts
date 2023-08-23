import { BaseController } from './base_controller';
import express from 'express';
import CoOffersService from '../service/cooffers/cooffers.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import PDFService from '../service/pdf/pdf.service';
import EmailService from '../service/email/email.service';
import coQuotationHTML from '../service/pdf/templates/coquotation.temeplate';
import coQuotationEmailHTML from '../service/email/templates/quotation.email';
import moment from 'moment';
import NotificationService from '../service/notification/notification.service';
import { MobileModificationType, MobileNotificationsType } from '../service/notification/constants.notifications';
import counterOfferEmailHTML from '../service/email/templates/counteroffer.email';


class CoOffersController extends BaseController {
	private coOffersService: CoOffersService;
	private customerOrderService: CustomerOrderService;
	private pdfService: PDFService;
	private emailService: EmailService;
	private notificationService: NotificationService;
	constructor() {
		super();
		this.coOffersService = new CoOffersService();
		this.customerOrderService = new CustomerOrderService();
		this.pdfService = new PDFService();
		this.emailService = new EmailService();
		this.notificationService = new NotificationService();
	}

	public async addOffer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			const result = await this.coOffersService.addOffer(req.body);
			const coOfferId = result.data.insertId;
			if (req.body.conditions) {
				for (const condition of req.body.conditions) {
					condition.userId = user.id;
					condition.coOffer_Id = coOfferId;
					await this.coOffersService.addOfferConditions(condition);
				}
			}
			res.send(this.getSuccessResponse({ 'message': 'Added successfully', id: coOfferId }));

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async saveOffer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;
			req.body.coOfferId = req.body.id;

			const result = await this.coOffersService.saveOffer(req.body);

			if (req.body.conditions) {
				for (const condition of req.body.conditions) {
					condition.userId = user.id;
					condition.coOfferConditionId = condition.id;
					condition.coOffer_Id = req.body.coOfferId;

					if (condition.id) {
						await this.coOffersService.saveOfferConditions(condition);
					} else {
						await this.coOffersService.addOfferConditions(condition);
					}
				}
			}
			res.send(this.getSuccessResponse({ 'message': 'Updated successfully', id: req.body.coOfferId }));

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCoOfferDetailsByUserId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			const result = await this.coOffersService.getCoOfferDetailsByUserId(req.body);

			for (const offer of result.data[0]) {
				offer.offerConditions = (offer.offerConditions ? JSON.parse(`[ ${offer.offerConditions} ]`) : []);
			}

			res.send(this.getSuccessResponse(result.data[0]));

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCoOffersByCoId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			const { customerOrder_Id } = req.params;

			const result = await this.coOffersService.getCoOffersByCoId(customerOrder_Id);

			for (const offer of result.data[0]) {
				offer.offerConditions = (offer.offerConditions ? JSON.parse(`[ ${offer.offerConditions} ]`) : []);
			}

			res.send(this.getSuccessResponse(result.data[0]));

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCoOfferDetailsById(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { coOfferId } = req.params;

			let result = await this.coOffersService.getCoOfferDetailsById(coOfferId);

			result = result.data[0][0];
			result.offerConditions = (result.offerConditions ? JSON.parse(`[ ${result.offerConditions} ]`) : []);
			res.send(this.getSuccessResponse(result));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async getCoOfferedLoads(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			const result = await this.coOffersService.getCoOfferedLoads(req.body);

			res.send(this.getSuccessResponse({ data: result.data[0], totalRecords: result.data[1][0].totalRecords }));
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}
	public async sendQuotation(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			const quotationPdf = await this.generateQuotationPdf(req.body);
			let companyInfo = await this.customerOrderService.getCompanyInfoById(user.companyId);
			
			if (companyInfo.data.length > 0 && quotationPdf) {
				companyInfo = companyInfo.data[0];
				const logoUrl = (companyInfo.logoUrl ? `<img class="left fixedwidth" border="0" src="https://lircteksams.s3.amazonaws.com/${companyInfo.logoUrl}" alt="Logo" title="Logo"style="text-decoration: none; -ms-interpolation-mode: bicubic;border: none; width: auto; height: 60px; display: block;"></img>` : '')
				const fromEmail = req.body.from === 'company' ? companyInfo.email : req.body.userEmail;
				
				const bodyHtml = coQuotationEmailHTML({ ...companyInfo, body: req.body.body, logoUrl, subject: req.body.subject });
				
				if (req.body.emails) {
					const bodyBuffer = await quotationPdf.body();
					const message = {
						body: bodyHtml,
						buffers: bodyBuffer,
						emails: req.body.emails.split(';'),
						fileName: 'Quotation.pdf',
						fromEmail,
						subject: req.body.subject
					}
					this.emailService.emailservice(message);
					res.send(this.getSuccessResponse({ message: 'Email sent successfully', status: 'Success' }));
				}
			}
			else {
				res.status(500).send(this.getSuccessResponse({ message: 'Email not sent successfully', status: 'Failed' }));
			}
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async postToLoadBoard(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			for (const customerOrder of req.body.customerOrders) {
				if (req.body.isPostLB && req.body.isPostLBRestricted && req.body.carriers) {
					for (const carrier of req.body.carriers) {
						await this.coOffersService.addLoadBoardPostedCarrier({
							carrier_Id: carrier,
							customerOrder_Id: customerOrder.customerOrder_Id
						});
					}
				}

				await this.customerOrderService.saveCustomerOrder({
					customerOrderId: customerOrder.customerOrder_Id,
					isPostLB: req.body.isPostLB,
					isPostLBRestricted: req.body.isPostLBRestricted,
					postedDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
					postedUser_Id: user.id,
					userId: req.body.userId
				});

				const customerOrderInfo = await this.customerOrderService.getCustomerOrderInfoById(customerOrder.customerOrder_Id);
				
				if (customerOrderInfo.data.length > 0 && customerOrderInfo.data[0].length > 0) {
					await this.sendLoadPostedNotification(customerOrder, req.body.carriers, customerOrderInfo.data[0][0]);
				}
			}
			res.send(this.getSuccessResponse({ message: 'Update Successfully' }));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}
	public async getLoadBoardLoadPostedCarriers(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { customerOrder_Id } = req.params;

			const result = await this.coOffersService.getLoadBoardPostedCarrier(customerOrder_Id);
			res.send(this.getSuccessResponse(result));
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}


	public async sendCounterOffer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			await this.coOffersService.saveOffer(req.body);

			let companyInfo = await this.customerOrderService.getCompanyInfoById(user.companyId);
			let carrierEmailInfo = await this.coOffersService.getCarrierEmail(req.body.carrier_Id);
			let customerOrderInfo = await this.customerOrderService.getCustomerOrderInfoById(req.body.customerOrder_Id);

			if (companyInfo.data.length > 0 && carrierEmailInfo.data.length > 0 
				&& customerOrderInfo.data.length > 0 && customerOrderInfo.data[0].length > 0) {
				
				companyInfo = companyInfo.data[0];
				carrierEmailInfo = carrierEmailInfo.data[0];
				customerOrderInfo = customerOrderInfo.data[0][0];
				
				await this.sendCounterOfferNotification(req.body, customerOrderInfo);
				
				const logoUrl = (companyInfo.logoUrl ? `<img class="left fixedwidth" border="0" src="https://lircteksams.s3.amazonaws.com/${companyInfo.logoUrl}" alt="Logo" title="Logo"style="text-decoration: none; -ms-interpolation-mode: bicubic;border: none; width: auto; height: 60px; display: block;"></img>` : '')
				const fromEmail = companyInfo.email;
				const bodyHtml = counterOfferEmailHTML({ ...companyInfo, body: `Offered amount:  $${req.body.counterOfferAmount}`, logoUrl, subject: `Counter Offer(${customerOrderInfo.pickUp} - ${customerOrderInfo.delivery}) -Load# ${req.body.coNumber}` });
				
				if (carrierEmailInfo.email && fromEmail) {
					const message = {
						body: bodyHtml,
						emails: [carrierEmailInfo.email],
						fromEmail,
						subject: `Counter offer - Load # ${req.body.coNumber}`
					};
					await this.emailService.emailservice(message);
					res.send(this.getSuccessResponse({ message: 'Email sent successfully', status: 'Success' }));
				}
			} else {
				res.status(500).send(this.getSuccessResponse({ message: 'Email not sent successfully', status: 'Failed' }));
			}
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	public async acceptOffer(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.userId = user.id;

			await this.coOffersService.saveOffer(req.body);

			await this.coOffersService.inactivateOffers(req.body.customerOrder_Id, req.body.coOfferId);
			
			const customerOrderInfo = await this.customerOrderService.getCustomerOrderInfoById(req.body.customerOrder_Id);
			
			if (customerOrderInfo.data.length > 0 && customerOrderInfo.data[0].length > 0) {
				await this.sendLoadBoardOfferAcceptedNotification(req.body, customerOrderInfo.data[0][0]);
			}
			res.send({ message: 'Offer Accepted Successfully' });

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e));
		}
	}

	private async sendCounterOfferNotification(offer: any, customerOrderInfo: any): Promise<any> {
		
		const data = await this.notificationService.getDeviceTokensInfo({
			carrier_Id: offer.carrier_Id
		});

		if (data.data.length > 0 && data.data[0].length > 0) {
			const tokenInfo = data.data[0][0];

			await this.notificationService.sendPushNotification({
				body: `Offered amount:  $${offer.counterOfferAmount}`,
				driver_Id: 0,
				message: JSON.stringify(offer),
				modification_Type: MobileModificationType.LoadBoard_Loads_LoadCounterOffer.toString(),
				notification_Type: MobileNotificationsType.LoadBoard_Loads.toString(),
				role_Id: 17,
				sendType: tokenInfo.type,
				title: `Counter Offer(${customerOrderInfo.pickUp} - ${customerOrderInfo.delivery}) - Load# ${offer.coNumber}`,
				token: tokenInfo.token,
				type: tokenInfo.type
			});
		}
	}

	private async sendLoadBoardOfferAcceptedNotification(offer: any, customerOrderInfo: any): Promise<any> {
		const data = await this.notificationService.getDeviceTokensInfo({
			carrier_Id: offer.carrier_Id
		});

		const tokenInfos = [] as any;

		if (data.data.length > 0 && data.data[0].length > 0) {
			tokenInfos.push(data.data[0][0]);
			tokenInfos[0].active = true;
			tokenInfos[0].carrier_Id = offer.carrier_Id;
		}

		const inactiveOffers = await this.coOffersService.getInactiveOffers(offer.customerOrder_Id, offer.coOfferId);
		
		for (const inactiveOffer of inactiveOffers.data) {
			
			const tokenResult = await this.notificationService.getDeviceTokensInfo({
				carrier_Id: inactiveOffers.carrier_Id
			});

			if (tokenResult.data.length > 0 && tokenResult.data[0].length > 0) {
				tokenResult.data[0][0].coOfferId = inactiveOffer.coOfferId;
				tokenResult.data[0][0].carrier_Id = offer.carrier_Id;
				tokenInfos.push(tokenResult.data[0][0]);
			}
		}

		for (const tokenInfo of tokenInfos) {
			const loadInfo = offer;

			if (tokenInfo.carrier_Id) {
				if (!tokenInfo.active) {
					loadInfo.coOfferId = tokenInfo.coOfferId;
					loadInfo.carrier_Id = tokenInfo.carrier_Id;
				}

				await this.notificationService.sendPushNotification({
					body: `Amount: $${offer.offeredAmount}`,
					driver_Id: 0,
					message: JSON.stringify(loadInfo),
					modification_Type: tokenInfo.active ? MobileModificationType.LoadBoard_Loads_LoadAccepted.toString()
						: MobileModificationType.LoadBoard_Loads_LoadInactive.toString(),
					notification_Type: MobileNotificationsType.LoadBoard_Loads.toString(),
					role_Id: 17,
					sendType: tokenInfo.type,
					title: `${tokenInfo.active ? 'Offer Accepted' : 'Offer declined'}(${customerOrderInfo.pickUp} - ${customerOrderInfo.delivery}) - Load# ${offer.coNumber}`,
					token: tokenInfo.token,
					type: tokenInfo.type
				});
			}
		}

	}

	private async sendLoadPostedNotification(req: any, carriers: any, customerOrderInfo: any): Promise<any> {

		let tokenInfos = carriers.length !== 0 ? [] : await this.notificationService.getCarrierUserTokens()
		
		if (tokenInfos.data) {
			tokenInfos = tokenInfos.data;
		}

		for (const carrier of carriers) {
			const data = await this.notificationService.getDeviceTokensInfo({
				carrier_Id: carrier
			});

			if (data.data.length > 0 && data.data[0].length > 0) {
				data.data[0][0].carrier_Id = carrier;
				tokenInfos.push(data.data[0][0]);
			}
		}

		for (const tokenInfo of tokenInfos) {
			const loadInfo = req;
			if (tokenInfo.carrier_Id) {
				loadInfo.carrier_Id = tokenInfo.carrier_Id;
				await this.notificationService.sendPushNotification({
					body: `${customerOrderInfo.pickupFromDate} - ${customerOrderInfo.deliveryFromDate}`,
					driver_Id: 0,
					message: JSON.stringify(loadInfo),
					modification_Type: MobileModificationType.LoadBoard_Loads_LoadPosted.toString(),
					notification_Type: MobileNotificationsType.LoadBoard_Loads.toString(),
					role_Id: 17,
					sendType: tokenInfo.type,
					title: `New load (${customerOrderInfo.pickUp} - ${customerOrderInfo.delivery}) - Load# ${req.coNumber}`,
					token: tokenInfo.token,
					type: tokenInfo.type
				});
			}
		}
	}

	private async generateQuotationPdf(req: any): Promise<any> {
		const result = {} as any;
		const coRateDetails = await this.customerOrderService.getCORateConPrintDetails(req);
		result.rateCon = coRateDetails.data[0][0];
		result.lineItems = [];

		if (result.rateCon.carrierId > 0) {
			if (req.coRelay_Id) {
				const coCarrierLineItemsByRelayId = await this.customerOrderService.getCOCarrierlineitemsByRelayId(req);
				result.lineItems = coCarrierLineItemsByRelayId.data[0];
			} else {
				const coCarrierLineItemsByCoId = await this.customerOrderService.getCOCarrierlineitemsByCOId(req);
				result.lineItems = coCarrierLineItemsByCoId.data[0];
			}
		}

		if (req.coRelay_Id) {
			const coCarrierLineItemsByRelayId = await this.customerOrderService.getCOStopsByRelayId(req);
			const stopResult = coCarrierLineItemsByRelayId.data[0];
			for (const stop of stopResult) {
				try {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
				} catch (e) {
					stop.stopItems = [];
				}
			}
			result.stops = stopResult;
		} else {
			const coCarrierLineItemsByCoId = await this.customerOrderService.getCOStopsByCOId(req.co_Id);
			const stopResult = coCarrierLineItemsByCoId.data[0];
			for (const stop of stopResult) {
				try {
					stop.stopItems = (stop.stopItems ? JSON.parse(`[${stop.stopItems}]`) : []);
				} catch (e) {
					stop.stopItems = [];
				}
			}
			result.stops = stopResult;
		}

		if (result.lineItems.length > 0) {
			const flatfee = result.lineItems.filter((item: any) => {
				return (item.name === 'Flat/Line Haul');
			});

			if (flatfee && flatfee.amount > 0 && result.rateCon.dispatchPCT > 0) {
				result.lineItems.push({
					amount: parseFloat((flatfee.amount * result.rateCon.dispatchPCT / 100).toFixed(2)),
					name: 'DispatchFee',
					per: result.rateCon.dispatchPCT,
					units: null
				});
			}
		}
		const rateConfirmation = coQuotationHTML(result);
		const pdfResponse = await this.pdfService.generatePdf(rateConfirmation);

		return pdfResponse;
	}

}
export default CoOffersController;