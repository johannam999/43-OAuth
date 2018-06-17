import express from 'express';
import superagent from 'superagent';

const app = express();

require('dotenv').config();
const GOOGLE_OAUTH_URL = '';
const OPEN_ID_URL = '';

app.get('/oauth/google', (request, response) => {
  if (!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    console.log('__CODE__ STEP 3.1', request.query.code);
    
    console.log('__CODE__ STEP 3.2 SENDING THE CODE BACK__')
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google` // we specify where we want token to go so google would send it there
      })
      .then(tokenResponse => {
     
        console.log('__STEP 3.3 - ACCESS TOKEN__');
        if(!tokenResponse.body.access_token) { // in case we didn't pass verification
          response.redirect(process.env.CLIENT_URL);
        }
        const accessToken = tokenResponse.body.access_token;
       
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
      .then(openIDResponse => {
        console.log('__STEP 4 - OPEN ID __')
          console.log(openIDResponse.body);
          
        response.cookie('_TOKEN')
        response.redirect(process.env.CLIENT_URL);
      })
      .catch(error => {
        console.log(error);
        response.redirect(process.env.CLIENT_URL + '?error=oauth'); // we should always redirect user to their page
      });
  }
});

app.listen(process.env.PORT, () => {
  console.log('__SERVER IS UP__ PORT', process.env.PORT);
});