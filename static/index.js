const getLocation = (href) => {
    let l = document.createElement("a");
    l.href = href;
    return l;
}
const showErrors = () => {
    $(".webtoon-rss").val("???").removeClass("is-success").addClass("is-danger", true);
    $(".webtoon-atom").val("???").removeClass("is-success").addClass("is-danger", true);
}
const setUrl = (prefix) => {
    const hostname = "https://rss.litehell.info";
    $(".webtoon-rss").val(hostname + prefix + "/rss").removeClass("is-danger").addClass("is-success", true);
    $(".webtoon-atom").val(hostname + prefix + "/atom").removeClass("is-danger").addClass("is-success", true);
}

$(() => {
    $(".webtoon-url").on("change input", function() {
        let loc = getLocation($('.webtoon-url').val());
        if (loc.hostname == "comic.naver.com") {
            const pattern = /titleId=([0-9]+)/,
                  querystring = loc.search,
                  matches = pattern.exec(querystring);
            if (matches.length < 2)
                return showErrors();
            setUrl(`/webtoon/naver/${matches[1]}`);
        } else if(loc.hostname == "webtoon.daum.net") {
            const viewPattern = /^\/webtoon\/view\/([^\/?]+)/,
                  viewerPattern = /^\/webtoon\/viewer\/([0-9]+)/;
            if (viewPattern.test(loc.pathname))
                return setUrl(`/webtoon/daum/${viewPattern.exec(loc.pathname)[1]}`);
            else if (viewerPattern.test(loc.pathname))
                $.ajax({
                    url: `/webtoon/daum/${viewerPattern.exec(loc.pathname)[1]}/toWebtoonId`,
                    datatype: 'json',
                    error: showErrors,
                    success: webtoonId => setUrl(`/webtoon/daum/${webtoonId}`)
                });
            else
                showErrors();
        } else {
            showErrors();
        }
    });
});