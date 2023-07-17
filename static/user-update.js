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

    $('html').hide();
    const me = await fetchSelf();
    if (!me) return;
    $('#founder-name').text(me.name);
    $('#founder-eth').text(me.wallet_address);
    $('#founder-image').attr('src', me.profile).removeAttr('srcset');
    $('#username').val(me.name);
    $('#socials').val(me.socials);
    setTextAreaInput('bio', me.bio);
    $('html').show();

    let submitted = false;
    $('#submit').on('click', async () => {
        try {
            if (submitted) return;
            submitted = true;
            $('#submit').val('Submitting...');

            const selectedFile = document.querySelector('#file').files[0];

            if (selectedFile?.size >= 10 * 1024 * 1024) {
                $('#submit').val('Profile image too big! Max 10mb');
                submitted = false;
                return;
            }

            const formData = new FormData();
            formData.append('name', $('#username').val());
            formData.append('socials', $('#socials').val());
            formData.append('bio', getTextAreaInput('bio'));
            selectedFile && formData.append('profile', selectedFile);

            await fetch(`${API}/users/${me._id}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
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
            $('#submit').val('Update your bio');
            $('#update-user-form').hide();
            $('.w-form-fail').show();
            setTimeout(() => {
                $('#update-user-form').show();
                $('.w-form-fail').hide();
            }, 2500);
            submitted = false;
            console.error(e);
        }
    });
})();
