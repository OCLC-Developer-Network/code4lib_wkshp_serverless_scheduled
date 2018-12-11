const aws = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const Client = require('ssh2-sftp-client');

const s3 = new aws.S3();

const kms = new aws.KMS({'region': 'us-east-1'});
let environment = 'prod';

exports.handler = async(event) => {
	
	try {
		let data = await kms.decrypt({CiphertextBlob: fs.readFileSync(environment + "_config_encrypted.txt")}).promise();
		let rsa_key_data = await kms.decrypt({CiphertextBlob: fs.readFileSync("rsa_id_encrypted")}).promise();
		
		let config = yaml.load(data['Plaintext'].toString());
		const bucket = config['bucket'];
		const filename = config['file']
		const path = config['path'];
	
		const sftp_config = {
		    host: config['host'],
		    username: config['username'],
		    privateKey: rsa_key_data['Plaintext'].toString()
		};
		
		const sftp = new Client();
		
		sftp.connect(sftp_config).then(() => {
			sftp.get(config['path'] + '/' + config['file']).then((data) => {
				let body = '';
			    data.on('data', (chunk) => {
			        body += chunk;
			    });
			    
			    data.on('end', () => {
					s3.putObject({Bucket: bucket, Key: filename, Body: body}, function(err, data) {
						if (err) {
							console.log('failure')
							return err;
						} else {
							console.log('success')
							return { status: 'success' }
						}
					});
					sftp.end();
			    })
			})	
		    .catch((err) => {
		    		console.log(err);
		    		return err;
		    })
		})
		.catch((err) => {
			console.log(err);
			return err;
		});
		
	} catch (Error){
		console.log(Error, Error.stack);
	    return Error;
	} 
};