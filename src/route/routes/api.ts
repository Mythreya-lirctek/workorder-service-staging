export const apiPrefix = '/workorder/api';

export enum RouteMethod {
	GET = 'get',
	PUT = 'put',
	POST = 'post',
	DELETE = 'delete'
}

export interface ApiRoute {
	method: RouteMethod;
	path: string;
	middlewares?: any[];
	controller: string;
}

const routes: ApiRoute[] = [{
	controller: 'health#check',
	method: RouteMethod.GET,
	path: `${apiPrefix}/health`
}, {
	controller: 'triumph#upload',
	method: RouteMethod.POST,
	path: `${apiPrefix}/triumph/upload`
}];

export default routes;