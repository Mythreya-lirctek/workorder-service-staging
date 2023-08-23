import Database from '../database/database';

class CoOffersService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async addOffer(req: any): Promise<any> {
		return this.databaseget.query(`
            INSERT INTO cooffer(CustomerOrder_Id, Carrier_Id, OfferedDT, createdUserId, createdAt, OfferedAmount, OfferValidDT, Status,CounterOfferAmount,CounterOfferValidDT,CounterOfferDT,CarrierAcceptedDT,BrokerAcceptedDT)
            values (${req.customerOrder_Id ? req.customerOrder_Id : null},
                    ${req.carrier_Id ? req.carrier_Id : null},
                    ${req.offeredDT ? this.db.connection.escape(req.offeredDT) : null},
                    ${req.userId ? req.userId : null},
                    UTC_TIMESTAMP,
                    ${req.offeredAmount ? req.offeredAmount : null},
                    ${req.offerValidDT ? this.db.connection.escape(req.offerValidDT) : null},
                    ${req.status ? this.db.connection.escape(req.status) : null},
                    ${req.counterOfferAmount ? this.db.connection.escape(req.counterOfferAmount) : null},
                    ${req.counterOfferValidDT ? this.db.connection.escape(req.counterOfferValidDT) : null},
                    ${req.counterOfferDT ? this.db.connection.escape(req.counterOfferDT) : null},
                    ${req.carrierAcceptedDT ? this.db.connection.escape(req.carrierAcceptedDT) : null},
                    ${req.brokerAcceptedDT ? this.db.connection.escape(req.brokerAcceptedDT) : null}
                    )
		`);
	}
	public async addOfferConditions(req: any): Promise<any> {
		return this.databaseget.query(`
            INSERT INTO cooffercondition(CoOffer_Id,Description_Id,PickupDT,Status,Comments,createdUserId,createdAt)
            values (${req.coOffer_Id ? req.coOffer_Id : null},
                    ${req.description_Id ? req.description_Id : null},
                    ${req.pickupDT ? this.db.connection.escape(req.pickupDT) : null},
                    ${req.status ? this.db.connection.escape(req.status) : null},
                    ${req.comments ? this.db.connection.escape(req.comments) : null},
                    ${req.userId ? req.userId : null},
                    UTC_TIMESTAMP
                    )
		`);
	}
	public async saveOfferConditions(req: any): Promise<any> {
		let text = '';
		const updateFields: any = ['coOffer_Id', 'description_Id', 'pickupDT','comments','status'];
		Object.keys(req).map((key) => {
			if (updateFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.coOfferConditionId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    cooffercondition
                SET
                    ${text}
                WHERE
                    Id = ${req.coOfferConditionId}
            `);
		} else {
			return null
		}
	}

	public async saveOffer(req:any): Promise<any> {
		let text = '';
		const updateFields: any = ['customerOrder_Id', 'carrier_Id', 'offeredDT', 'updatedUserId', 'offeredAmount', 'offerValidDT', 'counterOfferAmount', 'counterOfferValidDT', 'counterOfferDT', 'status',
			'carrierAcceptedDT','brokerAcceptedDT'];
		Object.keys(req).map((key) => {
			if (updateFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.coOfferId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                    cooffer
                SET
                    ${text}
                WHERE
                    Id = ${req.coOfferId}
            `);
		} else {
			return null
		}
	}

	public async getCoOfferDetailsByUserId(req:any): Promise<any> {
		return this.databaseget.query(`
			call getcoofferdetailsbyUserId_snew(
			    ${req.userId},
			    ${req.customerOrder_Id}
			)
		`);
	}
	public async getCoOffersByCoId(customerOrderId:any): Promise<any> {
		return this.databaseget.query(`
			call getCoOffersByCoId(
			    ${customerOrderId}
			)
		`);
	}

	public async getCoOfferDetailsById(coOfferId:any): Promise<any> {
		return this.databaseget.query(`
			call getcoofferdetailsbyId_snew(
			   ${coOfferId}
		    )
		`);
	}

	public async getCoOfferedLoads(req:any): Promise<any> {
		return this.databaseget.query(`
			call getCOOfferedLoads_snew(
			   ${req.userId},
			   ${req.status ? this.databaseget.connection.escape(req.status) : null},
			   ${req.pageSize ? req.pageSize:50},
               ${req.pageIndex ? req.pageIndex:0},
               ${req.sortExpression ? this.databaseget.connection.escape(req.sortExpression) : null},
               ${req.sortDirection ? this.databaseget.connection.escape(req.sortDirection) : null}
			)
		`);
	}
	public async addLoadBoardPostedCarrier(req: any): Promise<any> {
		return this.databaseget.query(`
            INSERT INTO loadboardpostedcarriers(Carrier_Id, CustomerOrder_Id)
            values (
                    ${req.carrier_Id},
                    ${req.customerOrder_Id}
             )
		`);
	}
	public async getLoadBoardPostedCarrier(customerOrderId: any): Promise<any> {
		return this.databaseget.query(`
            select lb.id, lb.customerOrder_Id, lb.carrier_Id, cca.Name as carrierName
from loadboardpostedcarriers lb
         left join carriers ca on lb.Carrier_Id = ca.Id
         LEFT JOIN contact cca ON cca.Id = ca.Contact_Id where CustomerOrder_Id = ${customerOrderId} 
		`);
	}


	public async inactivateOffers(customerOrderId:any,coOfferId:any):Promise<any>{
		return this.db.query(`update cooffer set Status = 'Inactive' where CustomerOrder_Id = ${customerOrderId} and id != ${coOfferId}`);
	}

	public async getInactiveOffers(customerOrderId:any,coOfferId:any):Promise<any>{
		return this.databaseget.query(`
                          select carrier_Id,id as coOfferId from  cooffer where CustomerOrder_Id = ${customerOrderId} and id != ${coOfferId}`);
	}

	public async getCarrierEmail(carrierId: any): Promise<any> {
		return this.databaseget.query(`select c.email
from  carriers ca
left join contact c on c.Id = ca.Contact_Id
where ca.id = ${carrierId}`);
	}

}

export default CoOffersService;