import express from 'express';
import debugModule from 'debug';
const debug = debugModule('api:log_response_time');
export const logResponseTime = () => {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const startHrTime = process.hrtime();
		res.on('finish', () => {
			const elapsedHrTime = process.hrtime(startHrTime);
			const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
			debug(`${req.path} : ${elapsedTimeInMs}ms`);
		});
		next();
	};
}