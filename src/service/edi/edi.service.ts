import Database from '../database/database';
import axios, {AxiosInstance} from 'axios';
import moment from 'moment';

class EdiService {
	private client: AxiosInstance;
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
		this.client = axios.create({
			baseURL: 'http://localhost:4019'
		})
	}

	public getEdiSendStatusLog(loadTenderId: any) : Promise<any>{
		return this.databaseget.query(`
			CALL getedisendstatuslog_snew(
				${loadTenderId}
		 	)
		`)
	}

	public getLoadTendersListByCompanyId(req: any) : Promise<any>{
		return this.databaseget.query(`
			 CALL getLoadTendersListByCompanyId_snew(
				 ${req.companyId},
				 ${req.fromDate ? this.db.connection.escape(req.fromDate) :null},
				 ${req.toDate ? this.db.connection.escape(req.toDate):null},
				 ${req.delfromDate ? this.db.connection.escape(req.delfromDate):null},
				 ${req.deltoDate ? this.db.connection.escape(req.deltoDate):null},
				 ${req.customerName ? this.db.connection.escape(req.customerName):null},
				 ${req.status ? this.db.connection.escape(req.status):null},
				 ${req.isOpened ? req.isOpened : 0},
				 ${req.refNumber ? this.db.connection.escape(req.refNumber):null},
				 ${req.pageSize ? req.pageSize : 50},
				 ${req.pageIndex ? req.pageIndex : 0},
				 ${req.sortExpression ? this.db.connection.escape(req.sortExpression) : null},
				 ${req.sortDirection ? this.db.connection.escape(req.sortDirection) : null}
			 )
		`)
	}

	public getUnopenedLTs(req:any):Promise<any>{
		return this.databaseget.query(`
		 CALL getUnopenedLTs_snew(
			 ${req.companyId}
		 )
		`)
	}  

	public getStopDetailsByLoadTenderId(loadTenderId: any):Promise<any>{
		return this.databaseget.query(`
		 CALL getStopDetailsbyLoadTenderId_snew(
			 ${loadTenderId}
		 )
		`)
	}

	public getRateDetailsByLoadTenderId(loadTenderId: any):Promise<any>{
		return this.databaseget.query(`
		 CALL getRateDetailsbyLoadTenderId_snew(
			 ${loadTenderId}
		 )
		`)
	}

	public getItemsByLoadTenderId(loadTenderId: any):Promise<any>{
		return this.databaseget.query(`
			 Select * from loadtenderitems where LoadTender_Id = ${loadTenderId}
		`)
	}

	public getLoadTenderById(loadTenderId: any):Promise<any>{
		return this.databaseget.query(`
		 CALL getLoadTenderById(
			 ${loadTenderId}
		 )
		`)
	}

	public getLoadTendersUpdateLog(loadTenderId:any):Promise<any>{
		return this.databaseget.query(`
		 CALL getLoadtendersUpdateLog_snew(
			 ${loadTenderId}
		 )
		`)
	}

	public getLoadTenderRawData(loadTenderId:any):Promise<any>{
		return this.databaseget.query(`
			 CALL getLoadtenderLogData(
				 ${loadTenderId}
			 )
		`)
	}

	public updateLoadTender(req:any): Promise<any> {
		let text = '';
		const lineFields: any = [
			'isOpened', 'workOrder_Id', 'customerOrder_Id', 'status'];
		Object.keys(req).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.loadTenderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    loadTenders
                SET
                    ${text}
                WHERE
                    Id = ${req.loadTenderId}
            `);
		} else {
			return null
		}
	}

	public async getEdiCustomerIdAndPassword(companyId: number) : Promise<any> {
		return this.databaseget.query(`select EDICustId, EDIPassword, Name from company where Id=${companyId}`);
	}

	public async getEdiResponse(req: any): Promise<any> {
		return this.client.post(`/integrations/api/edi/getEdiResponse`, { data : req }, {
			headers:{ 'Content-Type': 'application/json'}
		});
	}

	public async getEDIInvoiceDetails(req: any): Promise<any>{
		return this.databaseget.query(`
			CALL getEDIInvoiceDetails(
				${req.invoiceId},
				${req.type ? this.db.connection.escape(req.type) : null}
			)
		`)
	}

	public async ediSendStatusLog(req: any, respon: string): Promise<any> {
		return this.databaseget.query(`
			INSERT INTO edisendstatuslog(LoadTender_Id, WorkOrder_Id, CustomerOrder_Id, Status, Response, StatusDate)
			VALUES(
				${req.loadTenderId},
				${req.workOrderId ? req.workOrderId : null},
				${req.customerOrderId ? req.customerOrderId : null},
				${req.bodystr ? this.db.connection.escape(req.bodystr) : null},
				${respon ? this.db.connection.escape(respon) : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async getStatusDetails(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL get214statusdetails(
				${req.loadTenderId},
				${req.workOrderId ? req.workOrderId : 0},
				${req.customerOrderId ? req.customerOrderId : 0},
				${req.companyId}
			)
		`)
	}

	public async createEdiInvoiceLog(req : any): Promise<any> {
		return this.db.query(`
			INSERT INTO ediinvoicelog(Status, Message, MessageCode, BrokerInvoice_Id, WOInvoice_Id, COInvoice_Id)
			VALUES(
				${req.status ? this.db.connection.escape(req.status) : null},
				${req.message ? this.db.connection.escape(req.message) : null},
				${req.messageCode ? this.db.connection.escape(req.messageCode) : null},
				${req.brokerInvoice_Id ? req.brokerInvoice_Id : null},
				${req.wOInvoice_Id ? req.wOInvoice_Id : null},
				${req.cOInvoice_Id ? req.cOInvoice_Id : null}
			)
		`)
	}

	public async updateEdiLoadTenderUpdateLog(status: string, loadTenderId: any): Promise<any> {
		return this.databaseget.query(`
			CALL updateediloadtenderupdatelog(
				${this.db.connection.escape(status)},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))},
				${loadTenderId}
			)
		`)
	}

	public async validateLoadTender(companyId: number, shipmentId: any, tradingPartnerId: any): Promise<any> {
		return this.databaseget.query(`
		 CALL ValidateLoadtender(
		 	${companyId},
		 	${this.db.connection.escape(shipmentId)},
		 	${this.db.connection.escape(tradingPartnerId)}
		 )
		`)
	}

	public async ediLoadTenderLog(statusIn: any): Promise<any> {
		return this.db.query(`
			INSERT INTO ediloadtenderlog(Company_Id, Status, Message, MessageCode, Count, TendersData, createdAt)
			VALUES(
				${statusIn.companyId},
				${statusIn.status ? this.db.connection.escape(statusIn.status) : null},
				${statusIn.message ? this.db.connection.escape(statusIn.message) : null},
				${statusIn.messageCode ? this.db.connection.escape(statusIn.messageCode) : null},
				${statusIn.count ? statusIn.count : 0},
				${statusIn.tendersData ? this.db.connection.escape(statusIn.tendersData) : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async ediLoadTenderUpdateLog(req: any): Promise<any>{
		return this.db.query(`
			INSERT INTO ediloadtenderupdatelog(Purpose, LoadTender_Id, TenderData, Status, StatusDate, Changes, createdUserId, Request, Response, createdat)
			VALUES(
				${req.purpose ? this.db.connection.escape(req.purpose) : null},
				${req.loadTenderId ? req.loadTenderId : null},
				${req.tenderData ? this.db.connection.escape(req.tenderData) : null},
				${req.status ? this.db.connection.escape(req.status) : null},
				${req.statusDate ? this.db.connection.escape(req.statusDate) : null},
				${req.changes ? this.db.connection.escape(req.changes) : null},
				${req.userId ? req.userId : 0},
				${req.request ? this.db.connection.escape(req.request) : null},
				${req.response ? this.db.connection.escape(req.response) : null},
				UTC_TIMESTAMP
			)
		`)
	}

	public async deleteLoadTenderData(loadTenderId: any): Promise<any>{
		return this.db.query(`
			CALL deleteLoadtenderData(
				${loadTenderId}
			)
		`)
	}

	public async getBillToFactorFromContact(contactId : any): Promise<any> {
		return this.db.query(` select BillToFactor from contact where Id = ${contactId}`)
	}

	public async getFactorId(companyId : any): Promise<any> {
		return this.db.query(` select Factor_Id from company where Id = ${companyId}`)
	}

	public async updateLoadTenderDB(req : any, userId: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'company_Id','tradingPartnerId','shipmentId', 'purpose', 'equipmentType','specialInstructions', 'paymentTerms', 'respondByDate', 'respondByTime', 'timeZone', 'totalCharge', 'billTo_Id', 'miles', 'isOpened'];
		Object.keys(req).map((key) => {
			if (driverFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.id) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${userId}`;
			return this.db.query(`
                UPDATE
				loadtenders
                SET
                    ${text}
                WHERE
                    Id = ${req.id}
            `);
		} else {
			return null
		}
	}

	public async getLocalLoadTenderModel(companyId: any, tradingPartnerId: any): Promise<any>{
		return this.databaseget.query(`select Contact_Id from tradingpartners where company_Id=${companyId} and tradingpartnerId=${this.db.connection.escape(tradingPartnerId)}`);
	}

	public async createLoadTender(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO loadtenders(Company_Id, TradingPartnerId, ShipmentId, Purpose, EquipmentType, PaymentTerms, SpecialInstructions, BillTo_Id, Miles, RespondByDate, RespondByTime, 
				TimeZone, TotalCharge, CurrencyCode)
			VALUES(
				${req.companyId},
				${req.tradingPartnerId ? this.db.connection.escape(req.tradingPartnerId) : null},
				${req.shipmentId ? this.db.connection.escape(req.shipmentId) : null},
				${req.purpose ? this.db.connection.escape(req.purpose) : null},
				${req.equipmentType ? this.db.connection.escape(req.equipmentType) : null},
				${req.paymentTerms ? this.db.connection.escape(req.paymentTerms) : null},
				${req.specialInstructions ? this.db.connection.escape(req.specialInstructions) : null},
				${req.billToId ? req.billToId : null},
				${req.miles ? this.db.connection.escape(req.miles) : null},
				${req.respondByDate ? this.db.connection.escape(req.respondByDate) : null},
				${req.respondByTime ? this.db.connection.escape(req.respondByTime) : null},
				${req.timeZone ? this.db.connection.escape(req.timeZone) : null},
				${req.totalCharge ? this.db.connection.escape(req.totalCharge) : null},
				${req.currencyCode ? this.db.connection.escape(req.currencyCode) : null}
			)
		`)
	}

	public async updateLoadTenderData(req: any): Promise<any> {
		let text = '';
		const lineFields: any = ['error'];
		Object.keys(req).map((key) => {
			if (lineFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.loadtenderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    loadTenders
                SET
                    ${text}
                WHERE
                    Id = ${req.loadtenderId}
            `);
		} else {
			return null
		}
	}

	public async createReferenceNo(refNums: any): Promise<any>{
		return this.db.query(`
			INSERT INTO referencenums(LoadTender_Id, Stops_Id, ReferenceType, ReferenceText, ReferenceValue, createdAt)
			VALUES(
				${refNums.loadTenderId ? refNums.loadTenderId : 0},
				${refNums.stopsId ? refNums.stopsId : 0},
				${refNums.referenceType ? this.db.connection.escape(refNums.referenceType) : null},
				${refNums.referenceText ? this.db.connection.escape(refNums.referenceText) : null},
				${refNums.referenceValue ? this.db.connection.escape(refNums.referenceValue) : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createStop(stopData: any): Promise<any>{
		return this.db.query(`
			INSERT INTO stops(LoadTender_Id, StopNum, StopType, StopInstructions, ApptRequired, ExpectedDate, ExpectedTimeStart, ExpectedTimeEnd, TimeZone, createdAt)
			VALUES(
				${stopData.loadTenderId},
				${stopData.stopNum ? this.db.connection.escape(stopData.stopNum) : null},
				${stopData.stopType ? this.db.connection.escape(stopData.stopType) : null},
				${stopData.stopInstructions ? this.db.connection.escape(stopData.stopInstructions) : null},
				${stopData.apptRequired ? this.db.connection.escape(stopData.apptRequired) : null},
				${stopData.expectedDate ? this.db.connection.escape(stopData.expectedDate) : null},
				${stopData.expectedTimeStart ? this.db.connection.escape(stopData.expectedTimeStart) : null},
				${stopData.expectedTimeEnd ? this.db.connection.escape(stopData.expectedTimeEnd) : null},
				${stopData.timeZone ? this.db.connection.escape(stopData.timeZone) : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async contactByNameAddress(companyId: any, stopContact: any, stopContactAddress: any): Promise<any> {
		return this.db.query(`
			CALL getContactByNameAdress(
				${companyId},
				${stopContact.name ? this.db.connection.escape(stopContact.name) : null},
				'Facility',
				${stopContactAddress.address1 ? this.db.connection.escape(stopContactAddress.address1) : null},
				${stopContactAddress.address2 ? this.db.connection.escape(stopContactAddress.address2) : null},
				${stopContactAddress.city ? this.db.connection.escape(stopContactAddress.city) : null},
				${stopContactAddress.state ? this.db.connection.escape(stopContactAddress.state) : null},
				${stopContactAddress.zip ? this.db.connection.escape(stopContactAddress.zip) : null},
				1,
				0
			)
		`)
	}

	public async createAddress(stopContactAddress: any): Promise<any> {
		return this.db.query(`
			INSERT INTO address(Address1, Address2, City, State, Zip, createdAt)
			VALUES(
				${stopContactAddress.address1 ? this.db.connection.escape(stopContactAddress.address1) : null},
				${stopContactAddress.address2 ? this.db.connection.escape(stopContactAddress.address2) : null},
				${stopContactAddress.city ? this.db.connection.escape(stopContactAddress.city) : null},
				${stopContactAddress.state ? this.db.connection.escape(stopContactAddress.state) : null},
				${stopContactAddress.zip ? this.db.connection.escape(stopContactAddress.zip) : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createContact(stopContact: any): Promise<any> {
		return this.db.query(`
			INSERT INTO contact(Name, Phone, Fax, Email, Company_Id, ContactType, Address_Id, createdAt)
			VALUES(
				${stopContact.name ? this.db.connection.escape(stopContact.name) : null},
				${stopContact.phone ? this.db.connection.escape(stopContact.phone) : null},
				${stopContact.fax ? this.db.connection.escape(stopContact.fax) : null},
				${stopContact.email ? this.db.connection.escape(stopContact.email) : null},
				${stopContact.companyId ? stopContact.companyId : null},
				${stopContact.contactType ? this.db.connection.escape(stopContact.contactType) : null},
				${stopContact.addressId ? stopContact.addressId : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createStopContact(stopContact: any): Promise<any> {
		return this.db.query(`
			INSERT INTO stopcontacts(Stops_Id, Contact_Id, CompanyId, createdAt)
			VALUES(
				${stopContact.stopsId ? stopContact.stopsId : null},
				${stopContact.contactId ? stopContact.contactId : null},
				${stopContact.companyId ? stopContact.companyId : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createstopAccessorial(stopAccessorial: any): Promise<any> {
		return this.db.query(`
			INSERT INTO stopaccessorials(Stops_Id, Name, Code, Charge, createdAt)
			VALUES(
				${stopAccessorial.stopsId ? stopAccessorial.stopsId : null},
				${stopAccessorial.name ? this.db.connection.escape(stopAccessorial.name)  : null},
				${stopAccessorial.code ? this.db.connection.escape(stopAccessorial.code)  : null},
				${stopAccessorial.charge ? this.db.connection.escape(stopAccessorial.charge)  : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createLoadTenderItem(itemValues : any): Promise<any>{
		return this.db.query(`
			INSERT INTO loadtenderitems(LoadTender_Id, PickupStopNum, DropoffStopNum, ItemNum, \`Desc\`, HandlingUnitCount, HandlingUnit, PackagingUnitCount, PackagingUnit, Weight, WeightUnits, 
				Length, Width, Height, DimensionUnits, Volume, VolumeUnits, NmfcClass, IsHazardousMaterials, PONumber, CONumber, createdAt)
			VALUES(
				${itemValues.loadTenderId ? itemValues.loadTenderId : null},
				${itemValues.pickupStopNum ? itemValues.pickupStopNum  : 0},
				${itemValues.dropoffStopNum ? itemValues.dropoffStopNum  : 0},
				${itemValues.itemNum ? this.db.connection.escape(itemValues.itemNum)  : null},
				${itemValues.desc ? this.db.connection.escape(itemValues.desc)  : null},
				${itemValues.handlingUnitCount ? itemValues.handlingUnitCount  : 0},
				${itemValues.handlingUnit ? this.db.connection.escape(itemValues.handlingUnit)  : null},
				${itemValues.packagingUnitCount ? itemValues.packagingUnitCount  : 0},
				${itemValues.packagingUnit ? this.db.connection.escape(itemValues.packagingUnit)  : null},
				${itemValues.weight ? itemValues.weight  : null},
				${itemValues.weightUnits ? this.db.connection.escape(itemValues.weightUnits)  : null},
				${itemValues.length ? itemValues.length  : 0},
				${itemValues.width ? itemValues.width  : 0},
				${itemValues.height ? itemValues.height  : 0},
				${itemValues.dimensionUnits ? this.db.connection.escape(itemValues.dimensionUnits)  : null},
				${itemValues.volume ? itemValues.volume  : 0},
				${itemValues.volumeUnits ? this.db.connection.escape(itemValues.volumeUnits)  : null},
				${itemValues.nmfcClass ? itemValues.nmfcClass  : 0},
				${itemValues.isHazardousMaterials ? itemValues.isHazardousMaterials : 0},
				${itemValues.poNumber ? this.db.connection.escape(itemValues.poNumber)  : null},
				${itemValues.coNumber ? this.db.connection.escape(itemValues.coNumber)  : null},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async createLoadtTenderRateDetails(ratedetails : any): Promise<any>{
		return this.db.query(`
			INSERT INTO loadtenderratedetails(Description_Id, Amount, Units, Per, Notes, LoadTender_Id, createdAt)
			VALUES(
				${ratedetails.descriptionId ? ratedetails.descriptionId : null},
				${ratedetails.amount ? this.db.connection.escape(ratedetails.amount)  : null},
				${ratedetails.units ? ratedetails.units  : 0},
				${ratedetails.per ? ratedetails.per  : 0},
				${ratedetails.notes ? this.db.connection.escape(ratedetails.notes)  : null},
				${ratedetails.loadTenderId},
				${this.db.connection.escape(moment.utc().format('YYYY-MM-DD HH:mm:ss'))}
			)
		`)
	}

	public async updateStopMissingFields(missingFields: any, stopId: any): Promise<any>{
		try {
			return this.databaseget.query(
				`update stops set MissingFields=${missingFields ? this.db.connection.escape(JSON.stringify(missingFields)) : ''} where Id=${stopId}`
			)
		} catch (e) {
			return
		}
	}

	public async updateLoadTenderMissingFields(missingFields: any, loadTenderId: any): Promise<any>{
		try {
			return this.databaseget.query(
				`update loadtenders set MissingFields=${missingFields ? this.db.connection.escape(JSON.stringify(missingFields)) : ''} where Id=${loadTenderId}`
			)
		} catch (e) {
			return
		}
	}

	public async getWorkOrderStopIds(workOrderId: any): Promise<any>{
		return this.databaseget.query(`select Id, StopNumber from wostops where WorkOrder_Id = ${workOrderId}`)
	}

	public async getCustomerOrderStopIds(customerOrderId: any): Promise<any>{
		return this.databaseget.query(`select Id, StopNumber from costops where CustomerOrder_Id = ${customerOrderId}`)
	}

	public async deleteWorkOrderStopItems(stopId: any): Promise<any>{
		return this.databaseget.query(`update wostopitems set IsDeleted = 1 where WOStops_Id = ${stopId}`)
	}

	public async deleteCustomerOrderStopItems(stopId: any): Promise<any>{
		return this.databaseget.query(`update costopitems set IsDeleted = 1 where COStops_Id = ${stopId}`)
	}
}

export default EdiService;
