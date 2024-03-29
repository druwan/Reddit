import {
  getAccessToken,
  getFirstPagePost,
  getFirstUpvotedPage,
  getPages,
  getRestOfUpvotedPagesPosts,
  saveArray,
  sendToDiscord,
} from './functions/helperFunctions.js';
import PromptSync from 'prompt-sync';

// Make selection
const prompt = PromptSync();
console.log(
  '\n1. Discord\n2. Upvoted\n3. Hot\n4. Top\n5. Best\n6. New\n7. Quit'
);
let option = prompt();
// Get Access Token
const { access_token, token_type } = await getAccessToken();

while (option != undefined) {
  if (option == 1) {
    // Send to Discord
    await sendToDiscord();
    option = undefined;
  } else if (option == 2) {
    // Access user landingPage
    const { data } = await getFirstUpvotedPage(access_token, token_type);
    // Includes the id of 2nd page and first 100 posts
    const { after, children } = data;
    // Get first page post, -> [posts]
    const firstPagesPosts = await getFirstPagePost(children);
    // Get next page post and id of next page -> recursion :)
    const restOfPagesPosts = await getRestOfUpvotedPagesPosts(
      access_token,
      token_type,
      after,
      firstPagesPosts
    );
    // Saves to JSON file
    saveArray(restOfPagesPosts);
    option = undefined;
  } else if (option == 3) {
    const { data } = await getPages(access_token, token_type, 'hot');
    const { children } = data;
    const hotPages = await getFirstPagePost(children);
    await saveArray(hotPages);
    option = undefined;
  } else if (option == 4) {
    const { data } = await getPages(access_token, token_type, 'top');
    const { children } = data;
    const topPages = await getFirstPagePost(children);
    await saveArray(topPages);
    option = undefined;
  } else if (option == 5) {
    const { data } = await getPages(access_token, token_type, 'best');
    const { children } = data;
    const frontPage = await getFirstPagePost(children);
    await saveArray(frontPage);
    option = undefined;
  } else if (option == 6) {
    const { data } = await getPages(access_token, token_type, 'new');
    const { children } = data;
    const newPage = await getFirstPagePost(children);
    await saveArray(newPage);
    option = undefined;
  } else if (option == 7) {
    option = undefined;
  }
}
