jest.autoMockOff();

import { routes } from '../index';
import { ApiRoute } from '../api';
import { AssertionError } from 'assert';

describe('api routes', () => {
	it('make sure route paths are unique by method', () => {
		const visitedRoutes: any = [];
		const duplicateRoutes: any = [];
		const isDuplicate = (route: ApiRoute) => {
			const found = visitedRoutes.find((vr: any) => {
				return vr.path === route.path
				&& vr.method === route.method
			});
			if (found) {
				duplicateRoutes.push({
					found,
					route
				});
			}
		}
		routes.forEach((route: ApiRoute) => {
			expect(route.path).toBeDefined();
			expect(route.method).toBeDefined();
			expect(route.controller).toBeDefined();
			isDuplicate(route);
			visitedRoutes.push({
				controller: route.controller,
				method: route.method,
				path: route.path
			});
		});
		expect(duplicateRoutes.length).toBe(0);
	});
});