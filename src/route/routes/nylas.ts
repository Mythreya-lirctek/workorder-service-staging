import { ApiRoute, apiPrefix,RouteMethod } from './api';
import multer from 'multer';
import passport from 'passport';

const upload = multer();
const nylasRoutes: ApiRoute[] = [
	{
		controller: 'nylas_email#login',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/login`,
	},
	{
		controller: 'nylas_email#webhookGet',
		method: RouteMethod.GET,
		path: `${apiPrefix}/nylas/webhooks`
	},
	{
		controller: 'nylas_email#webhookPost',
		method: RouteMethod.POST,
		path: `${apiPrefix}/nylas/webhooks`
	},
	{
		controller: 'nylas_email#userCallback',
		method: RouteMethod.GET,
		path: `${apiPrefix}/nylas/user/callback`
	},
	{
		controller: 'nylas_email#companyIntegrationsCallback',
		method: RouteMethod.GET,
		path: `${apiPrefix}/nylas/company/callback`
	},
	{
		controller: 'nylas_email#getAccessToken',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/getAccessToken`,
	},
	{
		controller: 'nylas_email#sendEmail',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/sendEmail`,
	},
	{
		controller: 'nylas_email#getThreads',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/getThreads`,
	},
	{
		controller: 'nylas_email#getThreadById',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/getThreadById`,
	},
	{
		controller: 'nylas_email#getMessageById',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/getMessageById`,
	},
	{
		controller: 'nylas_email#sendAttachment',
		method: RouteMethod.POST,
		middlewares:[
			passport.authenticate('bearer'),
			upload.array('file', 10)
		],
		path: `${apiPrefix}/nylas/sendAttachment`,
	},
	{
		controller: 'nylas_email#deleteAttachment',
		method: RouteMethod.POST,
		middlewares: [
			passport.authenticate('bearer')
		],
		path: `${apiPrefix}/nylas/deleteAttachment`,
	},
	{
		controller: 'nylas_email#readAttachment',
		method: RouteMethod.POST,
		path: `${apiPrefix}/nylas/readAttachment`,
	}
];

export default nylasRoutes;