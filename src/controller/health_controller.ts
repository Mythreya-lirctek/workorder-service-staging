import express from 'express';
import Database from './../service/database/database';

export interface HealthCheck {
	environment: string;
	ip?: string;
	status: string;
	dbName: any;
}

export interface UserModel {
	firstname: string;
	lastname: string;
}

class HealthController {
	private db: Database;
	constructor() {
		this.db = new Database();
	}
	public async check(req: express.Request, res: express.Response): Promise<any> {
		try {
			const healthCheck: HealthCheck = await this.getHealthCheckData(req);
			res.send(healthCheck);
		} catch (error) {
			res.status(500).send(error);
		}
	}

	private async getHealthCheckData(req: express.Request): Promise<HealthCheck> {
		const databaseName = await this.db.query('SELECT DATABASE();');
		const healthCheck: HealthCheck = {
			dbName: databaseName.data,
			environment: process.env.NODE_ENV || 'development',
			ip: req.ip,
			status: 'up',
		};
		return healthCheck;
	}
}

export default HealthController;