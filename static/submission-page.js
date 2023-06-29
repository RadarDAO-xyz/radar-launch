(async function () {
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

    ids.forEach((id) => (data[id] = $(`#${id}`).val()));

    let team = [];
    for (let i = 1; i <= 8; i++) {
        team.push({
            name: $(`#team-name-${i}`).val(),
            bio: $(`#team-bio-${i}`).val(),
            email: $(`#team-email-${i}`).val()
        });
    }
    data.team = team.filter((x) => !!x.name);
    data.waitlist = !!$('#waitlist').val();

    let milestones = [];
    for (let i = 1; i <= 7; i++) {
        milestones.push({
            amount: parseInt($(`#milestone-amount-${i}`).val()),
            text: $(`#milestone-text-${i}`).val()
        });
    }
    data.milestones = milestones.filter((x) => !!x.amount);

    data.edition_price = parseInt($('#edition_price').val());

    data.mind_end_date = new Date($('#mind_end_date').val()).toISOString();

    let benefits = [];
    for (let i = 1; i <= 7; i++) {
        benefits.push({
            amount: parseInt($(`#milestone-amount-${i}`).val()),
            text: $(`#milestone-text-${i}`).val()
        });
    }
    data.benefits = benefits.filter((x) => !!x.amount);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers,
        body: data
    }).then((r) => r.json());

    console.log(res);
})();
