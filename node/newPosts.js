import {
  getAccessToken,
  getFirstPagePost,
  getPages,
  saveArray,
  sendToDiscord,
} from './functions/helperFunctions.js';

// Get Access Token
const { access_token, token_type } = await getAccessToken();
const { data } = await getPages(access_token, token_type, 'new');
const { children } = data;
const frontPage = await getFirstPagePost(children);
await saveArray(frontPage);

// Stupid workaround :D
setTimeout(() => {
  sendToDiscord();
}, 2500);
