import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';

class TokenService {
	public static issue(payload: any): string {
		return jwt.sign(
			payload,
			process.env.TOKEN_SECRET || this.DEFAULT_SECRET,
			{
				issuer: 'prime-service'
			}
		);
	}
	public static verify(token: string, next: NextFunction): void {
		return jwt.verify(
			token,
			process.env.TOKEN_SECRET || this.DEFAULT_SECRET, // The secret we used to sign it.
			{},
			next
		);
	}
	private static DEFAULT_SECRET: string = 'oursecret';
}

export default TokenService;