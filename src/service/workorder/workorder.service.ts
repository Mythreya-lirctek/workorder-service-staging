import Database from '../database/database';
import { WorkOrderCreateRequest, WorkorderStop, WorkorderRateDetail, AvailableLoad, AvailableLoadStopItem } from './workorder.interface';
import { DatabaseResponse } from '../database/database.interface';

export default class WorkorderService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
	}

	public addWorkorder(workOrder: WorkOrderCreateRequest): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL AddWorkOrder_snew(
				${workOrder.loadType ? this.database.connection.escape(workOrder.loadType) : '"Full Load"'},
				${workOrder.isIntermodal ? workOrder.isIntermodal : null},
				${this.database.connection.escape(workOrder.refNumber)},
				${workOrder.customer_Id},
				${workOrder.equipment_Id},
				${this.database.connection.escape(workOrder.billToType)},
				${workOrder.billTo_Id},
				${workOrder.loadAmount ? workOrder.loadAmount : 0},
				${workOrder.notes ? this.database.connection.escape(workOrder.notes) : null},
				${workOrder.miles ? workOrder.miles : null},
				${workOrder.status_Id},
				${workOrder.companyId},
				${workOrder.userId},
				${workOrder.legType ? this.database.connection.escape(workOrder.legType) : null},
				${workOrder.isHazmat ? workOrder.isHazmat : 0},
				${workOrder.loadCategory ? this.database.connection.escape(workOrder.loadCategory) : null},
				${workOrder.loadPriority ? this.database.connection.escape(workOrder.loadPriority) : null},
				${workOrder.lumperPaidby ? this.database.connection.escape(workOrder.lumperPaidby) : null},
				${workOrder.lumper ? workOrder.lumper : 0},
				${workOrder.ratePerMile ? workOrder.ratePerMile : null},
				${workOrder.contactPersonId ? workOrder.contactPersonId : null },
				${workOrder.agent_Id ? workOrder.agent_Id : null},
				${workOrder.agentPCT ? workOrder.agentPCT : null},
				${workOrder.agentAmount ? workOrder.agentAmount : 0},
				${workOrder.temperature ? this.database.connection.escape(workOrder.temperature) : null},
				${workOrder.dispatcher_Id ? workOrder.dispatcher_Id : null},
				${workOrder.factor_Id ? workOrder.factor_Id : null},
				${workOrder.subCompany_Id ? workOrder.subCompany_Id : null}
			);
		`)
	}
	
	public async saveWorkOrder(req: any): Promise<any> {
		let text = '';
		const driverFields: any = [
			'loadType', 'isIntermodal', 'refNumber', 'customer_Id', 'equipment_Id', 'billToType', 'billTo_Id', 'loadAmount', 'miles', 'notes', 'status_Id', 'isDeleted', 'isFullyPaid', 'legType', 'isHazmat','loadCategory','loadPriority','rateperMile','lumperPaidby','lumper','isBOLReceived','bolReceivedDate','contactPersonId','agent_Id','agentPCT','agentAmount','customerOrder_Id','isAltCompany','bolNumber','temperature','dispatcher_Id','isAgentPaid','agentPaidAmount','agentPaidDate','branch','subCompany_Id','hasDetention'];
		Object.keys(req).map((key) => {
			if (driverFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.workOrderId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
                    workorder
                SET
                    ${text}
                WHERE
                    Id = ${req.workOrderId}
            `);
		} else {
			return null
		}
	}	

	public validateOrderData(refNumber: string, customerId: number, companyId: number): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL ValidateRefnoCusComId(
				"${refNumber}",
				${customerId},
				${companyId}
			);
		`);
	}

	public async getDBLoadsgroupby(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLoadsgroupby(
			${this.database.connection.escape(req.statusName)},
			${this.database.connection.escape(req.groupbyColumn)},
			${req.companyId},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.terminal ? this.database.connection.escape(req.terminal) : null},
			${req.dispatcher ? this.database.connection.escape(req.dispatcher) : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.deliveryFromDate ? `'${req.deliveryFromDate}'` : null},
			${req.deliveryToDate ? `'${req.deliveryToDate}'` : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	
	public async getDBLoads(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLoads_snew(
			${req.companyId},
			${this.database.connection.escape(req.statusName)},
			${req.status_Id},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.terminal_Id ? req.terminal_Id : null},
			${req.dispatcher_Id ? this.database.connection.escape(req.dispatcher_Id) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.deliveryFromDate ? this.database.connection.escape(req.deliveryFromDate) : null},
			${req.deliveryToDate ? this.database.connection.escape(req.deliveryToDate) : null},
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.loadsType  ?this.database.connection.escape(req.loadsType ) : null},
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.isMainCompany},
			${req.shipper_Id ? req.shipper_Id : null},
			${req.consignee_Id ? req.consignee_Id : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
			)`
		);
	}
	
	public async getDBLTLLoads(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLTLLoads_snew(
			${req.companyId},
			${this.database.connection.escape(req.statusName)},
			${req.status_Id},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.terminal_Id ? req.terminal_Id : null},
			${req.dispatcher_Id ? this.database.connection.escape(req.dispatcher_Id) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.deliveryFromDate ? this.database.connection.escape(req.deliveryFromDate) : null},
			${req.deliveryToDate ? this.database.connection.escape(req.deliveryToDate) : null},
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.loadsType  ?this.database.connection.escape(req.loadsType ) : null},
			${req.subCompany_Id ? req.subCompany_Id:null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
			)`
		);
	}
	
	public async saveAvailableLoad(req : any): Promise<any> {
		let text = '';
		const stopFields: any = [
			'workOrder_Id','dispatchOrder_Id', 'pallets', 'pieceCount', 'origin_Id', 'destination_Id', 'alNumber','itemNumber', 'commodity','weight', 'length', 'parentOrigin_Id', 'parentDestination_Id', 'parentAvailableloads_Id','isDeleted'];
		Object.keys(req).map((key) => {
			if (stopFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.database.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text) {
			
			let whereCon = '';
			
			if (req.availableLoad_Id) {
				whereCon = `Id =${req.availableLoad_Id}`;
			} else if (req.dispatchOrder_Id) {
				whereCon = `dispatchOrder_Id =${req.dispatchOrder_Id}`;
			} else if (req.workOrder_Id) {
				whereCon = `workOrder_Id =${req.workOrder_Id}`;
			}
			
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.database.query(`
                UPDATE
					availableloads
                SET
                    ${text}
                WHERE
                    ${whereCon}
            `);
		} else {
			return null
		}
	}
	
	public addAvailableLoad(availableLoad: any): Promise<DatabaseResponse> {
		return this.database.query(`
			INSERT INTO availableloads(
				WorkOrder_Id,
				DispatchOrder_Id,
				Pallets,
				PieceCount,
				Origin_Id,
				Destination_Id,
				ALNumber,
				itemNumber,
				Commodity,
				Weight,
				Length,
				ParentOrigin_Id,
				ParentDestination_Id,
				ParentAvailableloads_Id,  
				createdAt,
				createdUserId
			)
			VALUES(
				${availableLoad.workorderId},
				${availableLoad.dispatchOrder_Id ? availableLoad.dispatchOrder_Id : null},
				${availableLoad.pallets ? availableLoad.pallets : 0},
				${availableLoad.pieceCount ? availableLoad.pieceCount : 0},
				${availableLoad.origin_Id ? availableLoad.origin_Id : null},
				${availableLoad.destination_Id ? availableLoad.destination_Id : null},
				${availableLoad.alNumber ? this.database.connection.escape(availableLoad.alNumber) : null},
				${availableLoad.itemNumber ? this.database.connection.escape(availableLoad.itemNumber) : null},
				${availableLoad.commodity ? this.database.connection.escape(availableLoad.commodity) : null},
				${availableLoad.weight ? availableLoad.weight : 0},
				${availableLoad.length ? availableLoad.length : 0},
				${availableLoad.parentOrigin_Id ? availableLoad.parentOrigin_Id : null},
				${availableLoad.parentDestination_Id ? availableLoad.parentDestination_Id : null},
				${availableLoad.parentAvailableloads_Id ? availableLoad.parentAvailableloads_Id : null},
				UTC_TIMESTAMP,
				${availableLoad.userId}
			)
		`);
	}

	public addAvailableLoadLineItem(lineItem: AvailableLoadStopItem): Promise<DatabaseResponse> {
		return this.database.query(`
			INSERT INTO availableloadslineitems(
				AvailableLoads_id,
				itemNumber,
				commodity,
				weight,
				length,
				pallets,
				pieceCount,
				orderNumber,
			    woStopItems_Id,                                
				createdUserId,
				createdAt
			)
			VALUES (
				${lineItem.availableLoadId},
				'${lineItem.itemNumber}',
				'${lineItem.commodity}',
				${lineItem.weight},
				${lineItem.length},
				${lineItem.pallets},
				${lineItem.pieceCount},
				${lineItem.orderNumber},
				${lineItem.woStopItems_Id?lineItem.woStopItems_Id:null},
				${lineItem.userId},
				UTC_TIMESTAMP
			);
		`);
	}

	public async ValidateRefnoCusConId(req: any):
		Promise<any> {
		return this.database.query(`
			CALL ValidateRefnoCusConId_snew(
				${this.database.connection.escape(req.refNumber)},
				${req.customerId},
				${req.companyId}
			)
		`);
	}
	
	public async getFLBWorkorderdetails(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getFLBWorkorderdetails_snew(
				${req.companyId},
				${req.workOrderId}
			)
		`);
	}
	
	public async getLTLWODetailsByWOId(req: any):
		Promise<any> {
		return this.databaseget.query(`
			CALL getLTLWODetailsByWOId_snew(
				${req.workOrderId}
			)
		`);
	}
	
	public async getDBListLoads(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBListLoads_snew(
			${req.companyId},
			${req.isDefault},
			${req.status_Id ? this.database.connection.escape(req.status_Id) : null},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.terminal_Id ? req.terminal_Id : null},
			${req.dispatcher_Id ? this.database.connection.escape(req.dispatcher_Id) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.deliveryFromDate ? `'${req.deliveryFromDate}'` : null},
			${req.deliveryToDate ? `'${req.deliveryToDate}'` : null},
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.deletedLoads ? req.deletedLoads : null},
			${req.loadsType?this.database.connection.escape(req.loadsType):null},
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.isMainCompany ? req.isMainCompany : null},
			${req.shipper_Id ? req.shipper_Id : null},
			${req.consignee_Id ? req.consignee_Id : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
			)`
		);
	}
	
	public async getDBLTLListLoads(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLTLListLoads_snew(
			${req.companyId},
			${req.isDefault},
			${req.status_Id},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.poNumber ? this.database.connection.escape(req.poNumber) : null},
			${req.deletedLoads ? this.database.connection.escape(req.deletedLoads) : null},
			${req.deliveryFromDate ? `'${req.deliveryFromDate}'` : null},
			${req.deliveryToDate ? `'${req.deliveryToDate}'` : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.loadsType ? this.database.connection.escape(req.loadsType) : null},
			${req.dispatcher_Id ? req.dispatcher_Id : null},
			${req.terminal_Id ? req.terminal_Id : null},
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
			)`
		);
	}

	public addLTLWorkorder(workorder: WorkOrderCreateRequest): Promise<DatabaseResponse> {
		return this.database.query(`
			CALL AddLTLWorkOrder_snew(
				'${workorder.loadType}',
				${workorder.isIntermodal},
				'${workorder.refNumber}',
				${workorder.customer_Id},
				${workorder.equipment_Id},
				'${workorder.billToType}',
				${workorder.billTo_Id},
				${workorder.loadAmount},
				${workorder.notes ? this.database.connection.escape(workorder.notes) : null},
				${workorder.miles ? workorder.miles : 0},
				${workorder.status_Id},
				${workorder.companyId},
				${workorder.userId},
				${workorder.legType ? this.database.connection.escape(workorder.legType) : null},
				${workorder.isHazmat},
				${workorder.loadCategory  ? this.database.connection.escape(workorder.loadCategory): null},
				${workorder.loadPriority ? this.database.connection.escape(workorder.loadPriority) : null},
				${workorder.lumperPaidby ? this.database.connection.escape(workorder.lumperPaidby) : null},
				${workorder.lumper ? workorder.lumper : 0},
				${workorder.ratePerMile ? workorder.ratePerMile : 0},
				${workorder.contactPersonId ? workorder.contactPersonId : null},
				${workorder.agent_Id ? workorder.agent_Id : null},
				${workorder.agentPCT ? workorder.agentPCT : 0},
				${workorder.agentAmount ? workorder.agentAmount : 0},
				${workorder.temperature ? this.database.connection.escape(workorder.temperature) :null},
				${workorder.dispatcher_Id ? workorder.dispatcher_Id : null},
				${workorder.factor_Id ? workorder.factor_Id : null},
				${workorder.subCompany_Id ? workorder.subCompany_Id : null}
			);
		`)
	}

	public getAvailableLoad(workorderId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT id FROM availableloads
			WHERE workorder_id = ${workorderId}
		`);
	}
	
	public FLWOStatusChange(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			call FLWOStatusChange(${req.workOrder_Id ? req.workOrder_Id : null},
								${req.dispatchOrder_Id ? req.dispatchOrder_Id : null},
								${req.relay_Id ? req.relay_Id : null},
								${req.status_Id},
								${req.userId}, 
								${req.allLegs ? req.allLegs : 0})
		`);
	}

	public UpdateWObyDOId(req: any): Promise<DatabaseResponse> {
		return this.database.query(`
			call UpdateWObyDOId_snew(${req.dispatchOrder_Id})
		`);
	}
	
	public copyWOtoWOtoOtherCompany(req: any): Promise<any> {
		return this.database.query(`
			call CopyWOtoWOtoOtherCompany_snew(
				${req.workOrder_Id},
				${req.toCompany_Id},
				${req.userId}
			)
		`);
	}
	
	public copyWOtoCOtoOtherCompany(req: any): Promise<any> {
		return this.database.query(`
			call CopyWOtoCOtoOtherCompany_snew(
				${req.workOrder_Id},
				${req.toCompany_Id},
				${req.userId}
			)
		`);
	}
	
	public copyCOtoWOtoOtherCompany(req: any): Promise<any> {
		return this.database.query(`
			call CopyCOtoWOtoOtherCompany_snew(
				${req.workOrder_Id},
				${req.toCompany_Id},
				${req.userId}
			)
		`);
	}
	
	public copyCOtoCOtoOtherCompany(req: any): Promise<any> {
		return this.database.query(`
			call CopyCOtoCOtoOtherCompany_snew(
				${req.workOrder_Id},
				${req.toCompany_Id},
				${req.userId}
			)
		`);
	}

	public async copyWOtoMultipleWO(req : any): Promise<any> {
		return this.database.query(`
		CALL CopyWOtoMultipleWO_snew(
			${req.wo_Id ? req.wo_Id : null},
			${req.woCount ? req.woCount : null},
			${req.userId}
			)`
		);
	}

	public async copyWOtoCO(req : any): Promise<any> {
		return this.database.query(`
		CALL CopyWOtoCO_snew(
			${req.wo_Id ? req.wo_Id : null}
			)`
		);
	}

	public async getWorkorderWithNoLineItems(req : any): Promise<any> {
		return this.databaseget.query(`
		CALL getWorkOrderWithNoLineItems_snew(
			${req.companyId},
			${req.status_Id ? req.status_Id : null},
			${req.fromDate ? `'${req.fromDate}'` : null},
			${req.toDate ? `'${req.toDate}'` : null},
			${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
			${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.trailer_Id ? req.trailer_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.isAmountApproved ? req.isAmountApproved : 0},
			${req.isAmountExist ? req.isAmountExist : 0},
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}

	public async getWorkorderReport(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWorkorderReport_snew (
			${req.companyId},
			${req.status_Id ? req.status_Id : null},
			${req.fromDate ? `'${req.fromDate}'` : null},
			${req.toDate ? `'${req.toDate}'` : null},
			${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
			${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.trailer_Id ? req.trailer_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.type ? this.database.connection.escape(req.type) : null},
			${req.ownerop ? req.ownerop : null},
			${req.delfromDate ? this.database.connection.escape(req.delfromDate) : null},
			${req.deltoDate ? this.database.connection.escape(req.deltoDate) : null},
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.isMainCompany},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	public async getWorkorderReportSummary (req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWorkOrderReportSummary (
			${req.companyId},
			${req.status_Id ? req.status_Id : null},
			${req.fromDate ? `'${req.fromDate}'` : null},
			${req.toDate ? `'${req.toDate}'` : null},
			${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
			${req.refNumber ? this.database.connection.escape(req.refNumber) : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.trailer_Id ? req.trailer_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.type ? this.database.connection.escape(req.type) : null},
			${req.ownerop ? req.ownerop : null},
			${req.delfromDate ? this.database.connection.escape(req.delfromDate) : null},
			${req.deltoDate ? this.database.connection.escape(req.deltoDate) : null}
			)`
		);
	}
	
	public async getWeeklyScheduleReport(req: any): Promise<any> {
		return this.database.query(`
		CALL getWeeklyScheduleReport_snew (
			${req.companyId},
			${this.database.connection.escape(req.fromDate)},
			${this.database.connection.escape(req.toDate)}
			)`
		);
	}

	public async updateWOFromDobyWOId(woId: number): Promise<any> {
		return this.database.query(`
		CALL updateWOFromDobyWOId (
			${woId}
			)`
		);
	}
	
	public async getWorkOrderPaymentHistory(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWorkOrderPaymentHistory_snew(
			${req.companyId},
			${req.customer_Id}
			)`
		);
	}
	
	public async getWOStatusLogByWOId(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWOStatusLogByWOId_snew(
			${req.wo_Id}
			)`
		);
	}
	
	public async getInfotoSendStatustoCustomer(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getinfotosendstatustocustomer_snew(
			${req.wo_Id}
			)`
		);
	}
	
	public async addwoStatusSentLog(req: any): Promise<any> {
		return this.database.query(`
			Insert into wostatussentlog(WorkOrder_Id,Emails,DeliveredOn,createdAt,createdUserId,Status,BodyText)
			values(

				${req.workOrder_Id},
				${req.emails ? this.database.connection.escape(req.emails) : null},
				UTC_TIMESTAMP,
				UTC_TIMESTAMP,
				${req.userId},
				${this.database.connection.escape(req.status)},
				${this.database.connection.escape(req.body)}
			)
		`);
	}
	
	public async getwoStatusSentLogbyWoId(workOrderId: any): Promise<any> {
		return this.database.query(`
			call getwoStatusSentLogbyWoId_snew(${workOrderId})
		`);
	}

	public async getDBLTLLoadsgroupby(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLTLLoadsgroupby_snew(
			${this.database.connection.escape(req.groupbyColumn)},
			${req.companyId},
			${req.statusName ? this.database.connection.escape(req.statusName) : null},
			${req.status_Id ? req.status_Id : null},
			${req.brokerName ? this.database.connection.escape(req.brokerName) : null},
			${req.referenceNumber ? this.database.connection.escape(req.referenceNumber) : null},
			${req.fromDate ? this.database.connection.escape(req.fromDate) : null},
			${req.toDate ? this.database.connection.escape(req.toDate) : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.terminal_Id ? req.terminal_Id : null},
			${req.dispatcher_Id ? this.database.connection.escape(req.dispatcher_Id) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.delFromDate ? this.database.connection.escape(req.delFromDate) : null},
			${req.delToDate ? this.database.connection.escape(req.delToDate) : null},	
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},	
			${req.hasIncidents ? req.hasIncidents : null},	
			${req.loadType ? this.database.connection.escape(req.loadType) : null},	
			${req.subCompany_Id ? req.subCompany_Id : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	
	public async getWOGlobalSearch(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWOGlobalSearch_snew(
			${req.companyId},
			${req.textfield ? this.database.connection.escape(req.textfield) : null},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}
	
	public addWOTemplate(req: any): Promise<any> {
		return this.database.query(`
			Insert into wotemplate(templateName, workorder_Id,customerName, equipmentType, pickupLocation, deliveryLocation, createdAt, createdUserId, company_Id)
			 values(
				 ${this.database.connection.escape(req.templateName)},
				 ${req.workOrder_Id},
				 ${this.database.connection.escape(req.customerName)},
				 ${this.database.connection.escape(req.equipmentType)},
				 ${this.database.connection.escape(req.pickupLocation)},
				 ${this.database.connection.escape(req.deliveryLocation)},
				 UTC_TIMESTAMP,
				${req.userId},
				${req.companyId})
		`)
	}
	
	public searchWOTemplate(req: any): Promise<any> {
		return this.databaseget.query(`
			call searchWOTemplate_snew(
				 ${this.database.connection.escape(req.templateName)},
				${req.companyId})
		`)
	}
	
	public getWOTemplates(req: any): Promise<any> {
		return this.databaseget.query(`
			call getWOTemplates_snew(
				${req.companyId},
				${req.pageSize ? req.pageSize : 50},
				${req.pageIndex ? req.pageIndex : 0},
				${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
				${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)
		`)
	}
	
	public getwoListbyCustomerId(req: any): Promise<any> {
		return this.databaseget.query(`
			call getwoListbyCustomerId(
			${req.contact_Id},
			${req.isDefault},
			${req.status_Id ? this.database.connection.escape(req.status_Id) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? this.database.connection.escape(req.fromDate) : null}, 
			${req.toDate ? this.database.connection.escape(req.toDate) : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.deliveryFromDate ? this.database.connection.escape(req.deliveryFromDate) : null},
			${req.deliveryToDate ? this.database.connection.escape(req.deliveryToDate) : null},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)
		`)
	}
	
	public getDBCListLoads(req: any): Promise<any> {
		return this.databaseget.query(`
			call getDBCListLoads_snew(
				${req.companyId},
				${req.isDefault},
				${req.status_Id ? this.database.connection.escape(req.status_Id) : null},
				${req.customerName ? this.database.connection.escape(req.customerName) : null},
				${req.refNum ? this.database.connection.escape(req.refNum) : null},
				${req.fromDate ? `'${req.fromDate}'` : null}, 
				${req.toDate ? `'${req.toDate}'` : null},
				${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
				${req.toCity ? this.database.connection.escape(req.toCity) : null},
				${req.fromState ? this.database.connection.escape(req.fromState) : null},
				${req.toState ? this.database.connection.escape(req.toState) : null},
				${req.terminal_Id ? req.terminal_Id : null},
				${req.dispatcher_Id ? this.database.connection.escape(req.dispatcher_Id) : null},
				${req.truck_Id ? req.truck_Id : null},
				${req.driver_Id ? req.driver_Id : null},
				${req.carrier_Id ? req.carrier_Id : null},
				${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
				${req.deliveryFromDate ? `'${req.deliveryFromDate}'` : null},
				${req.deliveryToDate ? `'${req.deliveryToDate}'` : null},
				${req.trailerNum ? req.trailerNum : null},
				${req.hasIncidents ? req.hasIncidents : null},
				${req.deletedLoads ? req.deletedLoads : null},
				${req.loadsType?this.database.connection.escape(req.loadsType):null},
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.pageSize},
				${req.pageIndex},
				${this.database.connection.escape(req.sortExpression)},
				${this.database.connection.escape(req.sortDirection)}
			)	
		`)
	}
	
	public getwodetailsforcustomer(req: any): Promise<any> {
		return this.databaseget.query(`
			call getwodetailsforcustomer_snew(
				${req.woId},
				${req.companyId}
			)	
		`)
	}
	
	public getDashboardAnalytics(req: any): Promise<any> {
		return this.databaseget.query(`
			call getDashboardAnalytics(
				${req.companyId},
				${req.fromDate ? `'${req.fromDate}'` : null}, 
				${req.toDate ? `'${req.toDate}'` : null},
				${req.subCompany_Id ? req.subCompany_Id : null},
				${req.isMainCompany}
			)	
		`)
	}
	
	public getDashboardPLICount(req: any): Promise<any> {
		return this.databaseget.query(`
		 	call getDashboardPLICount_snew(
				${req.companyId}
			)
		`)
	}

	public getETAlocationbyWO(req: any): Promise<any> {
		return this.databaseget.query(`
		 	select '2022-11-09 11:00:00' eta, 'Sacramento' city, 'CA' state from workorder where Id = ${req.wo_Id}
		`)
	}

	public getDBLTLListLoadssabitha(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getDBLTLListLoads_snew_sabitha(
			228,
			${req.isDefault},
			${req.status_Id},
			${req.customerName ? this.database.connection.escape(req.customerName) : null},
			${req.refNum ? this.database.connection.escape(req.refNum) : null},
			${req.fromDate ? `'${req.fromDate}'` : null}, 
			${req.toDate ? `'${req.toDate}'` : null},
			${req.fromCity ? this.database.connection.escape(req.fromCity) : null},
			${req.toCity ? this.database.connection.escape(req.toCity) : null},
			${req.fromState ? this.database.connection.escape(req.fromState) : null},
			${req.toState ? this.database.connection.escape(req.toState) : null},
			${req.truck_Id ? req.truck_Id : null},
			${req.trailerNum ? this.database.connection.escape(req.trailerNum) : null},
			${req.driver_Id ? req.driver_Id : null},
			${req.carrier_Id ? req.carrier_Id : null},
			${req.woNumber ? this.database.connection.escape(req.woNumber) : null},
			${req.poNumber ? this.database.connection.escape(req.poNumber) : null},
			${req.deletedLoads ? this.database.connection.escape(req.deletedLoads) : null},
			${req.deliveryFromDate ? `'${req.deliveryFromDate}'` : null},
			${req.deliveryToDate ? `'${req.deliveryToDate}'` : null},
			${req.hasIncidents ? req.hasIncidents : null},
			${req.loadsType ? this.database.connection.escape(req.loadsType) : null},
			${req.pageSize},
			${req.pageIndex},
			${this.database.connection.escape(req.sortExpression)},
			${this.database.connection.escape(req.sortDirection)}
			)`
		)
	}

	public getAvailableUnits(req: any): Promise<any> {
		return this.databaseget.query(`
		 	CALL getAvailableUnits_snew(
				${req.companyId}
			)
		`)
	} 

	public getWOCustomerSummary(req: any): Promise<any> {
		return this.databaseget.query(`
		 	CALL getWOCustomerSummary_snew(
				${req.companyId},
				${req.customer_Id ? req.customer_Id : null},
				${req.fromDate ? `'${req.fromDate}'` : null}, 
				${req.toDate ? `'${req.toDate}'` : null},
				${req.pageSize},
				${req.pageIndex},
				${this.database.connection.escape(req.sortExpression)},
				${this.database.connection.escape(req.sortDirection)}
			)
		`)
	} 

	public async getWOLTLGlobalSearch(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getWOLTLGlobalSearch_snew(
			${req.companyId},
			${req.textfield ? this.database.connection.escape(req.textfield) : null},
			${req.pageSize ? req.pageSize : 50},
			${req.pageIndex ? req.pageIndex : 0},
			${req.sortExpression ? this.database.connection.escape(req.sortExpression) : null},
			${req.sortDirection ? this.database.connection.escape(req.sortDirection) : null}
			)`
		);
	}
}
