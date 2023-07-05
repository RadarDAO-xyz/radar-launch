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
