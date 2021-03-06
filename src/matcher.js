(function(){

xtag.register('x-pattern-matcher', {
  lifecycle:{
    created: function(){
      this.xtag.split = new RegExp();
      this.xtag.select = null;
    }
  },
  accessors: {
    split: {
      attribute: {},
      set: function(value){
        this.xtag.split = new RegExp(value);
      },
      get: function(){
        return this.xtag.split;
      }
    },
    select: {
      attribute: {},
      set: function(value){
        if (value && value.length>0){ this.xtag.select = new RegExp(value);}
        else { this.xtag.select = null; }
      },
      get: function(){
        return this.xtag.select;
      }
    },
    onmatch: {
      attribute: {}
    }
  }
});

xtag.register('x-text-pattern-matcher', {
  lifecycle: {
    created: function(){
      var ac = this;
      this.xtag._selector = null;
      this.xtag._delegate = null;
      this.xtag.matches = this.querySelectorAll('x-pattern-matcher');
      this.xtag.list = document.createElement('ul');
      this.xtag.list.setAttribute('tabindex','0');
      document.body.appendChild(this.xtag.list);
      xtag.addClass(this.xtag.list,'autocompleter-list');
      xtag.addEvent(this.xtag.list,
        'keydown:keypass(13,38,40,27,32)', function(e){
          var selected;
          switch(e.keyCode){
            case 13: // enter
              selected = xtag.query(ac.xtag.list, 'li[selected]')[0];
              updateSelected.call(ac, selected.textContent);
              ac.xtag.list.setAttribute('hidden','');
              break;
            case 38: // up
              selected = xtag.query(ac.xtag.list, 'li[selected]')[0];
              if (selected){ selected.removeAttribute('selected');}
              (selected ? selected.previousSibling || ac.xtag.list.lastElementChild : ac.xtag.list.lastElementChild).setAttribute('selected','');
              break;
            case 40: // down
              selected = xtag.query(ac.xtag.list, 'li[selected]')[0];
              if (selected){ selected.removeAttribute('selected');}
              (selected ? selected.nextSibling || ac.xtag.list.firstElementChild : ac.xtag.list.firstElementChild).setAttribute('selected','');
              break;
            case 27: // escape
              ac.xtag.list.setAttribute('hidden','');
              break;
            case 32: // spacebar
              selected = xtag.query(ac.xtag.list, 'li[selected]')[0];
              if (selected){ selected.removeAttribute('selected');}
              this.setAttribute('selected','');
              break;
          }
        }
      );
      xtag.addEvent(this.xtag.list, 'tap:delegate(li)', function(e){
        var selected = xtag.query(ac.xtag.list, 'li[selected]')[0];
        if (selected){ selected.removeAttribute('selected');}
        updateSelected.call(ac, this.textContent);
        ac.xtag.list.setAttribute('hidden','');
      });
    }
  },
  accessors: {
    target:{
      attribute: {},
      set: function(selector){
        var pseudo = 'keypress:keyfail(13):delegate(';
        if (this.xtag._selector !== selector && this.xtag._delegate) {
          xtag.removeEvent(document,
            pseudo + this.xtag._selector + ')',
            this.xtag._delegate);
          this.xtag._delegate = null;
        }
        if (!this.xtag._delegate) {
          this.xtag._delegate = xtag.addEvent(document,
            pseudo + selector + ')',
            debounce(this._change.bind(this), 400));
          this.xtag._selector = selector;
        }
      }
    }
  },
  methods: {
    _change: function(e){
      var elem = this;
      if (e.keyCode === 9 && !elem.xtag.list.hasAttribute('hidden')){
        elem.xtag.list.focus();
        return;
      }
      xtag.query(this, 'x-pattern-matcher').forEach(function(match){
        // Find current word by looking at cursor position
        // and then iterating through words
        var wordStart = 0, wordEnd = 0,
          curPos = getCaretPosition(e.target);

        var currentWord = e.target.value.split(match.split).filter(function(word){
          wordEnd += word.length;
          if (curPos >= wordStart && curPos <= wordEnd){
            return true;
          }
          wordStart += word.length;
        })[0];
        // test against the current word
        var m = (match.select || match.split).exec(currentWord);
        if (m && e.keyCode !== 8) {
          elem.xtag.list.removeAttribute('hidden');
          // save current input, match, and position for later
          elem.xtag.lastMatchInput = e.target;
          elem.xtag.lastMatch = m;
          elem.xtag.lastMatchElement = match;
          elem.xtag.lastCursorPosition = curPos;
          window[match.onmatch](m, elem._buildUI.bind(elem));
        } else if (e.keyCode === 8) {
          elem.xtag.list.setAttribute('hidden','');
        }
      });
    },
    _buildUI: function(data){
      var lastMatchInput = this.xtag.lastMatchInput;
      this.xtag.list.innerHTML = '';
      data.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item;
        this.xtag.list.appendChild(li);
      }.bind(this));
      var pos = getElementPosition(lastMatchInput);
      this.xtag.list.style.top = (pos.top + convertEm(1, lastMatchInput)) + 'px';
      this.xtag.list.style.left = pos.left + 'px';
    }
  }
});

function updateSelected(newText){
  var obj = this.xtag,
    curPos = obj.lastCursorPosition,
    wordStart = 0,
    wordEnd = 0;

  obj.lastMatchInput.value = obj
    .lastMatchInput.value
    .split(obj.lastMatchElement.split).map(function(tag){
    wordEnd += tag.length;
    if (curPos >= wordStart && curPos <= wordEnd && tag.length>0){
      wordStart += tag.length;
      if (obj.lastMatch[1] && obj.lastMatch[1].length>0){
        tag = tag.replace(obj.lastMatch[1], newText);
      } else {
        tag = obj.lastMatch[0] + newText;
      }
    }
    return tag;
    }).join('');
  obj.lastMatchInput.focus();
}

function getCaretPosition (oField) {
  var iCaretPos = 0;
  // IE Support
  if (document.selection) {
    // Set focus on the element
    oField.focus ();
    // To get cursor position, get empty selection range
    var oSel = document.selection.createRange ();
    // Move selection start to 0 position
    oSel.moveStart ('character', -oField.value.length);
    // The caret position is selection length
    iCaretPos = oSel.text.length;
  } else if (oField.selectionStart || oField.selectionStart === '0'){
    iCaretPos = oField.selectionStart;
  }
  // Return results
  return (iCaretPos);
}

function getElementFontSize( context ) {
  // Returns a number
  return parseFloat(
    getComputedStyle( context || document.documentElement).fontSize
  );
}

function convertRem(value) {
  return convertEm(value);
}

function convertEm(value, context) {
  return value * getElementFontSize(context);
}

function getElementPosition(elem){
  var box = { left: 0, top: 0 };
  try {
    box = elem.getBoundingClientRect();
  }
  catch(e){}
  var doc = document,
    docElem = doc.documentElement,
    body = document.body,
    win = window,
    clientTop  = docElem.clientTop  || body.clientTop  || 0,
    clientLeft = docElem.clientLeft || body.clientLeft || 0,
    scrollTop  = win.pageYOffset || body.scrollTop,
    scrollLeft = win.pageXOffset || body.scrollLeft,
    top  = box.top  + scrollTop  - clientTop,
    left = box.left + scrollLeft - clientLeft;
  return { top:top, left:left};
}

var debounce = function (func, threshold, execAsap) {
  var timeout;
  return function debounced () {
    var obj = this, args = arguments;
    function delayed () {
      func.apply(obj, args);
    }

    if (timeout) {
    clearTimeout(timeout);
    } else if (execAsap) {
    func.apply(obj, args);
    return;
    }
    timeout = setTimeout(delayed, threshold || 200);
  };
};



})();
