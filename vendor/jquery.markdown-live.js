/*
 * MarkdownLive
 * Version: 0.1 (23-MARCH-2016)
 * Require jQuery & js-markdown-extra
 */

(function ( $ ) {
 
    'use strict';

    var ver = '0.1.0',
        pluginName = 'markdownlive';

    $.fn.markdownlive = function(options) {

        // Settings
        var settings = $.extend({
        }, options );

        // Functions
        var updatePreview = function($this){

                var markdown_text = $this.val(),
                    markdown_html = Markdown(markdown_text),
                    $preview = $($this.attr('data-preview'));

                if ($preview.length >0){
                    $preview.html(markdown_html);    
                }
            },

            wrapSelection = function($this, $action) {
                
                var text = $this.val(),
                    length = text.length,
                    start = $this[0].selectionStart,
                    end = $this[0].selectionEnd,
                    before = $action.attr('data-before'),
                    after = $action.attr('data-after'),
                    block = $action.attr('data-block'),
                    placeholder = $action.attr('data-placeholder'),
                    extendselect = $action.attr('data-extendselect'),
                    selection = null,
                    replacement = null;

                // If selection has to be extended
                if (extendselect == 1) {

                    start = text.lastIndexOf("\n", start) + 1,
                    end = text.indexOf("\n", end);

                    if (end === -1) {
                        end = text.length;
                    }
                } 

                // Set selection
                selection =  text.substring(start, end)

                // Placeholder is only used if there is no selected text
                if (selection.length == 0 && placeholder) {
                    selection = placeholder;
                }

                // Set replacement
                replacement = before + selection + after

                // If block is defined, we have to add extra line before and after
                if (block == 1) {
                    replacement = "\n" + replacement + "\n";
                }

                // Replace selection in textarea
                $this.val(text.substring(0, start) + replacement + text.substring(end, length));

                // Reset selection
                setFocus($this, start, end + after.length + before.length);
                
                // Update preview
                updatePreview($this);
            },

            setFocus = function ($object, start, end) {
            
                if (end === undefined){
                    end = start;
                }

                $object[0].selectionStart = start;
                $object[0].selectionEnd = end;
                
                $object.focus();
            };

        // Parsing dom
        return this.each(function() {
            
            var $this = $(this),
                $bar = $($this.attr("data-bar"));
            
            // Init preview
            updatePreview($this);

            // Update preview on key up
            $this.keyup(function(){
                updatePreview($this);
            });

            // Bar buttons
            if ($bar.length > 0) {
                $bar.children('li').click(function(e){
                    e.preventDefault();
                    wrapSelection($this, $(this));
                });
            }
        });
    };
 
}(jQuery));
