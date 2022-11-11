import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

// Create the Authenthication
export const getAccessToken = async () => {
  const basicAuth = Buffer.from(
    `${process.env.oAuth2ClientId}:${process.env.oAuth2ClientSecret}`
  ).toString('base64');

  const fetchAccessToken = await fetch(process.env.redditAccessUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: `${process.env.redditUsername}`,
      password: `${process.env.redditPassword}`,
    }),
  });
  const accessToken = await fetchAccessToken.json();
  return accessToken;
};

// Get data from landing page
export const getFirstPage = async (access_token, token_type) => {
  const fetchUpvotedPage = await fetch(
    `https://oauth.reddit.com/user/${process.env.redditUsername}/upvoted`,
    {
      method: 'GET',
      headers: {
        Authorization: `${token_type} ${access_token}`,
        'User-Agent': 'ChangeMeClient/0.1 by YourUsername',
      },
    }
  );
  const landingPage = fetchUpvotedPage.json();
  return landingPage;
};

export const getRestOfPagesPosts = async (
  access_token,
  token_type,
  currentPage,
  currentPostsArray
) => {
  const newPostsArray = currentPostsArray;
  if (currentPage == null) {
    return newPostsArray;
  } else {
    console.log(currentPage);
    const nextPagesResponse = await fetch(
      `https://oauth.reddit.com/user/${process.env.redditUsername}/upvoted/?count=100&after=${currentPage}`,
      {
        method: 'GET',
        headers: {
          Authorization: `${token_type} ${access_token}`,
          'User-Agent': 'ChangeMeClient/0.1 by YourUsername',
        },
      }
    );
    const { data } = await nextPagesResponse.json();
    // New pageId
    const { after, children } = data;

    children.map((child) => {
      const { title, subreddit_name_prefixed, url_overridden_by_dest, url } =
        child.data;
      newPostsArray.push({
        subreddit_name_prefixed,
        title,
        url,
        url_overridden_by_dest,
      });
    });

    return getRestOfPagesPosts(access_token, token_type, after, newPostsArray);
  }
};

// Get posts from first page
export const getFirstPagePost = async (children) => {
  let postArray = [];
  children.map((child) => {
    const { title, subreddit_name_prefixed, url_overridden_by_dest, url } =
      child.data;
    postArray.push({
      subreddit_name_prefixed,
      title,
      url,
      url_overridden_by_dest,
    });
  });
  return postArray;
};

// Save to Obj
export const saveArray = (savedPosts) => {
  fs.writeFile(
    'posts.json',
    JSON.stringify(savedPosts, null, 2),
    'utf-8',
    (err) => {
      if (err) throw err;
    }
  );
};

const readAllPosts = () => {
  const posts = fs.readFileSync('posts.json', 'utf-8');
  return JSON.parse(posts);
};

// https://stackoverflow.com/a/19270021/19091959
const shuffleArray = (postsArray, numOfPosts) => {
  let result = new Array(numOfPosts),
    len = postsArray.length,
    taken = new Array(len);
  if (numOfPosts > len)
    throw new RangeError('shuffleArray: more elements taken than available');
  while (numOfPosts--) {
    var x = Math.floor(Math.random() * len);
    result[numOfPosts] = postsArray[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
};

// Send to Discord
export const sendToDiscord = async (amountOfPosts) => {
  // Read all entries
  const entries = readAllPosts();
  // Randomise the amountOfPosts
  const arrayToPost = shuffleArray(entries, amountOfPosts);
  // send each
  arrayToPost.map(async (post, index) => {
    // 5 second delay on each post.
    setTimeout(() => {
      const { url, title, subreddit_name_prefixed, url_overridden_by_dest } =
        post;

      const postData = {
        content: `${url}`,
        username: `${title} from ${subreddit_name_prefixed}`,
        avatar_url: `${url_overridden_by_dest}`,
      };

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      };

      fetch(process.env.discordWebhook, options);
    }, 5000 * index);
  });
};
