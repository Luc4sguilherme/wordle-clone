import axios from 'axios';
import { CronJob } from 'cron';

import config from '~/config';
import logger from '~/src/logger';

export let word = 'WORDLE';

const options = {
  method: 'GET',
  url: 'https://random-words5.p.rapidapi.com/getRandom',
  params: { wordLength: '5' },
  headers: {
    'X-RapidAPI-Host': config.App.rapidApi.host,
    'X-RapidAPI-Key': config.App.rapidApi.key,
  },
};

export const job = new CronJob('00 00 00 * * *', async () => {
  try {
    logger.info('running job');

    const response = await axios.request(options);
    const { data } = response;

    word = data;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }

    job.stop();
  }
});
