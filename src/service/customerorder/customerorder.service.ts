import Database from '../database/database';
import {DatabaseResponse} from '../database/database.interface';

export default class CustomerorderService {
	private database: Database;
  private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}

	public validateRefnoCusComIdInCO(req: any): Promise<any> {
	  return this.database.query(`
      CALL ValidateRefnoCusComIdInCO(
        ${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null},
        ${req.customer_Id ? req.customer_Id : null},
        ${req.companyId}
      )
    `)
  }
  
	public addCustomerOrder(req: any): Promise<any> {
	return this.database.query(`
      CALL addCustomerOrder_snew(
        ${req.status_Id},
        ${req.customer_Id},
        ${req.carrier_Id ? req.carrier_Id : null},
        ${req.equipmentType_Id},
        ${req.totalMiles ? req.totalMiles : null},
        ${req.brokeragePercent ? req.brokeragePercent : null},
        ${req.companyId},
        ${this.database.connection.escape(req.referenceNumber)},
        ${req.loadType ? this.database.connection.escape(req.loadType) : null},
        ${req.specialInstruction ? this.database.connection.escape(req.specialInstruction) : null},
        ${req.userId},
        ${req.loadAmount ? req.loadAmount : null},
        ${req.minimumAmount ? req.minimumAmount : null},
        ${req.paidWithIn ? req.paidWithIn : null},
        ${req.quickPayPCT ? req.quickPayPCT : null},
        ${req.comissionPCT ? req.comissionPCT : null},
        ${req.factor_Id ? req.factor_Id : null},
        ${req.temperature ? this.database.connection.escape(req.temperature) : null},     
        ${req.dispatcher_Id ? req.dispatcher_Id : null},
        ${this.database.connection.escape(req.billToType)},
		${req.billTo_Id ? req.billTo_Id : req.customer_Id},
        ${req.contactPerson_Id ? req.contactPerson_Id : null},
        ${req.isHazmat ? req.isHazmat : 0},
        ${req.salesAgentPCT ? req.salesAgentPCT : null},
        ${req.salesAgentAmount ? req.salesAgentAmount : null},
        ${req.dispatchPCT ? req.dispatchPCT : null},
        ${req.salesAgent_Id ? req.salesAgent_Id : null},
        ${req.bookNowAmount ? req.bookNowAmount : null}
      )
    `)
  }

  public getCoListLoad(req: any): Promise<any> {
	return this.databaseget.query(`
              CALL getCoListLoad_snew(
                ${req.companyId},
                ${req.coNumber ? this.database.connection.escape(req.coNumber) : null},
                ${req.carrier_Id ? req.carrier_Id : null},
                ${req.customerName ? this.database.connection.escape(req.customerName) : null},
                ${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
                ${req.pickupFromDate ? this.database.connection.escape(req.pickupFromDate) : null},
                ${req.pickupToDate ? this.database.connection.escape(req.pickupToDate) : null}, 
                ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
                ${req.delToDate ? this.database.connection.escape(req.delToDate) : null}, 
                ${req.fromState ? this.database.connection.escape(req.fromState) : null},
                ${req.toState ? this.database.connection.escape(req.toState) : null}, 
                ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
                ${req.toCity ? this.database.connection.escape(req.toCity) : null}, 
                ${req.dispatcher_Id ? req.dispatcher_Id : null},
                ${req.status_Id ? req.status_Id : null},
                ${req.isDeleted},
                ${req.pageSize ? req.pageSize:50},
                ${req.pageIndex ? req.pageIndex:0},
                ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
                ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
              )
            `)
	}
  public getCoListLoadsGroupby(req: any): Promise<any> {
	return this.databaseget.query(`
                CALL getcoListLoadsgroupby_snew(
                  ${req.companyId},
                  ${req.groupByName ? this.database.connection.escape(req.groupByName) : null},
                  ${req.isDefault},
                  ${req.status ? this.database.connection.escape(req.status) : null},
                  ${req.customerName ? this.database.connection.escape(req.customerName) : null},
                  ${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
                  ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
                  ${req.toDate ? this.database.connection.escape(req.toDate) : null}, 
                  ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
                  ${req.toCity ? this.database.connection.escape(req.toCity) : null}, 
                  ${req.fromState ? this.database.connection.escape(req.fromState) : null},
                  ${req.toState ? this.database.connection.escape(req.toState) : null}, 
                  ${req.dipatcher_Id ? this.database.connection.escape(req.dipatcher_Id) : null},
                  ${req.carrier_Id ? req.carrier_Id : null},
                  ${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
                  ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
                  ${req.delToDate ? this.database.connection.escape(req.delToDate) : null}, 
                  ${req.hasIncidents},
                  ${req.pageSize ? req.pageSize:50},
                  ${req.pageIndex ? req.pageIndex:0},
                  ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
                  ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
                )
              `)
	}
  
	public getCOLoads(req: any): Promise<any> {
		return this.databaseget.query(`
                CALL getCOLoads_snew(
                  ${req.companyId},
                  ${req.coNumber ? this.database.connection.escape(req.coNumber) : null},
                  ${req.customerName ? this.database.connection.escape(req.customerName) : null},
                  ${req.carrier_Id ? req.carrier_Id : null},
                  ${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
                  ${req.pickupFromDate ? this.database.connection.escape(req.pickupFromDate) : null},
                  ${req.pickupToDate ? this.database.connection.escape(req.pickupToDate) : null}, 
                  ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
                  ${req.delToDate ? this.database.connection.escape(req.delToDate) : null}, 
                  ${req.fromState ? this.database.connection.escape(req.fromState) : null},
                  ${req.toState ? this.database.connection.escape(req.toState) : null}, 
                  ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
                  ${req.toCity ? this.database.connection.escape(req.toCity) : null}, 
                  ${req.dispatcher_Id ? req.dispatcher_Id : null},
                  ${req.status_Id ? req.status_Id : null},
                  ${this.database.connection.escape(req.status)},
                  ${req.pageSize ? req.pageSize:50},
                  ${req.pageIndex ? req.pageIndex:0},
                  ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
                  ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
                )
              `)
		}

  	public getCOLoadsgroupby(req: any): Promise<any> {
		return this.databaseget.query(`
                  CALL getcoLoadsgroupby(
                    ${this.database.connection.escape(req.status)},
                    ${this.database.connection.escape(req.columnName)},
                    ${req.companyId},
                    ${req.customerName ? this.database.connection.escape(req.customerName) : null},
                    ${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
                    ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
                    ${req.toDate ? this.database.connection.escape(req.toDate) : null}, 
                    ${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
                    ${req.toCity ? this.database.connection.escape(req.toCity) : null}, 
                    ${req.fromState ? this.database.connection.escape(req.fromState) : null},
                    ${req.toState ? this.database.connection.escape(req.toState) : null}, 
                    ${req.terminal_Id ? req.terminal_Id : null},
                    ${req.dispatcher_Id ? req.dispatcher_Id : null},
                    ${req.coNum ? this.database.connection.escape(req.coNum) : null},
                    ${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
                    ${req.delToDate ? this.database.connection.escape(req.delToDate) : null}, 
                    ${req.hasIncidents ? req.hasIncidents : null},
                    ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
                  )
                `)
		}
  
  
  public async saveCustomerOrder(req: any): Promise<any> {
		let text = '';
		const coFields: any = ['status_Id', 'customer_Id','carrier_Id', 'referenceNumber', 'loadType', 'equipmentType_Id', 'specialInstruction', 'totalMiles', 'truckNumber', 'driverName', 'driverPhoneNumber', 'currentLocation', 'isStandardPay', 'isQuickPay', 'quickPayPCT', 'minimumAmount','paidWithIn','carrierInvoicedDate','carrierInvoicedAmount','carrierPaidDate','carrierPaidAmount','carrierPaymentType','chequeNumber','carrierNotes','isDeleted','brokeragePercent','loadAmount','isCarrierPaid','isFullyPaid','termsAndConditions','isBOLReceived','bolReceivedDate','isLumperReceived','lumperReceiveDate','coCarrierSettlement_Id','carrierRate','comissionPCT','factor_Id','temperature','bolReceivedBy','isPostLB','postedUser_Id','postedDateTime','bookNowAmount','dispatcher_Id','billTo_Id','billToType','datLoadId','truckStopsLoadId', 'lumper','isAutoReposting','autoRepostingType','autoRepostingDuration','isPostLBRestricted', 'dispatchPCT', 'isHazmat', 'salesAgentPCT', 'salesAgentAmount', 'contactPerson_Id', 'salesAgent_Id','isSalesAgentPaid','salesAgentPaidAmount','salesAgentPaidDate','salesAgentSettlement_Id'];
		Object.keys(req).map((key) => {
			if (coFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.customerOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    customerorder
                SET
                    ${text}
                WHERE
                    Id = ${req.customerOrderId}
            `);
	}
}	 

	public async getCOdetailsbyCOId(req: any):Promise<any> {
		return this.databaseget.query(`
          CALL getCOdetailsbyCOId_snew(
            ${req.companyId},
            ${req.coId}
          )
        `);
	}

  public COStatusChange(req: any): Promise<any> {
		return this.database.query(`
			call COStatusChange(${req.customerOrder_Id},
								${req.coRelay_Id},
								${req.status_Id},
								${req.userId},
								${req.allLegs ? req.allLegs : 0}
								)
		`);
	}
	public getCORateConPrintDetails(req: any): Promise<any> {
		return this.database.query(`
			call getCORateConPrintDetails_snew(
			${req.co_Id},
			${req.coRelay_Id}
		)`);
	}
	public getCOCarrierlineitemsByRelayId(req: any): Promise<any> {
		return this.database.query(`
			call getCOCarrierlineitemsByRelayId_snew(
			   ${req.coRelay_Id}
		)`);
	}
	public getCOCarrierlineitemsByCOId(req: any): Promise<any> {
		return this.database.query(`
			call getCOCarrierlineitemsByCOId_snew(
			   ${req.co_Id}
		)`);
	}
	public getCOStopsByRelayId(req: any): Promise<any> {
		return this.database.query(`
			call getCOStopsByRelayId_snew(
			   ${req.coRelay_Id}
		)`);
	}
	public getCOStopsByCOId(customerOrderId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getCOStopsByCOId_snew(${customerOrderId}
			);
		`);
	}
	public getCompanyInfoById(companyId: number): Promise<any> {
		return this.databaseget.query(`
			select c.brokerageCompanyName as name, c.brokerageCompanyEmail as email, c.brokerageCompanyLogo as logoUrl, c.brokerageCompanyPhone as phone, a.address1, a.city, a.state, a.zip from company c left join address a on a.Id = c.BrokerageCompanyAddress_Id where c.Id = ${companyId}
		`);
	}
	public addCoRateConSentLog(req: any): Promise<any> {
		return this.databaseget.query(`
			insert into corateconsentlog
			 (CustomerOrder_Id,Emails,Documents,Relay_Id) 
			 values (
			 ${req.co_Id},
			 ${req.emails ? this.database.connection.escape(req.emails) : null},
			 'Rate Confirmation',
			 ${req.coRelay_Id}
			 )
		`);
	}

	public async getCarrierAmountBrokerage(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getCarrierAmountBrokerage(
			${req.co_Id},
			${req.coRelay_Id}
		)`
		);
	}

	public async addLoadBoardLogs(req: any): Promise<any> {
		return this.database.query(`
            INSERT INTO loadboardlogs(Company_Id,CustomerOrder_Id, LoadType, Error, Success,LoadBordLoadId,ActivityType, createdAt, createdUserId)
            Values (${req.company_Id ? req.company_Id : null},
                    ${req.customerOrder_Id ? req.customerOrder_Id : null},
                    ${req.loadType ? this.database.connection.escape(req.loadType) : null},
                    ${req.error ? this.database.connection.escape(req.error) : null},
                    ${req.success ? req.success : null},
                    ${req.loadBordLoadId ? this.database.connection.escape(req.loadBordLoadId): null},
                    ${req.activityType ? this.database.connection.escape(req.activityType): null},
                    UTC_TIMESTAMP,
                    ${req.userId ? req.userId : null})
		`);
	}

	public async getLoadBoardReport(req: any): Promise<any> {
		return this.database.query(`
		call getLoadBoardReport(
		 ${req.companyId},
		 ${req.co_Id ? req.co_Id : null},
		 ${req.success ? req.success : null},
		 ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
         ${req.toDate ? this.database.connection.escape(req.toDate) : null},
		 ${req.pageSize ? req.pageSize : 50},
         ${req.pageIndex ? req.pageIndex : 0},
         ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
         ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
		)`);
	}

	public async getCustomerOrderInfoById(coId:number):Promise<any>{
		return this.database.query(`
		call getCustomerOrderInfoById(${coId})
		`)
	}

	public async getCOCustomerSummary(req: any): Promise<any> {
		return this.databaseget.query(`
		call getCOCustomerSummary_snew(
		 ${req.companyId},
		 ${req.customer_Id ? req.customer_Id : null},
		 ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
     ${req.toDate ? this.database.connection.escape(req.toDate) : null},
		 ${req.pageSize ? req.pageSize : 50},
     ${req.pageIndex ? req.pageIndex : 0},
     ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
     ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
		)`);
	}

	public async getCOCarrierSummary(req: any): Promise<any> {
		return this.databaseget.query(`
		call getCOCarrierSummary_snew(
		 ${req.companyId},
		 ${req.carrier_Id ? req.carrier_Id : null},
		 ${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
     ${req.toDate ? this.database.connection.escape(req.toDate) : null},
		 ${req.pageSize ? req.pageSize : 50},
     ${req.pageIndex ? req.pageIndex : 0},
     ${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
     ${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
		)`);
	}
}
