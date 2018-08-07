const config = {
	development: {
		db: {
			 database: 'storedb',
			 user: 'postgres',
			 password: 12345,
			 host: 'localhost',
			 port: 5432
		},
		nodemailer: {

		}
	},
	production: {
		db: {
			database: process.env.DB_DB,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			ssl: true
		},
		nodemailer: {
			
		}
	}
};

module.exports = process.env.NODE_ENV == "production" ? config.production : config.development;