import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { ProjectDocument } from '../models/Project';
import { readFileSync } from 'fs';
import path from 'path';

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'launch@radardao.xyz',
        pass: process.env.EMAIL_PASS
    }
});

const BaseEmailTemplate = readFileSync(
    path.join(__dirname, '../../templates/email.html'),
    'utf8'
);
const formatBaseEmailTemplate = ({
    header,
    body
}: {
    header: string;
    body: string;
}) => {
    return BaseEmailTemplate.replace(/\$HEADER/g, header).replace(
        /\$BODY/g,
        body
    );
};

export const EmailTemplates = {
    _base: (project: ProjectDocument): Mail.Options => {
        return {
            to: project.getEmails().join(', ')
        };
    },
    CREATED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: `Project Submitted: ${project.title}`,
            html: formatBaseEmailTemplate({
                header: `Project Submitted: ${project.title}`,
                body: `This is to notify you that your project with title <strong>"${
                    project.title
                }"</strong> has been submitted and is under review by the RADAR Team.<br />Once the project is approved you will be able to launch it.<br /><br />You can view the project page here:<a href="${project.getUrl()}">${project.getUrl()}</a>`
            })
        };
    },
    APPROVED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: `Project Approved: ${project.title}`,
            html: formatBaseEmailTemplate({
                header: `Project Approved: ${project.title}`,
                body: `This is to notify you that your project with title <strong>"${
                    project.title
                }"</strong> has been approved.<br />You can now launch the project on the website.<br /><br />You can view the project page here: <a href="${project.getUrl()}">${project.getUrl()}</a>`
            })
        };
    },
    LAUNCHED: (project: ProjectDocument): Mail.Options => {
        return {
            ...EmailTemplates._base(project),
            subject: `Project Launched: ${project.title}`,
            html: formatBaseEmailTemplate({
                header: `Project Launched: ${project.title}`,
                body: `This is to notify you that your project with title <strong>"${
                    project.title
                }"</strong> has been launched.<br />You should be able to view it on public pages!<br /><br />You can view the project page here: <a href="${project.getUrl()}">${project.getUrl()}</a>`
            })
        };
    }
};

export function sendMail(options: Mail.Options) {
    return mailTransporter.sendMail({
        from: 'RADAR Launch <launch@radardao.xyz>',
        bcc: 'admin@radardao.xyz, contact@fancyy.xyz',
        ...options
    });
}
