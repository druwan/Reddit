import {
  getAccessToken,
  getFirstPage,
  getFirstPagePost,
  getRestOfPagesPosts,
  saveArray,
  sendToDiscord,
} from './functions/helperFunctions.js';
import PromptSync from 'prompt-sync';

// Make selection
const prompt = PromptSync();
console.log('1. Update List\n2. Send to Discord\n3. Quit');
let option = prompt();

while (option != undefined) {
  if (option == 1) {
    // Get Access Token
    const { access_token, token_type } = await getAccessToken();
    // Access user landingPage
    const { data } = await getFirstPage(access_token, token_type);
    // Includes the id of 2nd page and first 100 posts
    const { after, children } = data;
    // Get first page post, -> [posts]
    const firstPagesPosts = await getFirstPagePost(children);
    // Get next page post and id of next page -> recursion :)
    const restOfPagesPosts = await getRestOfPagesPosts(
      access_token,
      token_type,
      after,
      firstPagesPosts
    );
    // Saves to JSON file
    saveArray(restOfPagesPosts);
    option = undefined;
  } else if (option == 2) {
    const amountOfPosts = prompt('How many posts? ');
    await sendToDiscord(amountOfPosts);
    option = undefined;
  } else if (option == 3) {
    option = undefined;
  }
}
