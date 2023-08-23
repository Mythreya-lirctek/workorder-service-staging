import mysql, { Pool } from 'mysql';
import ConfigService from '../config/config';
import debugModule from 'debug';
const debug = debugModule('api:mysql');

class MysqlConnection {
	public static getConnectionPool(): Pool {
		if (!MysqlConnection.connection) {
			const config = ConfigService.configs;
			const databaseConfig = config.database;
			debug(`getting new connection pool max: ${databaseConfig.connectionLimit}`);
			MysqlConnection.connection = mysql.createPool({
				connectionLimit : databaseConfig.connectionLimit || 10,
				database: databaseConfig.database,
				host: databaseConfig.host,
				password: databaseConfig.password,
				user: databaseConfig.user
			});
			if (!process.env.NODE_ENV) {
				MysqlConnection.connection.on('connection', (connection) => {
					connection.on('enqueue', (sequence: any) => {
						if ('Query' === sequence.constructor.name) {
							debug(sequence.sql.replace(/\s\s+|\n|\r/g, ' '));
						}
					});
				});
			}
		}
		return MysqlConnection.connection;
	}


	public static getReaderConnectionPool(): Pool {
		if (!MysqlConnection.readonlyConnection) {
			const config = ConfigService.configs;
			// fallback to the main connection if a reader is not specified.
			const readonlyDatabaseConfig = config.readerDatabase || config.database;
			debug(`getting new reader connection pool max: ${readonlyDatabaseConfig.connectionLimit}`);
			
			MysqlConnection.readonlyConnection = mysql.createPool({
				connectionLimit : readonlyDatabaseConfig.connectionLimit || 10,
				database: readonlyDatabaseConfig.database,
				host: readonlyDatabaseConfig.host,
				password: readonlyDatabaseConfig.password,
				user: readonlyDatabaseConfig.user
			});
			if (!process.env.NODE_ENV) {
				MysqlConnection.readonlyConnection.on('connection', (connection) => {
					connection.on('enqueue', (sequence: any) => {
						if ('Query' === sequence.constructor.name) {
							debug(sequence.sql.replace(/\s\s+|\n|\r/g, ' '));
						}
					});
				});
			}
		}
		return MysqlConnection.readonlyConnection;
	}
	private static connection: Pool;
	private static readonlyConnection: Pool;

	private constructor() {}
}

export default MysqlConnection;