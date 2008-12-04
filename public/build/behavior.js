Red = {
  id: 100,
  
  conferInheritance: function(newClass,superclass) {
    newClass.__superclass__=superclass;
    Red.donateMethodsToSingleton(superclass,newClass,true);
    Red.donateMethodsToClass(superclass.prototype,newClass.prototype,true);
    if(newClass==c$Module){delete(newClass.prototype.m$initialize);};
    if(newClass!==Number&&newClass!==Array){newClass.prototype.toString=superclass.prototype.toString;};
  },
  
  donateMethodsToSingleton: function(donor,recipient,overwrite) {
    for(var x in donor) {
      if(x.slice(0,2)==='m$' && (overwrite || recipient[x]===undefined)) {
        var f = function() { var m=arguments.callee;return m.__methodSource__[m.__methodName__].apply(m.__methodReceiver__,arguments); };
        f.__methodName__=x;f.__methodSource__=donor;f.__methodReceiver__=recipient;
        recipient[x]=f;
      };
    };
  },
  
  donateMethodsToClass: function(donor,recipient,overwrite) {
    for(var x in donor) {
      if(x.slice(0,2)==='m$' && (overwrite || recipient[x]===undefined)) {
        var f = function() { var m=arguments.callee;return m.__methodSource__[m.__methodName__].apply(this,arguments); };
        f.__methodName__=x;f.__methodSource__=donor;
        recipient[x]=f;
      };
    };
  },
  
  donateConstantsToClass: function(donor,recipient,overwrite) {
    for(var x in donor) {
      if(x.slice(0,2)==='c$' && (overwrite || recipient[x]===undefined)) {
        recipient[x]=donor[x];
      };
    };
  },
  
  updateChildren: function(parentClass) {
    for(var x in parentClass.__children__) {
      var childClass=Red.inferConstantFromString(x);
      Red.donateMethodsToSingleton(parentClass,childClass,false);
      Red.donateMethodsToClass(parentClass.prototype,childClass.prototype,false);
      Red.updateChildren(childClass);
    };
  },
  
  updateIncluders: function(module) {
    for(var x in module.__includers__) {
      var includer=Red.inferConstantFromString(x);
      Red.donateMethodsToSingleton(module,includer,false);
      Red.donateMethodsToClass(module.prototype,includer.prototype,false);
      if(includer == window){return nil;};
      switch(includer.m$class().__name__){case 'Module':Red.updateIncluders(includer);break;case 'Class':Red.updateChildren(includer);break;};
    };
  },
  
  initializeClass: function(longName,newClass) {
    newClass.__name__ = longName;
    newClass.__id__ = Red.id++;
    newClass.__modules__ = {};
    newClass.__children__ = {};
    newClass.__class__ = c$Class;
    newClass.prototype.__class__=newClass;
    Red.donateMethodsToSingleton(c$Class.prototype,newClass,true);
  },
  
  interpretNamespace: function(longName) {
    var ary=longName.split('.'),name=ary.pop(),namespace=window;
    while(ary.length>0){namespace=namespace['c$'+ary.shift()];};
    return [namespace,name];
  },
  
  inferConstantFromString: function(longName) {
    if(longName=='window'){return window;}
    var context=Red.interpretNamespace(longName);
    return context[0]['c$'+context[1]];
  },
  
  _module: function(longName,block){
    var newModule,context=Red.interpretNamespace(longName),namespace=context[0],name=context[1],c$name='c$'+name;
    if(namespace[c$name]) {
      if(namespace[c$name].m$class&&namespace[c$name].m$class()!==c$Module){m$raise(c$TypeError,$q(longName+' is not a Module'));};
      newModule = namespace[c$name];
    } else {
      newModule = c$Module.m$new(longName);
      namespace[c$name] = newModule;
      newModule.__includers__={};
    };
    if(typeof(block)=='function') { block.call(newModule); };
    Red.updateIncluders(newModule);
  },
  
  _class: function(longName,superclass,block){
    var newClass,context=Red.interpretNamespace(longName),namespace=context[0],name=context[1],c$name='c$'+name;
    if(namespace[c$name]) {
      if(namespace[c$name].m$class&&namespace[c$name].m$class()!==c$Class){m$raise(c$TypeError,$q(longName+' is not a Class'));};
      if(name!=='Object'&&superclass!==namespace[c$name].__superclass__){m$raise(c$TypeError,$q('superclass mismatch for class '+longName));};
      newClass = namespace[c$name];
      if(name=='Module'&&!(newClass.__superclass__.__children__[name])){Red.conferInheritance(c$Module,c$Object);}
      if(name=='Class'&&!(newClass.__superclass__.__children__[name])){Red.conferInheritance(c$Class,c$Module);}
    } else {
      switch(name){case 'Array':newClass=Array;break;case 'Numeric':newClass=Number;break;default:newClass=function(){this.__id__=Red.id++;};};
      if(superclass.m$class&&superclass.m$class()!==c$Class){m$raise(c$TypeError,$q('superclass must be a Class ('+superclass.m$class().__name__+' given)'))}
      Red.conferInheritance(newClass,superclass);
      Red.initializeClass(longName,newClass);
      superclass.__children__[newClass.__name__]=true;
      superclass.m$inherited && superclass.m$inherited(newClass);
      namespace[c$name]=newClass;
    };
    if(name=='Object'||superclass==c$Object){newClass.cvset=function(v,o){return newClass['v$'+v]=o;};newClass.cvget=function(v){return newClass['v$'+v];};}else{newClass.cvset=function(v,o){return superclass.cvset(v,o);};newClass.cvget=function(v){return superclass.cvget(v);};};
    if(typeof(block)=='function'){block.call(newClass);};
    Red.updateChildren(newClass);
    if((typeof(c$TrueClass)!='undefined'&&newClass==c$TrueClass)||(typeof(c$FalseClass)!='undefined'&&newClass==c$FalseClass)){Red.donateMethodsToClass(newClass.prototype,Boolean.prototype,true);};
  },
  
  LoopError: {
    _break:function(returnValue){var e=new(Error);e.__keyword__='break';e.__return__=returnValue==null?nil:returnValue;throw(e);},
    _next:function(returnValue){var e=new(Error);e.__keyword__='next';e.__return__=returnValue==null?nil:returnValue;throw(e);},
    _redo:function(){var e=new(Error);e.__keyword__='redo';throw(e);},
  }
}
;

var $u=undefined,nil=null,$={};

c$Class  = function(){this.__id__=Red.id++};c$Class.__name__='Class';c$Class.__children__={};
c$Module = function(){this.__id__=Red.id++};c$Module.__name__='Module';c$Module.__children__={};c$Class.__superclass__=c$Module;
c$Object = function(){this.__id__=Red.id++};c$Object.__name__='Object';c$Object.__children__={};c$Module.__superclass__=c$Object;

c$Object.prototype.toString=function(){return '#<'+this.m$class().__name__.replace(/\./g,'::')+':0x'+(this.__id__*999^4000000).toString(16)+'>'};
Function.prototype.m$=function(o){var f=this;var p=function(){return f.apply(o,arguments);};p.__unbound__=f;p.__arity__=f.arity;p.__id__=Red.id++;return p;};
window.__name__='window';
window.prototype=window;
window.__children__={'Object':true};
window.m$include=function(){for(var i=0,modules=arguments,l=modules.length;i<l;++i){var mp=modules[i].prototype;for(var x in mp){if(x.slice(0,2)=='m$'){var f=function(){return arguments.callee._source[arguments.callee._name].apply(window,arguments) };f._source=mp;f._name=x;window[x]=f;};};modules[i].m$included(window);modules[i].__includers__['window']=true;};if(modules[0]!=c$Kernel){Red.donateMethodsToClass(window,c$Object.prototype);Red.updateChildren(c$Object);};return window;};
window.m$block_given_bool=function(){typeof(arguments[0])=='function'}

function $a(min,max,args,bg){var a=args.length-bg;if(a<min){n=min;}else{if(max!=-1&&a>max){n=max;}else{return;};};m$raise(c$ArgumentError, $q('wrong number of arguments ('+a+' for '+n+')'));}
function $e(e,ary){if(e.m$is_a_bool){for(var i=0,l=ary.length;i<l;++i){if(e.m$is_a_bool(ary[i])){return true;};};};return false;};
function $m(obj,name){var str=obj.m$inspect().__value__;str=str[0]=='#'?str:str+':'+obj.m$class().__name__;m$raise(c$NoMethodError, $q('undefined method "'+name+'" for '+str));}
function $n(obj,name){var str=obj.m$inspect().__value__;str=str[0]=='#'?str:str+':'+obj.m$class().__name__;m$raise(c$NameError, $q('undefined local variable or method "'+name+'" for '+str));}
function $Q(){for(var i=1,s=arguments[0],l=arguments.length;i<l;++i){s+=$q(arguments[i]).m$to_s().__value__;};return $q(s);};
function $q(obj){if(typeof obj!=='string'){return obj;};return c$String.m$new(obj);};
function $r(value,options){return c$Regexp.m$new(value,options);};
function $s(value){return(c$Symbol.__table__[value]||c$Symbol.m$new(value));};
function $T(x){return x!==false&&x!==nil&&x!=undefined;};

;

Red._class('Object',c$Object,function(){ var _=c$Object.prototype;
  _.m$initialize=function(){nil;};
  _.m$_eql2=function(other){return this.__id__===other.__id__;};
  _.m$_eql3=function(other){return this.__id__===other.__id__;};
  _.m$class=function(){return this.__class__;};
  _.m$extend=function(){for(var l=arguments.length,i=0,modules=[];i<l;++i){modules.push(arguments[i]);};for(var i=0,l=modules.length;i<l;++i){modules[i].m$extend_object(this);modules[i].m$extended(this);};return(this);};
  _.m$hash=function(){return 'o_'+this.__id__;};
  _.m$inspect=function(){return this.m$to_s();};
  _.m$instance_of_bool=function(klass){return this.m$class()==klass;};
  _.m$instance_variable_get=function(name){var v=this[name.__value__.replace('@','i$')];return v==null?nil:v;};
  _.m$instance_variable_set=function(name,obj){return this[name.__value__.replace('@','i$')]=obj;};
  _.m$is_a_bool=function(klass){if(this.m$class()==klass||c$Object==klass){return true;};if(this.m$class().__modules__[klass]){return true;};if(this.m$class()==c$Object){return false;};var bubble=this.m$class(),result=false;while(bubble!=c$Object){if(klass==bubble||bubble.__modules__[klass]!=null){result=true;};if(result){break;};bubble=bubble.__superclass__;};return(result);};
  _.m$nil_bool=function(){return false;};
  _.m$send=function(sym){for(var l=arguments.length,i=1,args=[];i<l;++i){args.push(arguments[i]);};var str=sym.__value__.replace('=','_eql').replace('!','_bang').replace('?','_bool');sub={'==':'_eql2','===':'_eql3','=~':'_etld','[]':'_brac','[]=':'_breq','<=':'_lteq','>=':'_gteq','<<':'_ltlt','>>':'_gtgt','<':'_lthn','>':'_gthn','<=>':'_ltgt','|':'_pipe','&':'_ampe','+':'_plus','+@':'_posi','-@':'_nega','*':'_star','**':'_str2','/':'_slsh','%':'_perc','^':'_care','~':'_tild'};var method=this['m$'+(sub[str]||str)];if(!method){m$raise(c$NoMethodError,$q('undefined method "'+sym.__value__+'" for '+this));};return method.apply(this,args);};
  _.m$to_s=function(){return $q('#<'+this.m$class().__name__.replace(/\./g,'::')+':0x'+(this.__id__*999^4000000).toString(16)+'>');};
});

Red._class('Module',c$Object,function(){ var _=c$Module.prototype;
  var writer=$u;
  _.m$initialize=function(module_name,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;this.__name__=module_name.__value__||module_name;this.prototype={};};
  _.m$_ltgt=function(other_module){return nil;};
  _.m$_eql3=function(obj){return obj.m$is_a_bool(this);};
  _.m$append_features=function(mod){Red.donateMethodsToSingleton(this,mod);Red.donateMethodsToClass(this.prototype,mod.prototype);Red.donateConstantsToClass(this,mod);return(mod);};
  _.m$attr=function(attribute,writer){writer=$T($.fh=writer)?$.fh:false;var a=attribute.__value__;f1=this.prototype['m$'+a]=function(){return this['i$'+arguments.callee._name];};f1._name=a;if(writer){f2=this.prototype['m$'+a.__value__+'_eql']=function(x){return this['i$'+arguments.callee._name]=x;};f2._name=a;};return(nil);};
  _.m$attr_accessor=function(){for(var l=arguments.length,i=0,symbols=[];i<l;++i){symbols.push(arguments[i]);};for(var i=0,l=symbols.length;i<l;++i){
      var a=symbols[i].__value__;
      f1=this.prototype['m$'+a]=function(){return this['i$'+arguments.callee._name];};f1._name=a;
      f2=this.prototype['m$'+a+'_eql']=function(x){return this['i$'+arguments.callee._name]=x;};f2._name=a;
    };return(nil);};
  _.m$define_method=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;this.prototype['m$'+sym.__value__]=block.__block__.__unbound__;Red.updateChildren(this);Red.updateIncluders(this);return(block);};
  _.m$extend_object=function(obj){var tp=this.prototype;for(var x in tp){
      if(x.slice(0,2)=='m$'){
        var f=function(){var m=arguments.callee;return m.__methodSource__[m.__methodName__].apply(m.__methodReceiver__,arguments) };
        f.__methodName__=x;f.__methodSource__=tp;f.__methodReceiver__=obj;
        obj[x]=f;
      };
    };return(obj);};
  _.m$extended=function(object){return nil;};
  _.m$hash=function(){return 'c_'+this.m$to_s();};
  _.m$include=function(){for(var l=arguments.length,i=0,modules=[];i<l;++i){modules.push(arguments[i]);};for(var i=0,l=modules.length;i<l;++i){var mod=modules[i];mod.m$append_features(this);mod.m$included(this);mod.__includers__[this.__name__]=true;};return(this);};
  _.m$include_bool=function(other_module){return nil;};
  _.m$included=function(other_module){return nil;};
  _.m$to_s=function(){return $q(this.__name__.replace(/\./g,'::'));};
});

Red._class('Class',c$Module,function(){ var _=c$Class.prototype;
  var superclass=$u;
  c$Class.m$new=function(class_name,superclass){superclass=$T($.fi=superclass)?$.fi:c$Object;Red._class(class_name.__value__,superclass,function(){});return(window['c$'+class_name.__value__]);};
  _.m$allocate=function(){return new(this)();};
  _.m$inherited=function(subclass){return nil;};
  _.m$new=function(){var result=this.m$allocate();this.prototype.m$initialize.apply(result,arguments);return(result);};
  _.m$superclass=function(){return this.__superclass__;};
});
Red.initializeClass('Object',c$Object);c$Object.__children__={'Module':true};
Red.initializeClass('Module',c$Module);c$Module.__children__={'Class':true};
Red.initializeClass('Class',c$Class)
;

Red._module('Comparable',function(){ var _=c$Comparable.prototype;
  _.m$_eql2=function(obj){return (this.__id__&&obj.__id__&&this.__id__==obj.__id__)||this.m$_ltgt(obj)==0;};
});

Red._module('Enumerable',function(){ var _=c$Enumerable.prototype;
  var block=$u;
  ;
});

Red._module('Kernel',function(){ var _=c$Kernel.prototype;
  var num=$u;
  _.m$block_given_bool=function(x){return typeof(x)=='function';};
  _.m$lambda=function(func){var result=new(c$Proc)();result.__block__=func;result.__block__.__id__=Red.id++;return(result);};
  _.m$proc=function(func){var result=new(c$Proc)();result.__block__=func;result.__block__.__id__=Red.id++;return(result);};
  _.m$raise=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};var exception_class=c$RuntimeError,msg=$q('');if(arguments[0]&&arguments[0].m$is_a_bool(c$Exception)){
      var e=arguments[0];
    }else{
      if(arguments[0]&&arguments[0].m$class()==c$String){
        msg=arguments[0];
      }else{
        if(arguments[0]!=null){
          exception_class=arguments[0],msg=arguments[1]||msg;
        };
      }
    };var e=e||exception_class.m$new(msg);e.__stack__=new Error().stack;throw(e);return(nil);};
  _.m$sprintf=function(string){var i=1,source=string.__value__,result=[],m=$u,arg=$u,val=$u,str=$u,dL=$u,chr=$u,pad=$u;
    while(source){
      if(m=source.match(/^[^%]+/)){result.push(m[0]);source=source.slice(m[0].length);continue;};
      if(m=source.match(/^%%/))   {result.push('%'); source=source.slice(m[0].length);continue;};
      //                  1(0)2(wdth)      3(prec) 4(field-type      )
      if(m=source.match(/^%(0)?(\d+)?(?:\.(\d+))?([bcdEefGgiopsuXx])/)){
        arg = arguments[i].__value__||arguments[i];
        switch(m[4]){
          case'b':str=parseFloat(arg).toString(2);break;
          case'c':str=String.fromCharCode(arg);break;
          case'd':val=parseInt(arg);str=''+val;break;
          case'E':val=parseFloat(arg);str=''+(m[3]?val.toExponential(m[3]):val.toExponential()).toUpperCase();break;
          case'e':val=parseFloat(arg);str=''+(m[3]?val.toExponential(m[3]):val.toExponential());break;
          case'f':val=parseFloat(arg);str=''+(m[3]?val.toFixed(m[3]):val);break;
          case'G':str='-FIX-';break;
          case'g':str='-FIX-';break;
          case'i':val=parseInt(arg);str=''+val;break;
          case'o':str=parseFloat(arg).toString(8);break;
          case'p':str=$q(arg).m$inspect().__value__;break;
          case's':val=arg.m$to_s&&arg.m$to_s().__value__||arg;str=(m[3]?val.slice(0,m[2]):val);break;
          case'u':val=parseInt(arg);str=''+(val<0?'..'+(Math.pow(2,32)+val):val);break;
          case'X':str=parseInt(arg).toString(16).toUpperCase();break;
          case'x':str=parseInt(arg).toString(16);break;
        };
        if((dL=m[2]-str.length)!=0){for(chr=m[1]||' ',pad=[];dL>0;pad[--dL]=chr);}else{pad=[]};
        result.push(pad.join('')+str);
        source=source.slice(m[0].length);
        i+=1;
        continue;
      };
      throw('ArgumentError: malformed format string')
    };return($q(result.join('')));};
});(this.m$include||window.m$include).call(this,c$Kernel);

Red._module('Math',function(){ var _=c$Math.prototype;
  c$Math.c$E=2.71828182845905;
  c$Math.c$PI=3.14159265358979;
});

Red._class('Array',c$Object,function(){ var _=c$Array.prototype;
  var length=$u,index=$u,str=$u;
  _.m$_plus=function(ary){return this.concat(ary);};
  _.m$_subt=function(ary){for(var i=0,l=ary.length,result=[],seen=[];i<l;++i){var a=ary[i],k=a.m$hash();if(!seen[k]){seen[k]=true;};};;for(var i=0,l=this.length;i<l;++i){var a=this[i],k=a.m$hash();if(!seen[k]){result.push(a);};};return(result);};
  _.m$_ltlt=function(object){this[this.length]=object;return(this);};
  _.m$_ltgt=function(ary){for(var i=0,l=this.length;i<l;++i){if(ary[i]==null){break;};var x=this[i].m$_ltgt(ary[i]);if(x!==0){return x;};};return(this.length.m$_ltgt(ary.length));};
  _.m$_eql2=function(ary){if(ary.m$class()!==c$Array||ary.length!==this.length){return false;};for(var i=0,l=this.length;i<l;++i){if(!(this[i].m$_eql2(ary[i]))){return false;};};return(true);};
  _.m$_brac=function(index,length){length=$T($.fj=length)?$.fj:nil;var l=this.length;if(index.m$class()==c$Range){
      var start=index.__start__,end=index.__exclusive__?index.__end__-1:index.__end__;
      index=start<0?start+l:start;
      length=(end<0?end+l:end)-index+1;
      if(length<0){length=0};
    }else{
      if(index<0){index+=l;};
    };if(index>=l||index<0){return nil;};if($T(length)){
      if(length<=0){return [];};
      result=this.slice(index,index+length);
    }else{
      result=this[index];
    };return(result);};
  _.m$_breq=function(index,length,object){var l=this.length;if(object==null){object=length;length=$u;};if(index.m$class()==c$Range){var start=index.__start__,end=index.__exclusive__?index.__end__-1:index.__end__;index=start<0?start+l:start;length=(end<0?end+l:end)-index+1;if(length<0){length=0};}else{if(index<0){index+=l;};if(length<0){throw('IndexError: negative length')}};if(index<0){throw('RangeError: out of range');};while(this.length<index){this.push(nil);};if($T(length)){var l=this.length,final=(index+length>l)?l:index+length;this._replace(this.slice(0,index).concat(object===nil?[]:(object.m$class()==c$Array?object:[object])).concat(this.slice(final,l)))}else{this[index]=object};return(object);};
  _.m$clear=function(){this.length=0;return(this);};
  _.m$compact=function(){for(var i=0,l=this.length,result=[];i<l;++i){if(!(this[i]===nil)){result.push(this[i]);};};return(result);};
  _.m$delete=function(obj,_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;for(var i=0,l=this.length,temp=[];i<l;++i){if(!(this[i].m$_eql2(obj))){temp.push(this[i]);};};this._replace(temp);return(l===this.length?(m$block_given_bool(_block.__block__)?_block.m$call():nil):obj);};
  _.m$each=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;for(var i=0,l=this.length;i<l;++i){try{_block.m$call(this[i]);}catch(e){switch(e.__keyword__){case 'next':break;case 'break':return e.__return__;break;case 'redo':--i;break;default:throw(e);};};};return(this);};
  _.m$empty_bool=function(){return this.length==0;};
  _.m$flatten=function(){for(var i=0,l=this.length,result=[];i<l;++i){if(this[i].m$class()==c$Array){result=result.concat(this[i].m$flatten());}else{result.push(this[i]);};};return(result);};
  _.m$hash=function(){return nil;};
  _.m$include_bool=function(obj){for(var i=0,l=this.length;i<l;++i){if(this[i].m$_eql2(obj)){return true;};};return(false);};
  _.m$inspect=function(){for(var i=1,l=this.length,result='['+(this[0]!=null?this[0].m$inspect().__value__:'');i<l;++i){result+=', '+this[i].m$inspect().__value__;};return($q(result+']'));};
  _.m$join=function(str){str=$T($.fk=str)?$.fk:$q("");var result=this[0]!=null?this[0].m$join?this[0].m$join(str.__value__).__value__:this[0].m$to_s().__value__:'';for(var i=1,l=this.length;i<l;++i){result+=(str.__value__||'')+(this[i].m$join?this[i].m$join(str).__value__:this[i].m$to_s().__value__);};return($q(result));};
  _.m$length=function(){return this.length;};
  _.m$map=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;for(var i=0,l=this.length,result=[];i<l;++i){try{result[i]=_block.m$call(this[i]);}catch(e){switch(e.__keyword__){case 'next':result[i]=e.__return__;break;case 'break':return e.__return__;break;case 'redo':--i;break;default:throw(e);};};};return(result);};
  _.m$push=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};for(var i=0,l=args.length;i<l;++i){this.push(args[i]);};return(this);};
  _.m$shift=function(){if(this.length==0){return nil;};return this.shift();};
  _.m$size=function(){return this.length;};
  _.m$to_s=function(){return(this.m$join());};
  _._partition=function(first,last,pivot,block){var value=this[pivot],store=first;this._swap(pivot,last);for(var i=0,l=this.length;i<l;++i){if(i<first||i>=last){continue;};var cmp=block?block(this[i],value):this[i].m$_ltgt(value);if(cmp==-1||cmp==0){this._swap(store++,i);};};this._swap(last,store);return(store);};
  _._quick_sort=function(start,finish,block){if(finish-1>start){var pivot=start+Math.floor(Math.random()*(finish-start));pivot=this._partition(start,(finish-1),pivot,block);this._quick_sort(start,pivot,block);this._quick_sort((pivot+1),finish,block);};return(this);};
  _._replace=function(ary){this.length=0;for(var i=0,l=ary.length;i<l;++i){this.push(ary[i])};return this;};
  _._swap=function(x,y){var z=this[x];this[x]=this[y];this[y]=z;return this;};
});

Red._class('Exception',c$Object,function(){ var _=c$Exception.prototype;
  _.m$initialize=function(msg){if(msg!=null){this.__message__=msg.__value__;};};
  _.m$backtrace=function(){if(this.__stack__==null){return [];};for(var i=0,lines=this.__stack__.match(/@[^\n]+:\d+/g),l=lines.length,result=[];i<l;++i){result.push($q(lines[i].match(/@\w+:\/*(\/[^\n]+:\d+)/)[1]));};return(result);};
  _.m$inspect=function(){var class_name=this.m$class().__name__.replace(/\./g,'::');return this.__message__==''?$q(class_name):$q('#<'+class_name+': '+(this.__message__||class_name)+'>');};
  _.m$to_s=function(){return this.__message__==null?$q(this.m$class().__name__.replace(/\./g,'::')):$q(this.__message__);};
  _.m$to_str=function(){return this.__message__==null?$q(this.m$class().__name__.replace(/\./g,'::')):$q(this.__message__);};
});
c$Exception.prototype.toString=function(){var class_name=this.m$class().__name__.replace(/\./g,'::'),str=class_name+': '+(this.__message__||class_name);console.log(str+(this.__stack__!=null?'\n        from '+this.m$backtrace().join('\n        from '):''));return '#<'+str+'>';}
;

Red._class('StandardError',c$Exception,function(){ var _=c$StandardError.prototype;
  ;
});

Red._class('ArgumentError',c$StandardError,function(){ var _=c$ArgumentError.prototype;
  ;
});

Red._class('IndexError',c$StandardError,function(){ var _=c$IndexError.prototype;
  ;
});

Red._class('RangeError',c$StandardError,function(){ var _=c$RangeError.prototype;
  ;
});

Red._class('RuntimeError',c$StandardError,function(){ var _=c$RuntimeError.prototype;
  ;
});

Red._class('NameError',c$StandardError,function(){ var _=c$NameError.prototype;
  ;
});

Red._class('NoMethodError',c$NameError,function(){ var _=c$NoMethodError.prototype;
  ;
});

Red._class('TypeError',c$StandardError,function(){ var _=c$TypeError.prototype;
  ;
});

Red._class('FalseClass',c$Object,function(){ var _=c$FalseClass.prototype;
  _.m$hash=function(){return nil;};
  _.m$to_s=function(){return nil;};
});

Red._class('Hash',c$Object,function(){ var _=c$Hash.prototype;
  var key=$u;
  c$Hash.m$_brac=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};if(args.length==1&&args[0].m$class()==c$Hash){return args[0];};for(var i=0,l=args.length,result=c$Hash.m$new(),c=result.__contents__;i<l;i+=2){var k=args[i],v=args[i+1],h=k.m$hash();c[h]=[k,v]};return(result);};
  _.m$initialize=function(block){for(var l=arguments.length,bg=m$block_given_bool(arguments[l-1]),l=bg?l-1:l,i=0,args=[];i<l;++i){args.push(arguments[i]);};var block=(bg?c$Proc.m$new(arguments[arguments.length-1]):nil);this.__default__=(args[0]==null?block==null?nil:block:args[0]);this.__contents__={};};
  _.m$_eql2=function(other){var c=this.__contents__,o=other.__contents__;for(var x in o){if(x.slice(1,2)=='_'&&c[x]==null){return false;};};for(var x in c){if(x.slice(1,2)=='_'&&!c[x][1].m$_eql2(o[x][1])){return false;};};return(true);};
  _.m$_brac=function(k){var kv=this.__contents__[k.m$hash()];if(!kv){var d=this.__default__;return(typeof(d)=='function'?d(this,kv[0]):d);};return(kv[1]);};
  _.m$_breq=function(k,v){this.__contents__[k.m$hash()]=[k,v];return(v);};
  _.m$clear=function(){this.__contents__={};return(this);};
  _.m$delete=function(k,_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var c=this.__contents__,d=this.__default__,x=k.m$hash(),kv=c[x];if(kv!=null){var result=kv[1];delete(c[x]);return result;};return(typeof(_block)=='function'?_block.m$call(k):(typeof(d)=='function'?d(this,k):d));};
  _.m$each=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var c=this.__contents__;for(var x in c){try{if(x.slice(1,2)=='_'){var kv=c[x];_block.__arity__==1?_block.m$call([kv[0],kv[1]]):_block.m$call(kv[0],kv[1])};}catch(e){switch(e.__keyword__){case 'next':;break;case 'break':return e.__return__;break;default:throw(e);};};};return(this);};
  _.m$each_key=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var c=this.__contents__;for(var x in c){try{if(x.slice(1,2)=='_'){_block.m$call(c[x][0])};}catch(e){switch(e.__keyword__){case 'next':;break;case 'break':return e.__return__;break;default:throw(e);};};};return(this);};
  _.m$empty_bool=function(){for(var x in this.__contents__){if(x.slice(1,2)=='_'){return false;};};return(true);};
  _.m$hash=function(){return nil;};
  _.m$include_bool=function(k){return !!this.__contents__[k.m$hash()];};
  _.m$inspect=function(){var contents=[],c=this.__contents__;for(var x in c){if(x.slice(1,2)=='_'){var kv=c[x];contents.push(kv[0].m$inspect().__value__+' => '+kv[1].m$inspect().__value__);};};return($q('{'+contents.join(', ')+'}'));};
  _.m$length=function(){var c=this.__contents__,result=0;for(var x in c){if(x.slice(1,2)=='_'){result++;};};return(result);};
  _.m$merge=function(other,_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var c=this.__contents__,o=other.__contents__,result=c$Hash.m$new(),r=result.__contents__;for(var x in c){if(x.slice(1,2)=='_'){r[x]=c[x];};};for(var x in o){var ckv=c[x],okv=o[x];if(x.slice(1,2)=='_'){typeof(_block)=='function'&&ckv!=null?r[x]=[ckv[0],_block.m$call(ckv[0],ckv[1],okv[1])]:r[x]=okv;};};return(result);};
  _.m$shift=function(){var c=this.__contents__,d=this.__default__,result=typeof(d)=='function'?d(nil):d;for(var x in c){if(x.slice(1,2)=='_'){result=[c[x][0],c[x][1]];delete(c[x]);break;};};return(result);};
  _.m$size=function(){var c=this.__contents__,result=0;for(var x in c){if(x.slice(1,2)=='_'){result++;};};return(result);};
  _.m$store=function(k,v){this.__contents__[k.m$hash()]=[k,v];return(v);};
  _.m$to_s=function(){var c=this.__contents__,result=[];for(var x in c){if(x.slice(1,2)=='_'){result.push(c[x]);};};return(c$Array.prototype.m$join.call(result));};
  _.m$update=function(other,_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var c=this.__contents__,o=other.__contents__;for(var x in o){var ckv=c[x],okv=o[x];if(x.slice(1,2)=='_'){typeof(_block)=='function'&&ckv!=null?ckv[1]=_block.m$call(ckv[0],ckv[1],okv[1]):c[x]=okv;};};return(this);};
});

Red._class('MatchData',c$Object,function(){ var _=c$MatchData.prototype;
  _.m$initialize=function(){this.__captures__=[];};
  _.m$_brac=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};return c$Array.prototype.m$_brac.apply(this.__captures__,args);};
  _.m$length=function(){return this.__captures__.length;};
  _.m$inspect=function(){return c$Object.prototype.m$to_s.apply(this);};
  _.m$size=function(){return this.__captures__.length;};
  _.m$to_s=function(){return this.__captures__[0];};
});

Red._class('NilClass',c$Object,function(){ var _=c$NilClass.prototype;
  _.m$initialize=function(){this.__id__=4;};
  _.m$inspect=function(){return $q("nil");};
  _.m$nil_bool=function(){return true;};
  _.m$to_i=function(){return 0;};
  _.m$to_proc=function(){return nil;};
  _.m$to_s=function(){return $q("");};
  nil=c$NilClass.m$new();
  c$Object.__superclass__=nil;
});

Red._class('Numeric',c$Object,function(){ var _=c$Numeric.prototype;
  var base=$u;
  this.m$include(c$Comparable);
  _.m$_perc=function(n){return this%n;};
  _.m$_plus=function(n){return this+n;};
  _.m$_subt=function(n){return this-n;};
  _.m$_ltlt=function(n){return Math.floor(parseInt(this)*Math.pow(2,parseInt(n)));};
  _.m$_ltgt=function(n){if(n.constructor!=Number){return nil;};if(this>n){return 1;};if(this<n){return -1;};return(0);};
  _.m$_eql2=function(n){return this.valueOf()===n.valueOf();};
  _.m$_eql3=function(n){return this.valueOf()===n.valueOf();};
  _.m$_brac=function(n){var str=parseInt(this).toString(2);if(n>=str.length){return 0;};return parseInt(str[(str.length-n-1)]);};
  _.m$hash=function(){return 'n_'+this;};
  _.m$times=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;for(var i=0,l=this.valueOf();i<l;++i){try{_block.m$call(i);}catch(e){switch(e.__keyword__){case 'next':break;case 'break':return e.__return__;break;case 'redo':--i;break;default:throw(e);};}};return(this);};
  _.m$to_i=function(){return parseInt(this);};
  _.m$to_s=function(base){base=$T($.fl=base)?$.fl:10;return $q(this.toString(base));};
  _.m$to_sym=function(){return nil;};
});

Red._class('Proc',c$Object,function(){ var _=c$Proc.prototype;
  _.m$initialize=function(func){this.__block__=func;this.__block__.__id__=func.__id__||Red.id++;this.__id__=this.__block__.__id__;};
  _.m$_eql2=function(other){return this.__id__==other.__id__;};
  _.m$_brac=function(){return this.__block__.apply(this,arguments);};
  _.m$call=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};return this.__block__.apply(this,args);};
  _.m$to_proc=function(){return(this);};
});

Red._class('Range',c$Object,function(){ var _=c$Range.prototype;
  var exclusive=$u;
  _.m$initialize=function(start,finish,exclusive){exclusive=$T($.fm=exclusive)?$.fm:false;this.__start__=start;this.__end__=finish;this.__exclusive__=exclusive;};
  _.m$_eql2=function(object){if(object.constructor!==c$Range){return false;};return this.__start__.m$_eql2(object.__start__)&&this.__end__.m$_eql2(object.__end__)&&this.__exclusive__==object.__exclusive__;};
  _.m$_eql3=function(obj){var s=obj.m$_ltgt(this.__start__),e=obj.m$_ltgt(this.__end__);return s==0||s==1?(this.__exclusive__?e==-1:e==-1||e==0):false;};
  _.m$each=function(_block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),_block=bg?c$Proc.m$new(z):nil;var start=this.__start__,end=this.__end__;if(typeof(start)=='number'&&typeof(end)=='number'){if(!this.__exclusive__){end++;};for(var i=start;i<end;i++){try{_block.m$call(i);}catch(e){switch(e.__keyword__){case 'next':break;case 'break':return e.__return__;break;case 'redo':--i;break;default:throw(e);};};};};return(this);};
  _.m$hash=function(){return nil;};
  _.m$include_bool=function(obj){var s=obj.m$_ltgt(this.__start__),e=obj.m$_ltgt(this.__end__);return s==0||s==1?(this.__exclusive__?e==-1:e==-1||e==0):false;};
  _.m$inspect=function(){return $q(''+this.__start__.m$inspect()+(this.__exclusive__?'...':'..')+this.__end__.m$inspect());};
  _.m$to_s=function(){return $q(''+this.__start__+(this.__exclusive__?'...':'..')+this.__end__);};
});

Red._class('Regexp',c$Object,function(){ var _=c$Regexp.prototype;
  c$Regexp.c$IGNORECASE=1;
  c$Regexp.c$EXTENDED=2;
  c$Regexp.c$MULTILINE=4;
  c$Regexp.m$escape=function(str){return $q(str.__value__.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1'));};
  _.m$initialize=function(regexp,options){switch(options){case 0:this.__options__='';break;case 1:this.__options__='i';break;case 2:this.__options__='x';break;case 3:this.__options__='ix';break;case 4:this.__options__='s';break;case 5:this.__options__='si';break;case 6:this.__options__='sx';break;case 7:this.__options__='six';break;default:this.__options__=options?'i':'';};this.__source__=regexp.__value__||regexp;this.__value__=new(RegExp)(this.__source__,'m'+(/i/.test(this.__options__)?'i':''));};
  _.m$_eql2=function(rxp){return this.__source__===rxp.__source__&&this.__options__===rxp.__options__;};
  _.m$_eql3=function(string){var c=$u,result=c$MatchData.m$new();if(!$T(c=string.__value__.match(this.__value__))){return nil;};for(var i=0,l=c.length;i<l;++i){result.__captures__[i]=$q(c[i])};result.__string__=string.__value__;return(result);};
  _.m$hash=function(){return nil;};
  _.m$inspect=function(){return $q(''+this);};
  _.m$to_s=function(){var o=this.__options__.replace('s','m'),c=o.match(/(m)?(i)?(x)?/);return $q('(?'+o+(c[0]=='mix'?'':'-')+(c[1]?'':'m')+(c[2]?'':'i')+(c[3]?'':'x')+':'+this.__source__+')');};
});

Red._class('String',c$Object,function(){ var _=c$String.prototype;
  var string=$u,pattern=$u,limit=$u,base=$u;
  _.m$initialize=function(string){string=$T($.fn=string)?$.fn:'';this.__value__=string.__value__||string;};
  _.m$_perc=function(arg){arg.m$class()==c$Array?arg.unshift(this):arg=[this,arg];return m$sprintf.apply(null,arg);};
  _.m$_plus=function(str){return $q(this.__value__ + str.__value__);};
  _.m$_ltlt=function(obj){this.__value__+=(typeof(obj)=='number'?String.fromCharCode(obj):obj.__value__);return(this);};
  _.m$_ltgt=function(str){if(str.m$class()!=c$String){return nil;};var tv=this.__value__,sv=str.__value__;if(tv>sv){return 1;};if(tv==sv){return 0;};if(tv<sv){return -1;};return(nil);};
  _.m$_eql2=function(str){if(str.m$class()!=c$String){return false;};return(this.m$_ltgt(str)==0);};
  _.m$_brac=function(){return nil;};
  _.m$_breq=function(){return nil;};
  _.m$delete=function(){return nil;};
  _.m$each=function(){return nil;};
  _.m$empty_bool=function(){return this.__value__=='';};
  _.m$hash=function(){return 'q_'+this.__value__;};
  _.m$include_bool=function(obj){return new(RegExp)(typeof(obj)=='number'?String.fromCharCode(obj):obj.__value__.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1')).test(this.__value__);};
  _.m$inspect=function(){return $q('"'+this.__value__.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"');};
  _.m$length=function(){return this.__value__.length;};
  _.m$size=function(){return this.__value__.length;};
  _.m$split=function(pattern,limit){pattern=$T($.fo=pattern)?$.fo:$r('\\s+',0);limit=$T($.fp=limit)?$.fp:nil;var a=this.__value__.split(pattern.__value__),result=[];for(var i=0,l=a.length;i<l;++i){result.push($q(a[i]));};return(result);};
  _.m$to_i=function(base){base=$T($.fq=base)?$.fq:10;var result=parseInt(this,base);return(result.toString()=='NaN'?0:result);};
  _.m$to_s=function(){return(this);};
  _.m$to_str=function(){return(this);};
  _.m$to_sym=function(){return $s(this.__value__);};
  _.m$upcase=function(){return $q(this.__value__.toUpperCase());};
});

Red._class('Symbol',c$Object,function(){ var _=c$Symbol.prototype;
  _.m$initialize=function(value){this.__value__=value;c$Symbol.__table__[value]=this;};
  _.m$hash=function(){return 's_'+this.__value__;};
  _.m$inspect=function(){return $q(''+this);};
  _.m$to_i=function(){return this.__id__;};
  _.m$to_s=function(){return $q(this.__value__);};
  _.m$to_sym=function(){return(this);};
  c$Symbol.__table__=new(Object);
});

Red._class('Time',c$Object,function(){ var _=c$Time.prototype;
  _.m$initialize=function(){this.__value__=new(Date);};
  _.m$_plus=function(numeric){var t=c$Time.m$new();t.__value__=new(Date)(numeric*1000+this.__value__.valueOf());return(t);};
  _.m$_subt=function(time){return typeof(time)=='number'?new(Date)(this.__value__.valueOf()-(time*1000)):(this.__value__.valueOf()-time.__value__.valueOf())/1000;};
  _.m$_ltgt=function(time){var v=this.__value__.valueOf(),ms=typeof(time)=='number'?time*1000:time.__value__.valueOf();if(v<ms){return -1;};if(v==ms){return 0;};if(v>ms){return 1;};return(nil);};
  _.m$hash=function(){return 't_'+this.__value__.valueOf()/1000;};
  _.m$inspect=function(){return $q(''+this);};
  _.m$to_i=function(){return parseInt(this.__value__.valueOf()/1000);};
  _.m$to_s=function(){return $q(''+this.__value__);};
});

Red._class('TrueClass',c$Object,function(){ var _=c$TrueClass.prototype;
  _.m$_eql2=function(obj){return obj.valueOf&&obj.valueOf()===this.valueOf();};
  _.m$_eql3=function(obj){return obj.valueOf&&obj.valueOf()===this.valueOf();};
  _.m$hash=function(){return 'b_'+this.valueOf();};
  _.m$to_s=function(){return $q(''+this);};
});

c$NilClass.prototype.toString=function(){return 'nil';};
c$Range.prototype.toString=function(){return ''+this.__start__+(this.__exclusive__?'...':'..')+this.__end__;};
c$Regexp.prototype.toString=function(){return '/'+this.__source__+'/'+(/s/.test(this.__options__)?'m':'')+(/i/.test(this.__options__)?'i':'')+(/x/.test(this.__options__)?'x':'');};
c$String.prototype.toString=function(){return this.__value__;};
c$Symbol.prototype.toString=function(){var v=this.__value__,str=/\s/.test(v)?'"'+v+'"':v;return ':'+str ;};
c$Time.prototype.toString=function(){return ''+this.__value__;};



Red._module('Chainable',function(){ var _=c$Chainable.prototype;
  _.m$call_chain=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};this.i$chain=($T($.a=this.i$chain)?$.a:[]);if(!$T(this.i$chain.m$empty_bool())){return(this.i$chain.m$shift().__block__.apply(this,args));};return(false);};
  _.m$chain=function(block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;this.i$chain=($T($.b=this.i$chain)?$.b:[]);this.i$chain.m$_ltlt(block);return(this);};
  _.m$clear_chain=function(){this.i$chain=($T($.c=this.i$chain)?$.c:[]);this.i$chain.m$clear();return(this);};
});

Red._module('Browser',function(){ var _=c$Browser.prototype;
  var b = c$Browser;
  b.__platform__=(window.orientation==undefined ? (navigator.platform.match(/mac|win|linux/i)||['other'])[0].toLowerCase() : 'ipod');
  b.__xpath__=!!(document.evaluate);
  b.__air__=!!(window.runtime);
  b.__query__=!!(document.querySelector);
  if(window.opera){b.__engine__='presto';b.__version__=(arguments.callee.caller ? 960 : (document.getElementsByClassName ? 950 : 925));};
  if(window.ActiveXObject){b.__engine__='trident';b.__version__=(window.XMLHttpRequest ? 5 : 4);};
  if(!navigator.taintEnabled){b.__engine__='webkit';b.__version__=(b.__xpath__ ? (b.__query__ ? 525 : 420) : 419);};
  if(document.getBoxObjectFor!=undefined){b.__engine__='gecko';b.__version__=(document.getElementsByClassName ? 19 : 18);};
  c$Browser.m$engine=function(){return c$Hash.m$_brac($s("name"),$q(c$Browser.__engine__||'unknown'),$s("version"),c$Browser.__version__?c$Browser.__version__:0);};
  c$Browser.m$platform=function(){return $q(c$Browser.__platform__);};
  

Red._module('Browser.Features',function(){ var _=c$Browser.c$Features.prototype;
  _.m$xpath_bool=function(){return c$Browser.__xpath__;};
  _.m$air_bool=function(){return c$Browser.__air__;};
  _.m$query_bool=function(){return c$Browser.__query__;};
});
  

Red._module('Browser.Engine',function(){ var _=c$Browser.c$Engine.prototype;
  _.m$gecko_bool=function(version){return c$Browser.__engine__=='gecko'&&(version ? c$Browser.__version__==version : true);};
  _.m$presto_bool=function(version){return c$Browser.__engine__=='presto'&&(version ? c$Browser.__version__==version : true);};
  _.m$trident_bool=function(version){return c$Browser.__engine__=='trident'&&(version ? c$Browser.__version__==version : true);};
  _.m$webkit_bool=function(version){return c$Browser.__engine__=='webkit'&&(version ? c$Browser.__version__==version : true);};
});
});(this.m$include||window.m$include).call(this,c$Browser.c$Engine);(this.m$include||window.m$include).call(this,c$Browser.c$Features);
Array.fromCollection = function(collection){
  for (var i = 0, a = [], j = collection.length; i < j; i++){
     a.push($E(collection[i]))
   }
   return a
};
// used in several places where element/selector comparison is used
// tells whether an element matches another element or selector
Element.prototype.match = function(selector){
  if (!selector) return true;
  var tagid = Selectors.Utils.parseTagAndID(selector);
  var tag = tagid[0], id = tagid[1];
  if (!Selectors.Filters.byID(this, id) || !Selectors.Filters.byTag(this, tag)) return false;
  var parsed = Selectors.Utils.parseSelector(selector);
  return (parsed) ? Selectors.Utils.filter(this, parsed, {}) : true;
};

// Provides polymorphic access to getElementById to Elements as well as documents, both of which
// can be passed into Selectors.Utils.search as location for searching for subelements.
Element.prototype.getElementById = function(id, nocash){
  var el = this.ownerDocument.getElementById(id);
  if (!el) return null;
  for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
    if (!parent) return null;
  }
  return $E(el);
},

Element.Attributes = {
  Props: {'html': 'innerHTML', 'class': 'className', 'for': 'htmlFor', 'text': ((this.m$trident_bool||window.m$trident_bool).call(this)) ? 'innerText' : 'textContent'},
  Bools: ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'],
  Camels: ['value', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap']
};

Element.prototype.getProperty = function(attribute){
  var EA = Element.Attributes, key = EA.Props[attribute];
  var value = (key) ? this[key] : this.getAttribute(attribute, 2);
  return (EA.Bools[attribute]) ? !!value : (key) ? value : value || null;
},

String.prototype.contains = function(string, separator){
  return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
};

String.prototype.trim = function(){
  return this.replace(/^ +| +$/g, '');
};

var Selectors = {Cache: {nth: {}, parsed: {}}};

Selectors.RegExps = {
  id: (/#([\w-]+)/),
  tag: (/^(\w+|\*)/),
  quick: (/^(\w+|\*)$/),
  splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
  combined: (/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

Selectors.Utils = {
  // added to replace $uid
  // uses internal Red.id
  object_uid: function(item){
    return item.__id__||(item.__id__=Red.id++)
  },
  
  chk: function(item, uniques){
    if (!uniques) return true;
    var uid = Selectors.Utils.object_uid(item);
    if (!uniques[uid]) return uniques[uid] = true;
    return false;
  },
    
  parseNthArgument: function(argument){
    if (Selectors.Cache.nth[argument]) return Selectors.Cache.nth[argument];
    var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
    if (!parsed) return false;
    var inta = parseInt(parsed[1]);
    var a = (inta || inta === 0) ? inta : 1;
    var special = parsed[2] || false;
    var b = parseInt(parsed[3]) || 0;
    if (a != 0){
      b--;
      while (b < 1) b += a;
      while (b >= a) b -= a;
    } else {
      a = b;
      special = 'index';
    }
    switch (special){
      case 'n': parsed = {a: a, b: b, special: 'n'}; break;
      case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
      case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
      case 'first': parsed = {a: 0, special: 'index'}; break;
      case 'last': parsed = {special: 'last-child'}; break;
      case 'only': parsed = {special: 'only-child'}; break;
      default: parsed = {a: (a - 1), special: 'index'};
    }
    
    return Selectors.Cache.nth[argument] = parsed;
  },
  
  parseSelector: function(selector){
    if (Selectors.Cache.parsed[selector]) return Selectors.Cache.parsed[selector];
    var m, parsed = {classes: [], pseudos: [], attributes: []};
    while ((m = Selectors.RegExps.combined.exec(selector))){
      var cn = m[1], an = m[2], ao = m[3], av = m[5], pn = m[6], pa = m[7];
      if (cn){
        parsed.classes.push(cn);
      } else if (pn){
        var parser = Selectors.Pseudo[pn];
        
        if (parser) parsed.pseudos.push({parser: parser, argument: pa});
        else parsed.attributes.push({name: pn, operator: '=', value: pa});
      } else if (an){
        parsed.attributes.push({name: an, operator: ao, value: av});
      }
    }
    if (!parsed.classes.length) delete parsed.classes;
    if (!parsed.attributes.length) delete parsed.attributes;
    if (!parsed.pseudos.length) delete parsed.pseudos;
    if (!parsed.classes && !parsed.attributes && !parsed.pseudos) parsed = null;
    return Selectors.Cache.parsed[selector] = parsed;
  },
  
  parseTagAndID: function(selector){
    var tag = selector.match(Selectors.RegExps.tag);
    var id = selector.match(Selectors.RegExps.id);
    return [(tag) ? tag[1] : '*', (id) ? id[1] : false];
  },
  
  filter: function(item, parsed, local){
    var i;
    if (parsed.classes){
      for (i = parsed.classes.length; i--; i){
        var cn = parsed.classes[i];
        if (!Selectors.Filters.byClass(item, cn)) return false;
      }
    }
    if (parsed.attributes){
      for (i = parsed.attributes.length; i--; i){
        var att = parsed.attributes[i];
        if (!Selectors.Filters.byAttribute(item, att.name, att.operator, att.value)) return false;
      }
    }
    if (parsed.pseudos){
      for (i = parsed.pseudos.length; i--; i){
        var psd = parsed.pseudos[i];
        if (!Selectors.Filters.byPseudo(item, psd.parser, psd.argument, local)) return false;
      }
    }
    return true;
  },
  
  getByTagAndID: function(ctx, tag, id){
    if (id){
      var item = (ctx.getElementById) ? ctx.getElementById(id, true) : Element.getElementById(ctx, id, true);
      return (item && Selectors.Filters.byTag(item, tag)) ? [item] : [];
    } else {
      return ctx.getElementsByTagName(tag);
    }
  },
  
  search: function(self, expression, local){
    var splitters = [];
    
    var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
      splitters.push(m1);
      return ':)' + m2;
    }).split(':)');
    
    
    var items, filtered, item;
    for (var i = 0, l = selectors.length; i < l; i++){
      var selector = selectors[i];
      
      if (i == 0 && Selectors.RegExps.quick.test(selector)){
        items = self.getElementsByTagName(selector);
        continue;
      }
            
      var splitter = splitters[i - 1];
      
      var tagid = Selectors.Utils.parseTagAndID(selector);
      var tag = tagid[0], id = tagid[1];
      if (i == 0){
        items = Selectors.Utils.getByTagAndID(self, tag, id);
      } else {
        var uniques = {}, found = [];
        for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
        items = found;
      }
            
      var parsed = Selectors.Utils.parseSelector(selector);
      if (parsed){
        filtered = [];
        for (var m = 0, n = items.length; m < n; m++){
          item = items[m];
          if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
        }
        items = filtered;
      }
      
    }
    return items;
    
  }
  
};

Selectors.Getters = {
  
  ' ': function(found, self, tag, id, uniques){
    var items = Selectors.Utils.getByTagAndID(self, tag, id);
    for (var i = 0, l = items.length; i < l; i++){
      var item = items[i];
      if (Selectors.Utils.chk(item, uniques)) found.push(item);
    }
    return found;
  },
  
  '>': function(found, self, tag, id, uniques){
    var children = Selectors.Utils.getByTagAndID(self, tag, id);
    for (var i = 0, l = children.length; i < l; i++){
      var child = children[i];
      if (child.parentNode == self && Selectors.Utils.chk(child, uniques)) found.push(child);
    }
    return found;
  },
  
  '+': function(found, self, tag, id, uniques){
    while ((self = self.nextSibling)){
      if (self.nodeType == 1){
        if (Selectors.Utils.chk(self, uniques) && Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
        break;
      }
    }
    return found;
  },
  
  '~': function(found, self, tag, id, uniques){
    
    while ((self = self.nextSibling)){
      if (self.nodeType == 1){
        if (!Selectors.Utils.chk(self, uniques)) break;
        if (Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
      } 
    }
    return found;
  }
  
};

Selectors.Filters = {
  
  byTag: function(self, tag){
    return (tag == '*' || (self.tagName && self.tagName.toLowerCase() == tag));
  },
  
  byID: function(self, id){
    return (!id || (self.id && self.id == id));
  },
  
  byClass: function(self, klass){
    return (self.className && self.className.contains(klass, ' '));
  },
  
  byPseudo: function(self, parser, argument, local){
    return parser.call(self, argument, local);
  },
  
  byAttribute: function(self, name, operator, value){
    var result = Element.prototype.getProperty.call(self, name);
    if (!result) return false;
    if (!operator || value == undefined) return true;
    switch (operator){
      case '=': return (result == value);
      case '*=': return (result.contains(value));
      case '^=': return (result.substr(0, value.length) == value);
      case '$=': return (result.substr(result.length - value.length) == value);
      case '!=': return (result != value);
      case '~=': return result.contains(value, ' ');
      case '|=': return result.contains(value, '-');
    }
    return false;
  }
  
};

Selectors.Pseudo = {
  
  // w3c pseudo selectors
  
  empty: function(){
    return !(this.innerText || this.textContent || '').length;
  },
  
  not: function(selector){
    return !Element.match(this, selector);
  },
  
  contains: function(text){
    return (this.innerText || this.textContent || '').contains(text);
  },
  
  'first-child': function(){
    return Selectors.Pseudo.index.call(this, 0);
  },
  
  'last-child': function(){
    var element = this;
    while ((element = element.nextSibling)){
      if (element.nodeType == 1) return false;
    }
    return true;
  },
  
  'only-child': function(){
    var prev = this;
    while ((prev = prev.previousSibling)){
      if (prev.nodeType == 1) return false;
    }
    var next = this;
    while ((next = next.nextSibling)){
      if (next.nodeType == 1) return false;
    }
    return true;
  },
  
  'nth-child': function(argument, local){
    argument = (argument == undefined) ? 'n' : argument;
    var parsed = Selectors.Utils.parseNthArgument(argument);
    if (parsed.special != 'n') return Selectors.Pseudo[parsed.special].call(this, parsed.a, local);
    var count = 0;
    local.positions = local.positions || {};
    var uid = Selectors.Utils.object_uid(this);
    if (!local.positions[uid]){
      var self = this;
      while ((self = self.previousSibling)){        
        if (self.nodeType != 1) continue;
        count ++;
        var position = local.positions[Selectors.Utils.object_uid(self)];
        if (position != undefined){
          count = position + count;
          break;
        }
      }
      local.positions[uid] = count;
    }
    return (local.positions[uid] % parsed.a == parsed.b);
  },
  
  // custom pseudo selectors
  
  index: function(index){
    var element = this, count = 0;
    while ((element = element.previousSibling)){
      if (element.nodeType == 1 && ++count > index) return false;
    }
    return (count == index);
  },
  
  even: function(argument, local){
    return Selectors.Pseudo['nth-child'].call(this, '2n+1', local);
  },

  odd: function(argument, local){
    return Selectors.Pseudo['nth-child'].call(this, '2n', local);
  }
  
};
;function $v(event){
  var doc=$u,result=$u,type=$u,target=$u,code=$u,key=$u,f_key=$u,wheel=$u,right_click=$u,page=$u,client=$u,related_target=$u;
  event = event || window.event;
  doc = document;
  if(!event){return nil;};
  result=c$Event.m$new(null);
  type = event.type;
  target = event.target || event.srcElement;
  while(target&&target.nodeType==3){target=event.parentNode;};
  if(/key/.test(type)){
    code=event.which || event.keyCode;
    key=c$Event.c$KEYS.m$_brac(code);
    if(type=='keydown'){f_key=code-111;if(f_key>0&&f_key<13){key=$s('f'+f_key);};};
    key=$T(key)?key:$s(String.fromCharCode(code).toLowerCase());
  }else{
    if(type.match(/(click|mouse|menu)/i)){
      doc=(!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
      wheel=(type.match(/DOMMouseScroll|mousewheel/) ? (event.wheelDelta ? event.wheelDelta/40 : -(event.detail||0)) : nil);
      right_click=event.which==3||event.button==2;
      page={x:(event.pageX || event.clientX + doc.scrollLeft),y:(event.pageY || event.clientY + doc.scrollTop)};
      client={x:(event.pageX ? event.pageX - window.pageXOffset : event.clientX),y:(event.pageY ? event.pageY - window.pageYOffset : event.clientY)};
      if(type.match(/over|out/)){
        switch(type){
          case 'mouseover':related_target=event.relatedTarget || event.fromElement;break;
          case 'mouseout':related_target=event.relatedTarget || event.toElement;break;
        };
        if(window.m$gecko_bool()){
          try{while(related_target&&related_target.nodeType==3){related_target=related_target.parentNode;};}catch(e){related_target=false;};
        }else{while(related_target&&related_target.nodeType==3){related_target.parentNode;};};
      };
    };
  };
  result.__native__=event;result.__code__=code;result.__key__=key;result.__type__=type;result.__target__=target;result.__wheel__=wheel;result.__right_click__=right_click;result.__related_target__=related_target;
  result.__page__=page||{x:nil,y:nil};result.__client__=client||{x:nil,y:nil};
  result.__shift__=event.shiftKey;result.__ctrl__=event.ctrlKey;result.__alt__=event.altKey;result.__meta__=event.metaKey;
  return result;
};

Red._class('Event',c$Object,function(){ var _=c$Event.prototype;
  c$Event.c$KEYS=c$Hash.m$_brac(8,$s("backspace"),9,$s("tab"),13,$s("enter"),27,$s("esc"),32,$s("space"),37,$s("left"),38,$s("up"),39,$s("right"),40,$s("down"),46,$s("delete"));
  

Red._class('Event.NewEventError',c$Exception,function(){ var _=c$Event.c$NewEventError.prototype;
  ;
});
  _.m$initialize=function(raise_error){if(!$T(raise_error === null)){(this.m$raise||window.m$raise).call(this,c$Event.c$NewEventError,$q("Events can only be initialized by user interactions with the browser"));};};
  _.m$alt_bool=function(){return this.__alt__;};
  _.m$base_type=function(){return $s(this.__type__);};
  _.m$client=function(){return c$Hash.m$_brac($s("x"),this.__client__.x,$s("y"),this.__client__.y);};
  _.m$code=function(){return this.__code__ || nil;};
  _.m$ctrl_bool=function(){return this.__ctrl__;};
  _.m$key=function(){return this.__key__ || nil;};
  _.m$kill_bang=function(){return this.m$stop_propagation().m$prevent_default();};
  _.m$meta_bool=function(){return this.__meta__;};
  _.m$page=function(){return c$Hash.m$_brac($s("x"),this.__page__.x,$s("y"),this.__page__.y);};
  _.m$prevent_default=function(){var native_event = this.__native__;native_event.preventDefault?native_event.preventDefault():native_event.returnValue=false;return(this);};
  _.m$right_click_bool=function(){return this.__right_click__;};
  _.m$shift_bool=function(){return this.__shift__;};
  _.m$stop_propagation=function(){var native_event = this.__native__;native_event.stopPropagation?native_event.stopPropagation():native_event.cancelBubble=true;return(this);};
  _.m$target=function(){return $E(this.__target__);};
  _.m$wheel=function(){return this.__wheel__;};
});

Red._module('UserEvents',function(){ var _=c$UserEvents.prototype;
  var hash=$u,type=$u,events=$u,custom=$u,condition=$u,real_type=$u,listener=$u,native_event=$u;
  c$UserEvents.mousecheck=function(element,event){
    var related=event.__related_target__,el=element.__native__;
    if(related===nil||related==undefined){return true;};
    if(related===false){return false;};
    return((el!==document)&&(related!=el)&&(related.prefix!='xul')&&!(el.contains?el.contains(related):!!(el.compareDocumentPosition(el)&16)))
  };
  c$UserEvents.c$NATIVE_EVENTS=c$Hash.m$_brac($s("click"),2,$s("dblclick"),2,$s("mouseup"),2,$s("mousedown"),2,$s("contextmenu"),2,$s("mousewheel"),2,$s("DOMMouseScroll"),2,$s("mouseover"),2,$s("mouseout"),2,$s("mousemove"),2,$s("selectstart"),2,$s("selectend"),2,$s("keydown"),2,$s("keypress"),2,$s("keyup"),2,$s("focus"),2,$s("blur"),2,$s("change"),2,$s("reset"),2,$s("select"),2,$s("submit"),2,$s("load"),1,$s("unload"),1,$s("beforeunload"),1,$s("resize"),1,$s("move"),1,$s("DOMContentLoaded"),1,$s("readystatechange"),1,$s("error"),1,$s("abort"),1,$s("scroll"),1);
  c$UserEvents.c$DEFINED_EVENTS=c$Hash.m$_brac($s("mouse_enter"),c$Hash.m$_brac($s("base"),$q("mouseover"),$s("condition"),(this.m$proc||window.m$proc).call(this,c$UserEvents.mousecheck)),$s("mouse_leave"),c$Hash.m$_brac($s("base"),$q("mouseout"),$s("condition"),(this.m$proc||window.m$proc).call(this,c$UserEvents.mousecheck)),$s("mouse_wheel"),c$Hash.m$_brac($s("base"),($T((this.m$gecko_bool||window.m$gecko_bool).call(this))?$q("DOMMouseScroll"):$q("mousewheel"))));
  c$UserEvents.m$define=function(sym,hash){hash=$T($.d=hash)?$.d:c$Hash.m$_brac();c$UserEvents.c$DEFINED_EVENTS.m$_breq(sym.m$to_sym(),hash);return(true);};
  c$UserEvents.m$included=function(base){return ($T(base.m$_eql2(c$Element))?nil:(this.m$raise||window.m$raise).call(this,c$TypeError,$q("only class Element and the singleton objects Window and Document may include UserEvents; use CodeEvents instead")));};
  c$UserEvents.m$extended=function(base){return ($T([c$Document,c$Window].m$include_bool(base))?nil:(this.m$raise||window.m$raise).call(this,c$TypeError,$q("only Document and Window may be extended with UserEvents; use CodeEvents instead")));};
  _.m$listen=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var type=$u,events=$u,custom=$u,condition=$u,real_type=$u,listener=$u,native_event=$u;type=sym.m$to_sym();events=this.i$events=($T($.f=this.i$events)?$.f:c$Hash.m$_brac());events.m$_breq(type,($T($.h=events.m$_brac(type))?$.h:c$Hash.m$_brac()));if($T(events.m$_brac(type).m$_brac(block))){return(this);};custom=c$UserEvents.c$DEFINED_EVENTS.m$_brac(type);condition=block;real_type=type;if($T(custom)){if($T(custom.m$_brac($s("on_listen")))){custom.m$_brac($s("on_listen")).m$call(this,block);};if($T(custom.m$_brac($s("condition")))){condition=(this.m$lambda||window.m$lambda).call(this,function(element,event){return ($T(custom.m$_brac($s("condition")).m$call(element,event))?block.m$call(element,event):true);}.m$(this));};real_type=($T($.m=custom.m$_brac($s("base")))?$.m:real_type).m$to_sym();};listener=(this.m$lambda||window.m$lambda).call(this,function(){return block.m$call(this,nil);}.m$(this));native_event=c$UserEvents.c$NATIVE_EVENTS.m$_brac(real_type);if($T(native_event)){if($T(native_event.m$_eql2(2))){listener=(this.m$lambda||window.m$lambda).call(this,function(native_event){event=$v(native_event);return ($T(condition.m$call(this,event).m$_eql2(false))?event.m$kill_bang():nil);}.m$(this));};this.m$add_listener(real_type,listener.m$to_proc().__block__);};events.m$_brac(type).m$_breq(block,listener);return(this);};
  _.m$add_listener=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var el=this.__native__,type=sym.__value__,fn=block.__block__;if(type==='unload'){var old=fn,that=this;fn=function(){that.m$remove_listener($q('unload'),fn);old();};}else{var collected = {};collected[this.__id__]=this};if(el.addEventListener){el.addEventListener(type,fn,false);}else{el.attachEvent('on'+type,fn);};return(this);};
  _.m$unlisten=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var type=$u,events=$u,listener=$u,custom=$u;type=sym.m$to_sym();events=this.i$events;if(!$T((($.x=$T(events))?(($.z=$T($.y=(($.u=$T(events.m$_brac(type)))?(($.w=$T($.v=events.m$_brac(type).m$_brac(block)))?$.v:$.w):$.u)))?$.y:$.z):$.x))){return(this);};listener=events.m$_brac(type).m$delete(block);custom=c$UserEvents.c$DEFINED_EVENTS.m$_brac(type);if($T(custom)){if($T(custom.m$_brac($s("on_unlisten")))){custom.m$_brac($s("on_unlisten")).m$call(this,block);};type=($T($.ac=custom.m$_brac($s("base")))?$.ac:type).m$to_sym();};if($T(c$UserEvents.c$NATIVE_EVENTS.m$_brac(type))){this.m$remove_listener(type,listener.m$to_proc().__block__);};return(this);};
  _.m$remove_listener=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var el=this.__native__,type=sym.__value__,fn=block.__block__;if(this.removeEventListener){this.removeEventListener(type,fn,false);}else{this.detachEvent('on'+type,fn);};return(this);};
});

Red._module('Window',function(){ var _=c$Window.prototype;
  this.__native__ = window;
  c$Window.m$window=function(){return c$Window;};
  c$Window.m$document=function(){return c$Document;};
});

Red._module('Document',function(){ var _=c$Document.prototype;
  document.head=document.getElementsByTagName('head')[0];
  document.html=document.getElementsByTagName('html')[0];
  document.window=(document.defaultView||document.parentWindow);
  c$Document.__native__= document;
  c$Document.m$_brac=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};if($T(args.m$length().m$_eql2(1))){if(!$T(args.m$_brac(0))){return(nil);};return(c$Document.m$find_by_string(args.m$_brac(0)));}else{args.m$map(function(str){return c$Document.m$_brac(str);}.m$(this)).m$compact();};};
  c$Document.m$body=function(){return $E(document.body);};
  c$Document.m$execute_js=function(str){if($T(str.m$_eql2($q("")))){return(str);};if($T(window.execScript)){window.execScript(str.__value__);}else{scriptElement = document.createElement('script');scriptElement.setAttribute('type','text/javascript');scriptElement.text = str;document.head.appendChild(scriptElement);document.head.removeChild(scriptElement);};return(str);};
  c$Document.m$head=function(){return $E(document.head);};
  c$Document.m$html=function(){return $E(document.html);};
  c$Document.m$ready_bool=function(block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;this.i$proc=block;document.addEventListener('DOMContentLoaded', function(){document.__loaded__=true;this.i$proc.m$call();}.m$(this), false);return(nil);};
  c$Document.m$title=function(){return $q(document.title);};
  c$Document.m$find_all_by_selector=function(selector){return Array.fromCollection(Selectors.Utils.search(document, selector.__value__, {}));;};
  c$Document.m$find_by_id=function(str){return $E(document.getElementById(str.__value__));};
  c$Document.m$find_by_string=function(str){return ($T(str.__value__.match(/^#[a-zA-z_]*$/))?c$Document.m$find_by_id($q(str.__value__.replace('#',''))):c$Document.m$find_all_by_selector(str));};
  c$Document.m$find_many_with_array=function(ary){for(var i=0,l=ary.length,result=[];i<l;++i){var el=c$Document.m$_brac(ary[i]);if($T(el)){result.push(el);};};return(result.m$flatten());};
  c$Document.m$walk=function(element,path,startRelation,matchSelector,all){if(startRelation){startRelation = startRelation.__value__;};
    var el = element.__native__[startRelation || path.__value__],elements = [];
    while (el){
      if (el.nodeType == 1 && (!$T(matchSelector) || Element.match(el, matchSelector))){
        if (!all) {return $E(el);}
        elements.push($E(el));
      }
      el = el[path.__value__];
    };return((all) ? elements : nil);};
  c$Document.m$window=function(){return c$Window;};
  c$Document.m$document=function(){return c$Document;};
});

Red._class('Cookie',c$Object,function(){ var _=c$Cookie.prototype;
  var options=$u,value=$u;
  c$Cookie.c$OPTIONS=c$Hash.m$_brac($s("duration"),nil,$s("domain"),nil,$s("path"),nil,$s("secure"),false,$s("document"),c$Document);
  (this.m$attr_accessor||window.m$attr_accessor).call(this,$s("key"),$s("value"),$s("duration"),$s("domain"),$s("path"),$s("secure"),$s("document"));
  _.m$initialize=function(key,value,options){options=$T($.ae=options)?$.ae:c$Hash.m$_brac();this.m$key_eql(key);this.m$update(value,c$Cookie.c$OPTIONS.m$merge(options));};
  c$Cookie.m$read=function(key){var value=$u;value=c$Cookie.c$OPTIONS.m$_brac($s("document")).__native__.cookie.match('(?:^|;)\s*' + c$Regexp.m$escape(key).__value__ + '=([^;]*)');return(($T(value)?$q(decodeURIComponent(value[1])):nil));};
  c$Cookie.m$store=function(cookie){var str = cookie.m$key().__value__ + '=' + encodeURIComponent(cookie.m$value().__value__);if($T(cookie.m$domain())){str += '; domain=' + cookie.m$domain().__value__;};if($T(cookie.m$path())){str += '; path='   + cookie.m$path().__value__;};if($T(cookie.m$duration())){date = new Date();date.setTime(date.getTime() + cookie.m$duration() * 86400000);str += '; expires=' + date.toGMTString();};if($T(cookie.m$secure())){str += '; secure';};cookie.m$document().__native__.cookie = str;return(cookie);};
  _.m$destroy=function(){return this.m$update($q(""),c$Hash.m$_brac($s("duration"),-1));};
  _.m$inspect=function(){return $Q("#<Cookie: @key=",this.m$key().m$inspect()," @value=",this.m$value().m$inspect(),">");};
  _.m$update=function(value,options){options=$T($.ag=options)?$.ag:c$Hash.m$_brac();this.m$value_eql(value);options.m$each(function(k,v){return this.m$send($Q("",k,"="),v);}.m$(this));return c$Cookie.m$store(this);};
});false;

Red._module('CodeEvents',function(){ var _=c$CodeEvents.prototype;
  var name=$u,events_group=$u;
  _.m$fire=function(sym,delay){for(var l=arguments.length,i=2,args=[];i<l;++i){args.push(arguments[i]);};var name=$u,events_group=$u;name=sym.m$to_sym();if(!$T((($.aj=$T(this.i$code_events))?(($.al=$T($.ak=events_group=this.i$code_events.m$_brac(name)))?$.ak:$.al):$.aj))){return(this);};events_group.m$each(function(proc){var f=function(){return proc.__block__.apply(null,args);};if(delay){return setTimeout(f,delay);};return f();}.m$(this));return(this);};
  _.m$ignore=function(sym,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var name=$u,events_group=$u;if($T(sym)){name=sym.m$to_sym();if(!$T((($.ao=$T(this.i$code_events))?(($.aq=$T($.ap=events_group=this.i$code_events.m$_brac(name)))?$.ap:$.aq):$.ao))){return(this);};if($T(block)){if(!$T(block.__block__.__unignorable__)){events_group.m$delete(block);};}else{events_group.m$each(function(proc){return this.m$ignore(name,proc.m$to_proc().__block__);}.m$(this));};}else{this.i$code_events.m$each_key(function(name){return this.m$ignore(name);}.m$(this));};return(this);};
  _.m$upon=function(sym_or_hash,unignorable,block){var z=arguments[arguments.length-1],bg=m$block_given_bool(z),block=bg?c$Proc.m$new(z):nil;var name=$u;if($T(sym_or_hash.m$instance_of_bool(c$Hash))){sym_or_hash.m$each(function(name,proc){return this.m$upon(name,proc.m$to_proc().__block__);}.m$(this));return(this);}else{name=sym_or_hash.m$to_sym();this.i$code_events=($T($.at=this.i$code_events)?$.at:c$Hash.m$_brac());this.i$code_events.m$_breq(name,($T($.au=this.i$code_events.m$_brac(name))?$.au:[]));this.i$code_events.m$_brac(name).m$_ltlt(block);block.__block__.__unignorable__=typeof(unignorable)=='function'?false:unignorable;return(this);};};
});

Red._class('Request',c$Object,function(){ var _=c$Request.prototype;
  var options=$u,xhr=$u,method=$u,data=$u,url=$u,format=$u,_method=$u,encoding=$u,separator=$u,evaluate=$u,scripts=$u,result=$u,base=$u,query_string=$u;
  (this.m$include||window.m$include).call(this,c$CodeEvents);
  (this.m$include||window.m$include).call(this,c$Chainable);
  c$Request.c$METHODS=[$q("GET"),$q("POST"),$q("PUT"),$q("DELETE")];
  c$Request.c$OPTIONS=c$Hash.m$_brac($s("url"),$q(""),$s("data"),c$Hash.m$_brac(),$s("link"),$q("ignore"),$s("async"),true,$s("format"),nil,$s("method"),$q("post"),$s("encoding"),$q("utf-8"),$s("is_success"),nil,$s("emulation"),true,$s("url_encoded"),true,$s("eval_scripts"),false,$s("eval_response"),false,$s("headers"),c$Hash.m$_brac($q("X-Requested-With"),$q("XMLHttpRequest"),$q("Accept"),$q("text/javascript, text/html, application/xml, text/xml, */*")));
  

Red._class('Request.Response',c$Object,function(){ var _=c$Request.c$Response.prototype;
  (this.m$attr||window.m$attr).call(this,$s("text"),$s("xml"));
  _.m$initialize=function(text,xml){this.i$text=text;this.i$xml=xml;};
});
  _.m$initialize=function(options){options=$T($.av=options)?$.av:c$Hash.m$_brac();this.__xhr__ = typeof(ActiveXObject)=='undefined' ? new XMLHttpRequest : new ActiveXObject('MSXML2.XMLHTTP');this.i$options=c$Request.c$OPTIONS.m$merge(options);this.i$options.m$_brac($s("headers")).__xhr__=this.__xhr__;this.i$options.m$_brac($s("headers")).m$_brac=function(name){return this.__xhr__.getResponseHeader(name);};};
  _.m$cancel=function(){var xhr=$u;if(!$T(this.i$running)){return(this);};this.i$running=false;xhr=this.__xhr__;xhr.abort;xhr.onreadystatechange=function(){;};this.__xhr__=typeof(ActiveXObject)=='undefined' ? new XMLHttpRequest : new ActiveXObject('MSXML2.XMLHTTP');this.m$fire($s("cancel"));return(this);};
  _.m$check=function(block){for(var l=arguments.length,bg=m$block_given_bool(arguments[l-1]),l=bg?l-1:l,i=0,args=[];i<l;++i){args.push(arguments[i]);};var block=(bg?c$Proc.m$new(arguments[arguments.length-1]):nil);if(!$T(this.i$running)){return(true);};var _switch=(this.i$options.m$_brac($s("link")));if($q("cancel").m$_eql3(_switch)){this.m$cancel();return(true);}else{if($q("chain").m$_eql3(_switch)){return(false);}else{;};};return(false);};
  _.m$execute=function(options){options=$T($.ax=options)?$.ax:c$Hash.m$_brac();var method=$u,xhr=$u,data=$u,url=$u,format=$u,_method=$u,encoding=$u,separator=$u;options=this.i$options.m$update(options);if(!$T([c$String].m$include_bool(options.m$_brac($s("url")).m$class()))){(this.m$raise||window.m$raise).call(this,c$TypeError,$q("can't convert %s to a String").m$_perc(options.m$_brac($s("url")).m$inspect()));};if(!$T([c$String,c$Symbol].m$include_bool(options.m$_brac($s("method")).m$class()))){(this.m$raise||window.m$raise).call(this,c$TypeError,$q("can't convert %s to a String").m$_perc(options.m$_brac($s("method")).m$inspect()));};if(!$T([c$Hash].m$include_bool(options.m$_brac($s("data")).m$class()))){(this.m$raise||window.m$raise).call(this,c$TypeError,$q("can't convert %s to a Hash").m$_perc(options.m$_brac($s("data")).m$inspect()));};if(!$T(c$Request.c$METHODS.m$include_bool(method=options.m$_brac($s("method")).m$to_s().m$upcase()))){(this.m$raise||window.m$raise).call(this,c$Request.c$HttpMethodError,$q("invalid HTTP method \"%s\" for %s").m$_perc([options.m$_brac($s("method")),this]));};this.i$running=true;xhr=this.__xhr__;data=options.m$_brac($s("data")).m$to_query_string();url=options.m$_brac($s("url"));if($T(options.m$_brac($s("format")))){format=$q("format=%s").m$_perc(options.m$_brac($s("format")));data=($T(data.m$empty_bool())?format:[format,data].m$join($q("&")));};if($T((($.bf=$T(options.m$_brac($s("emulation"))))?(($.bh=$T($.bg=[$q("PUT"),$q("DELETE")].m$include_bool(method)))?$.bg:$.bh):$.bf))){_method=$q("_method=%s").m$_perc(method);data=($T(data.m$empty_bool())?_method:[_method,data].m$join($q("&")));method=$q("POST");};if($T((($.bl=$T(options.m$_brac($s("url_encoded"))))?(($.bn=$T($.bm=method.m$_eql2($q("POST"))))?$.bm:$.bn):$.bl))){encoding=($T(options.m$_brac($s("encoding")))?$q("; charset=%s").m$_perc(options.m$_brac($s("encoding"))):$q(""));this.m$headers().m$_breq($q("Content-type"),$q("application/x-www-form-urlencoded").m$_plus(encoding));};if($T((($.bp=$T(data))?(($.br=$T($.bq=method.m$_eql2($q("GET"))))?$.bq:$.br):$.bp))){separator=($T(url.m$include_bool($q("?")))?$q("&"):$q("?"));url=[url,data].m$join(separator);data=nil;};xhr.open(method.__value__, url.__value__, options.m$_brac($s("async")));xhr.onreadystatechange = this.m$on_state_change().__block__;options.m$_brac($s("headers")).m$each(function(k,v){return xhr.setRequestHeader(k.__value__,v.__value__);}.m$(this));this.m$fire($s("request"));xhr.send($T(data)?data.__value__:'');if(!$T(options.m$_brac($s("async")))){this.m$on_state_change().m$call();};return(this);};
  _.m$headers=function(){return this.i$options.m$_brac($s("headers"));};
  _.m$on_state_change=function(){return c$Proc.m$new(function(){var xhr=this.__xhr__;if(xhr.readyState!=4||!this.i$running){return nil;};this.i$running=false;this.i$status=0;try{this.i$status=xhr.status}catch(e){;};if($T(this.m$success_bool())){this.i$response=c$Request.c$Response.m$new(this.m$process_scripts($q(xhr.responseText)),xhr.responseXML);this.m$fire($s("response"),0,this.i$response).m$fire($s("success"),0,this.i$response).m$call_chain();}else{this.i$response=c$Request.c$Response.m$new(nil,nil);this.m$fire($s("response"),0,this.i$response).m$fire($s("failure"),0,this.i$xhr);};xhr.onreadystatechange=function(){;};return(nil);}.m$(this));};
  _.m$process_scripts=function(str){if($T(($T($.bv=this.i$options.m$_brac($s("eval_response")))?$.bv:/(ecma|java)script/.test(this.__xhr__.getResponseHeader('Content-Type'))))){return(c$Document.m$execute_js(str));};return(str.m$strip_scripts(this.i$options.m$_brac($s("eval_scripts"))));};
  _.m$success_bool=function(){return this.i$status>=200&&this.i$status<300;};
  

Red._class('Request.HeaderError',c$StandardError,function(){ var _=c$Request.c$HeaderError.prototype;
  ;
});
  

Red._class('Request.HttpMethodError',c$StandardError,function(){ var _=c$Request.c$HttpMethodError.prototype;
  ;
});
  

Red._class('String',c$Object,function(){ var _=c$String.prototype;
  var evaluate=$u,scripts=$u,result=$u;
  _.m$strip_scripts=function(evaluate){evaluate=$T($.bw=evaluate)?$.bw:false;var scripts=$u,result=$u;scripts=$q("");result=$q(this.__value__.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(){scripts.__value__+=arguments[1]+'\n';return '';}));if($T(evaluate)){c$Document.m$execute_js(scripts);};return(result);};
});
  

Red._class('Hash',c$Object,function(){ var _=c$Hash.prototype;
  var base=$u,query_string=$u;
  _.m$to_query_string=function(base){base=$T($.bz=base)?$.bz:$q("");var query_string=$u;query_string=[];this.m$each(function(k,v){if($T(v.m$nil_bool())){Red.LoopError._next();};k=($T(base.m$empty_bool())?k.m$to_s():$q("%s[%s]").m$_perc([base,k]));var _switch=(v);if(c$Hash.m$_eql3(_switch)){result=v.m$to_query_string(k);}else{if(c$Array.m$_eql3(_switch)){qs=c$Hash.m$_brac();for(var i=0,l=v.length;i<l;i++){qs.m$_breq((this.m$i||window.m$i).call(this),v.m$_brac((this.m$i||window.m$i).call(this)))};result=qs.m$to_query_string(k);}else{result=$q("%s=%s").m$_perc([k,$q(encodeURIComponent(v))]);};};return query_string.m$push(result);}.m$(this));return(query_string.m$join($q("&")));};
});
  

Red._class('Request.HTML',c$Object,function(){ var _=c$Request.c$HTML.prototype;
  ;
});
  

Red._class('Request.JSON',c$Object,function(){ var _=c$Request.c$JSON.prototype;
  ;
});
});false;false;false;false;

Red._class('Element',c$Object,function(){ var _=c$Element.prototype;
  var novisibility=$u,native_element=$u;
  c$Element.__keyed_attributes__={'class':'className','for':'htmlFor'};
  c$Element.__boolean_attributes__={checked:'checked',declare:'declare',defer:'defer',disabled:'disabled',ismap:'ismap',multiple:'multiple',noresize:'noresize',noshade:'noshade',readonly:'readonly',selected:'selected'};
  _.m$add_class=function(sym){if(!this.m$has_class_bool(sym)){var el=this.__native__,c=el.className,s=sym.__value__;el.className=(c.length>0)?c+' '+s:s;};return(this);};
  _.m$add_classes=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};args.m$each(function(x){return this.m$add_class(x);}.m$(this));return(this);};
  _.m$class=function(){return $q(this.__native__.className);};
  _.m$class_eql=function(str){this.__native__.className=str.__value__;return(str);};
  _.m$classes=function(){return this.i$class_list=($T($.cg=this.i$class_list)?$.cg:c$Element.c$Classes.m$new(this));};
  _.m$classes_eql=function(ary){for(var result=[],i=0,l=ary.length;i<l;++i){result.push(ary[i].__value__);};this.__native__.className=result.join(' ');return(ary);};
  _.m$clear_styles=function(){this.__native__.style.cssText='';return(this);};
  _.m$get_property=function(attribute){var el=this.__native__,attr=attribute.__value__,key=c$Element.__keyed_attributes__[attr],bool=c$Element.__boolean_attributes__[attr];var value=key||bool?el[key||bool]:el.getAttribute(attr,2);return(bool ? !!value : (value==null) ? nil : $q(value));};
  _.m$get_style=function(attribute){var el=this.__native__,attr=attribute.__value__.replace(/[_-]\D/g, function(match){return match.charAt(1).toUpperCase();}),result=el.style[attr];return result===undefined?nil:$q(result);};
  _.m$has_class_bool=function(sym){var str=' '+this.__native__.className+' ',match=' '+sym.__value__+' ';return str.indexOf(match) > -1;};
  _.m$html=function(){return $q(this.__native__.innerHTML);};
  _.m$html_eql=function(str){this.__native__.innerHTML=str.__value__;return(str);};
  _.m$id=function(){return $q(this.__native__.id||nil);};
  _.m$properties=function(){return this.i$properties=($T($.ch=this.i$properties)?$.ch:c$Element.c$Properties.m$new(this));};
  _.m$remove_class=function(sym){var el=this.__native__,klass=sym.__value__;el.className=el.className.replace(new(RegExp)('(^|\\s)'+klass+'(?:\\s|$)'),'$1');return(this);};
  _.m$remove_classes=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};args.m$each(function(x){return this.m$remove_class(x);}.m$(this));return(this);};
  _.m$remove_property=function(attribute){var el=this.__native__,attr=attribute.__value__,bool=c$Element.__boolean_attributes__[attr],key=c$Element.__boolean_attributes__[attr]||bool;key ? el[key]=bool?false:'' : el.removeAttribute(attr);return(this);};
  _.m$remove_properties=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};args.m$each(function(x){return this.m$remove_property(x);}.m$(this));return(this);};
  _.m$remove_style=function(attribute){var attr=attribute.__value__.replace(/[_-]\D/g, function(match){return match.charAt(1).toUpperCase();});this.__native__.style[attr]=null;return(this);};
  _.m$remove_styles=function(){for(var l=arguments.length,i=0,args=[];i<l;++i){args.push(arguments[i]);};args.m$each(function(x){return this.m$remove_style(x);}.m$(this));return(this);};
  _.m$set_opacity=function(opacity,novisibility){novisibility=$T($.ci=novisibility)?$.ci:true;var native_element=$u;native_element=this.__native__;if(!$T(novisibility)){if($T(opacity.m$_eql2(0))){if(native_element.style.visibility != 'hidden'){native_element.style.visibility = 'hidden';};}else{if(native_element.style.visibility != 'visible'){native_element.style.visibility = 'visible';};};};if(!$T(native_element.currentStyle && native_element.currentStyle.hasLayout)){native_element.style.zoom = 1;};if($T((this.m$trident_bool||window.m$trident_bool).call(this))){native_element.style.filter = (opacity == 1) ? '' : 'alpha(opacity='+opacity * 100+')';};native_element.style.opacity = opacity;this.__opacity__ = opacity;return(this);};
  _.m$set_property=function(attribute,value){var el=this.__native__,attr=attribute.__value__,bool=c$Element.__boolean_attributes__[attr],key=c$Element.__boolean_attributes__[attr]||bool;key ? el[key]=bool?$T(value):value : el.setAttribute(attr,''+value);return(this);};
  _.m$set_properties=function(hash){hash.m$each(function(k,v){return this.m$set_property(k,v);}.m$(this));return(this);};
  _.m$set_style=function(attribute,value){var attr=attribute.__value__.replace(/[_-]\D/g, function(match){return match.charAt(1).toUpperCase();}),val=value.__value__||value;if(attr == 'opacity'){return this.m$set_opacity(value);};if(attr==='float'){val=(this.m$trident_bool||window.m$trident_bool).call(this)?'styleFloat':'cssFloat'};if(val===String(Number(val))){val=Math.round(val)};this.__native__.style[attr]=val;return(this);};
  _.m$set_styles=function(hash){hash.m$each(function(k,v){return this.m$set_style(k,v);}.m$(this));return(this);};
  _.m$style=function(){return $q(this.__native__.style.cssText);};
  _.m$style_eql=function(str){this.__native__.style.cssText=str.__value__;return(str);};
  _.m$styles=function(){return this.i$styles=($T($.ck=this.i$styles)?$.ck:c$Element.c$Styles.m$new(this));};
  _.m$text=function(){return $q((this.m$trident_bool||window.m$trident_bool).call(this) ? this.__native__.innerText : this.__native__.textContent);};
  _.m$text_eql=function(str){if($T((this.m$trident_bool||window.m$trident_bool).call(this))){this.__native__.innerText=str.__value__;}else{this.__native__.textContent=str.__value__;};return(str);};
  _.m$toggle_class=function(sym){if($T(this.m$has_class_bool(sym))){this.m$remove_class(sym);}else{this.m$add_class(sym);};return(this);};
  

Red._class('Element.Classes',c$Object,function(){ var _=c$Element.c$Classes.prototype;
  _.m$initialize=function(element){this.i$element=element;};
  _.m$_ltlt=function(sym){c$Element.prototype.m$add_class.call(this.i$element,sym);return(this);};
  _.m$include_bool=function(sym){return c$Element.prototype.m$has_class_bool.call(this.i$element,sym);};
  _.m$toggle=function(sym){c$Element.prototype.m$toggle_class.call(this.i$element,sym);return(this.i$element);};
});
  

Red._class('Element.Properties',c$Object,function(){ var _=c$Element.c$Properties.prototype;
  _.m$initialize=function(element){this.i$element=element;};
  _.m$_brac=function(attribute){return c$Element.prototype.m$get_property.call(this.i$element,attribute);};
  _.m$_breq=function(attribute,value){return c$Element.prototype.m$set_property.call(this.i$element,attribute,value);};
  _.m$delete=function(attribute){return c$Element.prototype.m$remove_property.call(this.i$element,attribute);};
  _.m$set_bool=function(attribute){return $T(c$Element.prototype.m$get_property.call(this.i$element,attribute));};
  _.m$update=function(hash){c$Element.prototype.m$set_properties.call(this.i$element,hash);return(this);};
});
  

Red._class('Element.Styles',c$Object,function(){ var _=c$Element.c$Styles.prototype;
  _.m$initialize=function(element){this.i$element=element;};
  _.m$_brac=function(attribute){return c$Element.prototype.m$get_style.call(this.i$element,attribute);};
  _.m$_breq=function(attribute,value){return c$Element.prototype.m$set_style.call(this.i$element,attribute,value);};
  _.m$clear=function(){return c$Element.prototype.m$clear_styles.call(this.i$element);};
  _.m$delete=function(attribute){return c$Element.prototype.m$remove_style.call(this.i$element,attribute);};
  _.m$set_bool=function(attribute){return $T(c$Element.prototype.m$get_style.call(this.i$element,attribute));};
  _.m$update=function(hash){c$Element.prototype.m$set_styles.call(this.i$element,hash);return(this);};
});
});

Red._class('Element',c$Object,function(){ var _=c$Element.prototype;
  var attributes=$u,expression=$u,items=$u,match_selector=$u,where=$u;
  window.$E=function(element){if(element==null){return nil;};var E=c$Element.m$new(null);E.__native__=element;return E;};
  (this.m$include||window.m$include).call(this,c$UserEvents);
  (this.m$include||window.m$include).call(this,c$CodeEvents);
  c$Element.m$destroy=function(elem){var el = elem.__native__ || elem;c$Element.m$empty(el);c$Element.m$remove(el);return(true);};
  c$Element.m$empty=function(elem){for (var c=(elem.__native__||elem).childNodes,i=c.length;i>0;){c$Element.m$destroy(c[--i]);};;return(true);};
  c$Element.m$remove=function(elem){var el = elem.__native__ || elem;return (el.parentNode) ? el.parentNode.removeChild(el) : this;};
  _.m$initialize=function(tag,attributes){attributes=$T($.cl=attributes)?$.cl:c$Hash.m$_brac();if(!tag){return nil;};this.__native__ = document.createElement(tag.__value__);this.m$set_properties(attributes);};
  _.m$_eql2=function(elem){return this.__native__ === elem.__native__;};
  _.m$_eql3=function(elem){return this.__native__ === elem.__native__;};
  _.m$_brac=function(expression){for(var l=arguments.length,i=1,args=[];i<l;++i){args.push(arguments[i]);};var items=$u;if (expression.__value__.match(/^#[a-zA-z_]*$/) && args.m$empty_bool()){return this.__native__.getElementById(expression.__value__.replace('#',''));};expression=expression.m$split($q(","));items=[];for (var i = 0, l = expression.length, local = {}; i < l; i++){
      var selector = expression[i].__value__, elements = Selectors.Utils.search(this.__native__, selector, local);
      elements = Array.fromCollection(elements);
      items = (i == 0) ? elements : items.concat(elements);     
    };return(items);};
  _.m$children=function(match_selector){match_selector=$T($.co=match_selector)?$.co:nil;return c$Document.m$walk(this,$q("nextSibling"),$q("firstChild"),match_selector,true);};
  _.m$destroy_bang=function(){c$Element.m$destroy(this);return(true);};
  _.m$document=function(){return this.__native__.ownerDocument;};
  _.m$empty_bang=function(){c$Element.m$empty(this);return(this);};
  _.m$eql_bool=function(elem){return this.__native__ === elem.__native__;};
  _.m$first_child=function(match_selector){match_selector=$T($.cp=match_selector)?$.cp:nil;return c$Document.m$walk(this,$q("nextSibling"),$q("firstChild"),match_selector,false);};
  _.m$insert=function(element,where){where=$T($.cq=where)?$.cq:$s("bottom");this.m$send($Q("insert_",where.m$to_s()),element);return(this);};
  _.m$insert_after=function(element){if (!element.parentNode) return;next = this.__native__.nextSibling;(next) ? this.__native__.parentNode.insertBefore(element.__native__, next) : this__native__.parentNode.appendChild(element.__native__);return(true);};
  _.m$insert_before=function(element){if (this.__native__.parentNode) this.__native__.parentNode.insertBefore(element.__native__, this.__native__);return(true);};
  _.m$insert_bottom=function(element){this.__native__.appendChild(element.__native__);return(true);};
  _.m$insert_inside=_.m$insert_bottom;
  _.m$insert_top=function(element){first = this.__native__.firstChild;(first) ? this.__native__.insertBefore(element.__native__, first) : this.__native__.appendChild(element.__native__);return(true);};
  _.m$inspect=function(){var attributes=$u;attributes=[$q(this.__native__.tagName.toUpperCase())];if($T(this.__native__.id!=='')){attributes.m$_ltlt($q('id="'+this.__native__.id+'"'));};if($T(this.__native__.className!=='')){attributes.m$_ltlt($q('class="'+this.__native__.className+'"'));};return $q("#<Element: %s>").m$_perc(attributes.m$join($q(" ")));};
  _.m$is_body_bool=function(){return (/^(?:body|html)$/i).test(this.__native__.tagName);};
  _.m$last_child=function(match_selector){match_selector=$T($.cs=match_selector)?$.cs:nil;return c$Document.m$walk(this,$q("previousSibling"),$q("lastChild"),match_selector,false);};
  _.m$next_element=function(match_selector){match_selector=$T($.ct=match_selector)?$.ct:nil;return c$Document.m$walk(this,$q("nextSibling"),nil,match_selector,false);};
  _.m$next_elements=function(match_selector){match_selector=$T($.cu=match_selector)?$.cu:nil;return c$Document.m$walk(this,$q("nextSibling"),nil,match_selector,true);};
  _.m$parent=function(match_selector){match_selector=$T($.cv=match_selector)?$.cv:nil;return c$Document.m$walk(this,$q("parentNode"),nil,match_selector,false);};
  _.m$parents=function(match_selector){match_selector=$T($.cw=match_selector)?$.cw:nil;return c$Document.m$walk(this,$q("parentNode"),nil,match_selector,true);};
  _.m$previous_element=function(match_selector){match_selector=$T($.cx=match_selector)?$.cx:nil;return c$Document.m$walk(this,$q("previousSibling"),nil,match_selector,false);};
  _.m$previous_elements=function(match_selector){match_selector=$T($.cy=match_selector)?$.cy:nil;return c$Document.m$walk(this,$q("previousSibling"),nil,match_selector,true);};
  _.m$remove_bang=function(){c$Element.m$remove(this);return(this);};
  _.m$to_s=function(){return nil;};
});false;

Red._module('Situated',function(){ var _=c$Situated.prototype;
  var native_element=$u,element=$u,x=$u,y=$u,u=$u,relative_to=$u,offset=$u,scroll=$u,relative_position=$u,left=$u,top=$u,win=$u,doc=$u,min=$u;
  window.styleString=function(el,prop){if(el.currentStyle){return el.currentStyle[prop.replace(/[_-]\D/g, function(match){return match.charAt(1).toUpperCase();})];};var computed=document.defaultView.getComputedStyle(el,null);return(computed?computed.getPropertyValue([prop.replace(/[A-Z]/g, function(match){return('-'+match.charAt(0).toLowerCase());})]):null);};
  

Red._module('Situated.PositionAndSize',function(){ var _=c$Situated.c$PositionAndSize.prototype;
  _.m$height=function(){return this.m$size().m$_brac($s("y"));};
  _.m$left=function(){return this.m$position().m$_brac($s("x"));};
  _.m$scroll_height=function(){return this.m$scroll_size().m$_brac($s("y"));};
  _.m$scroll_left=function(){return this.m$scroll().m$_brac($s("x"));};
  _.m$scroll_top=function(){return this.m$scroll().m$_brac($s("y"));};
  _.m$scroll_width=function(){return this.m$scroll_size().m$_brac($s("x"));};
  _.m$top=function(){return this.m$position().m$_brac($s("y"));};
  _.m$width=function(){return this.m$size().m$_brac($s("x"));};
});
  

Red._module('Situated.Element',function(){ var _=c$Situated.c$Element.prototype;
  var native_element=$u,element=$u,x=$u,y=$u,u=$u,relative_to=$u,offset=$u,scroll=$u,relative_position=$u,left=$u,top=$u;
  (this.m$include||window.m$include).call(this,c$Situated.c$PositionAndSize);
  _.m$offset_parent=function(){var native_element=$u,element=$u;if($T(this.m$is_body_bool())){return(nil);};native_element=this.__native__;if(!$T((this.m$trident_bool||window.m$trident_bool).call(this))){return($E(native_element.offsetParent));};while($T((($.db=$T(element=$E(native_element.parentNode)))?(($.dd=$T($.dc=!$T(element.m$is_body_bool())))?$.dc:$.dd):$.db))){if(!$T(element.m$styles().m$_brac($s("position")).m$_eql2($q("static")))){return(element);};};return(nil);};
  _.m$offsets=function(){var native_element=$u,x=$u,y=$u,u=$u,element=$u;native_element=this.__native__;if($T((this.m$trident_bool||window.m$trident_bool).call(this))){var bound=native_element.getBoundingClientRect(),html=this.m$document().__native__.documentElement;return(c$Hash.m$_brac($s("x"),bound.left+html.scrollLeft-html.clientLeft,$s("y"),bound.top+html.scrollTop-html.clientTop));};if($T(this.m$is_body_bool())){return(c$Hash.m$_brac($s("x"),0,$s("y"),0));};x=0;y=0;u=c$Situated.c$Utilities;element=native_element;while (element && !u.m$is_body_bool(element)){
        x+=element.offsetLeft;y+=element.offsetTop;
        if (m$gecko_bool()){
          if (!u.m$border_box(element)){x+=u.m$left_border(element);y+=u.m$top_border(element);};
          var parent = element.parentNode;
          if (parent && window.styleString(parent, 'overflow') != 'visible'){ x += u.m$left_border(parent); y += u.m$top_border(parent); };
        } else { if (element != this && m$webkit_bool()){ x += u.m$left_border(element); y += u.m$top_border(element); }; };
        element = element.offsetParent;
      };if($T((($.dj=$T((this.m$gecko_bool||window.m$gecko_bool).call(this)))?(($.dl=$T($.dk=!$T(u.m$border_box(native_element))))?$.dk:$.dl):$.dj))){x=x.m$_subt(u.m$left_border(native_element));y=y.m$_subt(u.m$top_border(native_element));};return(c$Hash.m$_brac($s("x"),x,$s("y"),y));};
  _.m$position=function(relative_to){relative_to=$T($.dp=relative_to)?$.dp:nil;var offset=$u,scroll=$u,relative_position=$u,x=$u,y=$u;if($T(this.m$is_body_bool())){return(c$Hash.m$_brac($s("x"),0,$s("y"),0));};offset=this.m$offsets();scroll=this.m$scrolls();relative_position=($T(relative_to)?relative_to.m$position():c$Hash.m$_brac($s("x"),0,$s("y"),0));x=offset.m$_brac($s("x")).m$_subt(scroll.m$_brac($s("x"))).m$_subt(relative_position.m$_brac($s("x")));y=offset.m$_brac($s("y")).m$_subt(scroll.m$_brac($s("y"))).m$_subt(relative_position.m$_brac($s("y")));return(c$Hash.m$_brac($s("x"),x,$s("y"),y));};
  _.m$position_at=function(x,y){var u=$u,native_element=$u,left=$u,top=$u;u=c$Situated.c$Utilities;native_element=this.__native__;left=x.m$_subt(u.m$styleNumber(native_element,'margin-left'));top=y.m$_subt(u.m$styleNumber(native_element,'margin-top'));return this.m$set_styles(c$Hash.m$_brac($s("left"),left,$s("top"),top,$s("position"),$q("absolute")));};
  _.m$scroll=function(){if($T(this.m$is_body_bool())){return(this.m$window().m$scroll());};var elem = this.__native__;return c$Hash.m$_brac($s("x"),elem.scrollLeft,$s("y"),elem.scrollTop);};
  _.m$scroll_size=function(){var native_element=$u;if($T(this.m$is_body_bool())){return(this.m$window().m$scroll_size());};native_element=this.__native__;return c$Hash.m$_brac($s("x"),native_element.scrollWidth,$s("y"),native_element.scrollHeight);};
  _.m$scroll_to=function(x,y){var native_element=$u;if($T(this.m$is_body_bool())){this.m$window().m$scroll_to(x,y);}else{native_element=this.__native__;native_element.scrollLeft = x;native_element.scrollTop  = y;};return(this);};
  _.m$scrolls=function(){var native_element=$u,x=$u,y=$u;native_element=this.__native__;x=0;y=0;while (native_element && !c$Situated.c$Utilities.m$is_body_bool(native_element)){x+=native_element.scrollLeft;y+=native_element.scrollTop;native_element=native_element.parentNode;};return c$Hash.m$_brac($s("x"),x,$s("y"),y);};
  _.m$size=function(){var native_element=$u;if($T(this.m$is_body_bool())){return(this.m$window().m$size());};native_element=this.__native__;return c$Hash.m$_brac($s("x"),native_element.offsetWidth,$s("y"),native_element.offsetHeight);};
});
  

Red._module('Situated.Viewport',function(){ var _=c$Situated.c$Viewport.prototype;
  var win=$u,doc=$u,min=$u;
  (this.m$include||window.m$include).call(this,c$Situated.c$PositionAndSize);
  _.m$position=function(){return c$Hash.m$_brac($s("x"),0,$s("y"),0);};
  _.m$scroll=function(){var win=$u,doc=$u;win=this.m$window().__native__;doc=c$Situated.c$Utilities.m$native_compat_element(this).__native__;return c$Hash.m$_brac($s("x"),win.pageXOffset||doc.scrollLeft,$s("y"),win.pageYOffset||doc.scrollTop);};
  _.m$scroll_size=function(){var doc=$u,min=$u;doc=c$Situated.c$Utilities.m$native_compat_element(this).__native__;min=this.m$size();return c$Hash.m$_brac($s("x"),Math.max(doc.scrollWidth, min.m$_brac($s("x"))),$s("y"),Math.max(doc.scrollHeight,min.m$_brac($s("y"))));};
  _.m$size=function(){var win=$u,doc=$u;if($T(($T($.ej=(this.m$presto_bool||window.m$presto_bool).call(this))?$.ej:(this.m$webkit_bool||window.m$webkit_bool).call(this)))){win=this.m$window().__native__;if($T(($T($.el=(this.m$presto_bool||window.m$presto_bool).call(this))?$.el:(this.m$webkit_bool||window.m$webkit_bool).call(this)))){return(c$Hash.m$_brac($s("x"),win.innerWidth,$s("y"),win.innerHeight));};}else{doc=c$Situated.c$Utilities.m$native_compat_element(this).__native__;return(c$Hash.m$_brac($s("x"),doc.clientWidth,$s("y"),doc.clientHeight));};};
});
  

Red._module('Situated.Utilities',function(){ var _=c$Situated.c$Utilities.prototype;
  c$Situated.c$Utilities.m$is_body_bool=function(element){return (/^(?:body|html)$/i).test(element.tagName);};
  c$Situated.c$Utilities.m$styleNumber=function(native_element,style){return parseInt(window.styleString(native_element, style)) || 0;};
  c$Situated.c$Utilities.m$border_box=function(element){return window.styleString(element, '-moz-box-sizing') == 'border-box';};
  c$Situated.c$Utilities.m$top_border=function(element){return c$Situated.c$Utilities.m$styleNumber(element, 'border-top-width');};
  c$Situated.c$Utilities.m$left_border=function(element){return c$Situated.c$Utilities.m$styleNumber(element, 'border-left-width');};
  c$Situated.c$Utilities.m$native_compat_element=function(element){var doc = element.m$document().__native__;return $E((!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body);};
});
});

Red._class('Element',c$Object,function(){ var _=c$Element.prototype;
  (this.m$include||window.m$include).call(this,c$Situated.c$Element);
});c$Document.m$extend(c$Situated.c$Viewport);c$Window.m$extend(c$Situated.c$Viewport);false;

Red._class('Transform',c$Object,function(){ var _=c$Transform.prototype;
  var options=$u,wait=$u,rgb=$u;
  (this.m$include||window.m$include).call(this,c$CodeEvents);
  c$Transform.c$OPTIONS=c$Hash.m$_brac($s("fps"),50,$s("unit"),false,$s("duration"),500,$s("link"),$q("ignore"));
  c$Transform.c$DURATIONS=c$Hash.m$_brac($s("short"),250,$s("normal"),500,$s("long"),1000);
  c$Transform.c$ALGORITHMS=c$Hash.m$_brac($q("linear"),function(p){return -(Math.cos(Math.PI * p) - 1) / 2;});
  c$Transform.m$add_transition=function(name,func){c$Transform.c$ALGORITHMS.m$_breq(name,func);c$Transform.c$ALGORITHMS.m$_breq($Q("",name,":in"),function(pos){return func(pos, params);});c$Transform.c$ALGORITHMS.m$_breq($Q("",name,":out"),function(pos){return 1 - func(1 - pos, params);});return c$Transform.c$ALGORITHMS.m$_breq($Q("",name,":in:out"),function(pos){return (pos <= 0.5) ? func(2 * pos, params) / 2 : (2 - func(2 * (1 - pos), params)) / 2;});};
  _.m$transition=function(transition){for(var l=arguments.length,i=1,args=[];i<l;++i){args.push(arguments[i]);};return c$Transform.c$ALGORITHMS.m$_brac(transition)(args);};
  $clear = function(timer){clearTimeout(timer);clearInterval(timer);return nil;};;
  Function.prototype.create = function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			return returns();
		};
	};
  Function.prototype.periodical = function(periodical, bind, args){
		return this.create({bind: bind, arguments: args, periodical: periodical})();
	};;
  c$Transform.m$compute=function(from,to,delta){return (to - from) * delta + from;};
  _.m$initialize=function(options){options=$T($.en=options)?$.en:c$Hash.m$_brac();var wait=$u;this.i$subject=($T($.eo=this.i$subject)?$.eo:this);this.i$options=c$Transform.c$OPTIONS.m$merge(options);this.i$options.m$_breq($s("duration"),($T($.ep=c$Transform.c$DURATIONS.m$_brac(this.i$options.m$_brac($s("duration"))))?$.ep:this.i$options.m$_brac($s("duration")).m$to_i()));wait=this.i$options.m$_brac($s("wait"));if($T(wait.m$_eql3(false))){this.i$options.m$_breq($s("link"),$q("cancel"));};};
  _.m$step=function(){
    var time = +new Date
		if (time < this.__time__ + this.i$options.m$_brac($s("duration"))){
			var delta = this.__transition__((time - this.__time__) / this.i$options.m$_brac($s("duration")));
			this.m$set(this.m$compute(this.__from__, this.__to__, delta));
		} else {
			this.m$set(this.m$compute(this.__from__, this.__to__, 1));
			this.m$complete();
		}
		;return(nil);};
  _.m$set_transition=function(){return this.__transition__ = c$Transform.c$ALGORITHMS.m$_brac(($T($.er=this.i$options.m$_brac($s("transition")))?$.er:$q("sine:in:out")));};
  _.m$set=function(now){return(now);};
  _.m$compute=function(from,to,delta){return(c$Transform.m$compute(from,to,delta));};
  _.m$check=function(caller){
    if (!this.__timer__) return true;
		switch (this.i$options.m$_brac($s("link"))){
			case 'cancel': this.cancel(); return true;
			case 'chain' : this.chain(caller.bind(this, Array.slice(arguments, 1))); return false;
		};return(false);};
  _.m$start=function(from,to){if (!this.m$check(arguments.callee, from, to)) return this;this.__from__ = from;this.__to__   = to;this.__time__ = 0;this.__transition__ = function(p){
      return -(Math.cos(Math.PI * p) - 1) / 2;
    };this.m$start_timer();this.m$fire($s("start"));return(this);};
  _.m$complete=function(){this.m$fire($s("completion"));this.m$stop_timer();return this;};
  _.m$cancel=function(){this.m$fire($s("cancellation"));this.m$stop_timer();return this;};
  _.m$pause=function(){this.m$stop_timer();return this;};
  _.m$resume=function(){this.m$start_timer();return this;};
  _.m$stop_timer=function(){if (!this.__timer__) return false;this.__time__ = (+new Date) - this.__time__;this.__timer__ = $clear(this.__timer__);return(true);};
  _.m$start_timer=function(){if (this.__timer__) return false;this.__time__ = (+new Date) - this.__time__;this.__timer__ = this.m$step.periodical(Math.round(1000 / this.i$options.m$_brac($s("fps"))), this);return(true);};
  x = {'pow'  : function(p, x){return Math.pow(p, x[0] || 6);},
   'expo' : function(p){return Math.pow(2, 8 * (p - 1));},
   'circ' : function(p){return 1 - Math.sin(Math.acos(p));},
   'sine' : function(p){return 1 - Math.sin((1 - p) * Math.PI / 2);},
   'back' : function(p, x){x = x[0] || 1.618;return Math.pow(p, 2) * ((x + 1) * p - x);},
   'bounce' : function(p){ var value; for (var a = 0, b = 1; 1; a += b, b /= 2){ if (p >= (7 - 4 * a) / 11){value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);break;}}return value;},
   'elastic' : function(p, x){return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);}
  };
  for (prop in x) {
    c$Transform.m$add_transition($q(prop), x.prop) 
  };
  x = ['quad', 'cubic', 'quart', 'quint'];
    for (var i = 0, l = x.length; i < l; i ++) {
    c$Transform.m$add_transition($q(x[i]), function(p){return Math.pow(p, [i + 2]);}) 
  };;
  

Red._module('Transform.Parser',function(){ var _=c$Transform.c$Parser.prototype;
  var rgb=$u;
  

Red._class('Transform.Parser.Color',c$Object,function(){ var _=c$Transform.c$Parser.c$Color.prototype;
  var rgb=$u;
  c$Transform.c$Parser.c$Color.m$hex_to_array=function(color){var hex = color.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/).slice(1);var rgb = []
    		for(i = 0, l = hex.length; i < hex.length; i++){
    		  value = hex[i]
    		  if (value.length == 1) value += value;
    		  rgb[i] = parseInt(value,16);
    		};return rgb;};
  c$Transform.c$Parser.c$Color.m$compute=function(from,to,delta){var rgb=$u;rgb=[];from.m$each(function(i){return rgb.m$_ltlt(Math.round(c$Transform.m$compute(from.m$_brac(i),to.m$_brac(i),delta)));}.m$(this));return 'rgb(' + rgb + ')';};
  c$Transform.c$Parser.c$Color.m$parse=function(value){value = value.__value__ || String(value);if (value.match(/^#[0-9a-f]{3,6}$/i)) return c$Transform.c$Parser.c$Color.m$hex_to_array(value);return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value.m$_brac(1),value.m$_brac(2),value.m$_brac(3)] : false;};
  c$Transform.c$Parser.c$Color.m$serve=function(value,unit){return value;};
});
  

Red._class('Transform.Parser.Number',c$Object,function(){ var _=c$Transform.c$Parser.c$Number.prototype;
  c$Transform.c$Parser.c$Number.m$compute=function(from,to,delta){return c$Transform.m$compute(from,to,delta);};
  c$Transform.c$Parser.c$Number.m$parse=function(value){value = value.__value__ || String(value);parsed = parseFloat(value);return (parsed || parsed == 0) ? parsed : false;};
  c$Transform.c$Parser.c$Number.m$serve=function(value,unit){return(($T(unit)?value.m$_plus(unit):value));};
});
  

Red._class('Transform.Parser.String',c$Object,function(){ var _=c$Transform.c$Parser.c$String.prototype;
  c$Transform.c$Parser.c$String.m$parse=function(value){return false;};
  c$Transform.c$Parser.c$String.m$compute=function(from,to,delta){return(to);};
  c$Transform.c$Parser.c$String.m$serve=function(value,unit){return(value);};
});
});
  c$Transform.c$Parsers=[c$Transform.c$Parser.c$Color,c$Transform.c$Parser.c$Number,c$Transform.c$Parser.c$String];
});

Red._class('Tween',c$Transform,function(){ var _=c$Tween.prototype;
  var parsed=$u,to=$u,parsed_from_to=$u,value=$u,returns=$u,computed=$u;
  _.m$initialize=function(element,options){this.i$element=this.i$subject=element;this.m$class().m$superclass().prototype.m$initialize.call(this,options);};
  _.m$start=function(property,from,to){var parsed=$u;this.i$property=property;parsed=this.m$prepare(this.i$element,property,[from,to]);return this.m$class().m$superclass().prototype.m$start.call(this,parsed.m$_brac($s("from")),parsed.m$_brac($s("to")));};
  _.m$prepare=function(element,property,from_to){var to=$u,parsed_from_to=$u;to=from_to.m$_brac(1);if(!$T(to)){from_to.m$_breq(1,from_to.m$_brac(0));from_to.m$_breq(0,element.m$styles().m$_brac(property));};parsed_from_to=[];from_to.m$each(function(val){return parsed_from_to.m$_ltlt(this.m$parse(val));}.m$(this));return(c$Hash.m$_brac($s("from"),parsed_from_to.m$_brac(0),$s("to"),parsed_from_to.m$_brac(1)));};
  _.m$parse=function(value){var returns=$u;value=value.m$to_s().m$split($q(" "));returns=[];value.m$each(function(val){c$Transform.c$Parsers.m$each(function(parser){parsed=parser.m$parse(val);return ($T(parsed)?found=c$Hash.m$_brac($s("value"),parsed,$s("parser"),parser):nil);}.m$(this));found=($T($.fa=found)?$.fa:c$Hash.m$_brac($s("value"),val,$s("parser"),c$Transform.c$Parser.c$String));return returns.m$_ltlt(found);}.m$(this));return(returns);};
  _.m$set=function(current_value){this.m$render(this.i$element,this.i$property,current_value.m$_brac(0),this.i$options.m$_brac($s("unit")));return(this);};
  _.m$render=function(element,property,current_value,unit){return element.m$set_style(property,this.m$serve(current_value,unit));};
  _.m$serve=function(value,unit){return value.m$_brac($s("parser")).m$serve(value.m$_brac($s("value")),unit);};
  _.m$compute=function(from,to,delta){var computed=$u;computed=[];Math.min(from.length, to.length).m$times(function(i){return computed.m$_ltlt(c$Hash.m$_brac($s("value"),from.m$_brac(i).m$_brac($s("parser")).m$compute(from.m$_brac(i).m$_brac($s("value")),to.m$_brac(i).m$_brac($s("value")),delta),$s("parser"),from.m$_brac(i).m$_brac($s("parser"))));}.m$(this));return(computed);};
});

Red._class('SplitView',c$View,function(){ var _=c$SplitView.prototype;
  ;
});

Red._class('View',c$Object,function(){ var _=c$View.prototype;
  this.i$bindings=[];
  c$View.m$bindings=function(){for(var l=arguments.length,i=0,bindings=[];i<l;++i){bindings.push(arguments[i]);};return this.i$bindings.m$_plus(bindings);};
  _.m$initialzie=function(name,bindings){this.i$name=name;return bindings.m$each(function(attribute,path){return c$View.c$Binding.m$new(this,attribute,path);}.m$(this));};
});

Red._class('Model',c$Object,function(){ var _=c$Model.prototype;
  var page=$u,offset=$u;
  c$Model.m$all=function(page,offset){page=$T($.fd=page)?$.fd:0;offset=$T($.fe=offset)?$.fe:nil;return this.i$request=c$Request.m$new(c$Hash.m$_brac($s("url"),this.i$data_source));};
  c$Model.m$data_source=function(url){return this.i$data_source=url;};
  c$Model.m$data_format=function(format){return this.i$data_format=format;};
});

Red._module('KVO',function(){ var _=c$KVO.prototype;
  

Red._module('KVO.ClassMethods',function(){ var _=c$KVO.c$ClassMethods.prototype;
  _.m$kvc_accessor=function(){for(var l=arguments.length,i=0,methods=[];i<l;++i){methods.push(arguments[i]);};return methods.m$each(function(method){(this.m$define_method||window.m$define_method).call(this,method,function(){return (this.m$instance_variable_get||window.m$instance_variable_get).call(this,$q("@{method}"));}.m$(this));return (this.m$define_method||window.m$define_method).call(this,$S("",method,"="),function(value){(this.m$will_change_value_for||window.m$will_change_value_for).call(this,method);(this.m$instance_variable_set||window.m$instance_variable_set).call(this,$q("@{method}"),value);return (this.m$did_change_value_for||window.m$did_change_value_for).call(this,method);}.m$(this));}.m$(this));};
});
  

Red._module('KVO.InstanceMethods',function(){ var _=c$KVO.c$InstanceMethods.prototype;
  _.m$will_change_value_for=function(key){return nil;};
  _.m$did_change_value_for=function(key){return nil;};
});
});

Red._class('KeyPath',c$Object,function(){ var _=c$KeyPath.prototype;
  _.m$initialize=function(path){this.i$path=path;};
});

Red._class('ArrayController',c$Object,function(){ var _=c$ArrayController.prototype;
  c$ArrayController.m$contents=function(key_path){return c$KeyPath.m$new(key_path);};
});

Red._class('Binding',c$Object,function(){ var _=c$Binding.prototype;
  var transformer=$u;
  _.m$initialize=function(object,attribute,key_path,transformer){transformer=$T($.ff=transformer)?$.ff:nil;this.i$object=object;this.i$attribute=attribute;this.i$key_path=key_path;this.i$transformer=transformer;};
});

Red._class('Note',c$Model,function(){ var _=c$Note.prototype;
  (this.m$data_source||window.m$data_source).call(this,$q("http://stikkies.local/notes"));
  (this.m$data_format||window.m$data_format).call(this,$q("json"));
  (this.m$kvc_accessor||window.m$kvc_accessor).call(this,$s("name"),$s("body"));
});

Red._class('NotesController',c$ArrayController,function(){ var _=c$NotesController.prototype;
  (this.m$contents||window.m$contents).call(this,$q("ApplicationController.notes"));
});

Red._class('ApplicationController',c$Object,function(){ var _=c$ApplicationController.prototype;
  _.m$notes=function(){(this.m$will_change_value_for||window.m$will_change_value_for).call(this,$s("notes"));this.i$notes=($T($.fg=this.i$notes)?$.fg:c$Note.m$all());return (this.m$did_change_value_for||window.m$did_change_value_for).call(this,$s("notes"));};
});

Red._class('SplitView',c$View,function(){ var _=c$SplitView.prototype;
  ;
});c$WorkspaceView.m$new($q("main"),nil);c$SplitView.m$new($q(""),nil);c$ListView.m$new($q("notes_list"),c$Hash.m$_brac($s("contents"),$q("NotesController.arranged_objects")))