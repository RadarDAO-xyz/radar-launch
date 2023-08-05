export const YOUTUBE_REGEX = /(?<=\d\/|\.be\/|v[=/])([\w-]{11,})|^([\w-]{11})$/;
export const VIMEO_REGEX =
    /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_-]+)?/i;

export function retrieveYoutubeId(url: string) {
    const match = YOUTUBE_REGEX.exec(url);
    if (match !== null) {
        return match[1];
    }
    return '';
}
export function retrieveVimeoId(videoUrl: string) {
    const match = VIMEO_REGEX.exec(videoUrl);
    if (match !== null) {
        return match[0];
    }
    return '';
}
export function retrieveVideoThumbnail(videoUrl: string) {
    if (YOUTUBE_REGEX.exec(videoUrl) !== null) {
        return `https://img.youtube.com/vi/${retrieveYoutubeId(
            videoUrl
        )}/0.jpg`;
    }
    if (VIMEO_REGEX.exec(videoUrl) !== null) {
        return `https://vumbnail.com/${retrieveVimeoId(videoUrl)}.jpg`;
    }
    return videoUrl;
}
