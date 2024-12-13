import { Router, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const router = Router();

const TWITTER_API_URL = 'https://api.twitter.com/2';
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error('Error: TWITTER_BEARER_TOKEN is not defined in .env file');
  process.exit(1);
}

// Route to fetch tweets
router.get('/', async (req: Request, res: Response): Promise<any> => {
  const { query, start_time, max_results = 50 } = req.query;
  // return res.status(400).json({ error: query });
  console.log(query);
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    // Prepare query parameters
    const queryParams = new URLSearchParams({
      query: String(query),
      max_results: String(max_results),
      sort_order: 'recency',
      expansions: 'author_id',
      'user.fields': 'username,name,profile_image_url',
      'tweet.fields': 'public_metrics,created_at',
    });
    if (start_time) {
      queryParams.append('start_time', String(start_time));
    }

    // Fetch recent tweets
    const { data: tweetData } = await axios.get(
      `${TWITTER_API_URL}/tweets/search/recent?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      }
    );

    console.log('==tweet data', tweetData);

    // Fetch author details for each tweet
    const tweetsWithUsernames = await Promise.all(
      tweetData.data.map(async (tweet: any) => {
        try {
          const { data: userData } = await axios.get(
            `${TWITTER_API_URL}/users/${tweet.author_id}`,
            {
              headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
            }
          );
          const username = userData.data.username;
          const tweetUrl = `https://twitter.com/${username}/status/${tweet.id}`;
          const userUrl = `https://twitter.com/${username}`;

          return {
            ...tweet,
            username,
            tweetUrl,
            userUrl
          };
        } catch (error: any) {
          console.error(
            `Error fetching user data for tweet ${tweet.id}:`,
            error.message
          );
          return tweet; // Return tweet as is if user data fetching fails
        }
      })
    );

    res.status(200).json(tweetsWithUsernames);
  } catch (error: any) {
    console.error(
      'Error fetching tweets:',
      error.response?.data || error.message
    );
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

export default router;
