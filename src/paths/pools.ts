import { Router } from 'express';
import { create, del, read, readMany, update } from '../util/crud';
import Pool from '../models/Pool';
import Project from '../models/Project';
import { authenticate } from '../util/auth';
import rl from '../ratelimit';

const PoolsRouter = Router();

PoolsRouter.get('/', readMany(Pool));

PoolsRouter.get('/:id', read(Pool));

PoolsRouter.get(
    '/:id/projects',
    readMany(Project, () => true, {
        filter: (req) => ({ pool: { $eq: req.params.id } })
    })
);

PoolsRouter.use(authenticate(true));

PoolsRouter.post(
    '/',
    rl('PoolCreate', 60, 5),
    create(Pool, () => false)
);

PoolsRouter.patch(
    '/:id',
    rl('PoolChange', 60, 10),
    update(Pool, () => false)
);

PoolsRouter.delete(
    '/:id',
    rl('PoolChange', 60, 5),
    del(Pool, () => false)
);

export default PoolsRouter;
