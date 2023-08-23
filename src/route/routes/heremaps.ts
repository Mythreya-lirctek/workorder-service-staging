import { ApiRoute, apiPrefix,RouteMethod } from './api';
import multer from 'multer';
import passport from 'passport';

const nylasRoutes: ApiRoute[] = [
	{
		controller: 'heremaps#calculateRoute',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/heremaps/calculateRoute`,
	}
];

export default nylasRoutes;