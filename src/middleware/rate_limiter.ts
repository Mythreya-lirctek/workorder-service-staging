import Database from '../service/database/database';
import { RateLimiterMySQL } from 'rate-limiter-flexible';
import express from 'express';
import debugModule from 'debug';

const debug = debugModule('api:rate-limiter');

const rateLimiterMiddleware = () => {
	const mysqlPool = new Database();

	const rateLimiter = new RateLimiterMySQL({
		duration: .1, // per 1 second by IP
		keyPrefix: 'rtl',
		points: 10, // 10 requests
		storeClient: mysqlPool.connection,
		storeType: 'mysql'
	}, (err) => {
		if (err) {
			debug(err);
		}
	});

	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		rateLimiter.consume(req.ip)
			.then(() => {
				next();
			})
			.catch((er) => {
				res.status(429).send(er);
			});
	}
};

export default rateLimiterMiddleware;