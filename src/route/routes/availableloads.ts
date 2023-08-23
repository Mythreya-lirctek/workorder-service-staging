import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'availableloads#getAvailableLoads',
	method: RouteMethod.GET,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/getAvailableLoads`
},{
	controller: 'availableloads#addALSplits',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/addALSplits`
},{
	controller: 'availableloads#mergeALs',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/mergeALs`
},{
	controller: 'availableloads#deleteTerminal',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/deleteTerminal`
},{
	controller: 'availableloads#getStopsforAvailableLoads',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/availableloads/getStopsforAvailableLoads`
}]

export default routes;