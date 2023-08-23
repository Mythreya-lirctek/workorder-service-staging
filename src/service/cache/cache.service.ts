import redis, { RedisClient } from 'redis';
import { promisify } from 'util';

// tslint:disable-next-line:no-empty-interface
interface Cache extends RedisClient {}

// tslint:disable-next-line:no-empty-interface
interface Stats {};

class CacheService {
	private cache: Cache;
	private ttlSeconds: number;
	constructor(ttlSeconds: number = 60 * 60 * 1) {
		this.ttlSeconds = ttlSeconds;
		this.cache = redis.createClient({
			host: 'localhost',
			password: '',
			port: 6379,
			prefix: 'template_'
		});
	}

	/**
	 * This method will obtain a value from cache based on the give key.
	 *
	 * @template T Interface for the cache value
	 * @param {string} key cache key to find in the cache
	 * @returns {Promise<T>} a promise which resolves to the object of the specifed type.
	 * It will still resolve to null/undefined value if the cache key is not present.
	 * @memberof CacheService
	 */
	public async get<T>(key: string): Promise<T> {
		const getAsync = promisify(this.cache.get).bind(this.cache);
		const result = await getAsync(key);
		if (result && typeof result === 'string') {
			return Promise.resolve<T>(JSON.parse(result));
		}
		return Promise.resolve<T>(result);
	}

	/**
	 * This method will set the given cache value with the specified cache key.
	 * You can additionally specify time to live (ttl) value. 
	 * Default is the cache level ttl
	 *
	 * @template T Interface for the cache value
	 * @param {string} key cache key under which the value will be stored.
	 * @param {T} value cache value to be cached.
	 * @param {number} [ttl] Optional time to live value in seconds
	 * @returns {Promise<boolean>} a promise which resolves true if cache set 
	 * correctly, false otherwise.
	 * @memberof CacheService
	 */
	public set<T>(key: string, value: T, ttl: number = this.ttlSeconds): Promise<boolean> {
		const setAsync = promisify(this.cache.set).bind(this.cache);
		const stringValue = typeof value !== 'string' ? JSON.stringify(value) : value;
		if (ttl) {
			// EX seconds -- Set the specified expire time, in seconds.
			return setAsync(key, stringValue, 'EX' ,ttl);
		}
		return setAsync(key, stringValue);
	}

	/**
	 * This method is used to delete a specific cache entry by key or a list of
	 * keys.
	 *
	 * @param {(string[])} keys key/keys for which
	 * cache to delete
	 * @returns {boolean} true if the entry was deleted, false otherwise
	 * @memberof CacheService
	 */
	public del(keys: string[]): boolean {
		return this.cache.del(...keys);
	}

	/**
	 * This method will remove all entries from the cache.
	 *
	 * @memberof CacheService
	 */
	public flush(): boolean {
		return this.cache.flushall();
	}

	/**
	 * This method will return statistics on all the cache
	 * entries about the hit/miss
	 *
	 * @returns {Stats}
	 * @memberof CacheService
	 */
	public getStats(): Stats {
		const infoAsync = promisify(this.cache.info).bind(this.cache);
		return infoAsync();
	}
}


export default CacheService;
