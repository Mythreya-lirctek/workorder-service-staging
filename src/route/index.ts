/**
 * This module loads all the API routes from routes/api.js. It expects the routes to be in a specific format.
 * All the routes are loaded on application start and have a dispatcher attached to each route, which is responsible
 * for calling controller actions on the specified routes.
 *
 * @example
 * Controller path is split into two sections.
 * 1. Path to the controller with the controller name without '_controller'
 * 2. The action to be invoked when the route is called and is denoted by #action
 * {
 *    'path': `api/login`,
 *    'method': 'post',
 *    'controller': 'auth/auth#login'
 * }
 *
 * @module routes/index
 * @requires express
 * @requires ./dispatcher
 */

import express from 'express';
import { dispatchRoute } from './dispatcher';

import { routes } from './routes';

import debugModule from 'debug';
const debug = debugModule('api:routes');

const router = express.Router() as any;

if (routes && routes.length) {
	routes.forEach(route => {
		const method = route.method ? route.method.toLowerCase() : 'get';
		const middlewares = route.middlewares || [];
		if (!route.controller) {
			return router[method].apply(router, [
				route.path,
				...middlewares
			]);
		}
		const controllerPath = route.controller.split('#');
		debug(`registering route ${method}: ${route.path} controller: ${route.controller}`);
		router[method].apply(router, [
			route.path,
			...middlewares,
			dispatchRoute.bind(router, controllerPath[0], controllerPath[1])
		]);
	});
}

/* GET home page. */
router.get('/', (_: express.Request, res: express.Response) => {
	res.send({ title: 'Welcome to Lirctek API system' });
});

export default router;