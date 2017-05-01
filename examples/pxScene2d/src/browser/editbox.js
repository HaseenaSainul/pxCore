
px.import({ scene: 'px:scene.1.js',
             keys: 'px:tools.keys.js'
}).then(function importsAreReady(imports)
{
    var scene = imports.scene;
    var keys  = imports.keys;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// EXAMPLE:  
//
//   var inputBox  = new EditBox( {    url:"images/input2.png",    <<<<< 9 slice Image for Background frame
//                                  insets: {l: 10, r: 10, t: 10, b: 10}, 
//                                  parent: bg, 
//                                       x: 10, 
//                                       y: 10, 
//                                       w: 800,
//                                       h: 35,
//                                     pts: 24 });
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function EditBox(params) {

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._x = 0;
        Object.defineProperty(this, "x",
        {
            set: function (val) { this._x = val; notify("setX( " + val + " )"); },
            get: function () { return this._x; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._y = 0;
        Object.defineProperty(this, "y",
        {
            set: function (val) { this._y = val; notify("setY( " + val + " )"); },
            get: function () { return this._y; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._w = 0;
        Object.defineProperty(this, "w",
        {
            set: function (val) { this._w = val; notify("setW( " + val + " )\n"); onSize(this._w, this._h); },
            get: function () { return this._w; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._h = 0;
        Object.defineProperty(this, "h",
        {
            set: function (val) { this._h = val; notify("setH( " + val + " )\n"); onSize(this._w, this._h); },
            get: function () { return this._h; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Object.defineProperty(this, "focus",
        {
            set: function (val) { textInput.focus = val; notify("setFocus( " + val + " )"); },
            get: function () { return textInput.focus; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Object.defineProperty(this, "text",
        {
            set: function (val) { 
                textInput.text = val;                                   
                prompt.a = (textInput.text.length > 0) ? 0 : 1; // show/hide placeholder
            },
            get: function () { 
                  // Remove Leading/Trailing whitespace...
                  var txt = textInput.text.trim();
                  return txt; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Object.defineProperty(this, "textColor",
        {
            set: function (val) { textInput.textColor = val; },
            get: function ()    { return textInput.textColor ; },
        });        
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._enableCopy = true;
        Object.defineProperty(this, "enableCopy",
        {
            set: function (val) { this._enableCopy = val; notify("setEnableCopy( " + val + " )"); },
            get: function () { return this._enableCopy; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this._enablePaste = true;
        Object.defineProperty(this, "enablePaste",
        {
            set: function (val) { this._enablePaste = val; notify("setEnablePaste( " + val + " )"); },
            get: function () { return this._enablePaste; },
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        //
        // PUBLIC methods
        //
        this.moveToHome     = moveToHome;
        this.moveToEnd      = moveToEnd;        
        this.selectAll      = selectAll;
        this.clearSelection = clearSelection;

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        function notify(msg) {
            console.log("layout( " + msg + " ) >>> WxH: " + this._w + " x " + this._h + " at (" + this._x + "," + this._y + ")");
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        var self       = this;
        var buttonDown = false;
        var buttonDownTime;
        var cursor_pos = 0;

        var selection_x     = 0;
        var selection_start = 0;
        var selection_chars = 0; // number of characters selected  (-)ive is LEFT of cursor start position
        var selection_text  = "";

        var lastScroll = 0;
        var scrollPos  = true;

        var scrollOffset = 0;

        var default_insets = {l: 10, r: 10, t: 10, b: 10};

                                                 // set -OR- (default)   
                    this._x =               "x" in params ? params.x               : 0;
                    this._y =               "y" in params ? params.y               : 0;
                    this._w =               "w" in params ? params.w               : 200;
                    this._h =               "h" in params ? params.h               : 50;
        var          parent =          "parent" in params ? params.parent          : scene.root;  // critical
        var             url =             "url" in params ? params.url             : "images/input2.png";
        var          insets =          "insets" in params ? params.insets          : default_insets;
        var             pts =             "pts" in params ? params.pts             : 24;
        var            font =            "font" in params ? params.font            : "FreeSans.ttf";
        var     prompt_text =     "prompt_text" in params ? params.prompt_text     : "Enter Url to JS File or Package";
        var selection_color = "selection_color" in params ? params.selection_color : 0xFCF2A488;  // yellow
        var    prompt_color =    "prompt_color" in params ? params.prompt_color    : 0x869CB2ff;  // gray ?
        var      text_color =      "text_color" in params ? params.text_color      : 0x303030ff;  // black

        var ss = scene.stretch.STRETCH;

        var container = scene.create({ t: "object", parent: parent,    x: this._x, y: this._y, w: this._w,   h: this._h });
        var clipRect  = scene.create({ t: "object", parent: container, x: 0,       y: 0,       w: this._w-2, h: this._h, clip: true} );
        var fontRes   = scene.create({ t: "fontResource",  url: font });
        var inputRes  = scene.create({ t: "imageResource", url: params.url });

        var inputBg = scene.create({
            t: "image9", resource: inputRes, a: 0.9, x: 0, y: 0, w: this._w, h: this._h,// insets: insets,
            insetLeft: insets.l, insetRight: insets.r, insetTop: insets.t, insetBottom: insets.b, 
            parent: clipRect, stretchX: ss, stretchY: ss
        });

        var prompt    = scene.create({ t: "text", text: prompt_text, font: fontRes, parent: clipRect, pixelSize: pts, textColor: prompt_color, x: 0, y: 0 });
        var textInput = scene.create({ t: "text", text: "",          font: fontRes, parent: clipRect, pixelSize: pts, textColor: text_color,   x: 0, y: 0 });
        var cursor    = scene.create({ t: "rect", w: 2, h: inputBg.h, parent: textInput, x: 0, y: 0 });
        var selection = scene.create({ t: "rect", w: 0, h: inputBg.h, parent: textInput, fillColor: selection_color, x: 0, y: 0, a: 0 });  // highlight rect

      //  var dots = scene.create({ t: "text", text: "...", font: fontRes, parent: inputBg, pixelSize: pts, textColor: text_color, x: 1, y: -1 });

        var assets = [fontRes, inputRes, inputBg, clipRect, prompt, textInput, cursor, selection];

        Promise.all(assets)
            .catch((err) => {
                console.log(">>> Loading Assets ... err = " + err);
            })
            .then((success, failure) => {

                onSize(self.w, self.h);

                // Adjust TEXT for font size ... center VERTICALLY in background
                var text = fontRes.measureText(pts, "ABCdef123'");

                textInput.y = (inputBg.h - text.h) / 2;

                selection.h = inputBg.h * 0.85;
                selection.y = (inputBg.h - selection.h) / 2 - textInput.y;

                cursor.h    = text.h * 0.65;
                cursor.y    = (inputBg.h - cursor.h) / 2 - textInput.y;

                prompt.y    = textInput.y;

                updateCursor(0);

                animateCursor();
            });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onMouseDown", function (e) {

            // cursor.a = 1;
            textInput.focus = true;

            if(textInput.text.length > 0)
            {
                var now = new Date().getTime();
                if( buttonDownTime !== undefined)
                {
                    if((now - buttonDownTime) < 200)
                    {
                        // DOUBLE CLICKED
                        selectAll();
                        
                        buttonDown = false;

                        return;
                    }
                }

                buttonDownTime = now;
            }

            buttonDown = true;

 //console.log("#######  onMouseDown ....  buttonDown = " + buttonDown);

            clearSelection();

            var ptc = pointToCursor(e.x, e.y); // returns a tuple

            // Update cursor...
            cursor_pos = ptc[0];

            if (self._enableCopy && keys.is_SHIFT(e.flags & 0x8)) // <<  SHIFT KEY    TODO: Fix "is_SHIFT()"
            {
                selection_chars = cursor_pos - selection_start;

                makeSelection(selection_start, selection_chars);
            }           
            else
            {
                selection.w = 0;
                selection.x = e.x;

                updateCursor(cursor_pos);

                selection_x     = cursor.x; // history
                selection.x     = cursor.x; // current
                selection_start = cursor_pos;
            }
        });
 
         //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onMouseUp", function (e) {

            buttonDown = false;

// console.log("#######  onMouseUp ....  buttonDown = " + buttonDown);

        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onMouseLeave", function (e) {

// console.log("#######  onMouseLeave ....  buttonDown = " + buttonDown);

            //cursor.a = 0;
            //textInput.focus = false;
            buttonDown      = false;
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onMouseMove", function (e) {
            if (self._enableCopy && buttonDown) {

 //console.log("#######  onMouseMove ....  buttonDown = " + buttonDown);

                // Selecting by mouse drag
                var ptc = pointToCursor(e.x, e.y); // returns a tuple

                selection.w     = ptc[1] - selection_x;     // pixels
                selection_chars = ptc[0] - selection_start; // character pos

                makeSelection(selection_start, selection_chars);
            }
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        container.on("onFocus", function (e) {

                cursor.a = 1;
                animateCursor();

// console.log(" OnFocus()    textInput.focus ");// = " + textInput.focus);
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onChar", function (e) {
            //console.log("#######  onChar ....  cursor_pos = " + cursor_pos);

            if (e.charCode == keys.ENTER)  // <<<  ENTER KEY
                return;

            if (selection_chars !== 0) {
                removeSelection(); // overwrote selection
            }
            // TODO should we be getting an onChar event for backspace
            if (e.charCode != keys.BACKSPACE) {

                removeSelection();  // Delete selection (if any)

                // insert character
                textInput.text = textInput.text.slice(0, cursor_pos) + String.fromCharCode(e.charCode) + textInput.text.slice(cursor_pos);

                prompt.a = (textInput.text.length > 0) ? 0 : 1; // show/hide placeholder

                cursor_pos += 1; // inserted 1 character

                updateCursor(cursor_pos);
            }
        });//onChar()

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        textInput.on("onKeyDown", function (e) {
            var code  = e.keyCode;
            var flags = e.flags;

            //    console.log("#######  onKeyDown ....  cursor_pos = " + cursor_pos);

            switch (code) {
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.BACKSPACE:
                    {
//                        console.log("BACKSPACE " + textInput.text);

                        var s = textInput.text.slice();

                        if (selection_chars === 0) {
                            // Delete ... possibly in the middle of string.
                            var lhs_w_cursor = s.slice(0, cursor_pos - 1);
                            var rhs_w_cursor  = s.slice(cursor_pos);

                            textInput.text = lhs_w_cursor + rhs_w_cursor;

                            if (cursor_pos > 0)
                                cursor_pos--;
                        }
                        else {
                            removeSelection();  // Delete selection
                        }

                        prompt.a = (textInput.text.length > 0) ? 0 : 1; // show/hide placeholder
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.ENTER:   // bubble up !!
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.HOME:
                    if (self._enableCopy && keys.is_SHIFT(e.flags))
                    {
                        selectToHome();  // <<  SHIFT KEY + HOME
                    }
                    else {
                        moveToHome();
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.END:
                    if (self._enableCopy && keys.is_SHIFT(e.flags)) 
                    {
                        selectToEnd(); // <<  SHIFT KEY + END
                    }
                    else {
                        moveToEnd();
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.LEFT:

                    if (cursor_pos === 0)
                    {
                        // Already at START !
                        break;
                    }

                    if (keys.is_CTRL(e.flags) || keys.is_CMD(e.flags))
                    {
                        moveToHome();  // <<  CTRL KEY + LEFT
                    }
                    else
                    if (self._enableCopy && (keys.is_CTRL_SHIFT(e.flags) || keys.is_CMD_SHIFT(e.flags)) )
                    {
                        selectToHome();  // <<  CTRL + SHIFT KEY + LEFT
                    }
                    else
                    if (self._enableCopy && keys.is_SHIFT(e.flags)) // <<  SHIFT KEY + LEFT
                    {
                        if (selection_chars === 0)
                        {
                            // Start NEW selection
                            selection_start = cursor_pos;
                            selection_x = cursor.x + cursor.w;
                        }
                        selection_chars--;

                        makeSelection(selection_start, selection_chars);
                    }
                    else // just move LEFT
                    {
                        if(selection.w !== 0)
                        {
                            clearSelection();
                        }
                        cursor_pos--;
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.RIGHT:

                    if (cursor_pos === textInput.text.length)
                    {
                        // Already at END !
                        console.log("DEBUG:  EDITBOX >> Already at END ! " );
                        break;
                    }

                    if (keys.is_CTRL(e.flags) || keys.is_CMD(e.flags)) 
                    {
                        moveToEnd(); // <<  CTRL KEY + RIGHT
                    }
                    else
                    if (self._enableCopy && (keys.is_CTRL_SHIFT(e.flags) || keys.is_CMD_SHIFT(e.flags)) ) 
                    {
                        selectToEnd(); // <<  CTRL + SHIFT KEY + RIGHT
                    }
                    else
                    if (self._enableCopy && keys.is_SHIFT(e.flags)) // <<  SHIFT KEY + RIGHT
                    {
                        if (selection_chars === 0)
                        {
                            // Start NEW selection
                            selection_start = cursor_pos;
                            selection_x = cursor.x + cursor.w;
                        }
                        selection_chars++;

                        makeSelection(selection_start, selection_chars);
                    }
                    else // just move RIGHT
                    {
                        if(selection.w !== 0)
                        {
                            clearSelection();
                        }
                        cursor_pos++; 
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.A:   // << CTRL + A 
                    if (self._enableCopy && (keys.is_CTRL(e.flags) || keys.is_CMD(e.flags)) )  // ctrl Pressed also
                    {
                        // Select All                        
                        cursor_pos = 0;
                        selection_x = textInput.x;
                         
                        selection_start = 0;
                        selection_chars = textInput.text.length + 1;

                        makeSelection(selection_start, selection_chars);
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.C:   // << CTRL + C
                    if (self._enableCopy && (keys.is_CTRL(e.flags) || keys.is_CMD(e.flags)) )  // ctrl Pressed also
                    {
                        // console.log("onKeyDown ....   CTRL-C >>> [" + selection_text + "]");

                        scene.clipboardSet('PX_CLIP_STRING', selection_text);
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.V:   // << CTRL + V
                    if (self._enablePaste && (keys.is_CTRL(e.flags) || keys.is_CMD(e.flags)) )  // ctrl Pressed also
                    {
                        removeSelection();  // Delete selection (if any)

                        // On PASTE ... access the Native CLIPBOARD and GET the top!   fancy.js
                        //
                        var fromClip = scene.clipboardGet('PX_CLIP_STRING'); // TODO ... pass TYPE of clip to get.

                        textInput.text = textInput.text.slice(0, cursor_pos) + fromClip + textInput.text.slice(cursor_pos);

                        prompt.a = (textInput.text.length > 0) ? 0 : 1;
                        cursor.x = textInput.x + textInput.w;

                        cursor_pos += fromClip.length;

                        clearSelection();
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                case keys.X:   // << CTRL + X
                    if (keys.is_CTRL(e.flags))  // ctrl Pressed also
                    {
                        // On CUT ... access the Native CLIPBOARD and GET the top!   fancy.js
                        //
                        scene.clipboardSet('PX_CLIP_STRING', selection_text);

                        removeSelection();
                    }
                    break;
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                case 0: // zero value
                    break; // only a modifer key ? Ignore

                default:
                    // prompt.a = (textInput.text)?0:1;
                    // cursor.x = textInput.x + textInput.w;
                    break;
            } // SWITCH

            // Always update cursor
            updateCursor(cursor_pos);

        });//onKeyDown()

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function onSize(w, h) {
//            console.log("onSize() >>> ## WxH = " + w + " x " + h);

            container.w = w;
            container.h = h;

            inputBg.w = w;
            inputBg.h = h;

            textInput.w = w;
            clipRect.w  = w;
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // returns nearest text insertion point / cursor position to (x,y)
        function pointToCursor(x, y)
        {
            var snip     = textInput.text;
            var metrics  = fontRes.measureText(pts, snip);
            var full_w   = metrics.w;
            var return_x = metrics.w; // default to RHS/END of text

            if (x <= full_w)
            {
               if(textInput.text.length > 0)
                {
                    // Coarse JUMP to get close !
                    var index  = textInput.text.length * ( x / full_w) - 0.1; // guess Glyph index click x-pos
                    var this_w = 0;
                    var last_w = 0;

                    while( (index <= textInput.text.length) && (this_w < x) )
                    {
                        snip    = textInput.text.slice(0,  index++);
                        metrics = fontRes.measureText(pts, snip);

                        last_w = this_w;
                        this_w = metrics.w;
                    }

                    return_x = metrics.w; // may have answer, check for overshot ?

                    var lhs_w = (x    - last_w);  // Click is 'within Glyph' - closer to LHS
                    var rhs_w = (metrics.w - x);  // Click is 'within Glyph' - closer to RHS

                    if(lhs_w <= rhs_w) // Closer to start..
                    {
                        snip     = textInput.text.slice(0, (index - 2) ); // 1 for exit of loop, 1 for previous
                        return_x = last_w;
                    }                    
                }
            }

            return [snip.length, return_x];  // return tuple [pos,x]
        }

        function cursorToPoint(pos) {

            var snip    = textInput.text.slice(0, pos);
            var metrics = fontRes.measureText(pts, snip);
            var pos_w   = metrics.w;

            var return_x = textInput.x + metrics.w + textInput.x;
            var return_y = textInput.y;

            console.log("cursorToPoint() >>> xy: (" + return_x + "," + return_y + ")");
        
            return [return_x, return_y]; // return tuple [x,y]
        }

        function updateScrollView() {

            var      cw  = cursor.w * 4;
            var scrollBy = clipRect.w - cursor.x - cw;

            var scrollLeft  = (lastScroll <= scrollBy);
            var scrollRight = !scrollLeft;

            var clip_w = clipRect.w - cw; // allow a little room for cursor

            var scrollBit = Math.abs(scrollBy - lastScroll);
            
            lastScroll = scrollBy;

            // Cursor beyond 'clipRect' bounds... slide `textInput` into view
            //
            if( cursor.x > clip_w ) // Need to Scroll ? 
            {
                if (scrollLeft)
                {              
                    if( scrollOffset < (clip_w - cw - 20) )
                    {  
                        scrollOffset += scrollBit;  // Move Cursor Offset to the RIGHT 
                    }
                }
                else
                if (scrollRight)
                {                
                    if( scrollOffset > cw) 
                    {  
                        scrollOffset -= scrollBit;  // Move Cursor Offset to the LEFT 
                    }
                }   
                textInput.x = scrollBy - scrollOffset;
            }       
            else
            {
                textInput.x  = 0;
                scrollOffset = 0;
            }
        }


        function updateCursor(pos) {

            var s       = textInput.text.slice();
            var snip    = s.slice(0, pos); // measure characters to the left of cursor
            var metrics = fontRes.measureText(pts, snip);
          
            cursor.x = metrics.w; // offset to cursor

            updateScrollView();
        }

        function clearSelection() {
            selection_text  = "";
            selection_start = 0;
            selection_chars = 0;

            selection.x = 0;
            selection.w = 0;
        }

        function removeSelection(){
            if(selection_text.length <=0)
            {
                return; // nothing to do.
            }

            textInput.text = textInput.text.replace(selection_text, '');

            if (selection_chars > 0) {
                cursor_pos -= selection_text.length;
            }

            updateCursor(cursor_pos);
            clearSelection();

            prompt.a = (textInput.text.length > 0) ? 0 : 1; // show/hide placeholder
        }

        function makeSelection(start, length) {

            var end = start + length;

            selection.a = (length === 0) ? 0 : 0.75;

            if (length === 0)
            {
//                console.log("ERROR: makeSelection(start, length) >>>  s: " + start + "  e: " + end + " selection_text = [" + selection_text + "]");
                return;
            }

            if (length < 0) // Selection made: right-to-left
            {
                end = start;  // original start is end .. left-to-right
                start = start + length;
            }

            var s = textInput.text.slice();
            selection_text = s.slice(start, end); // measure characters up to cursor
            var metrics = fontRes.measureText(pts, selection_text);

//            console.log("makeSelection(start, length) >>>  s: " + start + "  e: " + end + " selection_text = [" + selection_text + "]");

            selection.x = selection_x - cursor.w/2;
            selection.w = metrics.w   + cursor.w/2; 

            if (length < 0) // selecting towards LEFT
            {
                selection.x -= metrics.w;
            }

            // Position cursor at "start" of selection .. dependin on direction
            cursor_pos = (length > 0) ? end : start;//+= length;

            updateCursor(cursor_pos);
        }


        function moveToHome() {
            cursor_pos = 0;
            
            updateCursor(cursor_pos);
            clearSelection();
        }

        function moveToEnd() {
            cursor_pos = textInput.text.length;

            updateCursor(cursor_pos);
            clearSelection();
        }

        function selectAll() 
        {
            moveToHome();
            selectToEnd();
        }

        function selectToHome() {
            // Select from Cursor to End
            if (selection_chars === 0) {
                selection_start = cursor_pos; // new selection
                selection_x = cursor.x + cursor.w; // Extend selection
            }

            selection_chars += -cursor_pos;  // characters to the LEFT

            makeSelection(selection_start, selection_chars);

            cursor_pos = 0;
        }

        function selectToEnd() {
            // Select from Cursor to Start
            if (selection_chars === 0) {
                selection_start = cursor_pos;
                selection_x = cursor.x + cursor.w; // Start selection
            }
            selection_chars += (textInput.text.length - cursor_pos); // characters to the RIGHT

            makeSelection(selection_start, selection_chars);

            cursor_pos = textInput.text.length;
        }

        function animateCursor()
        {
            cursor.animateTo({ a: 0 }, 0.5, scene.animation.TWEEN_LINEAR, scene.animation.OPTION_OSCILLATE, scene.animation.COUNT_FOREVER);
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        this.ready = new Promise(function (resolve, reject) {
            Promise.all([prompt.ready])
                .then(function () {
                 //   console.log("PROMISE ALL IS READY");
                    resolve();
                });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    }//class 

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    module.exports = EditBox;

}).catch(function importFailed(err) {
    console.error("Import failed for editBox.js: " + err);
});