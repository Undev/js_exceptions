(function() {
  // https://github.com/emwendelin/javascript-stacktrace
  function printStackTrace(options){var ex=(options&&options.e)?options.e:null;var guess=options?!!options.guess:true;var p=new printStackTrace.implementation();var result=p.run(ex);return(guess)?p.guessFunctions(result):result;}
  printStackTrace.implementation=function(){};printStackTrace.implementation.prototype={run:function(ex){ex=ex||(function(){try{var _err=__undef__<<1;}catch(e){return e;}})();var mode=this._mode||this.mode(ex);if(mode==='other'){return this.other(arguments.callee);}else{return this[mode](ex);}},mode:function(e){if(e['arguments']){return(this._mode='chrome');}else if(window.opera&&e.stacktrace){return(this._mode='opera10');}else if(e.stack){return(this._mode='firefox');}else if(window.opera&&!('stacktrace'in e)){return(this._mode='opera');}
  return(this._mode='other');},instrumentFunction:function(context,functionName,callback){context=context||window;context['_old'+functionName]=context[functionName];context[functionName]=function(){callback.call(this,printStackTrace());return context['_old'+functionName].apply(this,arguments);};context[functionName]._instrumented=true;},deinstrumentFunction:function(context,functionName){if(context[functionName].constructor===Function&&context[functionName]._instrumented&&context['_old'+functionName].constructor===Function){context[functionName]=context['_old'+functionName];}},chrome:function(e){return e.stack.replace(/^[^\(]+?[\n$]/gm,'').replace(/^\s+at\s+/gm,'').replace(/^Object.<anonymous>\s*\(/gm,'{anonymous}()@').split('\n');},firefox:function(e){return e.stack.replace(/(?:\n@:0)?\s+$/m,'').replace(/^\(/gm,'{anonymous}(').split('\n');},opera10:function(e){var stack=e.stacktrace;var lines=stack.split('\n'),ANON='{anonymous}',lineRE=/.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i,i,j,len;for(i=2,j=0,len=lines.length;i<len-2;i++){if(lineRE.test(lines[i])){var location=RegExp.$6+':'+RegExp.$1+':'+RegExp.$2;var fnName=RegExp.$3;fnName=fnName.replace(/<anonymous function\:?\s?(\S+)?>/g,ANON);lines[j++]=fnName+'@'+location;}}
  lines.splice(j,lines.length-j);return lines;},opera:function(e){var lines=e.message.split('\n'),ANON='{anonymous}',lineRE=/Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i,i,j,len;for(i=4,j=0,len=lines.length;i<len;i+=2){if(lineRE.test(lines[i])){lines[j++]=(RegExp.$3?RegExp.$3+'()@'+RegExp.$2+RegExp.$1:ANON+'()@'+RegExp.$2+':'+RegExp.$1)+' -- '+lines[i+1].replace(/^\s+/,'');}}
  lines.splice(j,lines.length-j);return lines;},other:function(curr){var ANON='{anonymous}',fnRE=/function\s*([\w\-$]+)?\s*\(/i,stack=[],fn,args,maxStackSize=10;while(curr&&stack.length<maxStackSize){fn=fnRE.test(curr.toString())?RegExp.$1||ANON:ANON;args=Array.prototype.slice.call(curr['arguments']);stack[stack.length]=fn+'('+this.stringifyArguments(args)+')';curr=curr.caller;}
  return stack;},stringifyArguments:function(args){for(var i=0;i<args.length;++i){var arg=args[i];if(arg===undefined){args[i]='undefined';}else if(arg===null){args[i]='null';}else if(arg.constructor){if(arg.constructor===Array){if(arg.length<3){args[i]='['+this.stringifyArguments(arg)+']';}else{args[i]='['+this.stringifyArguments(Array.prototype.slice.call(arg,0,1))+'...'+this.stringifyArguments(Array.prototype.slice.call(arg,-1))+']';}}else if(arg.constructor===Object){args[i]='#object';}else if(arg.constructor===Function){args[i]='#function';}else if(arg.constructor===String){args[i]='"'+arg+'"';}}}
  return args.join(',');},sourceCache:{},ajax:function(url){var req=this.createXMLHTTPObject();if(!req){return;}
  req.open('GET',url,false);req.setRequestHeader('User-Agent','XMLHTTP/1.0');req.send('');return req.responseText;},createXMLHTTPObject:function(){var xmlhttp,XMLHttpFactories=[function(){return new XMLHttpRequest();},function(){return new ActiveXObject('Msxml2.XMLHTTP');},function(){return new ActiveXObject('Msxml3.XMLHTTP');},function(){return new ActiveXObject('Microsoft.XMLHTTP');}];for(var i=0;i<XMLHttpFactories.length;i++){try{xmlhttp=XMLHttpFactories[i]();this.createXMLHTTPObject=XMLHttpFactories[i];return xmlhttp;}catch(e){}}},isSameDomain:function(url){return url.indexOf(location.hostname)!==-1;},getSource:function(url){if(!(url in this.sourceCache)){this.sourceCache[url]=this.ajax(url).split('\n');}
  return this.sourceCache[url];},guessFunctions:function(stack){for(var i=0;i<stack.length;++i){var reStack=/\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;var frame=stack[i],m=reStack.exec(frame);if(m){var file=m[1],lineno=m[4];if(file&&this.isSameDomain(file)&&lineno){var functionName=this.guessFunctionName(file,lineno);stack[i]=frame.replace('{anonymous}',functionName);}}}
  return stack;},guessFunctionName:function(url,lineNo){try{return this.guessFunctionNameFromLines(lineNo,this.getSource(url));}catch(e){return'getSource failed with url: '+url+', exception: '+e.toString();}},guessFunctionNameFromLines:function(lineNo,source){var reFunctionArgNames=/function ([^(]*)\(([^)]*)\)/;var reGuessFunction=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;var line="",maxLines=10;for(var i=0;i<maxLines;++i){line=source[lineNo-i]+line;if(line!==undefined){var m=reGuessFunction.exec(line);if(m&&m[1]){return m[1];}else{m=reFunctionArgNames.exec(line);if(m&&m[1]){return m[1];}}}}
  return'(?)';}};

  window.ExceptionNotifier = {};
  $.extend(ExceptionNotifier, {
    notify: function (e) {
      if ( typeof(ExceptionNotifierOptions) !== 'undefined' && (typeof(ExceptionNotifierOptions.logErrors) !== 'undefined') && !ExceptionNotifierOptions.logErrors ) { return; }

      e = this.formatStringError(e);
      $.extend(e, {
        'Browser': navigator.userAgent,
        'Page': location.href
      });

      // Format stack trace
      e.Stack = printStackTrace({e: e, guess: false}).join("\n");

      this.send(e);
      return false;
    },

    send: function(error) {
      console.log(error)
      var params = {};
      params.subject = error.subject;

      for (var attr in error) {
        params[attr] = error[attr];
      }

      $.ajax({
        url: "/js_exceptions",
        type: "POST",
        dataType: "text/html",
        data: $.param(params)
      });
    },

    // If error is a string, convert it to a object
    formatStringError: function (error) {
      if (typeof error == 'string') {
        var old = error;
        error = {
          toString: function () { return old; }
        };
        error.message = old;
      }
      return error;
    },

    // Listens window.onError
    errorHandler: function(msg, url, l) {
      var e = {
        message: msg,
        fileName: url,
        lineNumber: l
      };
      ExceptionNotifier.notify(e);
      return false;
    },

    // Removes listener
    killEvent: function (event) {
      if (!event) { return; }
      event.cancelBubble = true;
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventDefault) { event.preventDefault(); }
    }
  });
  window.onerror = ExceptionNotifier.errorHandler;
})();

