import Database from '../database/database';

class ContactService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}
	
	public async validateContact(req:any): Promise<any> {
		return this.databaseget.query(`
			CALL ValidateContact_snew(
				${req.companyId},
				${req.name ? this.db.connection.escape(req.name) : null},
				${req.contactType ? this.db.connection.escape(req.contactType) : null},
				${req.address1 ? this.db.connection.escape(req.address1) : null},
				${req.address2 ? this.db.connection.escape(req.address2) : null},
				${req.city ? this.db.connection.escape(req.city) : null},
				${req.state ? this.db.connection.escape(req.state) : null},
				${req.zip ? this.db.connection.escape(req.zip) : null}
				)
		`);
	}

	
	public async addContact(req: any): Promise<any> {
		return this.db.query(`
			INSERT 
				INTO contact(
				Name,
				Phone,
				Fax,
				Email,
				Company_Id, 
				ContactType,
				Address_Id,
				createdAt,
				createdUserId,
				PhoneExt,
				ContactPerson,
				Notes,
				BillingAddress_Id,
				SalesPerson,
				ShippingHours,
				BillToFactor,
				PaymentTerms,
				QuickPayPCT,
				Category_Id,
				CreditLimit,
				FactorRefNum,
				DOT,
				MC,
				IsDeleted,
				SendStatusEmail,
				TrackerEmail,
				DispatcherEmail,
				IsAppRequired,
				ShippingPhone,
				FileImage,
				DoNotUse,
				DoNotUseReason,
				ReceivingHours,
				ReceivingPhone,
				user_Id
			)
			VALUES(
				${req.name ? this.db.connection.escape(req.name) : null},
				${req.phone ? this.db.connection.escape(req.phone) : null},
				${req.fax ? this.db.connection.escape(req.fax) : null},
				${req.email ? this.db.connection.escape(req.email) : null},
				${req.companyId ? req.companyId : null},
				${req.contactType ? this.db.connection.escape(req.contactType) : null},
				${req.address_Id ? req.address_Id : null},
				UTC_TIMESTAMP,
				${req.userId ? req.userId : null},
				${req.phoneExt ? this.db.connection.escape(req.phoneExt) : null},
				${req.contactPerson ? this.db.connection.escape(req.contactPerson) : null},
				${req.notes ? this.db.connection.escape(req.notes) : null},
				${req.billingAddress_Id ? req.billingAddress_Id : null},
				${req.salesPerson ? this.db.connection.escape(req.salesPerson) : null},
				${req.shippingHours ? this.db.connection.escape(req.shippingHours) : null},
				${req.billToFactor ? req.billToFactor : false},
				${req.paymentTerms ? req.paymentTerms : 0},
				${req.quickPayPCT ? req.quickPayPCT : 0},
				${req.category_Id ? req.category_Id : null},
				${req.creditLimit ? req.creditLimit : 0},
				${req.factorRefNum ? this.db.connection.escape(req.factorRefNum) : null},
				${req.dot ? this.db.connection.escape(req.dot) : null},
				${req.mc ? this.db.connection.escape(req.mc) : null},
				${req.isDeleted ? req.isDeleted : 0},
				${req.sendStatusEmail ? req.sendStatusEmail : 0},
				${req.trackerEmail ? this.db.connection.escape(req.trackerEmail) : null},
				${req.dispatcherEmail ? this.db.connection.escape(req.dispatcherEmail) : null},
				${req.isAppRequired ? req.isAppRequired : 0},
				${req.shippingPhone ? this.db.connection.escape(req.shippingPhone) : null},
				${req.fileImage ? this.db.connection.escape(req.fileImage) : null},
				${req.doNotUse ? req.doNotUse : 0},
				${req.doNotUseReason ? this.db.connection.escape(req.doNotUseReason) : null},
				${req.receivingHours ? this.db.connection.escape(req.receivingHours) : null},
				${req.receivingPhone ? this.db.connection.escape(req.receivingPhone) : null},
				${req.user_Id ? req.user_Id : null}
			)
		`)
	};
} 

export default ContactService;