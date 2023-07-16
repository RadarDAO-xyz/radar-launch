(async function () {
    const updatePage = `/founder-edit-project-page-copy`;
    const me = await fetchSelf();

    $('#founder-name').text(me.name);
    $('#founder-eth').text(me.wallet_address);
    $('#founder-profile').attr('src', me.profile).removeAttr('srcset');

    async function loadProjects() {
        const projects = await fetch(`${API}/users/${me._id}/projects`).then(
            (r) => r.json()
        );

        $('#active-visions-wrapper')
            .add('#inactive-visions-wrapper')
            .children()
            .hide();

        const example = $('#active-visions-wrapper')
            .add('#inactive-visions-wrapper')
            .children()
            .first();

        // Status enum to class name map
        const statusDivCorresps = {
            0: 'in-review',
            1: 'approved',
            2: 'review',
            3: 'building',
            4: 'rejected',
            5: 'cancelled'
        };

        const buttonsDivCorresps = {
            0: 'in-review-admin-buttons',
            1: 'approve-buttons',
            2: 'live-buttons-stack',
            3: 'building-button-stack',
            4: 'rejected-button-stack',
            5: '-'
        };

        projects.forEach((project) => {
            const curr = example.clone().show();

            curr.find('.project-title').text(project.title);

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

            curr.find('.status-div')
                .hide()
                .removeClass('w-condition-invisible')
                .filter(`.${statusDivCorresps[project.status]}`)
                .show();

            Object.values(buttonsDivCorresps).forEach((v) =>
                curr.find(`.${v}`).removeClass('w-condition-invisible').hide()
            );
            curr.find(`.${buttonsDivCorresps[project.status]}`).show();

            // Cancel Submission button
            curr.find('.in-review-admin-buttons')
                .children()
                .first()
                .on(
                    'click',
                    (function () {
                        // Anonymous function for var scoping
                        let submitted = false;
                        return async () => {
                            if (submitted) return;
                            submitted = true;
                            const headers = new Headers();
                            headers.set('Content-Type', 'application/json');
                            const r = await fetch(
                                `${API}/projects/${project._id}`,
                                {
                                    method: 'PATCH',
                                    headers,
                                    credentials: 'include',
                                    body: JSON.stringify({ status: 5 })
                                }
                            );
                            if (!r.ok) submitted = false;
                            else loadProjects();
                        };
                    })()
                );

            // Launch project button
            curr.find('.approve-buttons')
                .children()
                .first()
                .on(
                    'click',
                    (function () {
                        // Anonymous function for var scoping
                        let submitted = false;
                        return async () => {
                            if (submitted) return;
                            submitted = true;
                            const headers = new Headers();
                            headers.set('Content-Type', 'application/json');
                            const r = await fetch(
                                `${API}/projects/${project._id}`,
                                {
                                    method: 'PATCH',
                                    headers,
                                    credentials: 'include',
                                    body: JSON.stringify({ status: 2 })
                                }
                            );
                            if (!r.ok) submitted = false;
                            else loadProjects();
                        };
                    })()
                );

            curr.find('.live-buttons-stack')
                .children()
                .last()
                .attr('href', `${updatePage}?preselect=${project._id}`);
            curr.find('.building-button-stack')
                .children()
                .last()
                .attr('href', `${updatePage}?preselect=${project._id}`);

            if (project.status >= 4)
                curr.appendTo($('#inactive-visions-wrapper'));
            else curr.appendTo($('#active-visions-wrapper'));
        });
    }
    loadProjects();
})();
