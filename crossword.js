Array.prototype.rotate = (function() {
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >>> 0,
            count = count >> 0;

        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
})();

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

var MersenneTwister = function(seed) {
  if (seed == undefined) {
    seed = new Date().getTime();
  } 
  /* Period parameters */  
  this.N = 624;
  this.M = 397;
  this.MATRIX_A = 0x9908b0df;   /* constant vector a */
  this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
  this.LOWER_MASK = 0x7fffffff; /* least significant r bits */
 
  this.mt = new Array(this.N); /* the array for the state vector */
  this.mti=this.N+1; /* mti==N+1 means mt[N] is not initialized */

  this.init_genrand(seed);
}  
 
/* initializes mt[N] with a seed */
MersenneTwister.prototype.init_genrand = function(s) {
  this.mt[0] = s >>> 0;
  for (this.mti=1; this.mti<this.N; this.mti++) {
      var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
   this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
  + this.mti;
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.mt[this.mti] >>>= 0;
      /* for >32 bit machines */
  }
}
 
/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
  var i, j, k;
  this.init_genrand(19650218);
  i=1; j=0;
  k = (this.N>key_length ? this.N : key_length);
  for (; k; k--) {
    var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
      + init_key[j] + j; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++; j++;
    if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
    if (j>=key_length) j=0;
  }
  for (k=this.N-1; k; k--) {
    var s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
    this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
      - i; /* non linear */
    this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
    i++;
    if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
  }

  this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */ 
}
 
/* generates a random number on [0,0xffffffff]-interval */
MersenneTwister.prototype.genrand_int32 = function() {
  var y;
  var mag01 = new Array(0x0, this.MATRIX_A);
  /* mag01[x] = x * MATRIX_A  for x=0,1 */

  if (this.mti >= this.N) { /* generate N words at one time */
    var kk;

    if (this.mti == this.N+1)   /* if init_genrand() has not been called, */
      this.init_genrand(5489); /* a default initial seed is used */

    for (kk=0;kk<this.N-this.M;kk++) {
      y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
      this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    for (;kk<this.N-1;kk++) {
      y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
      this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
    }
    y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
    this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];

    this.mti = 0;
  }

  y = this.mt[this.mti++];

  /* Tempering */
  y ^= (y >>> 11);
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  y ^= (y >>> 18);

  return y >>> 0;
}
 
/* generates a random number on [0,0x7fffffff]-interval */
MersenneTwister.prototype.genrand_int31 = function() {
  return (this.genrand_int32()>>>1);
}
 
/* generates a random number on [0,1]-real-interval */
MersenneTwister.prototype.genrand_real1 = function() {
  return this.genrand_int32()*(1.0/4294967295.0); 
  /* divided by 2^32-1 */ 
}

/* generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
  return this.genrand_int32()*(1.0/4294967296.0); 
  /* divided by 2^32 */
}
 
/* generates a random number on (0,1)-real-interval */
MersenneTwister.prototype.genrand_real3 = function() {
  return (this.genrand_int32() + 0.5)*(1.0/4294967296.0); 
  /* divided by 2^32 */
}
 
/* generates a random number on [0,1) with 53-bit resolution*/
MersenneTwister.prototype.genrand_res53 = function() { 
  var a=this.genrand_int32()>>>5, b=this.genrand_int32()>>>6; 
  return(a*67108864.0+b)*(1.0/9007199254740992.0); 
} 


function shuffle(o, random){
    if(!random){
        random = Math.random
    }

    for(var j, x, i = o.length; i; j = Math.floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
// Each cell on the crossword grid is null or one of these
function CrosswordCell(letter){
    this.char = letter; // the actual letter for the cell on the crossword
    // If a word hits this cell going in the "across" direction, this will be a CrosswordCellNode
    this.across = null; 
    // If a word hits this cell going in the "down" direction, this will be a CrosswordCellNode
    this.down = null;
}

// You can tell if the Node is the start of a word (which is needed if you want to number the cells)
// and what word and clue it corresponds to (using the index)
function CrosswordCellNode(is_start_of_word, index){
    this.is_start_of_word = is_start_of_word;
    this.index = index; // use to map this node to its word or clue
}

function WordElement(word, index){
    this.word = word; // the actual word
    this.index = index; // use to map this node to its word or clue
}

function Crossword(words_in, clues_in, seed){
    var GRID_ROWS = 50;
    var GRID_COLS = 50;
    // This is an index of the positions of the char in the crossword (so we know where we can potentially place words)
    // example {"a" : [{'row' : 10, 'col' : 5}, {'row' : 62, 'col' :17}], {'row' : 54, 'col' : 12}], "b" : [{'row' : 3, 'col' : 13}]} 
    // where the two item arrays are the row and column of where the letter occurs
    var char_index = {};	

    // these words are the words that can't be placed on the crossword
    var bad_words;
    var mt = new MersenneTwister(seed || 0)
    var random = function(){
        return mt.genrand_res53();
    }

    // returns the crossword grid that has the ratio closest to 1 or null if it can't build one
    this.getSquareGrid = function(max_tries){
        var best_grid = null;
        var best_ratio = 0;
        for(var i = 0; i < max_tries; i++){
            var a_grid = this.getGrid(1);
            if(a_grid == null) continue;
            var ratio = Math.min(a_grid.length, a_grid[0].length) * 1.0 / Math.max(a_grid.length, a_grid[0].length);
            if(ratio > best_ratio){
                best_grid = a_grid;
                best_ratio = ratio;
            }

            if(best_ratio == 1) break;
        }
        return best_grid;
    }

    this.getGridGreedy = function(max_tries){
        var best_grid = null;
        var best_intersections = -1;
        for(var i = 0; i < max_tries; i++){
            var a_grid = this.getGrid(1);
            if(a_grid == null){
                console.log("restarting")
                shuffle(word_elements, random);
                continue
            }
            var intersections = a_grid.intersections;
            if(intersections > best_intersections){
                best_grid = a_grid;
                best_intersections = intersections;
                //console.log(intersections);
            }
            return a_grid
        }
        return null;
        //return best_grid;
    }

    this.getGridWithMaximizedIntersections = function(best_of, max_tries){
        var best_grid = null;
        var best_intersections = -1;
        var generated_count = 0;
        for(var i = 0; i < max_tries; i++){
            shuffle(word_elements, random);
            var a_grid = this.getGrid(1);
            if(a_grid == null) continue;
            generated_count++;
            var intersections = a_grid.intersections;
            console.log(intersections);
            if(intersections > best_intersections){
                best_grid = a_grid;
                best_intersections = intersections;
            }

            console.log(intersections)
            if(best_grid && generated_count == best_of){
                return best_grid;
            }
        }
        return best_grid;
    }

    // returns an abitrary grid, or null if it can't build one
    this.getGrid = function(max_tries){
        for(var tries = 0; tries < max_tries; tries++){
            //shuffle(word_elements);
            clear(); // always start with a fresh grid and char_index
            // place the first word in the middle of the grid
            var start_dir = randomDirection();
            var r = Math.floor(grid.length / 2);
            var c = Math.floor(grid[0].length / 2);
            var word_element = word_elements[0];
            if(start_dir == "across"){
                c -= Math.floor(word_element.word.length/2);
            } else {
                r -= Math.floor(word_element.word.length/2);
            }

            if(canPlaceWordAt(word_element.word, r, c, start_dir) !== false){
                placeWordAt(word_element.word, word_element.index, r, c, start_dir);
            } else {
                bad_words = [word_element];
                return;
                //throw 'Cannot place first word: ' + word_element.word + ' at ' + r + ', ' + c + ' (make the grid bigger)';
            }

            // initialize the max and min bounds around the words on the grid 
            // so we can shrink wrap the grid around the words later
            if(start_dir == "across"){
                var r_max = r;
                var c_max = c + word_elements[0].word.length - 1;
            } else {
                var r_max = r + word_elements[0].word.length - 1;
                var c_max = c; 
            }
            var r_min = r;
            var c_min = c; 			

            // start with a group containing all the words (except the first)
            // as we go, we try to place each word in the group onto the grid
            // if the word can't go on the grid, we add that word to the next group 
            var intersections = 0;
            var groups = [];
            if(word_elements.length > 1){
                groups.push(word_elements.slice(1));
            }

            var word_has_been_added_to_grid = true;
            for(var g = 0; g < groups.length; g++){
                word_has_been_added_to_grid = false;
                // try to add all the words in this group to the grid
                for(var i = 0; i < groups[g].length; i++){
                    var word_element = groups[g][i]; 
                    var best_position = findBestPositionForWord(word_element.word);
                    if(!best_position){ 
                        // make the new group (if needed)
                        if(groups.length - 1 == g) groups.push([]);
                        // place the word in the next group
                        groups[g+1].push(word_element);
                    } else {
                        intersections += best_position.intersections;
                        var r = best_position["row"], c = best_position["col"], dir = best_position['direction'];
                        placeWordAt(word_element.word, word_element.index, r, c, dir);
                        word_has_been_added_to_grid = true;						
                        // keep track of grid bounds
                        if(dir == "across"){
                            if(r > r_max) r_max = r;
                            if(c + word_element.word.length > c_max) c_max = c + word_element.word.length - 1;
                        } else {
                            if(r + word_element.word.length > r_max) r_max = r + word_element.word.length - 1;
                            if(c > c_max) c_max = c;
                        }						
                        if(r < r_min) r_min = r;						
                        if(c < c_min) c_min = c;							
                    }
                }
                // if we haven't made any progress, there is no point in going on to the next group
                if(!word_has_been_added_to_grid) break;
            }
            // no need to try again
            if(word_has_been_added_to_grid) {
                var g = minimizeGrid(r_min, r_max, c_min, c_max);
                g.intersections = intersections;
                return g;
            }
        }

        bad_words = groups[groups.length - 1];
        return null;
    }

    // returns the list of WordElements that can't fit on the crossword
    this.getBadWords = function(){
        return bad_words;
    }

    this.getLegend = function(grid){
        var groups = {"across" : [], "down" : []};
        var position = 1;
        for(var r = 0; r < grid.length; r++){	
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
                var increment_position = false;
                // check across and down
                for(var k in groups){
                    // does a word start here? (make sure the cell isn't null, first)
                    if(cell && cell[k] && cell[k]['is_start_of_word']){
                        var index = cell[k]['index'];
                        groups[k].push({
                            "position" : position,
                            "index" : index,
                            "clue" : clues_in[index],
                            "word" : words_in[index],
                            "row": r,
                            "col": c,
                        });
                        increment_position = true;
                    }
                }

                if(increment_position) position++;
            }
        }
        return groups;
    }	

    // move the grid onto the smallest grid that will fit it
    var minimizeGrid = function(r_min, r_max, c_min, c_max){
        // initialize new grid
        var rows = r_max - r_min + 1; 
        var cols = c_max - c_min + 1; 
        var new_grid = new Array(rows);
        for(var r = 0; r < rows; r++){
            for(var c = 0; c < cols; c++){
                new_grid[r] = new Array(cols);
            }
        }

        for(var r = r_min, r2 = 0; r2 < rows; r++, r2++){
            for(var c = c_min, c2 = 0; c2 < cols; c++, c2++){
                new_grid[r2][c2] = grid[r][c];
            }
        }

        return new_grid;
    }

    // helper for placeWordAt();
    var addCellToGrid = function(word, index_of_word_in_input_list, index_of_char, r, c, direction){
        var char = word.charAt(index_of_char);
        if(grid[r][c] == null){
            grid[r][c] = new CrosswordCell(char);

            // init the char_index for that character if needed
            if(!char_index[char]) char_index[char] = [];

            // add to index
            char_index[char].push({"row" : r, "col" : c});
        }

        var is_start_of_word = index_of_char == 0;
        grid[r][c][direction] = new CrosswordCellNode(is_start_of_word, index_of_word_in_input_list);
    }	

    // place the word at the row and col indicated (the first char goes there)
    // the next chars go to the right (across) or below (down), depending on the direction
    var placeWordAt = function(word, index_of_word_in_input_list, row, col, direction){
        if(direction == "across"){
            for(var c = col, i = 0; c < col + word.length; c++, i++){
                addCellToGrid(word, index_of_word_in_input_list, i, row, c, direction);
            }
        } else if(direction == "down"){
            for(var r = row, i = 0; r < row + word.length; r++, i++){
                addCellToGrid(word, index_of_word_in_input_list, i, r, col, direction);
            }			
        } else {
            throw "Invalid Direction";	
        }
    }

    // you can only place a char where the space is blank, or when the same character exists there already
    // and the row and col are inside the grid
    // returns false, if you can't place the char
    // 0 if you can place the char, but there is no intersection
    // 1 if you can place the char, and there is an intersection
    var canPlaceCharAt = function(char, row, col){
        // no intersection
        if(grid[row][col] == null) return 0;
        // intersection!
        if(grid[row][col]['char'] == char) return 1;

        return false;
    }

    // determines if you can place a word at the row, column in the direction
    var canPlaceWordAt = function(word, row, col, direction){
        // out of bounds
        if(row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return false;

        if(direction == "across"){
            // out of bounds (word too long)
            if(col + word.length > grid[row].length) return false;
            // can't have a word directly to the left
            if(col - 1 >= 0 && grid[row][col - 1] != null) return false;
            // can't have word directly to the right
            if(col + word.length < grid[row].length && grid[row][col+word.length] != null) return false;

            // check the row above to make sure there isn't another word running parallel
            // it is ok if there is a character above, only if the character below it intersects with the current word
            for(var r = row - 1, c = col, i = 0; r >= 0 && c < col + word.length; c++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // same deal as above, we just search in the row below the word
            for(var r = row + 1, c = col, i = 0; r < grid.length && c < col + word.length; c++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for(var c = col, i = 0; c < col + word.length; c++, i++){
                var result = canPlaceCharAt(word.charAt(i), row, c);
                if(result === false) return false;
                intersections += result;
            }
        } else if(direction == "down"){
            // out of bounds
            if(row + word.length > grid.length) return false;
            // can't have a word directly above
            if(row - 1 >= 0 && grid[row - 1][col] != null) return false;
            // can't have a word directly below
            if(row + word.length < grid.length && grid[row+word.length][col] != null) return false;

            // check the column to the left to make sure there isn't another word running parallel
            // it is ok if there is a character to the left, only if the character to the right intersects with the current word
            for(var c = col - 1, r = row, i = 0; c >= 0 && r < row + word.length; r++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // same deal, but look at the column to the right
            for(var c = col + 1, r = row, i = 0; r < row + word.length && c < grid[r].length; r++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for(var r = row, i = 0; r < row + word.length; r++, i++){
                var result = canPlaceCharAt(word.charAt(i, 1), r, col);
                if(result === false) return false;
                intersections += result;
            }
        } else {
            throw "Invalid Direction";	
        }
        return intersections == word.length ? false : intersections;
    }

    var randomDirection = function(){
        return Math.floor(random()*2) ? "across" : "down";
    }

    var findBestPositionForWord = function(word){
        // check the char_index for every letter, and see if we can put it there in a direction
        var bests = [];
        for(var i = 0; i < word.length; i++){
            var possible_locations_on_grid = char_index[word.charAt(i)];
            if(!possible_locations_on_grid) continue;
            for(var j = 0; j < possible_locations_on_grid.length; j++){
                var point = possible_locations_on_grid[j];
                var r = point['row'];
                var c = point['col'];
                // the c - i, and r - i here compensate for the offset of character in the word
                var intersections_across = canPlaceWordAt(word, r, c - i, "across");
                var intersections_down = canPlaceWordAt(word, r - i, c, "down");

                if(intersections_across !== false)
                    bests.push({"intersections" : intersections_across, "row" : r, "col" : c - i, "direction" : "across"});
                if(intersections_down !== false)
                    bests.push({"intersections" : intersections_down, "row" : r - i, "col" : c, "direction" : "down"});
            }
        }

        if(bests.length == 0) return false;
        shuffle(bests, random);

        //bests.sort(function(a, b){
        //    return b.intersections - a.intersections;
        //});
        var best = bests[0];

        //for(var i = 1; i < bests.length; i++){
        //    // there is probably a subtle bug here...
        //    if(bests[i]["intersections"] >= 1 && Math.floor(Math.random()*bests.length) == i) best = bests[i];
        //}

        return best;
    }

    var clear = function(){
        for(var r = 0; r < grid.length; r++){
            for(var c = 0; c < grid[r].length; c++){
                grid[r][c] = null;
            }
        }
        char_index = {};
    }

    // constructor
    //if(words_in.length < 2) throw "A crossword must have at least 2 words";
    if(words_in.length != clues_in.length) throw "The number of words must equal the number of clues";	

    // build the grid;
    var grid = new Array(GRID_ROWS);
    for(var i = 0; i < GRID_ROWS; i++){
        grid[i] = new Array(GRID_COLS);	
    }

    // build the element list (need to keep track of indexes in the originial input arrays)
    var word_elements = [];	
    for(var i = 0; i < words_in.length; i++){
        word_elements.push(new WordElement(words_in[i], i));
    }

    // I got this sorting idea from http://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword/1021800#1021800
    // seems to work well
    //word_elements.sort(function(a, b){ return b.word.length - a.word.length; });
	//word_elements
    //shuffle(word_elements, random);
}

var CrosswordUtils = {
    PATH_TO_PNGS_OF_NUMBERS : "numbers/",

    toHtml : function(grid, show_answers){
        if(grid == null) return;
        var html = [];
        html.push("<table class='crossword'>");
        var label = 1;
        for(var r = 0; r < grid.length; r++){
            html.push("<tr>");
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
                var is_start_of_word = false;
                if(cell == null){
                    var char = "&nbsp;";
                    var css_class = "no-border";
                } else {
                    var char = cell['char'];
                    var css_class = "";
                    var is_start_of_word = (cell['across'] && cell['across']['is_start_of_word']) || (cell['down'] && cell['down']['is_start_of_word']);
                }

                if(is_start_of_word) {
                    var img_url = CrosswordUtils.PATH_TO_PNGS_OF_NUMBERS + label + ".png";
                    html.push("<td class='" + css_class + "' title='" + r + ", " + c + "' style=\"background-image:url('" + img_url + "')\">");
                    label++;			
                } else {
                    html.push("<td class='" + css_class + "' title='" + r + ", " + c + "'>");					
                }

                if(show_answers) {
                    html.push(char);
                } else {
                    html.push("&nbsp;");								
                }
            }
            html.push("</tr>");
        }
        html.push("</table>");
        return html.join("\n");
    },

    get_cell: function(grid, r, c){
        try {
            return grid[r][c]
        } catch(e) {
            return null;
        }
    },

    toSvg : function(grid, show_answers){
        if(grid == null) return;
		var size = 30;
		var stroke_width = 1;
		var height = grid.length;
		var width = grid[0].length;
		var total_height = height*size*stroke_width*1.5;
		var total_width = width*size+stroke_width*1.5;
		var view_box = [-stroke_width/2, -stroke_width/2, width*size+stroke_width, height*size+stroke_width].join(" ")

        var html = [];
		html.push('<svg viewBox="' + view_box + '" style="width:100%; height:100%; max-height:' + total_height +'px; max-width:' +total_width+ 'px" xmlns="http://www.w3.org/2000/svg">')
		html.push('<style> g rect { height:'+size+'px; width:' + size + 'px; fill:rgb(255,255,255); stroke-width:' + stroke_width + '; stroke:rgb(0,0,0); } .cx-c { font-size:12px; font-family:monospace; pointer-events:none; font-weight:bold; } .cx-a { font-size:22px; font-family:monospace; text-anchor:middle; pointer-events:none; } </style>')
        var label = 1;
        for(var r = 0; r < grid.length; r++){
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
				if(cell == null){
                    north = CrosswordUtils.get_cell(grid, r-1, c)
                    west =  CrosswordUtils.get_cell(grid, r,   c-1)
                    south = CrosswordUtils.get_cell(grid, r+1, c)
                    east =  CrosswordUtils.get_cell(grid, r,   c+1)
                    all_ = north && south && east && west
                    if(all_){
                        html.push('<rect x="' + (c*size) + '" y="' + (r*size) + '" width="' + (size) + '" height="' + (size) + '" fill="#000000" />');
                    }
                    continue
				}


                var char = cell['char'];
                var is_start_of_word = (cell['across'] && cell['across']['is_start_of_word']) || (cell['down'] && cell['down']['is_start_of_word']);
                html.push('<g id="cx-' + r + '-' + c + '">')
                html.push('<rect x="' + (c*size) + '" y="' + (r*size) + '" width="' + size + '" height="' + size + '" />')

                if(is_start_of_word){
                    html.push('<text class="cx-c" x="' + (c*size+2) + '" y="' + (r*size+12/2+4) + '">' + label + '</text>')
                    label += 1
                }
                html.push('<text class="cx-a" x="' + (c*size+size/2) + '" y="' + (r*size+size/2+6) + '">' + (show_answers ? escapeHtml(char) : "") + '</text>')

                html.push('</g>');
            }
        }
        html.push("</svg>");
        return html.join("\n");
    }
}
