import { Handler, NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import ImgurClient from 'imgur';

const Imgur = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID
});

export function imageUpload(
    fileField: string,
    options?: formidable.Options
): Handler;
export function imageUpload(
    fileFields: string[],
    options?: formidable.Options
): Handler;
export function imageUpload(
    fileFields: string | string[],
    options?: formidable.Options
) {
    if (typeof fileFields === 'string') fileFields = [fileFields];
    return async function (req: Request, res: Response, next: NextFunction) {
        if (req.headers['content-type']?.startsWith('multipart/form-data')) {
            const form = formidable({
                maxFileSize: 10 * 1024 * 1024,
                ...options
            });

            form.parse(req, async (err, fields, files) => {
                if (err) return res.status(400);

                // Prepare fields for the next handler
                Object.keys(fields)
                    .filter((x) => x !== 'payload_json')
                    .forEach((k) => (req.body[k] = fields[k][0]));

                if ('payload_json' in fields) {
                    let ended = false;
                    try {
                        Object.assign(
                            req.body,
                            JSON.parse(fields.payload_json[0])
                        );
                    } catch {
                        res.status(400).json({
                            message: 'Invalid `payload_json`'
                        });
                        ended = true;
                    }
                    if (ended) return;
                }

                for (const field of fileFields) {
                    const val = files[field];
                    if (Array.isArray(val)) {
                        const resp = await Imgur.upload({
                            image: createReadStream(
                                val[0]?.filepath
                            ) as unknown as ReadableStream,
                            type: 'stream'
                        });
                        req.body[field] = resp.data.link; // Prepare field for the next handler
                    }
                }
                next();
            });
        } else {
            for (const field of fileFields) delete req.body[field]; // Remove any manual links from being set (must be upload via the API to imgur)
            next();
        }
    };
}
