(async function () {
    $('#update-form').on('submit', (e) => e.preventDefault());
    const getTextAreaInput = (id) =>
        tinymce.get(id)?.getContent() || $(`#${id}`).val();

    const formatDate = (date) =>
        `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
            .getDate()
            .toString()
            .padStart(2, '0')}.${date.getFullYear().toString().substring(2)}`;

    const me = await fetchSelf();
    $('#founder-name').text(me.name);
    $('#founder-eth').text(me.wallet_address);
    if (me.profile)
        $('#founder-image').attr('src', me.profile).removeAttr('srcset');

    const projects = await fetch(`${API}/users/${me._id}/projects`).then((r) =>
        r.json()
    );

    $('#project-selection').children().first().attr('disabled', true);
    $('#project-selection').children().not(':first').remove();
    projects.forEach((project) => {
        $(`<option value="${project._id}">${project.title}</option>`).appendTo(
            $('#project-selection')
        );
    });

    async function updateSelected(project) {
        $('#project-updates-title').text(
            `Previous updates for ${project.title}`
        );
        $('#project-milestones-title').text(`Milestones for ${project.title}`);

        $('#project-milestones-wrapper').empty();
        project.milestones.forEach((m) =>
            $(
                `<div class="funding-milestone-admin-page"><div class="text-block-40">$${m.amount}</div><div class="w-richtext">${m.text}</div></div>`
            ).appendTo($('#project-milestones-wrapper'))
        );

        const existingUpdates =
            project.updates ||
            (await fetch(`${API}/projects/${project._id}/updates`).then((r) =>
                r.json()
            ));
        project.updates = existingUpdates; // Cache system

        $('#project-updates-wrapper').empty();

        existingUpdates.forEach((u) =>
            $(
                `<div class="update-div-2"><p class="project-updates-text">${
                    u.text
                }</p><p class="editions-page-small-text">${formatDate(
                    new Date(u.createdAt)
                )}</p></div>`
            ).appendTo($('#project-updates-wrapper'))
        );
    }

    const preselect = new URL(location).searchParams.get('preselect');
    if (preselect) updateSelected(projects.find((p) => p._id === preselect));
    $('#project-selection')
        .children(`[value=${preselect}]`)
        .attr('selected', '');

    $('#project-selection').on('change', async (ev) => {
        const project = projects.find((p) => p._id === $(ev.target).val());
        if (!project) return;
        updateSelected(project);
    });

    let submitted = false;
    $('#share-update-button').on('click', async () => {
        try {
            if (submitted) return;
            submitted = true;
            if (!$('#project-selection').val()) throw 'fail';

            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            await fetch(
                `${API}/projects/${$('#project-selection').val()}/updates`,
                {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: JSON.stringify({
                        text: getTextAreaInput('update-field')
                    })
                }
            )
                .then((r) => {
                    if (!r.ok) throw r.statusText;
                    else return r;
                })
                .then((r) => r.json());

            $('#update-form').hide();
            $('.w-form-done').show();
        } catch (e) {
            submitted = false;
            console.error(e);
        }
    });
})();
