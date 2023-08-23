import express from 'express';
import newrelic from 'newrelic';
import debugModule from 'debug';
const debug = debugModule('api:request_logger');
export const requestLogger = () => {
	return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
		newrelic.addCustomAttribute('request.params', JSON.stringify(req.params));
		newrelic.addCustomAttribute('request.query', JSON.stringify(req.query));
		newrelic.addCustomAttribute('request.body', JSON.stringify(req.body));
		next();
	};
}