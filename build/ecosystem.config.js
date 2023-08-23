module.exports = {
	apps: [
		{
			name: "workorder-service-development",
			script: "dist/server.js",
			instances: 1,
			autorestart: true,
			watch: true,
			env: {
				NODE_ENV: "development",
				PORT: 4013,
				GATEWAY_URL: "http://dev-api-service.taraiwa.com",
				CONFIG_USERNAME: "prime-dev",
				CONFIG_PASSWORD: "u=7zdMcukBzwHdF-"
			}
		},
		{
			name: 'workorder-service-sandbox',
			script: 'dist/server.js',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'sandbox',
				PORT: 4013,
				GATEWAY_URL: "http://dev-api-service.taraiwa.com",
				CONFIG_USERNAME: "prime-dev",
				CONFIG_PASSWORD: "u=7zdMcukBzwHdF-",
				NYLAS_USER_REDIRECT_URI: "https://sandbox.taraiwa.com/#/users/profile",
				NYLAS_COMPANY_REDIRECT_URI: "https://sandbox.taraiwa.com/#/company/integration/email",
				TRUCKSTOPS_REDIRECT_URL:"https://sandbox.taraiwa.com/#/company/integration/loadboard",
			}
		},
		{
			name: 'workorder-service-staging',
			script: 'dist/server.js',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'staging',
				PORT: 4013,
				GATEWAY_URL: "https://staging-api-service.taraiwa.com",
				CONFIG_USERNAME: "prime-staging",
				CONFIG_PASSWORD: "u=7zdMcukBzwHdF-",
				NYLAS_USER_REDIRECT_URI: "https://sandbox.taraiwa.com/#/users/profile",
				NYLAS_COMPANY_REDIRECT_URI: "https://sandbox.taraiwa.com/#/company/integration/email",
				TRUCKSTOPS_REDIRECT_URL:"https://sandbox.taraiwa.com/#/company/integration/loadboard",
			}
		},
		{
			name: 'workorder-service-production',
			script: 'dist/server.js',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PORT: 4013,
				GATEWAY_URL: "http://config-server.etruckingsoft.com",
				NYLAS_USER_REDIRECT_URI: "https://app.taraiwa.com/#/users/profile",
				NYLAS_COMPANY_REDIRECT_URI: "https://app.taraiwa.com/#/company/integration/email",
				TRUCKSTOPS_REDIRECT_URL:"https://app.taraiwa.com/#/company/integration/loadboard",
			}
		}
	]
};
