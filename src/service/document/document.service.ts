import Database from '../database/database';

class DocumentService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async getContainerDocuments(req: any): Promise<any> {
		return this.databaseget.query(`
			CALL getContainerDocuments_snew(
			${req.containerId},
			'${req.containerName ? req.containerName : ''}',
			${req.userId ? req.userId : null},
			${req.type ? req.type : 0}
			)`
		);
	}
}

export default DocumentService; 