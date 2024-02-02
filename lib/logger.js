const fs = require( 'fs' );
const path = require('path');
const zlib = require('zlib');
const moment = require('moment');
const axios = require('axios');



class sirLogsALot {
	constructor ( settings )
	{

		this.label = settings?.label || 'PDF';
		this.codeEnv = settings?.codeEnv || 'backend';
		this.logArray = [];
		this.filenamePattern = 'log-%DATE%.txt';
		this.zipOldFiles = false;
		this.maxSize = 10 * 1024 * 1024;
		this.maxFiles = 10;
		this.timeInterval = '1d';
		this.currentLog = this.generateFilename();
		this.logStream = { stream: this.createWriteStream( this.currentLog ), startTime: moment() };
		this.checkSizeAndRotate();
		this.API_URL = 'https://www.exsicon.se/_functions/';
		this.accessToken;
			this.refreshToken;
		
	}

	// Log an info message
	info(logObject) {
		this.middleman(logObject, 'info');
	}

	// Log a warning message
	warn(logObject) {
		this.middleman(logObject, 'warn');
	}

	// log an error message
	error(logObject) {
		this.middleman(logObject, 'error');
	}
	// Log a debug message
	debug(logObject) {
		this.middleman(logObject, 'debug');
	}

	fatal(logObject) {
		this.middleman(logObject, 'fatal');
	}

	userCom(logObject) {
		this.middleman(logObject, 'userCom');
	}

	middleman ( logObject, level )
	{
		
		let { message = '', metadata = '', codefile = '', codeFile = '', labels = [] } = logObject;
		if (codeFile) codefile = codeFile;
		this.createLogEntry(level, message, metadata, codefile, labels);
		
  }
  
	createLogEntry(level, message, metadata, codefile, labels) {
		try {
			let entry = {
				level: level,
				timestamp: new Date().toISOString(),
				message: message,
				metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
				label: `${this.label}, ${Array.isArray(labels) ? labels.join(', ') : labels}`,
				codefile: codefile,
				codeEnv: this.codeEnv,
			};
      
			console.log(
				`Logger: ${entry.level.charAt(0).toUpperCase() + entry.level.slice(1)} - Labels: ${entry.label} - Message: ${
					entry.message
				}, Metadata: ${entry.metadata}, codefile: ${entry.codefile}, Timestamp: ${entry.timestamp}`
			);

			this.saveLogToFile(entry);

			this.logArray.push(entry);


		} catch (err) {
			console.log('Error in logger - _createLogEntry: ', err);
		}
	}
	

	generateFilename() {
		const date = moment().format('YYYY-MM-DD');
		return this.filenamePattern.replace('%DATE%', date);
	}

	createWriteStream(filename) {
		const dir = path.join(__dirname, 'logs');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		const fullPath = path.join(dir, filename);
		const stream = fs.createWriteStream(fullPath, { flags: 'a' });
stream.on('error', (err) => {
    console.error('Error writing to log file:', err);
});
return stream;
	}

	checkSizeAndRotate ()
	{
		try
		{
			const thisDir = path.join( __dirname, 'logs', this.currentLog );
			if ( fs.existsSync( thisDir ) )
			{
				
			
				const stats = fs.statSync( thisDir );
				if ( stats.size >= this.maxSize || moment().diff( this.logStream.startTime, this.timeInterval ) > 0 )
				{
					this.rotateLog();
				}
			}
				this.checkSizeInterval = setTimeout( this.checkSizeAndRotate.bind( this ), 21600000 );
			
		} catch ( err )
		{
			console.log( 'Error in logger - checkSizeAndRotate: ', err );
		}
	}

	rotateLog ()
	{
		try
		{
			this.logStream.stream.end();
			if ( this.zipOldFiles )
			{
				const oldLog = this.currentLog;
				const gzip = zlib.createGzip();
				const inp = fs.createReadStream( oldLog );
				const out = fs.createWriteStream( `${ oldLog }.gz` );
				inp
					.pipe( gzip )
					.pipe( out )
					.on( 'finish', () => fs.unlinkSync( oldLog ) );
			}
			this.deleteOldLogs();
			this.currentLog = this.generateFilename();
			this.logStream = {
				stream: this.createWriteStream( this.currentLog ),
				startTime: moment(),
			};
		} catch ( err )
		{
			console.log( 'Error in logger - rotateLog: ', err );
		}
	}

	deleteOldLogs ()
	{
		try {
			const files = fs
				.readdirSync( path.join( __dirname, 'logs' ) )
				.filter( ( file ) => file.startsWith( 'log-' ) )
				.sort()
				.reverse();
			while ( files.length >= this.maxFiles )
			{
				const fileToDelete = files.pop();
				fs.unlinkSync( path.join( __dirname, 'logs', fileToDelete ) );
			}
		} catch ( err )
		{
			console.log( 'Error in logger - deleteOldLogs: ', err );
		}
	}

	saveLogToFile(entry) {
		this.logStream.stream.write(
			`${ entry.timestamp } - Logger: ${ entry.level.charAt( 0 ).toUpperCase() + entry.level.slice( 1 ) } - Message: ${ entry.message }.\nMetadata: ${ entry.metadata }, codefile: ${ entry.codefile }, Labels: ${ entry.label }\n\n`
		);
	} 

	async sendLogArray() {
		await this.getAccessToken();
		await this.makeAuthorizedRequest();
	}

	async getAccessToken() {
		try {
			const PDF_PASSWORD = process.env.PDF_ADMIN_POST;
			const response = await axios.post(`${this.API_URL}/login`, {
				username: 'admin',
				password: PDF_PASSWORD,
			});
	
			this.accessToken = response.data.accessToken;
			this.refreshToken = response.data.refreshToken;
		} catch (error) {
			console.error('Error getting access token:', error.response.data);
		}
	}


	async refreshAccessToken() {
		try {
			const response = await axios.post(`${this.API_URL}/token`, {
				token: this.refreshToken,
			});
	
			this.accessToken = response.data.accessToken;
		} catch (error) {
			console.error('Error refreshing access token:', error.response.data);
			this.accessToken = null;
			this.refreshToken = null;
			await this.getAccessToken();
		}
	};
	
	// Refactored to handle errors and retry logic
	async makeAuthorizedRequest() {
		try {
			const response = await axios.post(`${this.API_URL}/createPdfLogs`, JSON.stringify(this.logArray), {
				headers: {
					'Authorization': `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
			});
	
			if (response.data.length > 0) {
				this.logArray = [];
			} else {
				console.log('No response from ExSicon API');
			}
		} catch (error) {
			if (error.response.status === 401 || error.response.status === 403) {
				console.log('Access Token expired. Refreshing token...');
				if (tries < 3) {
					tries++;
					await this.refreshAccessToken();
					// Retry the request with the new access token
					await this.makeAuthorizedRequest();
				} else {
					logger.error({
						message: 'Three attempts to get ExSicon API failed.',
						metadata: error.response.data,
					});
				}
			} else {
				console.error('Error making authorized request:', error.response.data);
			}
		}
	}



}

const logger = new sirLogsALot();
module.exports = logger;
