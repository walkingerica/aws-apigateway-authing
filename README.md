# API Gateway&Authing Authentication POC

### 

## POC Requirements

The [API Gateway custom authorizers](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) with Authing will be used as an authentication method. The architecture will be :

[Image: image.png]


## Details 

This is an example of how to protect API endpoints with [Authing](https://authing.cn/), JSON Web Tokens (jwt) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).
Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

### Prerequisite

1. NodeJS 14.x or above
2. An AWS China Region account(AWS Global account does not work)
3. An [Authing](https://authing.cn/) account

### Set up

1. Install [NodeJS Authing SDK dependencies](https://docs.authing.cn/v2/reference/sdk-for-node/), run `npm install.`
2. Prepare an [Authing application](https://docs.authing.cn/v2/guides/app/), use the default application or [create a new one](https://docs.authing.cn/v2/guides/app/create-app.html). 

[Image: image.png] Note: after the Authing application created,  please make sure the verification is all **none**.
[Image: image.png]
1. Gather all the Authing application information used by JavaScript SDK and we will use this in Step 4, including

* **App ID:**  Authing unique application ID for every one, and all the SDK will need this information to init.
* **App Secret:** Authing issue for every applications to be identified by the platform, and some Authing SDK may need this to init. This should be always used in backend in production for security reason. But we need to broken the rule in this demo, because we need keep this demo simple enogh. And if we want to use this App Secret only in backend then we must use HTTPS as the call back URL.
* **Subdomain**: The endpoint for Authing API and all the SDK need this to init.
* [Image: image.png]

1. Please modify the `serverless.yml` according to your keys.

* Line 27, modify the prefix in the serverless.yml,  make sure it is unique in site and bucketname.
* Line 28, modify the authId to your App ID.
* Line 29 modify the authUrl to Subdomain.
* Line30 modify the authKey to App Secret.

1. Please deploy Serverless framework 

```
`sls deploy`
```

1. Run your frontend locally or deploy your frontend to host of your choosing. In both cases, make sure to configure the `Login Callback URL` in your Authing console. An example of how to run your frontend locally:

```
cd front;
python -m http.server
```

And also need start Serverless offline:

```
sls offline
```

    It will work like the following:
[Image: image.png]

### Custom Authorizers functions

[Custom authorizers functions](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) are executed before a Lambda function is executed and return an Error or a Policy document.
The Custom authorizer function is passing an `event` object to API Gateway as below:


```
{
"type": "TOKEN",
"authorizationToken": "<Incoming bearer token>",
"methodArn": "arn:aws:execute-api:<Region id>:<Account id>:<API id>/<Stage>/<Method>/<Resource path>"
}
```

You will have to change this policy to accommodate your needs. The default reply provided, will only authorize one endpoint!


### Workflow 

### Frontend

The frontend is a bare bones vanilla JavaScript implementation.

### Issues you may meet

1. Make sure you have installed two plugins, [serverless-offline](https://www.serverless.com/plugins/serverless-offline#installation) and [serverless-s3-sync](https://www.serverless.com/plugins/serverless-s3-sync), otherwise you will get the following error when running “sls deploy”

```
Serverless Error ----------------------------------------
 
  Serverless plugin "serverless-offline" not found. Make sure it's installed and listed in the "plugins" section of your serverless config file. Run "serverless plugin install -n serverless-offline" to install it.
```

1. The error like the following:

```
"TypeError: Cannot read properties of undefined (reading ‘importKey')"
```

[Image: image.png]The reason is that there are two signature algorithms,  HTTP with HS256 are used in test case. In the production, please choose HTTPS with RS256.
[Image: image.png]

### How it works

1. Prepare a user in the Authing.

[Image: image.png]
1. Open your link in the Browser and Click “Log in” .

[Image: image.png]
1. Enter your user’s name and password that is created in the first Step. 

[Image: image.png]
1. If you log in successfully, your user’s email will show on the page.

[Image: image.png]
1. Try to call the different API, public API and protected API.

[Image: image.png][Image: image.png]
### Reference

This project is refer to the [Serverless](http://serverless.com/) examples in the [Github](https://github.com/serverless/examples).

### License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.
