import Database from '../database/database';

class SearchFavouritesService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async getsearchFavouritesbyUserId(req: any):
		Promise<any> {
		return this.databaseget.query(`
		CALL getsearchFavouritesbyUserId_snew(
			${req.userId},	
            ${req.name ? this.db.connection.escape(req.name) : null},
            ${req.module ? this.db.connection.escape(req.module) : null}
			)`
		);
	}
	
	public async validateFavourites(req: any):
		Promise<any> {
		return this.databaseget.query(`
		CALL validateFavourites_snew(
			${req.userId},	
            ${req.name ? this.db.connection.escape(req.name) : null},
            ${req.module ? this.db.connection.escape(req.module) : null}
			)`
		);
	}
	
	public async addSearchFavourites(req: any): Promise<any> {
		return this.db.query(`
			INSERT
				INTO
                searchFavourites(Name,Module,Criteria,createdUserId, createdAt) 
				VALUES(
					${req.name ? this.db.connection.escape(req.name) : null},
					${req.module ? this.db.connection.escape(req.module) : null },
					${req.criteria ? this.db.connection.escape(req.criteria) : null },
                    ${req.userId ? req.userId : null},
                    UTC_TIMESTAMP
				)
				
		`);
	}
	
	public async saveSearchFavourites(req: any): Promise<any> {
		let text = '';
		const employeeFields: any = ['name','module','criteria', 'isDeleted']
		Object.keys(req).map((key) => {
			if (employeeFields.indexOf(key) > -1) {

				if (typeof req[key] === 'string') {
					// tslint:disable-next-line: prefer-template
					text += key + `=${this.db.connection.escape(req[key])},`;
				} else {
					// tslint:disable-next-line: prefer-template
					text += key + '=' + `${req[key]}` + ',';
				}
			}
		});
		if (text && req.searchFavouriteId) {
			text += ` UpdatedAt = UTC_TIMESTAMP, updatedUserId = ${req.userId}`;
			return this.db.query(`
				UPDATE searchFavourites
				SET 
					${text}
				WHERE 
				Id = ${req.searchFavouriteId}
			`);
		}
		else {
			return null;
		}
	}
	
}

export default SearchFavouritesService;