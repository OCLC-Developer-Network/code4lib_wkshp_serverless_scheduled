#Scheduled Lambda

Custom application which copies a file from an SFTP server to S3 bucket

##Installing Locally

### Step 1: Clone the repository
Clone this repository

```bash
$ git clone {url}
```
or download directly from GitHub.

Change into the application directory

### Step 2: Use npm
Download node and npm and use the `install` command to read the dependencies JSON file 

```bash
$ npm install
```

### Step 3: Configure application
Copy example_config.yml to prod_config.yml . Open prod_config.yml and edit to include:
- sftp server
- bucket
- file

### Step 4: 

1. Create a rsa Key to use on the SFTP server

```bash
ssh-keygen -t rsa
```

2. Upload the public key to the SFTP server
- If you're using OCLC's SFTP server 

```bash
scp /home/{localusername}/.ssh/id_rsa.pub {userid}@scp.oclc.org:.ssh/authorized_keys
```

### Step 5: AWS Setup

1. Install AWS Commandline tools
- https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html
I reccomend using pip.
2. Create an AWS user in IAM console. Give it appropriate permissions. Copy the key and secret for this user to use in the CLI. 
3. Configure the commandline tools - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

- Make sure you add 
-- key/secret
-- region

### Step 6: Encrypt your Credentials

1. Create a KMS key

2. Encrypt the config file

```bash
$ aws kms encrypt --key-id {key-id} --plaintext fileb://prod_config.yml --output text --query CiphertextBlob --output text | base64 -D > prod_config_encrypted.txt
```

3. Encrypt the rsa key file

```bash
$ aws kms encrypt --key-id {key-id} --plaintext fileb:///path/to/rsa_id --output text --query CiphertextBlob --output text | base64 -D > rsa_id_encrypted
```

### Step 7: Create an S3 Bucket for the files
1. Use the AWS Console to create a bucket with same name as in the config file

### Step 8: Test application
1. Use serverless to test locally

```bash
serverless invoke local --function getFilesViaSFTP --path scheduled_event.json
```

##Installing in AWS Lambda

1. Download and setup the application, see Installing locally
2. Deploy the code using serverless

```bash
$ serverless deploy
```

3. Make sure the role for the Lambda has the right permissions
- KMS decrypt
- S3 write
4. Setup the schedule