(function () {
    const replaceUrl = (url) =>
        $('#video_image').replaceWith(
            $('<img id="video_image"/>').attr(
                'src',
                `https://i3.ytimg.com/vi/${extractYoutubeId(
                    url
                )}/maxresdefault.jpg`
            )
        );

    $('#video_url').val() && replaceUrl($('#video_url').val());
    $('#video_url').on('input', (ev) => replaceUrl(ev.target.value));
})();

(async function () {
    $('#submission-form').on('submit', (e) => e.preventDefault());
    const getTextAreaInput = (id) =>
        tinymce.get(id)?.getContent() || $(`#${id}`).val();

    const ids = [
        // String values
        'title',
        'description',
        'video_url',
        'tldr',
        'brief',
        'inspiration',
        'collaborators',
        'admin_address'
    ];

    const data = {};

    let submitted = false;
    $('#submission-form-submit').on('click', async () => {
        try {
            if (submitted) return;
            submitted = true;

            ids.forEach((id) => (data[id] = getTextAreaInput(id)));

            let team = [];
            for (let i = 1; i <= 8; i++) {
                team.push({
                    name: $(`#team-name-${i}`).val(),
                    bio: getTextAreaInput(`team-bio-${i}`),
                    email: $(`#team-email-${i}`).val()
                });
            }
            data.team = team.filter((x) => !!x.name);
            data.waitlist = $('#waitlist').is(':checked');

            let milestones = [];
            for (let i = 1; i <= 7; i++) {
                milestones.push({
                    amount: parseFloat($(`#milestone-amount-${i}`).val()),
                    text: getTextAreaInput(`milestone-text-${i}`)
                });
            }
            data.milestones = milestones.filter((x) => !!x.amount);

            data.edition_price = parseFloat($('#edition_price').val());

            data.mint_end_date = new Date(
                $('#mind_end_date').val().replace(/-/g, '/')
            ).toISOString();

            let benefits = [];
            for (let i = 1; i <= 7; i++) {
                benefits.push({
                    amount: parseFloat($(`#benefit-amount-${i}`).val()),
                    text: getTextAreaInput(`benefit-text-${i}`)
                });
            }
            data.benefits = benefits.filter((x) => !!x.amount);

            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            await fetch(`${API}/projects`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                credentials: 'include'
            })
                .then((r) => {
                    if (!r.ok) throw r.statusText;
                    else return r;
                })
                .then((r) => r.json());

            $('#submission-form').hide();
            $('.w-form-fail').hide();
            $('.w-form-done').show();
        } catch (e) {
            submitted = false;
            console.error(e);
        }
    });
})();
