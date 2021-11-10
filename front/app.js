//New modify for your Severless output

const PUBLIC_ENDPOINT = 'http://localhost:3000/dev/api/public';
const PRIVATE_ENDPOINT = 'http://localhost:3000/dev/api/private';
const AUTH_ID = 'AUTH_IDxxxx';
const AUTH_URL = 'AUTH_URLxxxx';
const AUTH_KEY = 'AUTH_KEYxxxx';
const AUTH_REDIRECT = 'http://localhost:8000';
// const AUTH_ID = '6181e88b3925c086f1ef1d8c';
// const AUTH_URL = 'https://cellosqure-demo.authing.cn';
// const AUTH_KEY = 'da377fd6a35e82d17cebe53f77c7c145';

function getAuthClient(tokenEndPointAuthMethod) {
  if (tokenEndPointAuthMethod){
    return authenticationClient = new Authing.AuthenticationClient({
      appId: AUTH_ID,
      secret: AUTH_KEY,
      appHost: AUTH_URL,
      redirectUri: AUTH_REDIRECT,
      tokenEndPointAuthMethod: 'none'
    });

  } else {
    return authenticationClient = new Authing.AuthenticationClient({
      appId: AUTH_ID,
      secret: AUTH_KEY,
      appHost: AUTH_URL,
      redirectUri: AUTH_REDIRECT,
    });
  }
  
}

const JWS = KJUR.jws.JWS;
const queryString = window.location.search;
let id_token = localStorage.getItem('id_token');
let access_token = localStorage.getItem('accessToken');
let profile = localStorage.getItem('profile');

if (id_token && access_token && profile){
  const authenticated = JWS.verifyJWT(id_token, {utf8: AUTH_KEY}, {alg: ["HS256"]});
  if (!authenticated) {
    auth = {}
    auth.authenticated = false;
    alert('ID Token is not valid! Login again!');
    updateUI(auth);
  } else {
    auth = JWS.parse(id_token).payloadObj;
    auth.authenticated = true;
    auth.access_token = access_token;
    auth.profile = profile;
    auth.id_token = id_token;
    updateUI(auth)
  }

} else {
  (async() => {
    if (queryString){
      const urlParams = new URLSearchParams(queryString);
      if (urlParams.get('code')){
        const authenticationClient = getAuthClient('none');
        let res = await authenticationClient.getAccessTokenByCode(urlParams.get('code'));
        if (res.access_token && res.id_token) {
          const authenticationClient = getAuthClient();
          const authenticated = JWS.verifyJWT(res.id_token, {utf8: AUTH_KEY}, {alg: ["HS256"]});

          if (authenticated)
            try {
              auth = JWS.parse(res.id_token).payloadObj;
              res.authenticated = true;
              res.email = auth.email;
              updateUI(res);
            } catch(error) {
              alert('Token parse error! Login again!');
              res.authenticated = false;
            }
        } else {
          alert('Callback code is not valid!');
        }
      } else {
        alert('Callback code is missing from params! Login again!');
      }
    }
  })();
}

function updateUI(data) {

  if (data.authenticated) {
    // swap buttons
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'inline';
    // show username
    document.getElementById('nick').textContent = data.email;
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('id_token', data.id_token);
    localStorage.setItem('profile', data.scope);
  } else {
    document.getElementById('btn-login').style.display = 'flex';
    document.getElementById('btn-logout').style.display = 'none';
    document.getElementById('nick').textContent = '';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
  }
}

// Handle login
document.getElementById('btn-login').addEventListener('click', () => {
  direct_login();
});

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  document.getElementById('btn-login').style.display = 'flex';
  document.getElementById('btn-logout').style.display = 'none';
  document.getElementById('nick').textContent = '';
  localStorage.removeItem('accessToken');
  localStorage.removeItem('id_token');
  localStorage.removeItem('profile');
  const authenticationClient = getAuthClient();
  let url = authenticationClient.buildLogoutUrl({ redirectUri: AUTH_REDIRECT });
  window.location.href = url;

});

// Handle public api call
document.getElementById('btn-public').addEventListener('click', () => {
  // call public API
  fetch(PUBLIC_ENDPOINT, {
      cache: 'no-store',
      method: 'POST',
    })
    .then(response => response.json())
    .then((data) => {
      console.log('Message:', data);
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    })
    .catch((e) => {
      console.log('error', e);
    });
});

// Handle private api call
document.getElementById('btn-private').addEventListener('click', () => {
  // Call private API with JWT in header

  let id_token = localStorage.getItem('id_token');
  if (id_token){

    const authenticated = JWS.verifyJWT(id_token, {utf8: AUTH_KEY}, {alg: ["HS256"]});
    if (authenticated) {
        fetch(PRIVATE_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        })
        .then(response => response.json())
        .then((data) => {
          console.log('Message:', data);
          document.getElementById('message').textContent = '';
          document.getElementById('message').textContent = data.message;
        })
        .catch((e) => {
          console.log('error', e);
          alert('The API Gateway return errors!!')
        }); 

    } else {
      alert('ID token is not Valid, please login first!');
      direct_login();
    }

  } else {
    alert('You must login first!');
    document.getElementById('message').textContent = '';
    auth = {}
    auth.authenticated = false;
    updateUI(auth);
  }
  

});

function direct_login() {
  const authenticationClient = getAuthClient();
  let url = authenticationClient.buildAuthorizeUrl({ scope: 'openid profile email' });
  window.location.href = url;
}