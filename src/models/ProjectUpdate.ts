import { ObjectId, Schema, model } from 'mongoose';

export interface IProjectUpdate {
    project: ObjectId;
    text: string;
}

const projectUpdateSchema = new Schema<IProjectUpdate>({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    text: {
        type: String,
        required: true
    }
});

const ProjectUpdate = model<IProjectUpdate>(
    'ProjectUpdate',
    projectUpdateSchema,
    'projects.updates'
);

export default ProjectUpdate;
