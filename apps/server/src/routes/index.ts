import { Router } from 'express';
import roomRouter from './room.routes.js';

const router = Router();

router.use('/rooms', roomRouter);

export default router;
