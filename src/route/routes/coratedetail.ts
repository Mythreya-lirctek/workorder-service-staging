import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'coratedetail#addCoRateDetail',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coratedetail/addCoRateDetail`
},{
	controller: 'coratedetail#saveCoRateDetail',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coratedetail/saveCoRateDetail/:id`
},{
	controller: 'coratedetail#getCORateDetailsByCOId',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/coratedetail/getCORateDetailsByCOId/:customerOrderId`
}];
export default routes;