import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ProjectDocument } from '../models/Project';

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'launch@radardao.xyz',
        pass: process.env.EMAIL_PASS
    }
});

export const EmailTemplates = {
    _base: (project: ProjectDocument): Mail.Options => {
        return {
            to: project.getEmails().join(', ')
        };
    },
    CREATED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: 'Your project has been submitted',
            text: `Your project ${project.title} has been submitted and is under approval by RADAR`
        };
    },
    APPROVED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: 'Your project has been approved',
            text: `Your project ${project.title} has been approved and is ready to be published and go live`
        };
    },
    LAUNCHED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: 'Your project has been launched',
            text: `Your project ${
                project.title
            } has been launched you can view it at ${project.getUrl()}`
        };
    }
};

export function sendMail(options: Mail.Options) {
    return mailTransporter.sendMail({
        from: 'RADAR Launch <launch@radardao.xyz>',
        ...options
    });
}
