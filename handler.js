// Set in `environment` of serverless.yml
const AUTH_URL = process.env.AUTH_URL;
const AUTH_ID = process.env.AUTH_ID;
const AUTH_KEY = process.env.AUTH_KEY;

const AuthenticationClient = require('authing-js-sdk').AuthenticationClient;

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {

  const authenticationClient = new AuthenticationClient({
    appId: AUTH_ID,
    appHost: AUTH_URL,
    secret: AUTH_KEY,
  });

  console.log('event', event);
  if (!event.authorizationToken) {
    return callback('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }

  (async() => {
    let res = await authenticationClient.validateTokenLocally(tokenValue);

    if (res.code && res.code==="400") {
      console.log('verifyError', res.message);
      return callback('Unauthorized');
    } else {
      console.log('valid from customAuthorizer', res);
      return callback(null, generatePolicy(res.sub, 'Allow', event.methodArn));
    }

  })();

};

// Public API
module.exports.publicEndpoint = (event, context, callback) => callback(null, {
  statusCode: 200,
  headers: {
    /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
    /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Public API',
  }),
});

// Private API
module.exports.privateEndpoint = (event, context, callback) => callback(null, {
  statusCode: 200,
  headers: {
    /* Required for CORS support to work */
    'Access-Control-Allow-Origin': '*',
    /* Required for cookies, authorization headers with HTTPS */
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify({
    message: 'Hi ⊂◉‿◉つ from Private API. Only logged in users can see this',
  }),
});