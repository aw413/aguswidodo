// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

$(document).ready(function(){
	var MAX_TRIES = 100;

    function breakStringIntoWordClue(line){
        var line = $.trim(line);
        var word = line.split(/\s+/)[0];
        var clue = $.trim(line.substr(word.length));
        return [word, clue];

    }

	function getWordsAndCluesFromTextbox(words, clues){
		var lines = $('#id_words').val().split("\n");
		for(var i = 0; i < lines.length; i++){
			//var data = $.trim(lines[i]).split(/\s(.+)?/);
            var data = breakStringIntoWordClue(lines[i]);
			if(data.length < 2)	continue;
			data[0] = $.trim(data[0]);
			data[1] = $.trim(data[1]);
			if(data[0] == "" || data[1] == ""){
                continue;
            }
			words.push(data[0].toLowerCase());
			clues.push(data[1]);
		}
	}

	function addLegendToPage(groups){
		for(var k in groups){
			var html = [];
			for(var i = 0; i < groups[k].length; i++){
				html.push("<li><strong>" + groups[k][i]['position'] + ".</strong> " + groups[k][i]['clue'] + "</li>");
			}
			$('#' + k).html(html.join("\n"));
		}
		$('#clues').show();
	}

	function makeTextboxContentPretty(){
		var words = [], clues = [];
		var lines = $('#id_words').val().split("\n");
		for(var i = 0; i < lines.length; i++){
			//var data = $.trim(lines[i]).split(/\s(.+)?/);
            var data = breakStringIntoWordClue(lines[i]);
			data[0] = $.trim(data[0]);
			data[1] = $.trim(data[1]);
			if(data[0] == "" && data[1] == "") continue;
			words.push(data[0].toLowerCase());
			clues.push(data[1]);
		}
		// find longest word
		if(words.length == 0) return;
		var longest_word = words[0].length;
		if(longest_word == 0) return;
		for(var i = 1; i < words.length; i++){
			if(words[i].length > longest_word) longest_word = words[i].length;
		}

		var buffer = new Array(longest_word+1);
		var textbox_content = [];
		for(var i = 0; i < words.length; i++){
			for(var j = 0; j < buffer.length; j++) buffer[j] = " ";
			for(var j = 0; j < words[i].length; j++) buffer[j] = words[i].charAt(j);
			textbox_content.push(buffer.join(""), clues[i], "\n");
		}
		$('#id_words').val(textbox_content.join(""));
	}

    $('#id_words').blur(function(){
        makeTextboxContentPretty();
    })

    var seed = 0;
    $('#seed-left').on("click", function(){
        seed--;
        regenerate();
    });

    $('#seed-right').on("click", function(){
        seed++;
        regenerate();
    });

    $('#build-crossword').on("submit", function(e){
        var grid = regenerate();
        if(grid === null){
            alert("Please finish your crossword before submitting");
            e.preventDefault();
        }
    });

    $('#show').on("click", function(e){
        //var checked = $(this).prop("checked");
        var type = $('#id_password').attr("type")
        $('#id_password').attr("type", type == "password" ? "text" : "password");

    });

	$('#id_password').on('keyup change', function(e){
        if(this.value){
            $('#show').css("opacity", 1);
        } else {
            $('#show').css("opacity", 0);
        }

    }).change();

    var last_words = "";
    var g_words = [], g_clues = [];
    function populateWordsAndClues(){
        g_words = [];
        g_clues = [];
		getWordsAndCluesFromTextbox(g_words, g_clues);
    }

    var debounceRegenerate = debounce(function(){
        regenerate(false);
    }, 250, false)

    function regenerate(delay){
        var space = $('#preview-here');
        populateWordsAndClues()
        var grid = null;

		// catch errors
		if(g_words.length == 0){
            space.removeClass("loading");
            $('#preview-header').css("visibility", "hidden");
            space.html("<span class='message'>PREVIEW</span>")
			return null;
		}

        var key = seed + g_words.join(" ");
        if(delay){
            debounceRegenerate();
            if(key == last_words){
                return;
            }
            $('#preview-header').css("visibility", "hidden");
            space.addClass("loading");
            space.html("");
        } else {
            space.removeClass("loading");
            var cw = new Crossword(g_words, g_clues, seed);
            var grid = cw.getGridWithMaximizedIntersections(10, MAX_TRIES);

            if(grid == null){
                var bads = cw.getBadWords();
                var bad_words = [];
                for(var i = 0; i < bads.length; i++){
                    bad_words.push(bads[i].word);
                }
                space.html("<span class='message'>Keep adding more words! <small>Why?</small></span>")
                space.find("small").on("click", function(){
                    alert("We couldn't place these words on the crossword because they don't have enough common letters with other words: " + bad_words.join(", "))

                });
                $('#preview-header').css("visibility", "hidden");
            } else {
                space.html(CrosswordUtils.toSvg(grid, true));
                var legend = cw.getLegend(grid)

                $('#preview-header').css("visibility", "visible");
                $('#id_legend_json').val(JSON.stringify(legend, null, 2));
            }
        }
        last_words = key;
        return grid;
    }


    $('#id_words').keyup(function(){
        regenerate(true);
    });

    regenerate()

	makeTextboxContentPretty();

	$('#example').click(function(e){
        e.preventDefault()
		var lines = $.trim($("#id_words").val());
		lines += "\ndog Man's best friend \ncat Likes to chase mice\nbat Flying mammal\nelephant Has a trunk\nkangaroo Large marsupial";
		$('#id_words').val($.trim(lines));
        $('#id_words').keyup();
	});

    if(!window.LOGGED_IN){
        $('#id_permissions_1, #id_permissions_2').on("click", function(e){
            e.preventDefault();
            initStripe(function(){
                $('.modal-wrapper').show();
            });
        });
    }

});
