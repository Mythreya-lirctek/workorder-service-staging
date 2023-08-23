import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'ten99#addTen99',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/addTen99`
},{
	controller: 'ten99#saveTen99',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/saveTen99/:ten99Id`
},{
	controller: 'ten99#get1099HistoryNotCreated',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099HistoryNotCreated`
},{
	controller: 'ten99#get1099HistoryNotCreatedExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099HistoryNotCreatedExportAll`
},
{
	controller: 'ten99#get1099Summary',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099Summary`
},{
	controller: 'ten99#get1099History',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099History`
},{
	controller: 'ten99#get1099Details',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099Details`
},{
	controller: 'ten99#get1099HistoryExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099HistoryExportAll`
},{
	controller: 'ten99#addBulkTen99',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/addBulkTen99`
},
{
	controller: 'ten99#get1099SummaryExportAll',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/get1099SummaryExportAll`
},{
	controller: 'ten99#print1099Details',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/ten99/print1099Details`
}]

export default routes;