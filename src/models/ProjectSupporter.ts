import { NextFunction, Request, Response } from 'express';
import { Model, ObjectId, Schema, model } from 'mongoose';

export enum ProjectSupporterType {
    Signup,
    Contribution,
    Believer
}

export interface IProjectSupporter {
    project: ObjectId;
    type: ProjectSupporterType;
    email: string;
    social: this['type'] extends 1 ? string : undefined;
    skillset: this['type'] extends 1 ? string : undefined;
    contribution: this['type'] extends 1 ? string : undefined;
    signatureHash: this['type'] extends 2 ? string : undefined;
    signedMessage: this['type'] extends 2 ? string : undefined;
    signingAddress: this['type'] extends 2 ? string : undefined;
}

type ErrorHandlerFunction = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => void;

interface ProjectSupporterModel extends Model<IProjectSupporter> {
    handlers: {
        11000: ErrorHandlerFunction;
    };
}

const projectSupporterSchema = new Schema<
    IProjectSupporter,
    ProjectSupporterModel
>(
    {
        project: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Project'
        },
        type: {
            type: Number,
            required: true,
            enum: [0, 1]
        },
        email: {
            type: String,
            required: true
        },
        social: {
            type: String,
            required: function () {
                return (this as unknown as IProjectSupporter).type === 1;
            },
            validate: function () {
                return (this as unknown as IProjectSupporter).type !== 0;
            }
        },
        skillset: {
            type: String,
            required: function () {
                return (this as unknown as IProjectSupporter).type === 1;
            },
            validate: function () {
                return (this as unknown as IProjectSupporter).type !== 0;
            }
        },
        contribution: {
            type: String,
            required: function () {
                return (this as unknown as IProjectSupporter).type === 1;
            },
            validate: function () {
                return (this as unknown as IProjectSupporter).type !== 0;
            }
        },
        signatureHash: {
            type: String,
            required: function () {
                return (this as unknown as IProjectSupporter).type === 2;
            },
            validate: function () {
                return (this as unknown as IProjectSupporter).type === 2;
            }
        },
        signedMessage: {
            type: String,
            required: function () {
                return (this as unknown as IProjectSupporter).type === 2;
            },
            validate: function () {
                return (this as unknown as IProjectSupporter).type === 2;
            }
        },
        signingAddress: {
            type: String,
            validate: function () {
                return (this as unknown as IProjectSupporter).type === 2;
            }
        }
    },
    { timestamps: true }
);

projectSupporterSchema.index({ type: 1, email: 1 }, { unique: true });

const ProjectSupporter = model<IProjectSupporter, ProjectSupporterModel>(
    'ProjectSupporter',
    projectSupporterSchema,
    'projects.supporters'
);

ProjectSupporter.handlers = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    11000: function (err: any, req, res) {
        if (err.keyPattern.type === 1 && err.keyPattern.email === 1) {
            // Matches { type: 1, email: 1 } index
            res.json({
                message:
                    'You have already signed up as a ' +
                    (err.keyValue.type === 0 ? 'signatory' : 'contributor')
            });
        }
    }
};

export default ProjectSupporter;
