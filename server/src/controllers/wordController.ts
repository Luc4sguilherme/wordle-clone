import { Request, Response } from 'express';

import logger from '~/src/logger';

import { word } from '../job';

export async function index(req: Request, res: Response) {
  try {
    res.json(word);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error);
      res.status(500).send(error.message);
    }
  }
}
