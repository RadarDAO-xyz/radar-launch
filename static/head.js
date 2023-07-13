/* eslint-disable @typescript-eslint/no-unused-vars */
const API = 'https://api.radardao.xyz/launch';

tinymce.on('addeditor', function (event) {
    var editor = event.editor;
    var $textarea = $('#' + editor.id);
    const val = $textarea.val();
    if (val.length > 0) editor.on('init', () => editor.setContent(val));
});

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

let cached_user = JSON.parse(localStorage.getItem('cached_user') || 'null');
let cached_user_expiry = JSON.parse(
    localStorage.getItem('cached_user_expiry') || '0'
);
const clearUserCache = () => {
    localStorage.removeItem('cached_user');
    localStorage.removeItem('cached_user_expiry');
    cached_user = null;
    cached_user_expiry = 0;
};

const isLoggedIn = () => document.cookie.includes('session=');
async function fetchSelf() {
    if (!isLoggedIn()) return null;
    if (cached_user && cached_user_expiry > Date.now()) return cached_user;
    cached_user = await fetch(`${API}/users/@me`, { credentials: 'include' })
        .then((r) => {
            if (!r.ok) throw r.statusText;
            else return r;
        })
        .then((r) => r.json());
    cached_user.profile = `${API}/users/${cached_user._id}/profile`;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 20);
    cached_user_expiry = expiry.getTime();
    localStorage.setItem('cached_user', JSON.stringify(cached_user));
    localStorage.setItem(
        'cached_user_expiry',
        JSON.stringify(cached_user_expiry)
    );
    return cached_user;
}

function logout() {
    localStorage.removeItem('cached_user');
    localStorage.removeItem('cached_user_expiry');
    document.cookie = '';
}

function startTimer(date, { days, hours, minutes, seconds }) {
    // Countdown Timer by Flowbase
    // Set the target date and time
    let target_date = date.getTime();

    // Update the countdown timer every second
    let countdown_timer = setInterval(function () {
        // Get the current date and time
        let current_date = new Date().getTime();

        // Calculate the remaining time in milliseconds
        let distance = target_date - current_date;

        // Calculate the remaining days, hours, minutes, and seconds
        let day = 1000 * 60 * 60 * 24;
        let hour = 1000 * 60 * 60;
        let minute = 1000 * 60;
        let second = 1000;

        // Add the ID to your HTML/Webflow text elements
        days?.text(Math.floor(distance / day));
        hours?.text(Math.floor((distance % day) / hour));
        minutes?.text(Math.floor((distance % hour) / minute));
        seconds?.text(Math.floor((distance % minute) / second));

        // Check if the countdown is complete
        if (distance <= 0) {
            clearInterval(countdown_timer);
            days?.text(0);
            hours?.text(0);
            minutes?.text(0);
            seconds?.text(0);
        }
    }, 1000);
}
