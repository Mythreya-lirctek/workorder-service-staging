export interface WorkOrderCreateRequest {
	loadType: string;
	isIntermodal: boolean;
	refNumber: string;
	customer_Id: number;
	equipment_Id: number;
	billToType: string;
	billTo_Id: number;
	loadAmount: number;
	notes: string;
	miles: number;
	status_Id: number;
	companyId: number;
	userId: number;
	legType: string;
	isHazmat: number;
	loadCategory: string;
	loadPriority: string;
	lumperPaidby: string;
	lumper: number;
	ratePerMile: number;
	contactPersonId: number;
	agent_Id: number;
	agentPCT: number;
	agentAmount: number;
	temperature: string;
	dispatcher_Id: number;
	factor_Id: number;
	subCompany_Id: number;
	rateDetails: any[];
	stops: WorkorderStop[];
}

export interface WorkorderStop {
	workorderId: number;
	stopNumber: number;
	stopType: WorkorderStopType;
	poNumber: string;
	isAppRequired: boolean;
	appNumber: string;
	sealNumber: string;
	contactId: number;
	fromDate: string;
	fromTime: string;
	toDate: string;
	toTime: string;
	arrivedDate: string;
	loadedOrUnloadedDate: string;
	eta: string;
	delayReason: string;
	lumperFee: number;
	statusId: number;
	lumperPaidBy: string;
	notes: string;
	rpType: string;
	temperature: string;
	blanketNumber: string;
	blanketRelNumber: string;
	runningLate: boolean;
	fcfs: boolean;
	dateTimeChangedBy: string;
	createdAt: string;
	updatedAt: string;
	updatedUserId: string;
	createdUserId: string;
	userId: number;
}

export interface WorkorderCompanyFlags {
	isFullLoad: boolean;
	splitFullLoad: boolean;
	isLTL: boolean;
}

export enum WorkorderStopType {
	PICKUP = 'Pickup',
	DELIVERY = 'Delivery'
}

export interface WorkorderRateDetail {
	workorderId: number;
	descriptionId: number;
	units: number;
	per: number;
	amount: number;
	createdAt: string;
	updatedAt: string;
	createdUserId: string;
	updatedUserId: string;
	notes: string;
	userId: number
}

export interface AvailableLoad {
	workorderId: number;
	dispatchOrderId: number;
	pallets: number;
	pieceCount: number;
	pickupStopId: number;
	deliveryStopId: number;
	origin_Id: number;
	destination_Id: number;
	alNumber: string;
	itemNumber: string,
	commodity: string;
	weight: number;
	length: number;
	parentOriginId: number;
	parentAavailabileLoads: number;
	isDeleted: boolean;
	stopItems: AvailableLoadStopItem[],
	userId: number,
	temp_id:string
}

export interface AvailableLoadStopItem {
	pallets: number;
	availableLoadId: number;
	woStopItems_Id:number;
	itemNumber: string;
	commodity: string;
	orderNumber: number;
	weight: number;
	length: number;
	pieceCount: number;
	userId: number;
	createdAt: string;
	updatedAt: string;
	stopItemTempId:string;
}