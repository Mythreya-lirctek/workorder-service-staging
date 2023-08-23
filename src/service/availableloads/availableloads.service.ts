import Database from '../database/database';

class AvailableLoadsService {
	private db: Database;
	private databaseget: Database;
	constructor() {
		this.db = new Database();
		this.databaseget = new Database(true);
	}

	public async getAvailableLoads(req: any): Promise<any> {
		return this.databaseget.query(`
        CALL getAvailableLoads_snew(
            ${req.companyId}
            )`
		);
	}

	public async getStopsforAvailableLoads(req: any): Promise<any> {
		return this.databaseget.query(`
		CALL getStopsForAvailableLoads_snew(
			${req.workorder_Id ? req.workorder_Id : null},
			${req.al_Id},
			${this.db.connection.escape(req.loadType)},
			${req.stop_Id ? req.stop_Id : null}			 
			)`
		);
	}
	
	public async getALById(req: any): Promise<any> {
		return this.databaseget.query(`
			select
				a.id,
				a.workOrder_Id,
				a.dispatchOrder_Id,
				a.pallets,
				a.pieceCount,
				a.origin_Id,
				a.destination_Id,
				a.alNumber,
				a.createdAt,
				a.updatedAt,
				a.createdUserId,
				a.updatedUserId,
				a.itemNumber,
				a.commodity,
				a.weight,
				a.length,
				a.parentOrigin_Id,
				a.parentDestination_Id,
				a.parentAvailableloads_Id,
				a.isDeleted
			from 
				availableloads a
			where 
				Id = ${req.al_Id}			
		`);
	}

	public addAvailableLoad(req: any): Promise<any> {
		return this.db.query(`
			INSERT INTO availableloads(
				WorkOrder_Id,
				DispatchOrder_Id,
				Pallets,
				PieceCount,
				Origin_Id,
				ALNumber,
				itemNumber,
				Weight,
				Length,
				ParentDestination_Id,
				ParentAvailableloads_Id,
				createdAt,
                createdUserId,
				Destination_Id,
				Commodity,
				ParentOrigin_Id
			)
			VALUES(
				${req.workOrder_Id},
				${req.dispatchOrder_Id},
				${req.pallets},
				${req.pieceCount},
				${req.origin_Id},
				'${req.alNumber}',
				'${req.itemNumber}',
				${req.weight},
				${req.length},
				${req.parentDestination_Id},
				${req.parentAvailableloads_Id},
				UTC_TIMESTAMP,
				${req.userId},
				${req.destination_Id},
				${req.commodity ? this.db.connection.escape(req.commodity) : null},
				${req.parentOrigin_Id}
				
			)
		`);
	}
	
	public deleteTerminal(parentId: number, alId: number): Promise<any> {
		return this.db.query(`
			CALL DeleteTerminal(
				${parentId},
				${alId}
			)
		`);
	}
	
	public deleteAvailableLoad(alId: number): Promise<any> {
		return this.db.query(`
			delete from availableloads where Id = ${alId}
		`);
	}

	public InsertUpdateAL(alId: number, newPickId: number, newDropId: number, userId: number, alNumber: any): Promise<any> {
		return this.db.query(`
			call InsertUpdateAL(${alId},${newPickId},${newDropId}, ${userId}, ${this.db.connection.escape(alNumber)})
		`);
	}

	public updateALLoadbyDoId(doId: number): Promise<any> {
		return this.db.query(`
			update availableloads set dispatchorder_Id = NULL where dispatchorder_Id = ${doId}
		`);
	}

	public getALsByDOId(doId: number): Promise<any> {
		return this.databaseget.query(`
			call getALsByDOId_snew(
				${doId}
			)
		`)
	}

	public getALItemsbywostopsId(woStopId: number): Promise<any> {
		return this.databaseget.query(`
			call getALItemsbywostopsId(
				${woStopId}
			)
		`)
	}

	public getALNumbers(alId: number): Promise<any> {
		return this.db.query(`
			select sal.alNumber from availableloads sal where sal.ParentAvailableloads_Id = ${alId}
		`)
	}
} 

export default AvailableLoadsService;