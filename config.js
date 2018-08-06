const config = {
	development: {
		db: {
			 database: 'localhost'
			 user: '
			 password: 
			 host: 
			 port: 5432
		},
		nodemailer: {

		}
	},
	production: {
		db: {
			database: 'DB_DB',
			user: 'DB_USER',
			password: 'DB_PASSWORD',
			host: 'DB_HOST',
			port: 'DB_PORT',
			ssl: true
		},
		nodemailer: {
			
		}
	}
};

module.exports = process.env.NODE_ENV == "production" ? config.production : config.development;