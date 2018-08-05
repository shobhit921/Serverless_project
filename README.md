

## Getting Started

### Install Package

This package can be installed via npm:

```bash
npm install
```

### Configure Platforms

You must configure credentials before using any of the supported platforms:

* **AWS Lambda** can be configured by following this <a href='https://serverless.com/framework/docs/providers/aws/guide/credentials/'>guide</a> on the Serverless Framework website.
* **IBM OpenWhisk** can be configured by following this <a href='https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/'>guide</a> on the Serverless Framework website.


After this to deploy the AWS environment run the following command

sls deploy or serverless deploy

Later to run the performance test you can run the following command

npm start amazon

this will start the tests and will execute the tests in hand giving results
