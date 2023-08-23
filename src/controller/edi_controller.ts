import express from 'express';
import { BaseController } from './base_controller';
import EdiService from '../service/edi/edi.service';
import PDFService from '../service/pdf/pdf.service';
import { parse } from 'json2csv';
import ActivityLogService from '../service/activitylog/activitylog.service';
import moment from 'moment';
import { diff } from 'deep-object-diff';
import WorkorderService from '../service/workorder/workorder.service';
import WOStopService from '../service/wostop/wostop.service';
import ContactService from '../service/contact/contact.service';
import WOStopItemService from '../service/wostopitem/wostopitem.service';
import RateDetailService from '../service/ratedetail/ratedetail.service';
import { SQS_QUEUES } from '../service/sqs/sqs.constants';
import DOStopsService from '../service/dostop/dostop.service';
import AddressService from '../service/address/address.service';
import DispatchOrderService from '../service/dispatchorder/dispatchorder.service';
import DriverLineItemService from '../service/driverlineitem/driverlineitem.service';
import OwnerOpLineItemService from '../service/owneroplineitem/owneroplineitem.service';
import CarrierLineItemService from '../service/carrierlineitem/carrierlineitem.service';
import MilesService from '../service/miles/miles.service';
import { SQSService } from '../service/sqs/sqs.service';
import WayPointService from '../service/waypoint/waypoint.service';
import CustomerOrderService from '../service/customerorder/customerorder.service';
import CORateDetailService from '../service/coratedetail/coratedetail.service';
import COCarrierLineItemService from '../service/cocarrierlineitem/cocarrierlineitem.service';
import COStopItemService from '../service/costopitem/costopitem.service';
import COStopService from '../service/costop/costop.service';
import CompanyService from '../service/checkhq/company.service';
import { SamsaraService } from '../service/samsara/samsara.service';
import tz from 'moment-timezone';

class EdiController extends BaseController {
	private ediService: EdiService;
	private pdfService: PDFService;
	private activityLogService: ActivityLogService;
	private workorderService: WorkorderService
	private rateDetailService: RateDetailService;
	private woStopService: WOStopService;
	private contactService: ContactService;
	private woStopItemService: WOStopItemService;
	private doStopsService: DOStopsService;
	private addressService: AddressService;
	private dispatchOrderService: DispatchOrderService
	private driverLineItemService: DriverLineItemService;
	private carrierLineItemService: CarrierLineItemService;
	private ownerOpLineItemService: OwnerOpLineItemService;
	private milesService: MilesService;
	private sqsService: SQSService;
	private wayPointService: WayPointService;
	private coRateDetailService: CORateDetailService;
	private customerOrderService: CustomerOrderService;
	private coCarrierLineItemService: COCarrierLineItemService;
	private coStopItemService: COStopItemService;
	private coStopService: COStopService;
	private companyService: CompanyService;
	private samsaraService: SamsaraService;

	constructor() {
		super();
		this.ediService = new EdiService();
		this.pdfService = new PDFService();
		this.activityLogService = new ActivityLogService();
		this.workorderService = new WorkorderService();
		this.rateDetailService = new RateDetailService();
		this.woStopService = new WOStopService();
		this.contactService = new ContactService();
		this.woStopItemService = new WOStopItemService();
		this.doStopsService = new DOStopsService();
		this.addressService = new AddressService();
		this.dispatchOrderService = new DispatchOrderService();
		this.driverLineItemService = new DriverLineItemService();
		this.ownerOpLineItemService = new OwnerOpLineItemService();
		this.carrierLineItemService = new CarrierLineItemService();
		this.milesService = new MilesService();
		this.sqsService = new SQSService();
		this.wayPointService = new WayPointService();
		this.customerOrderService = new CustomerOrderService();
		this.coRateDetailService = new CORateDetailService();
		this.coCarrierLineItemService = new COCarrierLineItemService();
		this.coStopItemService = new COStopItemService();
		this.coStopService = new COStopService();
		this.companyService = new CompanyService();
		this.samsaraService = new SamsaraService();
	}

	public async getEdiSendStatusLog(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { loadTenderId } = req.params;
			const result = await this.ediService.getEdiSendStatusLog(Number(loadTenderId));
			res.send(this.getSuccessResponse({
				data: result.data[0],
				totalRecords: result.data[0].length
			}));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getLoadTendersListByCompanyId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ediService.getLoadTendersListByCompanyId(req.body);
			if (result.data[0].length > 0) {
				for (let i = 0; i < result.data[0].length; i++) {
					result.data[0][i].rateDetails = result.data[0][i].rateDetails ? JSON.parse(`[${result.data[0][i].rateDetails}]`) : [];
					result.data[0][i].referenceNums = result.data[0][i].referenceNums ? JSON.parse(`[${result.data[0][i].referenceNums}]`) : [];
					result.data[0][i].stops = result.data[0][i].stops ? JSON.parse(`[${result.data[0][i].stops}]`) : [];
					result.data[0][i].missingFields = result.data[0][i].missingFields ? JSON.parse(`${result.data[0][i].missingFields}`) : [];
				}
				res.send(this.getSuccessResponse({
					data: result.data[0],
					totalRecords: result.data[1][0].totalRecords
				}));
			} else {
				res.send(this.getSuccessResponse({
					data: result.data[0],
					totalRecords: 0
				}));
			}

		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getStopDetailsByLoadTenderId(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ediService.getStopDetailsByLoadTenderId(req.body.loadtenderId);
			if (result.data[0].length > 0) {
				for (let i = 0; i < result.data[0].length; i++) {
					result.data[0][i].referenceNums = result.data[0][i].referenceNums ? JSON.parse(`[${result.data[0][i].referenceNums}]`) : []
					result.data[0][i].missingFields = result.data[0][i].missingFields ? JSON.parse(`${result.data[0][i].missingFields}`) : []
					result.data[0][i].stopItems = result.data[0][i].stopItems ? JSON.parse(`[${result.data[0][i].stopItems}]`) : []
				}
				res.send(this.getSuccessResponse({
					data: result.data[0],
					totalRecords: result.data[0].length
				}));
			} else {
				res.send(this.getSuccessResponse({
					data: result.data[0],
					totalRecords: 0
				}));
			}

		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getLoadTendersListByCompanyIdExportAll(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.pageSize = 10000;

			const result = await this.ediService.getLoadTendersListByCompanyId(req.body);
			if (req.body.exportType === 'pdf') {
				const pdfResponse = await this.pdfService.generatePdf(exportHTMLLoadTenders(result.data[0]));
				pdfResponse.pipe(res);
			} else {

				const fields = ['billTo', 'shipmentId', 'fromAddress', 'toAddress', 'pickupDate', 'deliveryDate', 'totalCharge',
					'respondBy', 'status', 'coNumber', 'workOrderNumber', 'loadStatus'];

				const opts = { fields };
				let finalResult = {} as any;
				finalResult = result.data[0];

				for (let x = 0; x < finalResult.length; x++) {
					finalResult[x].actions = finalResult[x].status === 'Accept' ||
						finalResult[x].status === 'Decline' ? 'Log Send Status' : finalResult[x].status === 'Update' ||
							finalResult[x].status === 'Reject' ? 'Accept Reject Log Send Status Send Status Log' : null;
				}

				const csv = parse(finalResult, opts);
				res.attachment('Load Tenders.csv');
				res.status(200).send(csv);
			}
		} catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}

	}


	public async getUnopenedLTs(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			const result = await this.ediService.getUnopenedLTs(req.body);
			res.send(this.getSuccessResponse(result.data[0][0]));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getLoadTendersUpdateLog(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { loadTenderId } = req.params;
			const result = await this.ediService.getLoadTendersUpdateLog(loadTenderId);
			const response = [];
			for (const item of result.data[0]) {
				item.changes = (item.changes ? JSON.parse(`[ ${item.changes} ]`) : []);
				item.tenderData = (item.tenderData ? JSON.parse(`[ ${item.tenderData} ]`) : []);
				response.push(item);
			}
			res.send(this.getSuccessResponse(response));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async getLoadTenderRawData(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { loadTenderId } = req.params;
			const result = await this.ediService.getLoadTenderRawData(loadTenderId);
			const responseResult = {} as any
			// tslint:disable-next-line:prefer-conditional-expression
			if (result.data && result.data.length > 0 && result.data[0] && result.data[0][0] && result.data[0][0].tenderData) {
				responseResult.createdAt = result.data[0][0].createdAt;
				responseResult.loadTender_Id = result.data[0][0].loadTender_Id;
				responseResult.tenderData = (result.data[0][0].tenderData ? JSON.parse(`[ ${result.data[0][0].tenderData} ]`) : []);
			} else {
				responseResult.createdAt = null;
				responseResult.loadTender_Id = loadTenderId;
				responseResult.tenderData = [];
			}
			res.send({ rawData: responseResult });
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async updateLoadTender(req: express.Request, res: express.Response): Promise<any> {
		try {
			const { loadTenderId } = req.params;

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;
			req.body.loadTenderId = loadTenderId;

			await this.ediService.updateLoadTender(req.body);
			await this.activityLogService.addActivityLog({
				activityType: req.body.activityType ? req.body.activityType : '',
				description: JSON.stringify(req.body),
				module: 'EDI Load Tender',
				module_Id: loadTenderId,
				userId: user.id,
			});
			res.send(this.getSuccessResponse({ result: 'Updated Succesfully' }));
		}
		catch (error) {
			res.status(500).send(this.getErrorResponse(error));
		}
	}

	public async sendLoadTenderResponse(req: express.Request, res: express.Response): Promise<any> {
		try {

			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			let refnumsstr = '';
			const refnums = req.body.refNums;
			for (const reference of refnums) {
				refnumsstr += `<referenceNum><type>${reference.referenceType}</type><value>${reference.referenceValue}</value></referenceNum>`
			}

			const queryData = await this.ediService.getEdiCustomerIdAndPassword(Number(req.body.companyId))
			if (queryData.data && queryData.data.length > 0) {
				const request = `<sendLoadTenderResponsesRequest><auth><custId>${queryData.data[0].EDICustId}</custId><pwd>${queryData.data[0].EDIPassword}</pwd></auth>
					<loadTenderResponses><loadTenderResponse><tradingPartnerId>${req.body.tradingPartnerId}</tradingPartnerId><shipmentId>${req.body.shipmentId}</shipmentId>
					<loadNum>${req.body.loadNumber}</loadNum><referenceNums>${refnumsstr}</referenceNums><status>${req.body.status}</status></loadTenderResponse></loadTenderResponses>
					</sendLoadTenderResponsesRequest>`;

				let status = 'Load Tender - Accepted';
				if (req.body.status === 'Decline') {
					status = 'Load Tender - Rejected';
				}

				try {
					let responseData = '' as any;
					await this.updateLog(status, req.body.loadTenderId, null, null, null, null,
						req.body.userId, request, request);
					if (req.body.status === 'Accept') {
						await this.ediService.updateEdiLoadTenderUpdateLog(status, req.body.loadTenderId)
						responseData = await this.checkToCreateOrder(req.body)
					} else {
						await this.ediService.updateLoadTender({
							isOpened: 1,
							loadTenderId: req.body.loadTenderId,
							status: 'Decline',
							userId: req.body.userId
						});
						await this.ediService.updateEdiLoadTenderUpdateLog(status, req.body.loadTenderId)
						responseData = {message: 'Load Tender Declined Successfully'}
					}
					res.send(responseData)
				} catch (e) {
					await this.updateLog(status, req.body.loadTenderId, null, null, null, null,
						req.body.userId, request, e.message);
					res.status(500).send(this.getErrorResponse(e))
				}

			} else {
				res.status(500).send({ message: 'No data found for the Company' })
			}

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	public async sendInvoice(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const invoiceDetails = await this.getInvoiceDetails(req, res);

			if (invoiceDetails) {
				let chargestr = ''
				let refnumsstr = ''
				let stopstr = ''
				let itemstr = ''
				let deliveryDate = ''
				let pickDate = ''
				for (const rateDetail of invoiceDetails.RateDetails) {
					if (rateDetail.Description === 'Flat/Line Haul') {
						chargestr += `<charge><type>Line Haul</type><desc>Line Haul</desc><qty>${rateDetail.Units}</qty><rateType>Per Mile</rateType>
									<rate>${rateDetail.Per}</rate><amount>${rateDetail.Amount}</amount></charge>`
					} else if (rateDetail.Description === 'Fuel Surcharge' || rateDetail.Description === 'FuelSurcharge') {
						chargestr += `<charge><type>Accessorial</type><desc>Fuel Surcharge</desc><qty>${rateDetail.Units}</qty><rateType>Per Mile</rateType>
									<rate>${rateDetail.Per}</rate><amount>${rateDetail.Amount}</amount></charge>`
					} else {
						chargestr += `<charge><type>Accessorial</type><desc>${rateDetail.Description}</desc><qty>${rateDetail.Units}</qty><rateType>Per Mile</rateType>
									<rate>${rateDetail.Per}</rate><amount>${rateDetail.Amount}</amount></charge>`
					}
				}
				const refnums = invoiceDetails.RefNums;
				for (const referenceNo of refnums) {
					refnumsstr += `<referenceNum><type>${referenceNo.ReferenceType}</type><value>${referenceNo.ReferenceValue}</value></referenceNum>`
				}

				const stops = invoiceDetails.Stops;
				for (let i = 0; i < stops.length; i++) {
					const address = (stops[i].address ? stops[i].address.split(',') : []);

					let stoprefnums = '<referenceNums>';

					const refnumbers = stops[i].referenceNums ? JSON.parse(`[${stops[i].referenceNums}]`) : [];
					for (const refnumber of refnumbers) {
						stoprefnums += `<referenceNum><type>${refnumber.referenceType}</type><text>${refnumber.referenceText}</text><value>${refnumber.referenceValue}</value></referenceNum>`
					}
					stoprefnums += '</referenceNums>';

					if (address.length > 0) {
						stopstr += `<stop><stopNum>${stops[i].stopNum}</stopNum><stopType>${stops[i].stopType}</stopType><company><companyName>${stops[i].contactName}</companyName>
									<addr>${address[0]}</addr><city>${address[2]}</city><state>${address[3]}</state><zip>${address[4]}</zip><country>USA</country>
									<companyId>${stops[i].companyId}</companyId></company>${stoprefnums}</stop>`;

						if (i === 0) {
							pickDate = moment(stops[i].fromDate).format('MM/DD/YYYY');
						}
						if (i === (stops.length - 1)) {
							deliveryDate = moment(stops[i].fromDate).format('MM/DD/YYYY');
						}
					}
				}

				const items = invoiceDetails.Items;
				for (const item of items) {
					itemstr += `<item><pickupStopNum>${item.PickupStopNum}</pickupStopNum><dropoffStopNum>${item.DropoffStopNum}</dropoffStopNum><itemNum>${item.ItemNum}</itemNum>
							<desc>${item.Desc}</desc>${item.HandlingUnitCount ? `<handlingUnitCount>${item.HandlingUnitCount}</handlingUnitCount>` : `<handlingUnitCount />`}${(item.HandlingUnit && item.HandlingUnit !== '0') ? `<handlingUnits>${item.HandlingUnit}</handlingUnits>` : `<handlingUnits />`}
							${item.PackagingUnitCount ? `<packagingUnitCount>${item.PackagingUnitCount}</packagingUnitCount>` : `<packagingUnitCount />`} ${(item.PackagingUnit && item.PackagingUnit !== '0') ? `<packagingUnits>${item.PackagingUnit}</packagingUnits>` : `<packagingUnits />`} ${item.Weight ? `<weight>${item.Weight}</weight>` : `<weight />`}
							${(item.WeightUnits && item.WeightUnits !== '0') ? `<weightUnits>${item.WeightUnits}</weightUnits>` : `<weightUnits />`} ${item.Length ? `<length>${item.Length}</length>` : `<length />`}${item.Width ? `<width>${item.Width}</width>` : `<width />`}${item.Height ? `<height>${item.Height}</height>` : `<height />`}
							${(item.DimensionUnits && item.DimensionUnits !== '0') ? `<dimensionUnits>${item.DimensionUnits}</dimensionUnits>` : `<dimensionUnits />`} ${item.Volume ? `<volume>${item.Volume}</volume>` : `<volume />`} ${(item.VolumeUnits && item.VolumeUnits !== '0') ? `<volumeUnits>${item.VolumeUnits}</volumeUnits>` : `<volumeUnits />`}
							${item.NmfcClass ? `<nmfcClass>${item.NmfcClass}</nmfcClass>` : `<nmfcClass />`} ${(item.NmfcNum && item.NmfcNum !== '0') ? `<nmfcNum>${item.NmfcNum}</nmfcNum>` : `<nmfcNum />`} ${item.IsHazardousMaterials ? `<isHazardousMaterials>${item.IsHazardousMaterials}</isHazardousMaterials>` : `<isHazardousMaterials />`}</item>`;
				}

				const bodyStr = `<sendLoadInvoicesRequest><auth><custId>${invoiceDetails.EDICustId}</custId><pwd>${invoiceDetails.EDIPassword}</pwd></auth><loadInvoices>
							<loadInvoice><tradingPartnerId>${invoiceDetails.TradingPartnerId}</tradingPartnerId><shipmentId>${invoiceDetails.ShipmentId}</shipmentId>
							<loadNum>${invoiceDetails.LoadNumber}</loadNum><invoiceNum>${invoiceDetails.InvoiceNumber}</invoiceNum><referenceNums>${refnumsstr}</referenceNums>
							<paymentTerms>${invoiceDetails.PaymentTerms}</paymentTerms><pickupDate>${pickDate}</pickupDate><deliveryDate>${deliveryDate}</deliveryDate>
							<invoiceDate>${moment(invoiceDetails.IssuedDate).format('MM/DD/YYYY')}</invoiceDate><currencyCode>USD</currencyCode>
							<charges>${chargestr}</charges><stops>${stopstr}</stops><items>${itemstr}</items></loadInvoice></loadInvoices></sendLoadInvoicesRequest>`

				await this.updateLog('Send Invoice', req.body.loadTenderId, null, null, null, null,
					req.body.userId, bodyStr, bodyStr);

				res.send({message : 'Successfully Sent'})

			}

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	public async sendLoadStatusMessages(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			if (req.body.loadTenderId > 0 || req.body.loadTenderId == null) {
				const statusResponse = await this.ediService.getStatusDetails(req.body);
				if (statusResponse.data) {
					const result = statusResponse.data;
					const loadTenderResult = result[0][0];
					const stops = result[1];
					const refnums = result.length > 2 ? result[2] : [];
					const stopCompanyIds = result.length > 3 ? result[3] : [];
					let vehicleLocation = {} as any;

					const companyIntegrationDetails = await this.companyService.getCompanyIntegration(user.companyId, 'eld', null, false)

					if (companyIntegrationDetails.data && companyIntegrationDetails.data.length > 0 && loadTenderResult.vehicleId) {
						if (companyIntegrationDetails.data[0].ApiKey && companyIntegrationDetails.data[0].Partner === 'samsara') {
							if (loadTenderResult.vehicleId) {
								const vehicleLocationRequest = { vehicleIds: loadTenderResult.vehicleId };
								const vehicleLocationData = await this.samsaraService.getVehicleLocation(vehicleLocationRequest,
									companyIntegrationDetails.data[0].ApiKey);

								if (vehicleLocationData.data.data.length > 0) {
									vehicleLocation = vehicleLocationData.data.data[0];
								}
							}
						}
					}

					let refnumsstr = ''
					let stopstr = ''

					for (const refNum of refnums) {
						refnumsstr += `<referenceNum><type>${refNum.ReferenceType}</type><value>${refNum.ReferenceValue}</value></referenceNum>`
					}

					for (const stopData of stops){
						if (stopData.StopNum === req.body.stopNo) {
							let stoprefnums = '';
							const address = (stopData.Address ? stopData.Address.split(',') : []);
							let status = loadTenderResult.StatusName;

							if (stopData.CheckOutTime && stopData.CheckOutTime !== '') {
								status = (stopData.StopType === 'Pickup') ? 'LOADED' : 'UNLOADED';
							} else if (stopData.CheckInTime && stopData.CheckInTime !== '') {
								status = (stopData.StopType === 'Pickup') ? 'ARRIVEDATPICKUP' : 'ARRIVEDATDELIVERY';
							}

							if (stopCompanyIds.length > 0) {
								stoprefnums = '<referenceNums>'
								const refnumbers = stopCompanyIds[0].ReferenceNums ? JSON.parse(`[${stopCompanyIds[0].ReferenceNums}]`) : [];
								for (const refnumber of refnumbers) {
									stoprefnums += `<referenceNum><type>${refnumber.ReferenceType}</type><text>${refnumber.ReferenceText}</text><value>${refnumber.ReferenceValue}</value></referenceNum>`
								}
								stoprefnums += '</referenceNums>'
							}

							const utcTimestamp = tz.utc();
							const date = utcTimestamp.format('YYYY-MM-DD')
							const time = utcTimestamp.format('HH:mm')

							stopstr += `<stop>${stoprefnums}<stopNum>${stopData.StopNum}</stopNum><stopType>${stopData.StopType}</stopType><company><companyName>${stopData.ContactName}</companyName>
							<addr>${address[0] ? address[0] : ''}</addr><city>${address[2] ? address[2] : ''}</city><state>${address[3] ? address[3] : ''}</state><zip>${address[4] ? address[4] : ''}</zip><country>USA</country>
							<companyId>${(stopCompanyIds.length > 0 ? stopData.CompanyId ? stopData.CompanyId : '' : '')}</companyId></company>
							<apptRequired>${stopData.IsAppRequired ? `Y` : `N`}</apptRequired><expectedDate>${stopData.FromDate}</expectedDate><expectedTimeStart>${stopData.FromTime}</expectedTimeStart>
							${stopData.ToTime ? `<expectedTimeEnd>${stopData.ToTime}</expectedTimeEnd>` : ''}<timeZone>LT</timeZone><status>${status}</status>
							<reason /><statusDate>${date}</statusDate><statusTime>${time}</statusTime></stop>`
						}
					}

					let location = [] as any;

					try {
						location = vehicleLocation ? vehicleLocation.location.reverseGeo.formattedLocation.split(',') : {};
					} catch (e) {
						location = [];
					}

					const bodyStr = `<sendLoadStatusMessagesRequest><auth><custId>${loadTenderResult.EDICustId}</custId><pwd>${loadTenderResult.EDIPassword}</pwd></auth><loadStatusMessages>
						<loadStatusMessage><tradingPartnerId>${loadTenderResult.TradingPartnerId}</tradingPartnerId><shipmentId>${loadTenderResult.ShipmentId}</shipmentId>
						<loadNum>${loadTenderResult.LoadNumber}</loadNum><referenceNums>${refnumsstr}</referenceNums>
						${vehicleLocation.location ? `<currentLocation><status>${loadTenderResult.statusName}</status><reason /><statusDate>${vehicleLocation.location ? moment(vehicleLocation.location.time).format('MM/DD/YYYY') : ''}</statusDate>
						<statusTime>${vehicleLocation.location ? moment(vehicleLocation.location.time).format('HH:MM') : ''}</statusTime><timeZone>LT</timeZone><city>${location.length > 0 ? location[1] : ''}</city><state>${location.length > 0 ? location[2] : ''}</state>
						<country>US</country><lat>${vehicleLocation.location ? vehicleLocation.location.latitude : ''}</lat><lon>${vehicleLocation.location ? vehicleLocation.location.longitude : ''}</lon></currentLocation>` : ''}
						<stops>${stopstr}</stops></loadStatusMessage></loadStatusMessages>
						</sendLoadStatusMessagesRequest>`

					await this.updateLog('Send Load Status', req.body.loadTenderId, '', null, null,
						'', req.body.userId, bodyStr, bodyStr);

					res.send({message : 'Successfully Sent'})

				} else {
					res.status(500).send({ message: 'Unable to get load tender Info.' })
				}
			}
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	public async getInvoiceDetails(req: express.Request, res: express.Response): Promise<any> {
		try {
			const response = await this.ediService.getEDIInvoiceDetails(req.body)
			if (response.data && response.data.length > 0 && response.data[0][0] && response.data[0][0].LoadTenderId
				&& response.data[0][0].LoadTenderId !== null) {
				const stopDetails = await this.ediService.getStopDetailsByLoadTenderId(response.data[0][0].LoadTenderId);
				if (stopDetails.data && stopDetails.data.length > 0) {
					const invoice = response.data[0][0];
					invoice.Items = (invoice.Items ? JSON.parse(`[${invoice.Items}]`) : []);
					invoice.RateDetails = (invoice.RateDetails ? JSON.parse(`[${invoice.RateDetails}]`) : []);
					invoice.RefNums = (invoice.RefNums ? JSON.parse(`[${invoice.RefNums}]`) : []);
					invoice.Stops = stopDetails.data[0];
					return invoice;
				} else {
					res.status(500).send({ message: 'No stop details found for the load tender id' })
				}
			} else {
				res.status(500).send({ message: 'No Invoice Found' })
			}
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	// tslint:disable-next-line:cyclomatic-complexity
	public async getLatestLoadTenders(req: express.Request, res: express.Response): Promise<any> {
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const queryData = await this.ediService.getEdiCustomerIdAndPassword(Number(req.body.companyId));
			if (queryData.data && queryData.data.length > 0) {

				const request = `<getLoadTendersRequest><auth><custId>${queryData.data[0].EDICustId}</custId><pwd>${queryData.data[0].EDIPassword}</pwd></auth></getLoadTendersRequest>`

				const apiResponse = await this.ediService.getEdiResponse(request);
				if (apiResponse.data && apiResponse.data.response && apiResponse.data.xml && apiResponse.data.response.data
					&& apiResponse.data.response.data.getLoadTenderResponse) {

					const loadTenderResponse = apiResponse.data.response.data.getLoadTenderResponse;
					let rawData = ''
					if (apiResponse.data && apiResponse.data.xml) {
						rawData = apiResponse.data.xml
					}
					if (loadTenderResponse.status) {

						const status = loadTenderResponse.status;
						if (status.statusCode && status.statusCode._text && status.statusCode._text === 'OK'
							&& loadTenderResponse.loadTenders) {

							if (loadTenderResponse.loadTenders.loadTender) {
								const loadTenderDataResponse = loadTenderResponse.loadTenders.loadTender;

								let loadTenders = [];
								if (loadTenderDataResponse.length === undefined) {
									loadTenders.push(loadTenderDataResponse);
								} else {
									loadTenders = loadTenderDataResponse;
								}

								await this.updateStatus(loadTenderResponse.status, loadTenders, req.body.companyId, rawData);

								if (loadTenders.length > 0) {
									for (const record of loadTenders) {

										const errorMessages = [];
										const missingFields = [];
										const loadTender = {} as any;

										loadTender.companyId = req.body.companyId;

										if (record.equipmentType && record.equipmentType._text && record.equipmentType._text !== '') {
											loadTender.equipmentType = record.equipmentType._text;
										} else {
											loadTender.equipmentType = '';
											missingFields.push('Equipment Type Not Found');
										}

										loadTender.miles = record.miles ? (record.miles._text ? record.miles._text : '') : '';
										loadTender.paymentTerms = record.paymentTerms ? (record.paymentTerms._text ? record.paymentTerms._text : '') : '';
										loadTender.purpose = record.purpose ? (record.purpose._text ? record.purpose._text : '') : '';
										loadTender.shipmentId = record.shipmentId ? (record.shipmentId._text ? record.shipmentId._text : '') : '';
										loadTender.tradingPartnerId = record.tradingPartnerId ? (record.tradingPartnerId._text ? record.tradingPartnerId._text : '') : '';
										loadTender.respondByDate = record.respondByDate ? (record.respondByDate._text ? moment(record.respondByDate._text).format('YYYY-MM-DD') : null) : null;
										loadTender.respondByTime = record.respondByTime ? (record.respondByTime._text ? record.respondByTime._text : '') : '';
										loadTender.timeZone = record.timezone ? (record.timezone._text ? record.timeZone._text : '') : '';
										loadTender.totalCharge = record.totalCharge ? (record.totalCharge._text ? record.totalCharge._text : null) : '';
										loadTender.currencyCode = record.currencyCode ? (record.currencyCode._text ? record.currencyCode._text : '') : '';

										const specialInstructions = await this.updateSpecialInstructions(record);
										loadTender.specialInstructions = specialInstructions ? specialInstructions : '';

										let loadTenderId = 0;
										let billToId = 0;
										let changes = null;

										if (loadTender.purpose === 'Update' || loadTender.purpose === 'Cancellation') {
											try {
												const validateLoadTender = await this.ediService.validateLoadTender(loadTender.companyId,
													loadTender.shipmentId, loadTender.tradingPartnerId);
												if (validateLoadTender.data && validateLoadTender.data.length > 0
													&& validateLoadTender.data[0].length > 0 && validateLoadTender.data[0][0].Id) {
													const loadTenderData = validateLoadTender.data[0][0];
													loadTenderId = loadTenderData.Id;
													loadTender.id = loadTenderData.Id;
													billToId = loadTenderData.BillTo_Id;
													loadTender.billToId = loadTenderData.BillTo_Id
													if (loadTenderData.TenderData) {
														changes = diff(JSON.parse(loadTenderData.TenderData), record);
													}
													try {
														loadTender.isOpened = 0;
														await this.ediService.updateLoadTenderDB(loadTender, req.body.userId);
														await this.ediService.deleteLoadTenderData(loadTenderData.Id);
													} catch (e) {
														errorMessages.push(`After the delete call->LoadTender-ShipmentId: ${loadTender.ShipmentId} ...Error: ${e.message}`);
													}
												} else {
													const localLoadTenderModel = await this.ediService.getLocalLoadTenderModel(loadTender.companyId, loadTender.tradingPartnerId);
													if (localLoadTenderModel.data && localLoadTenderModel.data.length > 0) {
														billToId = localLoadTenderModel.data[0].Contact_Id;
														loadTender.billToId = localLoadTenderModel.data[0].Contact_Id
														try {
															const addedLoadTender = await this.ediService.createLoadTender(loadTender);
															if (addedLoadTender.data.insertId) {
																loadTenderId = addedLoadTender.data.insertId
															} else {
																errorMessages.push(`Error Adding Load Tender-> LoadTender-ShipmentId: ${loadTender.ShipmentId}`)
															}
														} catch (e) {
															errorMessages.push(`Failed to Create Load Tender-> LoadTender-ShipmentId: ${loadTender.ShipmentId}, Error : ${e.message}`)
														}
													} else {
														errorMessages.push(`Error getting contactId from trading partner-> LoadTender-ShipmentId: ${loadTender.ShipmentId}`)
													}
												}
											} catch (e) {
												errorMessages.push(`Error validating Load Tender-> LoadTender-ShipmentId: ${loadTender.ShipmentId}, Error : ${e.message}`)
											}
										} else {
											try {
												const localLoadTenderModel = await this.ediService.getLocalLoadTenderModel(loadTender.companyId, loadTender.tradingPartnerId);
												if (localLoadTenderModel.data && localLoadTenderModel.data.length > 0) {
													billToId = localLoadTenderModel.data[0].Contact_Id;
													loadTender.billToId = billToId;
													try {
														const addedLoadTender = await this.ediService.createLoadTender(loadTender);
														if (addedLoadTender.data.insertId) {
															loadTenderId = addedLoadTender.data.insertId
														} else {
															errorMessages.push(`Error Adding Load Tender-> LoadTender-ShipmentId: ${loadTender.ShipmentId}`)
														}
													} catch (e) {
														errorMessages.push(`Failed to Create Load Tender-> LoadTender-ShipmentId: ${loadTender.ShipmentId}, Error : ${e.message}`)
													}
												} else {
													errorMessages.push(`Error getting contactId from trading partner-> LoadTender-ShipmentId: ${loadTender.ShipmentId}`)
												}
											} catch (e) {
												errorMessages.push(`Error getting contactId from trading partner-> LoadTender-ShipmentId: ${loadTender.ShipmentId}, Error : ${e.message}`)
											}
										}

										if (loadTenderId !== 0 && billToId !== 0) {
											try {
												let referenceNums = [];
												if (record.referenceNums) {
													if (record.referenceNums.referenceNum.length === undefined) {
														referenceNums.push(record.referenceNums.referenceNum)
													} else {
														referenceNums = record.referenceNums.referenceNum;
													}
												}

												if (referenceNums.length > 0) {
													for (const reference of referenceNums) {
														const refNums = {} as any
														refNums.referenceType = reference.type ? (reference.type._text ? reference.type._text : '') : ''
														refNums.referenceText = reference.text ? (reference.text._text ? reference.text._text : '') : ''
														refNums.referenceValue = reference.value ? (reference.value._text ? reference.value._text : '') : ''
														refNums.loadTenderId = loadTenderId ? loadTenderId : 0
														await this.ediService.createReferenceNo(refNums)
													}
												} else {
													missingFields.push(`No Reference Nos Found`);
												}

											} catch (e) {
												errorMessages.push(`Error catched in reference numbers...Loadtender_Id: ${loadTenderId} ...Error: ${e.message}`);
											}

											try {
												let charges = []
												if (record.charges) {
													if (record.charges.length === undefined && record.charges.charge) {
														charges.push(record.charges.charge);
													} else if (record.charges.charge) {
														charges = record.charges.charge;
													}
												}
												for (const charge of charges) {
													const rateDetail = {} as any;
													rateDetail.descriptionId = charge.type ? (charge.type._text ? (charge.type._text === 'Line Haul' ? 1 : null) : null) : null;
													rateDetail.amount = charge.amount ? (charge.type._text ? charge.type._text : null) : null;
													rateDetail.units = 0;
													rateDetail.per = 0;
													rateDetail.notes = charge.desc ? (charge.desc._text ? charge.desc._text : null) : null;
													rateDetail.loadTenderId = loadTenderId;
													await this.ediService.createLoadtTenderRateDetails(rateDetail);
												}
											} catch (e) {
												errorMessages.push(`Error catched in rate details...Loadtender_Id: ${loadTenderId} ...Error: ${e.message}`);
											}
											await this.updateLog(loadTender.purpose, loadTenderId, record, null, null, changes, req.body.userId, request, rawData);

											if (record.stops && record.stops.stop) {
												if (record.stops.stop.length === undefined) {
													missingFields.push('Load Tender has only one stop');
												}
												await this.addLoadTenderStopDetails(record, req.body.companyId, req.body.userId, loadTenderId, errorMessages);
											} else {
												missingFields.push('Load Tender has no Stops');
											}

											try {
												if (missingFields.length > 0) {
													await this.ediService.updateLoadTenderMissingFields(missingFields, loadTenderId)
												}
											} catch (e) {
												// Do Nothing
											}

											try {
												if (errorMessages.length > 0) {
													let errorMsg = ''
													for (const errorMessage of errorMessages) {
														errorMsg += `${errorMessage} `
													}
													const updatedData = {
														error: errorMsg,
														loadtenderId: loadTenderId,
														userId: req.body.userId,
													}
													await this.ediService.updateLoadTenderData(updatedData);
												}
											} catch (e) {
												// Do Nothing
											}
										}

										if (loadTenderId === 0 && errorMessages.length > 0) {
											try {
												const newLoadTender = {
													companyId: loadTender.companyId,
													shipmentId: loadTender.shipmentId,
													tradingPartnerId: loadTender.tradingPartnerId
												}
												const loadTenderRes = await this.ediService.createLoadTender(newLoadTender);
												if (loadTenderRes.data && loadTenderRes.data.insertId) {
													let errorMsg = ''
													for (const errorMessage of errorMessages) {
														errorMsg += `${errorMessage} `
													}
													const updatedData = {
														error: errorMsg,
														loadtenderId: loadTenderRes.data.insertId,
														userId: req.body.userId,
													}
													await this.ediService.updateLoadTenderData(updatedData);
													await this.updateLog(loadTender.purpose, loadTenderRes.data.insertId, record, null, null, null,
														req.body.userId, request, rawData);
												}
											} catch (e) {
												// Ignore This
											}
										}
									}
									res.send({ message: 'Load Tenders Update Successfully' });
								} else {
									res.send({ message: 'No New Load Tenders' });
								}
							} else {
								res.send({ message: 'No New Load Tenders' });
							}
						} else {
							const statusIn = await this.updateStatus(loadTenderResponse.status, null, req.body.companyId, rawData)
							res.status(500).send(statusIn)
						}
					} else {
						const statusIn = await this.updateStatus(loadTenderResponse.status, null, req.body.companyId, rawData)
						res.status(500).send(statusIn)
					}
				} else {
					res.status(500).send({ message: 'No Load Tenders Found' })
				}
			} else {
				res.status(500).send({ message: 'No data found for the Company' })
			}

		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	public async updateOrder(req: express.Request, res: express.Response):Promise<any>{
		try {
			const user = req.user as any;
			req.body.companyId = user.companyId;
			req.body.userId = user.id;

			const reqCreator = {} as any
			if (req.body.loadTenderId > 0) {
				const stopDetails = await this.ediService.getStopDetailsByLoadTenderId(req.body.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (stopDetails.data && stopDetails.data.length > 0 && stopDetails.data[0] && stopDetails.data[0].length > 0) {
					reqCreator.stops = stopDetails.data[0]
				} else {
					reqCreator.stops = []
				}
				const rateDetails = await this.ediService.getRateDetailsByLoadTenderId(req.body.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (rateDetails.data && rateDetails.data.length > 0 && rateDetails.data[0]) {
					reqCreator.rateDetails = rateDetails.data[0]
				} else {
					reqCreator.rateDetails = []
				}

				const items = await this.ediService.getItemsByLoadTenderId(req.body.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (items.data && items.data.length > 0) {
					reqCreator.items = items.data
				} else {
					reqCreator.items = []
				}

				reqCreator.companyId = req.body.companyId
				reqCreator.userId = req.body.userId
				reqCreator.loadType = 'Full Load';
				reqCreator.status_Id = 7;

				const loadTender = await this.ediService.getLoadTenderById(req.body.loadTenderId);
				if (loadTender.data && loadTender.data.length > 0 && loadTender.data[0] && loadTender.data[0][0]) {
					reqCreator.loadAmount = 0;
					reqCreator.billTo_Id = loadTender.data[0][0].billTo_Id;
					reqCreator.customer_Id = loadTender.data[0][0].billTo_Id;

					if (req.body.isWorkOrder) {
						reqCreator.workOrderId = req.body.workOrderId
						reqCreator.refNumber = loadTender.data[0][0].shipmentId;
						reqCreator.equipment_Id = req.body.equipmentId;
						reqCreator.notes = loadTender.data[0][0].specialInstructions;
						reqCreator.miles = loadTender.data[0][0].miles;
						reqCreator.dispatcher_Id = req.body.userId;
						const result = await this.updateWorkOrder(reqCreator);
						res.send(result)

					} else {
						reqCreator.customerOrderId = req.body.customerOrderId;
						reqCreator.equipmentType_Id = req.body.equipmentId;
						reqCreator.totalMiles = loadTender.data[0][0].miles;
						reqCreator.referenceNumber = loadTender.data[0][0].shipmentId;
						reqCreator.specialInstruction = loadTender.data[0][0].specialInstructions;
						reqCreator.dispatcher_Id = req.body.userId;
						reqCreator.carrierLineItems = [];
						const result = await this.updateCustomerOrder(reqCreator);
						res.send(result)
					}
				}
			} else {
				res.status(500).send({ error: 'Load tender id is not valid' })
			}
		} catch (e) {
			res.status(500).send(this.getErrorResponse(e))
		}
	}

	private async updateSpecialInstructions(loadTender: any): Promise<any> {

		let specialIns = '';
		if (loadTender.specialInstructions) {

			let specialInstructionsListData = []
			if (loadTender.specialInstructions.length === undefined) {
				specialInstructionsListData.push(loadTender.specialInstructions)
			} else {
				specialInstructionsListData = loadTender.specialInstructions
			}

			for (const specIns of specialInstructionsListData) {
				if (specIns.specialInstruction) {
					const specialInstructions = specIns.specialInstruction

					let specialInstructionsList = [];
					if (specialInstructions.length === undefined) {
						specialInstructionsList.push(specialInstructions);
					} else {
						specialInstructionsList = specialInstructions;
					}

					if (specialInstructionsList.length > 0) {
						for (const specialInst of specialInstructionsList) {
							specialIns += `${specialInst._text} `
						}
					}
				}
			}
			return specialIns

		} if (loadTender.stopInstructions && loadTender.stopInstructions.specialInstruction){

			let specialInstructionsListData = []
			if (loadTender.stopInstructions.specialInstruction.length === undefined) {
				specialInstructionsListData.push(loadTender.stopInstructions.specialInstruction)
			} else {
				specialInstructionsListData = loadTender.stopInstructions.specialInstruction
			}

			for (const specIns of specialInstructionsListData) {
				if (specIns.specialInstruction) {
					const specialInstructions = specIns.specialInstruction

					let specialInstructionsList = [];
					if (specialInstructions.length === undefined) {
						specialInstructionsList.push(specialInstructions);
					} else {
						specialInstructionsList = specialInstructions;
					}

					if (specialInstructionsList.length > 0) {
						for (const specialInst of specialInstructionsList) {
							specialIns += `${specialInst._text} `
						}
					}
				} else {
					specialIns += `${specIns._text} `
				}
			}
			return specialIns

		} else {
			return specialIns
		}
	}

	private async updateStatus(status: any, loadTenders: any, companyId: any, rawData: any): Promise<any> {
		const statusIn = {} as any;
		statusIn.status = status.statusCode ? status.statusCode._text : 'ERROR'

		if (status.statusCode && status.statusCode._text && status.statusCode._text !== 'OK') {
			statusIn.message = status.message ? status.message._text : `Error Occured -> Compamy_Id: ${companyId}`
			statusIn.messageCode = status.messageCode ? status.messageCode._text : '500'
		} else {
			statusIn.message = ''
			statusIn.messageCode = ''
		}

		statusIn.companyId = companyId
		statusIn.count = (loadTenders.length !== undefined ? loadTenders.length : 0)
		statusIn.tendersData = loadTenders ? JSON.stringify(loadTenders) : null
		statusIn.rawData = rawData ? rawData : null
		await this.ediService.ediLoadTenderLog(statusIn)
		return statusIn
	}

	// tslint:disable-next-line:cyclomatic-complexity
	private async addLoadTenderStopDetails(record: any, companyId: any, userId: any, loadTenderId: any, errorMsg: string[]): Promise<any> {
		const errorMessages = errorMsg
		const poCoItemNum = []
		try {
			let stops = []
			if (record.stops.stop.length === undefined) {
				stops.push(record.stops.stop);
			} else {
				stops = (record.stops.stop);
			}

			for (const stop of stops) {

				const missingFields = [];
				const stopData = {} as any;

				stopData.loadTenderId = loadTenderId;

				if (stop.stopNum && stop.stopNum._text && stop.stopNum._text !== '') {
					stopData.stopNum = stop.stopNum._text
				} else {
					stopData.stopNum = '';
					missingFields.push('Stop has no stop number');
				}

				if (stop.stopType && stop.stopType._text && stop.stopType._text !== '') {
					stopData.stopType = stop.stopType._text;
				} else {
					stopData.stopType = '';
					missingFields.push('Stop has no stop type');
				}

				stopData.apptRequired = stop.apptRequired ? (stop.apptRequired._text ? (stop.apptRequired._text === 'Y') ? 1 : 0 : 0) : 0;

				if (stop.expectedDate && stop.expectedDate._text && stop.expectedDate._text !== '') {
					stopData.expectedDate = stop.expectedDate ? (stop.expectedDate._text ?
						moment(stop.expectedDate._text).format('YYYY-MM-DD') : null) : null;
				} else {
					stopData.stopNum = '';
					missingFields.push('Stop has no expected date');
				}

				stopData.expectedTimeStart = stop.expectedTimeStart ? (stop.expectedTimeStart._text ? stop.expectedTimeStart._text : '') : '';
				stopData.expectedTimeEnd = stop.expectedTimeEnd ? (stop.expectedTimeEnd._text ? stop.expectedTimeEnd._text : '') : '';

				const specialInstructions = await this.updateSpecialInstructions(stop);
				stopData.stopInstructions = specialInstructions ? specialInstructions : '';

				const createdStop = await this.ediService.createStop(stopData);
				if (createdStop.data && createdStop.data.insertId) {

					try {
						let referenceNums = [];
						if (stop.referenceNums) {
							if (stop.referenceNums.referenceNum.length === undefined) {
								referenceNums.push(stop.referenceNums.referenceNum)
							} else {
								referenceNums = stop.referenceNums.referenceNum;
							}
						}
						let poNo = ''
						let coNo = ''
						let itemNum = ''
						if (referenceNums.length > 0) {
							for (let i = 0; i < referenceNums.length; i++) {
								const reference = referenceNums[i]
								const refNums = {} as any
								refNums.loadTenderId = loadTenderId
								refNums.referenceType = reference.type ? (reference.type._text ? reference.type._text : '') : ''
								refNums.referenceText = reference.text ? (reference.text._text ? reference.text._text : '') : ''
								refNums.referenceValue = reference.value ? (reference.value._text ? reference.value._text : '') : ''
								refNums.stopsId = createdStop.data.insertId;

								if (i === 0){
									itemNum = reference.value ? (reference.value._text ? reference.value._text : '') : ''
								} else if (i === 1){
									coNo = reference.value ? (reference.value._text ? reference.value._text : '') : ''
								} else if (i === 2){
									poNo = reference.value ? (reference.value._text ? reference.value._text : '') : ''
								}
								await this.ediService.createReferenceNo(refNums)
							}
						} else {
							missingFields.push(`No Reference No's Found`);
						}
						poCoItemNum.push({
							coNo,
							itemNum,
							poNo,
							stopNo : stopData.stopNum,
						})

					} catch (e) {
						errorMessages.push(`Error catched in reference numbers...stopsId: ${createdStop.data.insertId} ...Error: ${e.message}`);
					}

					try {
						const stopAddress = {} as any;
						const stopContact = {} as any;
						if (stop.company) {
							stopAddress.address1 = stop.company.addr ? (stop.company.addr._text ? stop.company.addr._text : '') : ''
							stopAddress.city = stop.company.city ? (stop.company.city._text ? stop.company.city._text : '') : ''
							stopAddress.state = stop.company.state ? (stop.company.state._text ? stop.company.state._text : '') : ''
							stopAddress.zip = stop.company.zip ? (stop.company.zip._text ? stop.company.zip._text : '') : ''

							let stopContactList = [];
							if (stop.company.contacts && stop.company.contacts.contact) {
								const contactsData = stop.company.contacts.contact;
								if (contactsData.length === undefined) {
									stopContactList.push(contactsData);
								} else {
									stopContactList = contactsData;
								}

								if (stopContactList[0]) {
									stopContact.contactPerson = stopContactList[0].contactName ? stopContactList[0].contactName._text :
										(stopContactList[0].contactname ? stopContactList[0].contactname._text : '');
									stopContact.phone = stopContactList[0].phone ? stopContactList[0].phone._text : '';
								}

							} else {
								missingFields.push('Stop has no contact info');
							}
						} else {
							missingFields.push('Stop has no contact address');
						}

						stopContact.name = stop.company.companyName._text;
						const contactByNameAddress = await this.ediService.contactByNameAddress(companyId, stopContact, stopAddress);
						if (contactByNameAddress.data && contactByNameAddress.data[0]) {

							if (contactByNameAddress.data[0].length === 0) {

								const address = await this.ediService.createAddress(stopAddress);
								if (address.data && address.data.insertId) {
									stopContact.addressId = address.data.insertId;
									stopContact.companyId = companyId;
									stopContact.ContactType = 'Facility';
									const createContact = await this.ediService.createContact(stopContact);
									if (createContact.data.insertId) {
										const stopContacts = {} as any;
										stopContacts.stopsId = createdStop.data.insertId;
										stopContacts.contactId = createContact.data.insertId;
										stopContacts.companyId = stop.company.companyId._text;
										await this.ediService.createStopContact(stopContacts);
									}
								}

							} else {
								const stopContacts = {} as any;
								stopContact.addressId = stopContacts.stopsId = createdStop.data.insertId;
								stopContacts.contactId = contactByNameAddress.data[0].Id;
								stopContacts.companyId = companyId;
								await this.ediService.createStopContact(stopContacts);

							}
						}

						let stopAccessorials = [];
						if (stop.accessorials && stop.accessorials.accessorial) {
							const stopAccessorialData = stop.accessorials.accessorial;
							if (stopAccessorialData.length === undefined) {
								stopAccessorials.push(stopAccessorialData);
							} else {
								stopAccessorials = stopAccessorialData;
							}
						}

						for (const stopAcc of stopAccessorials) {
							const stopAccessorial = {} as any;
							stopAccessorial.name = stopAcc.name ? (stopAcc.name._text ? stopAcc.name._text : '') : '';
							stopAccessorial.code = stopAcc.code ? (stopAcc.code._text ? stopAcc.code._text : '') : '';
							stopAccessorial.charge = stopAcc.charge ? (stopAcc.charge._text ? stopAcc.charge._text : '') : '';
							stopAccessorial.stopsId = createdStop.data.id;
							stopData.stopAccessorial = stopAccessorial
							await this.ediService.createstopAccessorial(stopAccessorial)
						}

						if (missingFields.length > 0) {
							await this.ediService.updateStopMissingFields(missingFields, createdStop.data.insertId)
						}
					} catch (e) {
						errorMessages.push(`Error catched in contact address...stopsId: ${createdStop.data.insertId} ...Error: ${e.message}`);
					}
				}
			}
		} catch (e) {
			errorMessages.push(`Error catched in stops...Loadtender_Id: ${loadTenderId} ...Error: ${e.message}`);
		}

		try {

			let itemsData = [];
			if (record.items && record.items.item) {
				const items = record.items.item
				if (items.length === undefined) {
					itemsData.push(items)
				} else {
					itemsData = items
				}
			}

			for (const item of itemsData) {
				const itemValues = {} as any
				itemValues.loadTenderId = loadTenderId
				itemValues.pickupStopNum = item.pickupStopNum ? (item.pickupStopNum._text ? item.pickupStopNum._text : 0) : 0;
				itemValues.dropoffStopNum = item.dropoffStopNum ? (item.dropoffStopNum._text ? item.dropoffStopNum._text : 0) : 0;

				for (const values of poCoItemNum){
					if (values.stopNo !== itemValues.dropoffStopNum){
						itemValues.itemNum = values.itemNum
						itemValues.poNumber = values.poNo
						itemValues.coNumber = values.coNo
					}
				}

				itemValues.desc = item.desc ? (item.desc._text ? item.desc._text : '') : '';
				itemValues.weight = item.weight ? (item.weight._text ? item.weight._text : 0) : 0;
				itemValues.nmfcClass = item.nmfcclass ? (item.nmfcclass._text ? item.nmfcclass._text : 0) : 0;
				itemValues.weightUnits = item.weightUnits ? (item.weightUnits._text ? item.weightUnits._text : '') : '';
				itemValues.handlingUnitCount = item.handlingUnitCount ? (item.handlingUnitCount._text ? item.handlingUnitCount._text : 0) : 0;
				itemValues.handlingUnit = item.handlingUnits ? (item.handlingUnits._text ? item.handlingUnits._text : '') : '';
				itemValues.packagingUnitCount = item.packagingUnitCount ? (item.packagingUnitCount._text ? item.packagingUnitCount._text : 0) : 0;
				itemValues.packagingUnit = item.packagingUnits ? (item.packagingUnits._text ? item.packagingUnits._text : '') : '';
				itemValues.isHazardousMaterials = item.ishazardousmaterials ?
					(item.ishazardousmaterials._text ? item.ishazardousmaterials._text : 0) : 0;
				await this.ediService.createLoadTenderItem(itemValues)
			}

		} catch (e) {
			errorMessages.push(`Error catched in items...Loadtender_Id: ${loadTenderId} ...Error: ${e.message}`);
		}

		try {
			if (errorMessages.length > 0) {
				let errorMsgs = ''
				for (const errorMessage of errorMessages) {
					errorMsgs += `${errorMessage} `
				}
				const updatedData = {
					error: errorMsgs,
					loadtenderId: loadTenderId,
					userId,
				}
				await this.ediService.updateLoadTenderData(updatedData);
			}
		} catch (e) {
			// Ignore This
		}

	}

	private async updateLog(purpose: string, loadTenderId: any, record: any,
		status: string, statusDate: string, changes: any, userId: any, request: any, response: any): Promise<any> {
		try {
			const log = {} as any
			log.purpose = purpose;
			log.loadTenderId = loadTenderId;
			log.tenderData = record ? JSON.stringify(record) : '';
			log.status = status;
			log.statusDate = statusDate;
			log.changes = changes ? JSON.stringify(changes) : '';
			log.request = request ? JSON.stringify(request) : '';
			log.response = response ? JSON.stringify(response) : '';
			log.userId = userId;
			await this.ediService.ediLoadTenderUpdateLog(log);
			return;
		} catch (e) {
			return;
		}
	}

	private async checkToCreateOrder(req: any): Promise<any> {
		try {
			const reqCreator = {} as any
			if (req.loadTenderId > 0) {
				const stopDetails = await this.ediService.getStopDetailsByLoadTenderId(req.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (stopDetails.data && stopDetails.data.length > 0 && stopDetails.data[0] && stopDetails.data[0].length > 0) {
					reqCreator.stops = stopDetails.data[0]
				} else {
					reqCreator.stops = []
				}
				const rateDetails = await this.ediService.getRateDetailsByLoadTenderId(req.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (rateDetails.data && rateDetails.data.length > 0 && rateDetails.data[0]) {
					reqCreator.rateDetails = rateDetails.data[0]
				} else {
					reqCreator.rateDetails = []
				}

				const items = await this.ediService.getItemsByLoadTenderId(req.loadTenderId);
				// tslint:disable-next-line:prefer-conditional-expression
				if (items.data && items.data.length > 0) {
					reqCreator.items = items.data
				} else {
					reqCreator.items = []
				}

				reqCreator.companyId = req.companyId
				reqCreator.userId = req.userId
				reqCreator.loadType = 'Full Load';
				reqCreator.status_Id = 7;

				const loadTender = await this.ediService.getLoadTenderById(req.loadTenderId);
				if (loadTender.data && loadTender.data.length > 0 && loadTender.data[0] && loadTender.data[0][0]) {
					reqCreator.loadAmount = 0;
					reqCreator.billTo_Id = loadTender.data[0][0].billTo_Id;
					reqCreator.customer_Id = loadTender.data[0][0].billTo_Id;

					const buildToFactor = await this.ediService.getBillToFactorFromContact(loadTender.data[0][0].billTo_Id)
					if (buildToFactor && buildToFactor.data && buildToFactor.data[0] && buildToFactor.data[0].BillToFactor
						&& buildToFactor.data[0].BillToFactor !== null && buildToFactor.data[0].BillToFactor !== ''
						&& buildToFactor.data[0].BillToFactor === 1) {
						const factoryId = await this.ediService.getFactorId(req.companyId)
						// tslint:disable-next-line:prefer-conditional-expression
						if (factoryId && factoryId.data && factoryId.data[0].Factor_Id && factoryId.data[0].Factor_Id !== null
							&& factoryId.data[0].Factor_Id !== '') {
							reqCreator.factor_Id = factoryId.data[0].Factor_Id;
						} else {
							reqCreator.factor_Id = 0
						}
						reqCreator.billToType = 'Factor';
					} else {
						reqCreator.factor_Id = 0;
						reqCreator.billToType = 'Customer';
					}
					if (req.isWorkOrder) {
						reqCreator.isIntermodal = false;
						reqCreator.refNumber = loadTender.data[0][0].shipmentId;
						reqCreator.equipment_Id = req.equipmentId;
						reqCreator.notes = loadTender.data[0][0].specialInstructions;
						reqCreator.miles = loadTender.data[0][0].miles;
						reqCreator.legType = null;
						reqCreator.isHazmat = 0;
						reqCreator.loadCategory = null;
						reqCreator.loadPriority = null;
						reqCreator.lumperPaidby = null;
						reqCreator.lumper = 0;
						reqCreator.ratePerMile = 0;
						reqCreator.contactPersonId = 0;
						reqCreator.agent_Id = 0;
						reqCreator.agentPCT = 0;
						reqCreator.agentAmount = 0;
						reqCreator.temperature = null;
						reqCreator.dispatcher_Id = req.userId;
						reqCreator.subCompany_Id = 0;
						reqCreator.templateName = null;
						const res = await this.createWorkOrder(reqCreator);
						if (res.success) {
							await this.ediService.updateLoadTender({
								isOpened: 1,
								loadTenderId: req.loadTenderId,
								status: 'Accept',
								workOrder_Id: res.success.id,
								// tslint:disable-next-line:object-literal-sort-keys
								userId: req.userId
							});
						}
						return res;

					} else {
						reqCreator.carrier_Id = 0;
						reqCreator.equipmentType_Id = req.equipmentId;
						reqCreator.totalMiles = loadTender.data[0][0].miles;
						reqCreator.brokeragePercent = 0;
						reqCreator.referenceNumber = loadTender.data[0][0].shipmentId;
						reqCreator.specialInstruction = loadTender.data[0][0].specialInstructions;
						reqCreator.minimumAmount = 0;
						reqCreator.paidWithIn = null;
						reqCreator.quickPayPCT = null;
						reqCreator.comissionPCT = null;
						reqCreator.temperature = null;
						reqCreator.dispatcher_Id = req.userId;
						reqCreator.carrierLineItems = [];
						const res = await this.createCustomerOrder(reqCreator);
						if (res.success) {
							await this.ediService.updateLoadTender({
								customerOrder_Id: res.success.id,
								isOpened: 1,
								loadTenderId: req.loadTenderId,
								status: 'Accept',
								// tslint:disable-next-line:object-literal-sort-keys
								userId: req.userId
							});
						}
						return res
					}
				}
			} else {
				return { error: 'Load tender id is not valid' }
			}
		} catch (e) {
			return { error: e.message }
		}
	}

	private async createCustomerOrder(req: any): Promise<any> {
		try {
			const { stops, rateDetails, items, carrierLineItems } = req

			const isExist = await this.customerOrderService.validateRefnoCusComIdInCO(req);
			const isExisted = isExist.data[0][0];

			if (isExisted['0'] === 0) {
				let createdCO = await this.customerOrderService.addCustomerOrder(req);
				createdCO = createdCO.data[0][0];

				let rateDetailsResponse;
				const processRateDetails = [];
				if (rateDetails) {
					for (const rateDetail of rateDetails) {
						rateDetail.userId = req.userId;
						rateDetail.customerOrder_Id = createdCO.cid;
						processRateDetails.push(this.coRateDetailService.addCoRateDetail(rateDetail));
					}
					rateDetailsResponse = await Promise.all(processRateDetails);
				}

				let carrierLineItemsResponse;
				const processCarrierLineItemsDetails = [];
				if (carrierLineItems) {
					for (const item of carrierLineItems) {
						item.userId = req.userId;
						item.customerOrder_Id = createdCO.cid;
						item.carrier_Id = req.carrier_Id;
						processCarrierLineItemsDetails.push(this.coCarrierLineItemService.addCoCarrierLineItem(item));
					}
					carrierLineItemsResponse = await Promise.all(processCarrierLineItemsDetails);
				}

				let stopsResponse;
				const processStops = [];
				if (stops) {
					for (const stop of stops) {

						if (stop.stopType === 'pickup') {
							stop.stopType = 'Pickup';
						} else if (stop.stopType === 'dropoff') {
							stop.stopType = 'Delivery';
						}

						stop.userId = req.userId;
						stop.customerOrder_Id = createdCO.cid;
						stop.stopNumber = stop.stopNum
						stop.contact_Id = stop.contactId

						const fromDateTime = (stop.fromTime && stop.fromDate)
							? moment(`${stop.fromDate} ${stop.fromTime}`).format('YYYY-MM-DD HH:mm:ss') : null
						const fromDate = fromDateTime
						let toDate = ''
						let toDateTime = ''

						if ((stop.toDate === undefined || stop.toDate === null || stop.toDate === '') && stop.toTime && stop.fromDate){
							toDate = (stop.fromDate && stop.toTime) ? moment(`${stop.fromDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
							toDateTime = toDate
						} else {
							toDateTime = (stop.toTime && stop.toDate) ? moment(`${stop.toDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
							toDate = toDateTime
						}

						stop.fromDate = fromDate
						stop.fromTime = fromDateTime
						stop.toDate = toDate
						stop.toTime = toDateTime
						stop.notes = stop.specialInstruction

						stop.poNumber = ''
						if (stop.referenceNums){
							const itemNum = (stop.referenceNums ? JSON.parse(`[ ${stop.referenceNums} ]`) : []);
							for (let i = 0; i< itemNum.length; i++){
								const refNum = itemNum[i]
								if (refNum.referenceValue) {
									if (i === 0) {
										stop.poNumber += `${refNum.referenceValue}`
									} else {
										stop.poNumber += `, ${refNum.referenceValue}`
									}
								}
							}
						}

						stop.isCOStop = 1;
						const addedStop = await this.coStopService.addCoStop(stop);
						if (items && items.length > 0) {
							for (const item of items) {
								item.userId = req.userId;
								item.coStops_Id = addedStop.data.insertId;
								item.poNumber = item.PONumber;
								item.coNumber = item.CONumber;
								const addedStopItem = this.coStopItemService.addLoadTenderCOStopItem(item);
								processStops.push(addedStopItem);
							}
						}
						stopsResponse = await Promise.all(processStops);
						processStops.push(addedStop);
					}
					stopsResponse = await Promise.all(processStops);
				}
				return { success: { id: createdCO.cid, coNum: createdCO.cnum, message: 'Load Added successfully!' } }
			}
			else {
				return { error: 'Load Already Exists in the system.' }
			}
		} catch (e) {
			return { error: e.message }
		}
	}

	private async updateCustomerOrder(reqCreator: any): Promise<any> {
		try {
			const { stops, rateDetails, items, carrierLineItems } = reqCreator
			await this.customerOrderService.saveCustomerOrder(reqCreator)
			const stopIds = await this.ediService.getCustomerOrderStopIds(reqCreator.customerOrderId)
			if (stopIds.data) {
				for (const stopId of stopIds.data) {
					if (stops) {
						for (const stop of stops) {
							if (stopId.StopNumber === stop.stopNum) {
								if (stop.stopType === 'pickup') {
									stop.stopType = 'Pickup';
								} else if (stop.stopType === 'dropoff') {
									stop.stopType = 'Delivery';
								}
								stop.coStopId = stopId.Id
								stop.userId = reqCreator.userId;
								stop.stopNumber = stop.stopNum
								stop.contact_Id = stop.contactId

								const fromDateTime = (stop.fromTime && stop.fromDate)
									? moment(`${stop.fromDate} ${stop.fromTime}`).format('YYYY-MM-DD HH:mm:ss') : null
								const fromDate = fromDateTime
								let toDate = ''
								let toDateTime = ''

								if ((stop.toDate === undefined || stop.toDate === null || stop.toDate === '') && stop.toTime && stop.fromDate) {
									toDate = (stop.fromDate && stop.toTime) ? moment(`${stop.fromDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
									toDateTime = toDate
								} else {
									toDateTime = (stop.toTime && stop.toDate) ? moment(`${stop.toDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
									toDate = toDateTime
								}

								stop.fromDate = fromDate
								stop.fromTime = fromDateTime
								stop.toDate = toDate
								stop.toTime = toDateTime
								stop.notes = stop.stopInstructions

								stop.poNumber = ''
								if (stop.referenceNums) {
									const itemNum = (stop.referenceNums ? JSON.parse(`[ ${stop.referenceNums} ]`) : []);
									for (let i = 0; i < itemNum.length; i++) {
										const refNum = itemNum[i]
										if (refNum.referenceValue) {
											if (i === 0) {
												stop.poNumber += `${refNum.referenceValue}`
											} else {
												stop.poNumber += `, ${refNum.referenceValue}`
											}
										}
									}
								}
								await this.coStopService.saveCOStop(stop)

								await this.ediService.deleteCustomerOrderStopItems(stopId.Id)
								if (items && items.length > 0) {
									for (const item of items) {
										item.userId = reqCreator.userId;
										item.coStops_Id = stopId.Id;
										item.poNumber = item.PONumber;
										item.coNumber = item.CONumber;
										await this.coStopItemService.addLoadTenderCOStopItem(item);
									}
								}
							}
						}
					}
				}
			}
			return {success: 'Customer Order Updated Successfully', customerOrderId : reqCreator.customerOrderId}
		} catch (e) {
			return { error: e.message }
		}
	}

	private async createWorkOrder(req: any): Promise<any> {
		const { stops, rateDetails, ...workorderRequest } = req;

		try {
			const addWorkorderResp = await this.workorderService.addWorkorder(workorderRequest);
			if (addWorkorderResp.data && addWorkorderResp.data[0] && addWorkorderResp.data[0][0] && addWorkorderResp.data[0][0].id) {

				const workOrderId = addWorkorderResp.data[0][0].id;

				const processStops = [];
				const stopItems = [];

				if (stops) {
					for (const stop of stops) {
						if (stop.stopType === 'pickup') {
							stop.stopType = 'Pickup';
						} else if (stop.stopType === 'dropoff') {
							stop.stopType = 'Delivery';
						}
						stop.userId = req.userId;
						stop.workOrder_Id = workOrderId;
						stop.stopNumber = stop.stopNum
						stop.contact_Id = stop.contactId

						const fromDateTime = (stop.fromTime && stop.fromDate)
							? moment(`${stop.fromDate} ${stop.fromTime}`).format('YYYY-MM-DD HH:mm:ss') : null
						const fromDate = fromDateTime
						let toDate = ''
						let toDateTime = ''

						if ((stop.toDate === undefined || stop.toDate === null || stop.toDate === '') && stop.toTime && stop.fromDate){
							toDate = (stop.fromDate && stop.toTime) ? moment(`${stop.fromDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
							toDateTime = toDate
						} else {
							toDateTime = (stop.toTime && stop.toDate) ? moment(`${stop.toDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
							toDate = toDateTime
						}

						stop.fromDate = fromDate
						stop.fromTime = fromDateTime
						stop.toDate = toDate
						stop.toTime = toDateTime
						stop.notes = stop.stopInstructions

						stop.poNumber = ''
						if (stop.referenceNums){
							const itemNum = (stop.referenceNums ? JSON.parse(`[ ${stop.referenceNums} ]`) : []);
							for (let i = 0; i< itemNum.length; i++){
								const refNum = itemNum[i]
								if (refNum.referenceValue) {
									if (i === 0) {
										stop.poNumber += `${refNum.referenceValue}`
									} else {
										stop.poNumber += `, ${refNum.referenceValue}`
									}
								}
							}
						}

						const addedStop = await this.woStopService.addStop(stop);
						stop.id = addedStop.data.insertId;
						if (req.items && req.items.length > 0) {
							for (let i = 0; i < req.items.length; i++) {
								const item = req.items[i]
								if (item.PickupStopNum === stop.stopNum || item.DropoffStopNum === stop.stopNum) {
									item.userId = req.userId;
									item.woStops_Id = addedStop.data.insertId;
									if (item.linkedWOStopsId) {
										const linkedStop = stops.find((s: any) => {
											return s.temp_id === item.linkedWOStopsId;
										});
										item.linkedWOStops_Id = linkedStop.id;
									}
									const addedStopItem = await this.woStopItemService.addWOStopItemForLoadTender(item, i);
									item.id = addedStopItem.data.insertId;
									stopItems.push(item);
									processStops.push(addedStopItem);
								}
							}
						}
						await Promise.all(processStops);
						processStops.push(addedStop);
					}
					await Promise.all(processStops);

					for (const item of stopItems) {
						item.userId = req.userId;
						if (item.linkedWOSIId) {
							const linkedStopItem = stopItems.find((s: any) => {
								return s.stopItemTempId === item.linkedWOSIId;
							});
							item.linkedWOSI_Id = linkedStopItem ? linkedStopItem.id : null;
						}
						item.woStopItemId = item.id;
						await this.woStopItemService.saveWOStopItem(item);
					}
				}

				// add rate details
				const processRateDetails = [];
				if (rateDetails) {
					for (const rateDetail of rateDetails) {
						rateDetail.userId = req.userId;
						rateDetail.workOrder_Id = workOrderId;
						processRateDetails.push(this.rateDetailService.addRateDetail(rateDetail));
					}
					await Promise.all(processRateDetails);
				}

				const woTemplate = {
					companyId: req.companyId,
					templateName: workorderRequest.templateName,
					userId: req.userId,
					workOrder_Id: workOrderId
				};

				const template = await this.workorderService.addWOTemplate(woTemplate);
				this.activityLogService.addActivityLog({
					description: JSON.stringify(woTemplate),
					module: 'WOTemplate',
					module_Id: template.data.insertId,
					userId: req.userId,
				});

				const activity = this.activityLogService.addActivityLog({
					description: JSON.stringify(req),
					module: 'WorkOrder',
					module_Id: workOrderId,
					userId: req.userId,
				});
				await this.queueCreateWorkorderMessage(workOrderId);

				return { success: addWorkorderResp.data[0][0] }

			} else {
				return { error: `failed to create work order ${JSON.stringify(addWorkorderResp.data[0])}` }
			}

		} catch (e) {
			return { error: e.message }
		}
	}

	private async queueCreateWorkorderMessage(workorderId: number): Promise<void> {
		const queueUrl = await this.sqsService.getQueueUrl({
			QueueName: SQS_QUEUES.CREATE_WORKORDER
		});

		await this.sqsService.sendMessage({
			MessageAttributes: {
				'workorder': {
					DataType: 'Number',
					StringValue: `${workorderId}`
				}
			},
			MessageBody: `${workorderId}`,
			QueueUrl: queueUrl.QueueUrl
		});
	}

	private async updateWorkOrder(reqCreator: any): Promise<any> {
		try {
			const {stops, rateDetails, ...workorderRequest} = reqCreator;
			await this.workorderService.saveWorkOrder(reqCreator)
			const stopIds = await this.ediService.getWorkOrderStopIds(reqCreator.workOrderId)
			if (stopIds.data) {
				for (const stopId of stopIds.data) {
					if (stops) {
						for (const stop of stops) {
							if (stopId.StopNumber === stop.stopNum) {
								if (stop.stopType === 'pickup') {
									stop.stopType = 'Pickup';
								} else if (stop.stopType === 'dropoff') {
									stop.stopType = 'Delivery';
								}
								stop.woStopId = stopId.Id
								stop.userId = reqCreator.userId;
								stop.workOrder_Id = reqCreator.workOrderId;
								stop.stopNumber = stop.stopNum
								stop.contact_Id = stop.contactId

								const fromDateTime = (stop.fromTime && stop.fromDate)
									? moment(`${stop.fromDate} ${stop.fromTime}`).format('YYYY-MM-DD HH:mm:ss') : null
								const fromDate = fromDateTime
								let toDate = ''
								let toDateTime = ''

								if ((stop.toDate === undefined || stop.toDate === null || stop.toDate === '') && stop.toTime && stop.fromDate) {
									toDate = (stop.fromDate && stop.toTime) ? moment(`${stop.fromDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
									toDateTime = toDate
								} else {
									toDateTime = (stop.toTime && stop.toDate) ? moment(`${stop.toDate} ${stop.toTime}`).format('YYYY-MM-DD HH:mm:ss') : null
									toDate = toDateTime
								}

								stop.fromDate = fromDate
								stop.fromTime = fromDateTime
								stop.toDate = toDate
								stop.toTime = toDateTime
								stop.notes = stop.stopInstructions

								stop.poNumber = ''
								if (stop.referenceNums) {
									const itemNum = (stop.referenceNums ? JSON.parse(`[ ${stop.referenceNums} ]`) : []);
									for (let i = 0; i < itemNum.length; i++) {
										const refNum = itemNum[i]
										if (refNum.referenceValue) {
											if (i === 0) {
												stop.poNumber += `${refNum.referenceValue}`
											} else {
												stop.poNumber += `, ${refNum.referenceValue}`
											}
										}
									}
								}
								await this.woStopService.saveWOStop(stop)
								await this.ediService.deleteWorkOrderStopItems(stopId.Id)

								if (reqCreator.items && reqCreator.items.length > 0) {
									for (let i = 0; i < reqCreator.items.length; i++) {
										const item = reqCreator.items[i]
										if (item.PickupStopNum === stop.stopNum || item.DropoffStopNum === stop.stopNum) {
											item.userId = reqCreator.userId;
											item.woStops_Id = stopId.Id;
											if (item.linkedWOStopsId) {
												const linkedStop = stops.find((s: any) => {
													return s.temp_id === item.linkedWOStopsId;
												});
												item.linkedWOStops_Id = linkedStop.id;
											}
											await this.woStopItemService.addWOStopItemForLoadTender(item, i);
										}
									}
								}
							}
						}
					}
				}
			}
			return {success: 'Workorder Updated Successfully', workOrderId : reqCreator.workOrderId}
		} catch (e) {
			return {error: e.message}
		}
	}

}

export default EdiController;

const exportHTMLLoadTenders = (result: any) => {
	let htmlString = '';
	htmlString += `<!doctype html> <html lang="en"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head> <body><style>.this-is {padding: 3px 0;font-size: 5px;border-top: 1px solid #dddddd;text-align: center;  border-right: 12px;}.generaltable {border: 1px solid #000000; border-right:hidden; border-left:hidden;border-bottom:hidden;border-spacing:0px;width:100%;font-size:8px;}.generaltable td, .generaltable tr {border: 1px solid #000000; border-spacing:0px;}.maintable td, .maintable tr {border: 1px solid #000000; border-spacing:0px;}.maintable {border: 1px solid #000000; border-right:hidden;border-top:hidden; border-left:hidden;border-spacing:0px;width:100%;font-size:10px;}</style>`;
	htmlString += `Load Tenders<table style="font-size:5px"><tr><table class="generaltable"><tr>`;
	htmlString += '<td>Customer</td><td>Ref #</td><td>From</td><td>To</td><td>Pickup</td><td>Delivery</td><td>Amount</td><td>Respond By</td><td>Status</td><td>CO#</td><td>WO#</td><td>Load Status</td></tr>';

	for (const item of result) {
		htmlString += `<tr><td>${item.billTo ? item.billTo : ''}</td><td>${item.shipmentId ? item.shipmentId : ''}</td><td>${item.fromAddress ? item.fromAddress : ''}</td><td>${item.toAddress ? item.toAddress : ''}</td><td>${item.pickupDate ? item.pickupDate : ''}</td><td>${item.deliveryDate ? item.deliveryDate : ''}</td><td>${item.totalCharge ? item.totalCharge : 0}</td><td>${item.respondBy ? item.respondBy : ''}</td><td>${item.status ? item.status : ''}</td><td>${item.coNumber ? item.coNumber : ''}</td><td>${item.workOrderNumber ? item.workOrderNumber : ''}</td><td>${item.loadStatus ? item.loadStatus : ''}</td><td>${item.status}</td>
		</tr>`;
	}

	htmlString += `</tr></table></body></html>`;

	return htmlString;
};