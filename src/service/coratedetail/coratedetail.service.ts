import Database from '../database/database';

class CORateDetailService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async addCoRateDetail(req: any): Promise<any> {
		return this.db.query(`
            INSERT 
                INTO
                    coratedetails(
                        CustomerOrder_Id, Description_Id, Units, PER, Amount, 
                        createdAt, createdUserId, Notes
                    )
                VALUES(
                    ${req.customerOrder_Id},
                    ${req.description_Id},
                    ${req.units ? req.units : 0},
                    ${req.per ? req.per : 0},
                    ${req.amount ? req.amount : 0},
                    UTC_TIMESTAMP,
                    ${req.userId},
                    ${req.notes ? this.db.connection.escape(req.notes) : null}
                )
        `)
	}

	public async saveCoRateDetail(req: any): Promise<any> {
		let text = '';
		const invoiceFields: any = ['customerOrder_Id', 'description_Id', 'units', 'per', 'amount','notes','isDeleted'];
		Object.keys(req).map((key) => {
			if (invoiceFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});

		if (text && req.coRateDetailId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
                UPDATE
                coratedetails
                SET
                    ${text}
                WHERE
                    Id = ${req.coRateDetailId}
            `);
		}
	}
	
	public getCORateDetailsByCOId(customerOrderId: number): Promise<any> {
		return this.databaseget.query(`
			CALL getCORateConDetailsByCOId_snew(${customerOrderId}
			);
		`);
	}

	public updateCOInvoiceamount(customerOrderId: any): Promise<any> {
		return this.db.query(`
			CALL updateCOInvoiceamount_snew(${customerOrderId}
			);
		`);
	}
}

export default CORateDetailService;
