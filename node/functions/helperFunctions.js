import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import PromptSync from 'prompt-sync';

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
export const getFrontPage = async (access_token, token_type) => {
  const fetchUpvotedPage = await fetch(`https://oauth.reddit.com/best`, {
    method: 'GET',
    headers: {
      Authorization: `${token_type} ${access_token}`,
      'User-Agent': 'ChangeMeClient/0.1 by YourUsername',
    },
  });
  return fetchUpvotedPage.json();
};

// Get data from Hot page
export const getPagesHot = async (access_token, token_type) => {
  const fetchHotPage = await fetch('https://oauth.reddit.com/hot/', {
    method: 'GET',
    headers: {
      Authorization: `${token_type} ${access_token}`,
      'User-Agent': 'ChangeMeClient/0.1 by YourUsername',
    },
  });
  return fetchHotPage.json();
};

// Get data from Top page
export const getPagesTop = async (access_token, token_type) => {
  const fetchTopPage = await fetch('https://oauth.reddit.com/top/', {
    method: 'GET',
    headers: {
      Authorization: `${token_type} ${access_token}`,
      'User-Agent': 'ChangeMeClient/0.1 by YourUsername',
    },
  });
  return fetchTopPage.json();
};

// Get data from first upvoted page
export const getFirstUpvotedPage = async (access_token, token_type) => {
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
  console.log('Fetched first page of upvoted posts');
  return fetchUpvotedPage.json();
};

export const getRestOfUpvotedPagesPosts = async (
  access_token,
  token_type,
  currentPage,
  currentPostsArray
) => {
  const newPostsArray = currentPostsArray;
  if (currentPage == null) {
    console.log('Done fetching upvoted posts');
    return newPostsArray;
  } else {
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
      const {
        permalink,
        title,
        subreddit_name_prefixed,
        url_overridden_by_dest,
        url,
      } = child.data;
      newPostsArray.push({
        permalink,
        subreddit_name_prefixed,
        title,
        url,
        url_overridden_by_dest,
      });
    });

    return getRestOfUpvotedPagesPosts(
      access_token,
      token_type,
      after,
      newPostsArray
    );
  }
};

// Get posts from first page
export const getFirstPagePost = async (children) => {
  let postArray = [];
  children.map((child) => {
    const {
      permalink,
      title,
      subreddit_name_prefixed,
      url_overridden_by_dest,
      url,
    } = child.data;
    postArray.push({
      permalink,
      subreddit_name_prefixed,
      title,
      url,
      url_overridden_by_dest,
    });
  });
  return postArray;
};

// Save to Obj
export const saveArray = async (savedPosts) => {
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
  if (posts.length == 0) return 'No posts could be read.';
  return JSON.parse(posts);
};

// https://stackoverflow.com/a/19270021/19091959
// const shuffleArray = (postsArray, numOfPosts) => {
//   let result = new Array(numOfPosts),
//     len = postsArray.length,
//     taken = new Array(len);
//   if (numOfPosts > len)
//     throw new RangeError('shuffleArray: more elements taken than available');
//   while (numOfPosts--) {
//     var x = Math.floor(Math.random() * len);
//     result[numOfPosts] = postsArray[x in taken ? taken[x] : x];
//     taken[x] = --len in taken ? taken[len] : len;
//   }
//   return result;
// };

// Send to Discord
export const sendToDiscord = async () => {
  const prompt = PromptSync();
  let amountOfPosts;
  // Read all entries
  const entries = readAllPosts();
  if (entries.length > 100) {
    amountOfPosts = prompt('How many posts would you like to send? ');
  } else {
    amountOfPosts = entries.length;
  }
  // Randomise the amountOfPosts
  // const arrayToPost = shuffleArray(entries, amountOfPosts);
  const arrayToPost = entries;
  // send each
  arrayToPost.map(async (post, index) => {
    // 5 second delay on each post.
    setTimeout(() => {
      const {
        permalink,
        title,
        subreddit_name_prefixed,
        url,
        url_overridden_by_dest,
      } = post;

      const postData = {
        embeds: [
          {
            author: {
              name: `${title}`,
              url: `https://reddit.com${permalink}`,
            },
            title: `${title}`,
            url: `${url}`,
            image: { url: `${url}` },
          },
        ],
        username: `${subreddit_name_prefixed}`,
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
