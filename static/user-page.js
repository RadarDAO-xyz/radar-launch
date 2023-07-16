(async function () {
    const id = new URL(location).searchParams.get('id');
    const user = id
        ? await fetch(`${API}/users/${id}`).then((r) => r.json())
        : {
              name: 'Invalid User ID/User not found'
          };
    $('#founder-name').text(user.name);
    $('#founder-bio').html(user.bio);
    $('#founder-profile')
        .attr('src', `${API}/users/${user._id}/profile`)
        .removeAttr('srcset');
})();
(async function () {
    const id = new URL(location).searchParams.get('id');

    $('#created-wrapper').children().not(':first').remove();
    const example = $('#created-wrapper').children().first().hide();
    const userProjects = await fetch(`${API}/users/${id}/projects`).then((r) =>
        r.json()
    );
    userProjects.forEach((project) => {
        const curr = example.clone().show();

        curr.find('.briefs-labels').last().text(project.brief);
        curr.find('.project-title').text(project.title);
        curr.find('.project-byline').text(project.description);
        curr.find('.amount-of-supporters').text(project.supporter_count);

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

        curr.appendTo($('#created-wrapper'));
    });
})();
