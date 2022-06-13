import express from 'express';

import * as wordController from '@src/controllers/wordController';

const router = express.Router();

router.get('/', wordController.index);

export { router };
