import { Router, Request, NextFunction, Response } from 'express';
import Project from '../models/Project';
import { authenticate } from '../util/auth';
import { create, del, prefetch, read, readMany, update } from '../util/crud';
import { Types } from 'mongoose';

const ProjectsRouter = Router();

ProjectsRouter.get('/', readMany(Project));
ProjectsRouter.get('/:id', read(Project));

interface ProjectsPostRequest extends Request {
    body: Partial<{
        title: string;
        description: string;
        video_url: string;
        tldr: string;
        brief:
            | 'The Enchantress'
            | 'The Healer'
            | 'The Mediator'
            | 'The Teacher'
            | 'The Artist'
            | 'Other';
        inspiration: string;
        team: { name: string; bio?: string; email: string }[];
        collaborators?: string;
        waitlist: boolean;
        milestones: string[];
        edition_price: number;
        mint_end_date: string;
        benefits: string[];
        admin_address: string;
    }>;
}

ProjectsRouter.use(authenticate(true));

ProjectsRouter.post(
    '/',
    async (req: ProjectsPostRequest, res: Response, next: NextFunction) => {
        (req.body as Record<string, Types.ObjectId>).founder = req.user
            ?._id as Types.ObjectId;
        next();
    }
);
ProjectsRouter.post('/', create(Project));

ProjectsRouter.use(prefetch(Project));

ProjectsRouter.put(
    '/:id',
    update(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

ProjectsRouter.delete(
    '/:id',
    del(
        Project,
        (req) => req.doc?.founder.toString() === req.user?._id.toString()
    )
);

export default ProjectsRouter;
