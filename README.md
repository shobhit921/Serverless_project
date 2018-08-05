

## Getting Started

### Install Package

This package can be installed via npm:

```bash
npm install
```

### Configure Platforms

You must configure credentials before using any of the supported platforms:

* **Amazon AWS Lambda** can be configured by following this  'https://serverless.com/framework/docs/providers/aws/guide/credentials/' guide  on the Serverless Framework website.
* **Apache OpenWhisk** can be configured by following this 'https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/' guide on the Serverless Framework website.

NOTE: In server.js kindly add your aws management console details in the line 175 and 177 for your deployment. Follow the links above for configuring your setup. 

After this to deploy the AWS environment run the following command

```bash
sls deploy or serverless deploy
```

Later to run the performance test you can run the following command

```bash
npm start amazon
```

this will start the tests and will execute the tests in hand giving results
