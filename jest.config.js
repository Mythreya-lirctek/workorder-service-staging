module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	testEnvironment: 'node',
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.json'
		}
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	moduleDirectories: ['node_modules', 'src'],
	transform: {
		"^.+\\.jsx?$": "babel-jest",
		"^.+\\.tsx?$": "ts-jest"
	},
	testMatch: ['<rootDir>/src/**/__tests__/**/*.test.(ts|js)'],
	testEnvironment: 'node',
	collectCoverage: true,
	restoreMocks: true,
	resetMocks: true,
	resetModules: true,
	automock: true,
	collectCoverageFrom: [
		'**/*.{ts,jsx}',
		'!**/node_modules/**',
		'!**/vendor/**',
		'!**/coverage/**',
		'!dist/**/*.{ts,jsx}',
	],
	unmockedModulePathPatterns: [
		'bluebird',
		'soap',
		'axios',
		'debug'
	]
};
