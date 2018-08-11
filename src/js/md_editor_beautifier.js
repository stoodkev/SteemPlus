var token_md_editor_beautifier = null;
var markdownSource = null;
var preview = null;
var waitingForPreview = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'md_editor_beautifier' && request.order === 'start' && token_md_editor_beautifier == null && window.location.href.includes('submit')) {
        token_md_editor_beautifier = request.token;
        startMDEditorPreview();
    }
    if (request.to === 'md_editor_beautifier' && request.order === 'click' && window.location.href.includes('submit')) {
        token_md_editor_beautifier = request.token;
        startMDEditorPreview();
    }
});

function startMDEditorPreview() {

    $('textarea').addClass('smi-gif-picker-textarea2');

    if ($('textarea').length > 0 && $('textarea')[0].textLength === 0) {
        waitingForPreview = true;
    } else
        waitingForPreview = false;

    setupPreview();
    $('.float-right.secondary').click(function() {
        bindTextArea();
    });
    bindTextArea();

}

function waitInsertedDropImage() {
    if ($('textarea')[0].textLength === 0) {
        if (regexCreatePostSteemit.test(window.location.href)) {
            setTimeout(function() {
                waitInsertedDropImage();
            }, 200);
        }

    } else {
        if ($('.MarkdownViewer2').length === 0) {
            waitingForPreview = false;
            setTimeout(function() {
                $('.MarkdownViewer')[1].innerHTML = $('.MarkdownViewer')[0].innerHTML;
                return;
            }, 1000);

        }

        $('.MarkdownViewer').bind("DOMNodeInserted", function(event) {
            setTimeout(function() {
                $('.MarkdownViewer')[1].innerHTML = $('.MarkdownViewer')[0].innerHTML;
                $('.MarkdownViewer').unbind("DOMNodeInserted");
                return;
            }, 1000);
        });
    }
}

function bindTextArea() {
    if ($('textarea').length === 0) {
        setTimeout(function() {
            bindTextArea();
        }, 1000);
    }

    $("html").on("drop", function(event) {
        event.preventDefault();
        waitInsertedDropImage();
    });

    $('textarea').on('paste', function() {
        setTimeout(function() {
            waitingForPreview = false;
            $('.MarkdownViewer')[1].innerHTML = $('.MarkdownViewer')[0].innerHTML;
        }, 200);
    });


    $('textarea').bind('keyup', function(event) {
        // $('textarea').bind('input propertychange', function(event){
        if (event.currentTarget.value.length === 0) {
            preview.remove();
            waitingForPreview = true;
            setupPreview();
        } else {
            setTimeout(function() {
                $('.MarkdownViewer')[1].innerHTML = $('.MarkdownViewer')[0].innerHTML;
            }, 1000);
            waitingForPreview = false;
        }
    });

}

function setupPreview() {
    if (regexCreatePostSteemit.test(window.location.href)) {
        if (waitingForPreview || $('.Preview').length === 0) {
            setTimeout(function() {
                setupPreview();
            }, 500);
            return;
        }

        // Put editor next to preview
        markdownSource = $('.Preview');
        preview = markdownSource.clone();
        preview.id = 'mypreview';
        preview.addClass('Preview2');
        markdownSource.hide();
        preview.find('div.MarkdownViewer').addClass('MarkdownViewer2');


        if ($('.myrow').length > 0) {
            preview.appendTo($('.myrow'));
        } else {
            preview.appendTo($('.column'));
            $('.column').removeClass('small-12');
            $('.column').addClass('row');
            $('.column').addClass('myrow');
            $('.column').removeClass('column');

            $('.ReplyEditor').removeClass('row');
            $('.ReplyEditor').addClass('ReplyEditor2');
            $('.vframe').addClass('vframe2');
        }
    }

}