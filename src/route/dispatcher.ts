import express from 'express';
import debugModule from 'debug';

const debug = debugModule('api:dispatcher');

/**
 * Dispatch module is invoke on very route and is responsible for calling the correct
 * controller and action respective to the routes register in routes/index.js.
 *
 * Note: It assumes that the controller path does not have '_controller' in the path.
 * Is creates a new instance for the controller for each request who's scope should end with the
 * end of the request.
 *
 * @module routes/dispatch
 */
export const dispatchRoute = async (controller: any, action: string, req: express.Request, res: express.Response) => {
	try {
		const controllerPath = `../controller/${controller}_controller`;
		debug(`dispatching ${controllerPath}`);
		// tslint:disable-next-line: variable-name
		const Controller = await import(controllerPath);
		const ctrlInstance = new Controller.default();
		ctrlInstance[action](req, res);
	} catch (error) {
		throw error;
	}
};