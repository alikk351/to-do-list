$("#iteminput").focus(function () {
    setInterval(function () {
        const text_len = $("#iteminput").val().length;
        if (text_len < 21) {
            $("#remainingCharacters").text(text_len);
        }
    }, 100);
});