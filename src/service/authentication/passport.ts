import passport from 'passport';
import passportHttp from 'passport-http';
import passportLocal from 'passport-local';
import passportHttpBearer from 'passport-http-bearer';
import UserService from '../user/user';
import TokenService from '../authentication/token';
import { UserModel } from '../user/user.interface';
import debugModule from 'debug';

const debug = debugModule('api:passport');

class PassportService {
	private userService: UserService;
	constructor() {
		passport.serializeUser((user, done) => {
			done(null, user);
		});
		
		passport.deserializeUser((user, done) => {
			done(null, user);
		});
	}
	public loadStrategies(): void {
		passport.use(new passportHttp.BasicStrategy (
			async (identifier: string, password: string, done) => {
				try {
					this.userService = new UserService();
					const userResponse  = await this.userService.findUser(identifier);
					const users: UserModel[] = userResponse.data;
					const user = users && users.length ? users[0] : null;
					const validatePwd = await this.userService.validatePassword(password, user.password)

					if (user && validatePwd) {
						debug('user accepted');
						return done(null, user);
					} 
					debug('user unauthorized');
					return done(false);
				} catch (error) {
					debug('user error');
					return done(error);
				}
			}
		));

		passport.use(new passportLocal.Strategy(
			async (identifier: string, password: string, done) => {
				try {
					this.userService = new UserService();
					const userResponse = await this.userService.findUser(identifier);
					const users: UserModel[] = userResponse.data;
					const user = users && users.length ? users[0] : null;
					if (user) {
						const validatePwd = await this.userService.validatePassword(password, user.password)
						if (user && validatePwd) {
							debug('user accepted');
							delete user.password;
							if (!user.token) {
								debug('issuing new user token');
								user.token = await this.userService.issueUserToken(user);
							}
							return done(null, user);
						} else  {
							return done(null,{Message:'Username / Password doesn\'t match'});
						}
					} else {
						return done(null,{Message:'You are not authorized to login, Please contact your manager or our customer support team.'});
					}
					debug('user unauthorized');
					return done(false);
				} catch (error) {
					debug('user error');
					return done(error);
				}
			}
		));

		passport.use(new passportHttpBearer.Strategy(
			async (token: string, done) => {
				const userService = new UserService();
				try {
					const userResponse = await userService.findUserByToken(token);
					const users: UserModel[] = userResponse.data;
					const user = users && users.length ? users[0] : null;
					if (user) {
						return done(null, user);
					}
				} catch (error) {
					return done(error);
				}
				return done(null, false);
			}
		));
	}
}

export default PassportService;
