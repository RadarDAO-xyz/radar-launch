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
        seconds?.text(Math.floor(distance % minute) / second);

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

(async function () {
    const data = await fetch(`${API}/projects`).then((r) => r.json());

    const example = $('#all-projects-wrapper').children().hide().first();
    data.forEach((project) => {
        const curr = example.clone().show();

        curr.find('.briefs-labels').last().text(project.brief);
        startTimer(new Date(project.mint_end_date), {
            days: curr.find('.days'),
            hours: curr.find('.hours'),
            minutes: curr.find('.minutes')
        });

        curr.find('.youtube')
            .attr('data-embed', extractYoutubeId(project.video_url))
            .on('click', function () {
                var iframe = document.createElement('iframe');

                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute(
                    'src',
                    'https://www.youtube.com/embed/' +
                        this.dataset.embed +
                        '?rel=0&showinfo=0&autoplay=1'
                );

                this.innerHTML = '';
                this.appendChild(iframe);
            });

        var image = new Image();
        image.src = `https://img.youtube.com/vi/${extractYoutubeId(
            project.video_url
        )}/sddefault.jpg`;
        image.addEventListener('load', function () {
            curr.find('.youtube').append(image);
        });

        curr.find('.project-title').text(project.title);
        curr.find('.project-byline').text(project.description);
        curr.find('.amount-of-supporters')
            .first()
            .text(project.supporter_count); // Amount of supporters
        curr.find('.amount-of-supporters').last().text(project.vote_count); // Amount of upvotes
        $('#all-projects-wrapper').append(curr);
    });
})();
