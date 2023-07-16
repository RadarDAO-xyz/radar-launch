(async function () {
    try {
        const id = new URL(location.href).searchParams.get('id');

        $('html').hide();
        const project = id
            ? await fetch(`${API}/projects/${id}`).then((r) => r.json())
            : undefined;

        if (!project) throw project;
        formatProjectToPage(project);

        const founder = await fetch(`${API}/users/${project.founder}`).then(
            (r) => r.json()
        );
        if (!founder) throw founder;
        formatFounderToPage(founder);
        $('html').show();

        clearProjectUpdates();
        const projectUpdates = await fetch(
            `${API}/projects/${id}/updates`
        ).then((r) => r.json());
        formatProjectUpdatesToPage(projectUpdates || []);
    } catch (e) {
        $('html').show();
        console.error(e);
        $('#project-title').text('Invalid Project ID/Project not found');
    }

    function formatDate(date) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
            .getDate()
            .toString()
            .padStart(2, '0')}.${date.getFullYear().toString().substring(2)}`;
    }

    function formatProjectToPage(project) {
        $('#project-title').text(project.title);
        $('#project-byline').text(project.description);
        $('#project-brief').text(project.brief);

        $('.small-text.center').html(
            '<span id="days"></span>d&nbsp<span id="hrs"></span>h&nbsp<span id="mins"></span>m&nbsp<span id="secs"></span>s&nbsp•&nbsp<span id="supporter-count"></span>&nbspcollected'
        );
        startTimer(new Date(project.mint_end_date), {
            days: $('#days'),
            hours: $('#hrs'),
            minutes: $('#mins'),
            seconds: $('#secs')
        });

        const youtubeId = extractYoutubeId(project.video_url);
        $('iframe.embedly-embed').attr(
            'src',
            `https://cdn.embedly.com/widgets/media.html?src=https://www.youtube.com/embed/${youtubeId}?feature=oembed&display_name=YouTube&url=https://www.youtube.com/watch?v=${youtubeId}&image=https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg&key=c4e54deccf4d4ec997a64902e9a30300&type=text/html&schema=youtube`
        );

        $('#supporter-count').text(project.supporter_count);
        $('#vote-count').text(project.vote_count);

        $('#project-tldr').html(project.tldr);
        $('#project-team').html(
            project.team
                .map(
                    (x) =>
                        `<strong>${x.name}</strong> • ${x.email}<br />${x.bio}`
                )
                .join('<br />-----------------<br /><br />')
        );
        $('#project-collaborators').html(project.collaborators);

        $('#project-funding')
            .children('.funding-milestones-stack-2')
            .slice(project.milestones.length)
            .remove();

        project.milestones.forEach((m, i) => {
            const curr = $(
                $('#project-funding').children('.funding-milestones-stack-2')[i]
            );
            curr.find('.funding-goal-amount').text(m.amount);
            curr.find('.milestones').html(m.text);
        });

        $('#benefits-wrapper')
            .children('.benefits-div')
            .slice(project.benefits.length)
            .remove();

        project.benefits.forEach((b, i) => {
            const curr = $($('#benefits-wrapper').children('.benefits-div')[i]);
            curr.find('.body-text-5').text(b.amount);
            curr.find('.benefits-list-text').html(b.text);
        });
    }
    function formatFounderToPage(founder) {
        $('#founder-name')
            .text(founder.name)
            .attr('href', `/founder-profile?id=${founder._id}`);
        $('#founder-eth').text(founder.wallet_address);
        $('#founder-image')
            .attr('src', `${API}/users/${founder._id}/profile`)
            .removeAttr('srcset');
    }
    function clearProjectUpdates() {
        $('#project-updates-wrapper').children().remove();
    }
    function formatProjectUpdatesToPage(projectUpdates) {
        projectUpdates.forEach((u) => {
            $(
                `<div class="update-div-2"><p class="project-updates-text">${
                    u.text
                }</p><p class="editions-page-small-text">${formatDate(
                    new Date(u.createdAt)
                )}</p></div>`
            ).appendTo($('#project-updates-wrapper'));
        });
    }
})();
