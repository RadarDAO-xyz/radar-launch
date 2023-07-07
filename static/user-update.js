(function () {
    // Webflow fixer function
    $('#update-user-form').on('submit', (e) => e.preventDefault());
    $('.file-upload-2').css('flex-direction', 'column');
    $('#file').hide();
    $('.w-file-upload-input').removeClass('w-file-upload-input');
    $('.w-file-upload-label').removeClass('w-file-upload-label');
    $('.w-file-remove-link').on('click', () =>
        $('#file').val('').parent().parent().find('label').show()
    );
    $('#file')
        .val('')
        .off()
        .on('change', (ev) => {
            let $this = $(ev.target);
            $this
                .parent()
                .parent()
                .find('.w-file-upload-success')
                .show()
                .find('.w-file-upload-file-name')
                .text($this.val().split('\\').pop().split('/').pop());
            $this.parent().parent().find('label').hide();
        });
})();

(async function () {
    const getTextAreaInput = (id) =>
        tinymce.get(id)?.getContent() || $(`#${id}`).val();
    const setTextAreaInput = (id, content) =>
        tinymce.get(id)?.setContent(content) || $(`#${id}`).val(content);

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

    const me = await fetchSelf();
    if (!me) return;
    console.log(me);
    $('#founder-name').text(me.name);
    $('#founder-eth').text(me.wallet_address);
    $('#founder-image').attr('src', me.profile).removeAttr('srcset');
    $('#username').val(me.name);
    $('#socials').val(me.socials);
    setTextAreaInput('bio', me.bio);

    let submitted = false;
    $('#submit').on('click', async () => {
        try {
            if (submitted) return;
            submitted = true;

            const selectedFile = document.querySelector('#file').files[0];

            console.log(selectedFile);

            const data = {
                profile: selectedFile
                    ? await toBase64(selectedFile)
                    : undefined,
                name: $('#username').val(),
                socials: $('#socials').val(),
                bio: getTextAreaInput('bio')
            };

            console.log(data);

            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            await fetch(`${API}/users/${me._id}`, {
                method: 'PATCH',
                headers,
                credentials: 'include',
                body: JSON.stringify(data)
            })
                .then((r) => {
                    if (!r.ok) throw r.statusText;
                    return r;
                })
                .then((r) => r.json());

            $('#update-user-form').hide();
            $('.w-form-done').show();
            clearUserCache();
        } catch (e) {
            submitted = false;
            console.error(e);
        }
    });
})();
