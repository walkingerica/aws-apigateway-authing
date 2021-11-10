# API Gateway Custom Authorizer Function + Authing in China BJS&ZHY Region

This is an example of how to protect API endpoints with [Authing](https://authing.cn/), JSON Web Tokens (jwt) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

## Use cases

- Protect API routes for authorized users
- Rate limiting APIs

## Setup

1. You must have NodeJS 14.x or above! Once you do, run `npm install` to install [NodeJS Authing SDK dependencies](https://docs.authing.cn/v2/reference/sdk-for-node/)

2. You must hava a China region account, and Global account is not work.

3. Have an [Authing](https://authing.cn) account, and get around for how to use this SaaS product.

4. Use the default [Authing application](https://docs.authing.cn/v2/guides/app/) or create a new one.

5. Gather all the Authing application information used by JavaScript SDK.
- App ID: this is Authing unique application ID for every one, and all the SDK will need this information to init.
- App Secret: this Authing issue for every applications to be identified by the platform, and some Authing SDK may need this to init. This should be always used in backend in production for security reason. But we need to broken the rule in this demo, because we need keep this demo simple enogh. And if we want to use this App Secret only in backend then we must use HTTPS as the call back URL. 
- Subdomain: This is the endpoint for Authing API and all the SDK need this to init.

6. Please modify the `serverless.yml` file according to your situations.
- First of all modify the `prefix` in the `serverless.yml` [line 27] value to be unique in site and buckename.
- In the `serverless.yml` [line 28](serverless.yml#L28) modify the `authId` value to your step 5 enterd App ID.
- In the [line 29](serverless.yml#L29) modify the `authUrl` value to your step 5 gathered Subdomain value.
- In the [line 30](serverless.yml#L30) modify the `authKey` value to your step 5 gathered App Secret value.

6. Serverless framework deploy
```
sls deploy
```

7. You can either run your frontend locally or deploy your frontend to host of your choosing. However in either case, make sure to configure the `Login Callback URL` in your Authing console. An example of how to run your frontend locally:

  ```
  cd frontend;
  python -m http.server
  ```
And also need start Serverless offline:
```
sls offline
```


## Custom authorizer functions

[Custom authorizers functions](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) are executed before a Lambda function is executed and return an Error or a Policy document.

The Custom authorizer function is passing an `event` object to API Gateway as below:
```javascript
{
  "type": "TOKEN",
  "authorizationToken": "<Incoming bearer token>",
  "methodArn": "arn:aws:execute-api:<Region id>:<Account id>:<API id>/<Stage>/<Method>/<Resource path>"
}
```
You will have to change this policy to accommodate your needs. The default reply provided, will only authorize one endpoint!

## Frontend

The frontend is a bare bones vanilla javascript implementation.

## Referece

This project is refence the [Serverless](http://serverless.com) examples in the [Github](https://github.com/serverless/examples).

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.