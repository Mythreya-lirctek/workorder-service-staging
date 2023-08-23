import Database from '../database/database';

class AddressService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async addAddress(req: any): Promise<any> {
		return this.db.query(`
			INSERT
				INTO
				address(
					Address1, Address2, City, State, Zip, Latitude, 
					Longitude, createdAt, createdUserId, Offset
					)
				VALUES(
					${req.address1 ? this.db.connection.escape(req.address1) : null},
					${req.address2 ? this.db.connection.escape(req.address2) : null},
					${req.city ? this.db.connection.escape(req.city) : null},
					${req.state ? this.db.connection.escape(req.state) : null},
					${req.zip ? this.db.connection.escape(req.zip) : null},
					${req.latitude ? this.db.connection.escape(req.latitude) : null},
					${req.longitude ? this.db.connection.escape(req.longitude) : null},
					UTC_TIMESTAMP,
					${req.userId ? req.userId : null},
					${req.offset ? this.db.connection.escape(req.offset) : null}
				)
		`)
	};

	public async saveAddress(req: any): Promise<any> {
		let text = '';
		const addressFields: any = [
			'address1', 'address2', 'city', 'state', 'zip', 'latitude', 'longitude', 'offset'
		];
		Object.keys(req).map((key) => {
			if (addressFields.indexOf(key) > -1) {
				if (typeof req[key] === 'string') {
// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if(text && req.addressId){
			text += ` updatedAt = UTC_TIMESTAMP,updatedUserId=${req.userId}`;
			return this.db.query(`
                UPDATE
                    address
                SET
                    ${text}
                WHERE
                    Id = ${req.addressId}
            `)
		} else {
			return null
		}
	};


	public async deleteAddress(addressId: number): Promise<any> {
		return this.db.query(`
			DELETE
				FROM
					address
				WHERE
					Id = ${addressId}
		`)
	};

	public async getAddressById(addressId: number): Promise<any> {
		return this.databaseget.query(`
			SELECT 
				a.id,
				a.address1, 
				a.address2, 
				a.city, 
				a.state, 
				a.zip, 
				a.latitude, 
				a.longitude, 
				a.offset
			FROM 
				address as a
			WHERE
				a.Id = ${addressId}
		`)
	};
}
export default AddressService;