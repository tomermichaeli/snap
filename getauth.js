const TwitterLite = require('twitter-lite');
const client = new TwitterLite({
    consumer_key: 'JLTB6tEvrqU24szKl7qAKg5uc',
    consumer_secret: 'rD0ytEfp0Ig1tu68r5P1XpwYBEYmROV7FkOJEbwap1eYdo5Scr'
  });
  
  const getRequestToken = async () => {
    try {
      const response = await client.getRequestToken('http://localhost:3000/callback/twitter');
      const oauthRequestUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${response.oauth_token}`;
      console.log('OAuth request URL:', oauthRequestUrl);
    } catch (error) {
      console.error('Error getting OAuth request token:', error);
    }
  };
  
  getRequestToken();
  

  const getAccessToken = async (oauthToken, oauthVerifier) => {
    try {
      const response = await client.getAccessToken({
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      });
      const accessToken = response.oauth_token;
      const accessTokenSecret = response.oauth_token_secret;
      console.log('Access Token:', accessToken);
      console.log('Access Token Secret:', accessTokenSecret);
      // You can now use the accessToken and accessTokenSecret to access the user's Twitter account.
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };
  
  // Extract the OAuth token and verifier from the callback URL
  const oauthToken = 'bEyJoAAAAAABDSR2AAABiA_MBbk'; // Replace with the extracted value
  const oauthVerifier = '2o60rrIHsfoD0bx8KYvKhwT9bEh3bRJO'; // Replace with the extracted value
  
  // Call the getAccessToken function
  getAccessToken(oauthToken, oauthVerifier);
  


//   http://localhost:3000/callback/twitter?oauth_token=bEyJoAAAAAABDSR2AAABiA_MBbk&oauth_verifier=2o60rrIHsfoD0bx8KYvKhwT9bEh3bRJO