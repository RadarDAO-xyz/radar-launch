import { Router } from 'express';
import { read, readMany } from '../util/crud';
import Pool from '../models/Pool';
import Project from '../models/Project';

const PoolsRouter = Router();

PoolsRouter.get('/', readMany(Pool));

PoolsRouter.get('/:id', read(Pool));

PoolsRouter.get(
    '/:id/projects',
    readMany(Project, () => true, {
        filter: (req) => ({ pool: { $eq: req.params.id } })
    })
);

export default PoolsRouter;
