/* eslint-disable @typescript-eslint/no-unused-vars */
const API = 'https://api.radardao.xyz/launch';

function extractYoutubeId(url) {
    let newval = '';
    if ((newval = url.match(/(\?|&)v=([^&#]+)/))) {
        return newval.pop();
    } else if ((newval = url.match(/(\.be\/)+([^/]+)/))) {
        return newval.pop();
    } else if ((newval = url.match(/(embed\/)+([^/]+)/))) {
        return newval.pop().replace('?rel=0', '');
    }
}
