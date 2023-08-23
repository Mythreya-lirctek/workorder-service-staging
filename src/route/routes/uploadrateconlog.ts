import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'uploadrateconlog#addUploadRateconLog',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/uploadrateconlog/addUploadRateconLog`
}, {
	controller: 'uploadrateconlog#saveUploadRateconLog',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/uploadrateconlog/saveUploadRateconLog/:uploadRateconLogId`
}, {
	controller: 'uploadrateconlog#getUploadRateconLog',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/uploadrateconlog/getUploadRateconLog`
}];

export default routes;