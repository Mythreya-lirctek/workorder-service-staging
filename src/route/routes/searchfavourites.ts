import { ApiRoute, apiPrefix, RouteMethod } from './api';
import passport from 'passport';

const routes: ApiRoute[] = [{
	controller: 'searchfavourites#getsearchFavouritesbyUserId',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/searchfavourites/getsearchFavouritesbyUserId`
}, {
	controller: 'searchfavourites#addSearchFavourites',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/searchfavourites/addSearchFavourites`
}, {
	controller: 'searchfavourites#saveSearchFavourites',
	method: RouteMethod.PUT,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/searchfavourites/saveSearchFavourites/:searchFavouriteId`
}, {
	controller: 'searchfavourites#validateFavourites',
	method: RouteMethod.POST,
	middlewares: [
		passport.authenticate('bearer')
	],
	path: `${apiPrefix}/searchfavourites/validateFavourites`
}
];

export default routes;