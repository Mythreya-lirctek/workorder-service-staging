import Database from '../database/database';
import { UserModel } from './user.interface';
import { compareSync, hashSync } from 'bcryptjs';
import TokenService from '../authentication/token';
import { DatabaseResponse } from '../database/database.interface';

class UserService {
	private database: Database;
	private databaseget: Database;
	constructor() {
		this.database = new Database();
		this.databaseget = new Database(true);
		
	}
	public findUser(username: string): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT 
				u.id as id,
				u.username as userName,
				u.email as email,
				u.firstName as firstName,
				u.lastName as lastName,
				u.company_id as companyId,
				u.address_id as addressId,
				u.businessName as businessName,
				u.startTime as startTime,
				u.endTime as endTime,
				u.role_id as roleId,
				u.profilePhoto as profilePhoto,
				u.fax as fax,
				u.phone as phone,
				p.password as password,
				p.tokens as token,
				c.timeZone as timeZone
			FROM
				user as u
			LEFT JOIN passport as p ON p.user_id = u.id
			LEFT JOIN company as c ON c.id = u.company_id
			WHERE
				u.username = '${username}'
				AND u.isdeleted = 0
		`);
	}

	public findUserByToken(token: string): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			SELECT 
				u.id as id,
				u.username as userName,
				u.firstName as firstName,
				u.lastName as lastName,
				u.company_id as companyId,
				u.address_id as addressId,
				u.businessName as businessName,
				u.startTime as startTime,
				u.endTime as endTime,
				u.role_id as roleId,
				u.profilePhoto as profilePhoto,
				u.fax as fax,
				u.phone as phone,
				p.password as password,
				p.tokens as token,
				c.timeZone as timeZone
			FROM
				user as u
			LEFT JOIN passport as p ON p.user_id = u.id
			LEFT JOIN company as c ON c.id = u.company_id
			WHERE
				p.tokens = '${token}'
				AND u.isdeleted = 0
		`);
	}

	public getuserDetailsonLogin(companyId: number, userId: number): Promise<DatabaseResponse> {
		return this.databaseget.query(`
			CALL getuserDetailsonLogin(
				${userId},
				${companyId}
			)
		`);
	}

	public async issueUserToken(user: UserModel): Promise<string> {
		const token = TokenService.issue({
			companyId: user.companyId,
			id: user.id
		});

		await this.database.query(`
			UPDATE passport
			SET tokens = '${token}'
			WHERE user_id = ${user.id};
		`);

		return token;
	}

	public generateHash(password: string): string {
		// Using salt as 10 to keep in sync with prime backend
		return hashSync(password, 10);
	}

	public validatePassword(password: string, hash: string): boolean {
		return compareSync(password, hash);
	}

	public addPassport(password: string, userId: number, createUserId: number): Promise<any> {
		const generatePassword =  this.generateHash(password);
		return this.database.query(`
			INSERT INTO passport(
				protocol, password, provider, identifier, user_id, createdAt, createdUserId
			)
			VALUES(
				'local',
				${this.database.connection.escape(generatePassword)},
				'local',
				'Admin',
				${userId},
				UTC_TIMESTAMP,
				${createUserId ? createUserId : null} 
			)
		`)
	}
}

export default UserService;