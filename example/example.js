var app = {};
$(function(){
    app.TileManager.init();
    app.ex__1();
    app.ex__2();
    app.ex__3();
    app.ex__6();
    app.ex__7();
    new app.generator({elem : $('#generator')})
})

app.ex__1 = function(){
    var $clock = $('#ex__1 .clock');
    $clock.clock();
    $('#ex__1 select').change(function(){
        $clock.clock('destroy')
                .clock({timeZone:$(this).val()});
    });
}
app.ex__2 = function(){
    var $clock = $('#ex__2 .clock');
    var log = $('#clock_log');
    var params = {
        onStop : function(surplus){
            log.html(log.html()+"onStop \n");
            console.log('onStop');
        },
        onStep : function(){
            log.html(log.html()+"onStep \n");
            console.log('onStep');
        },
        onCreate : function(){
            log.html(log.html()+"onCreate \n");
            console.log('onCreate');
        },
        onPlay : function(){
            log.html(log.html()+"onPlay \n");
            console.log('onPlay');
        },
        onPause : function(){
            log.html(log.html()+"onPause \n");
            console.log('onPause');
        },
        onDestroy : function(){
            log.html(log.html()+"onDestroy \n");
            console.log('onDestroy');
        },
        onDestroyHTML : function(){
            log.html(log.html()+"onDestroyHTML \n");
            console.log('onDestroyHTML');
        },
        btns : {
            play: $('#ex__2 .clock_play'),
            pause: $('#ex__2 .clock_pause'),
            stop: $('#ex__2 .clock_stop')
        },
    };
    
    $clock.clock(params);
    
    $('#ex__2 .clock_init').on('click', function(){
        $clock.clock(params);
    });
    
    $('#ex__2 .clock_destroy').on('click', function(){
        $clock.clock('destroy');
    });
    $('#ex__2 .clock_destroy-html').on('click', function(){
        $clock.clock('destroyHTML');
    });
}

app.ex__3 = function(){
    var $clock = $('#ex__3 .clock');
    var params = {
        onStop : function(e,surplus){
            $('#ex__3 .surplus').html(surplus);
        },
        btns : {
            play: $('#ex__3 .clock_play'),
            stop: $('#ex__3 .clock_stop')
        }
    };
    
    $clock.clock(params);
    
    $('#ex__3 .clock_init').on('click', function(){
        $clock.clock(params);
    });
    $('#ex__3 .clock_destroy').on('click', function(){
        $clock.clock('destroy');
    });
    $('#ex__3 .clock_surplus').on('click', function(){
        $('#ex__3 .surplus').html($clock.data('clock').getSurplus());
    });
    
}
app.generator = function(options){
    var self = this;
    this.$elem = options.elem;
    this.$form = self.$elem.find('form');
    this.$code = self.$elem.find('pre code.javascript');
    this.$codeHtml = self.$elem.find('pre code.xml');
    this.$inputs = self.$form.find('input');
    
    function _init(){
        self.$form.submit(_onSubmitHandler);
        self.$inputs.change(_onChangeHandler);
    }
    
    function _onSubmitHandler(e){
        return false;
    }
    
    function _onChangeHandler(e){
        self.getCode();
    }
    
    this.getCode = function(){
        var code = '';
        code += self.$inputs.filter('[name="elem"]').val()+'.clock({\n';
        if(self.$inputs.filter('[name="type"]:checked').val() === 'js'){
            if(self.$inputs.filter('[name="timeZone"]').val())
                code += '   timeZone :' + self.$inputs.filter('[name="timeZone"]').val()+',\n';
            if(self.$inputs.filter('[name="autoStart"]:checked').val())
                code += '   autoStart :' + self.$inputs.filter('[name="autoStart"]').val()+',\n';
            if(self.$inputs.filter('[name="timer"]:checked').val())
                code += '   timer :' + self.$inputs.filter('[name="timer"]').val()+',\n';
            if(self.$inputs.filter('[name="direction"]').val())
                code += '   direction :' + self.$inputs.filter('[name="direction"]').val()+',\n';
            if(self.$inputs.filter('[name="startTime"]').val())
                code += '   startTime :' + self.$inputs.filter('[name="startTime"]').val()+',\n';
            if(self.$inputs.filter('[name="timeDif"]').val())
                code += '   timeDif :' + self.$inputs.filter('[name="timeDif"]').val()+',\n';
            if(self.$inputs.filter('[name="sRndrTpl"]').val())
                code += '   sRndrTpl : "' + self.$inputs.filter('[name="sRndrTpl"]').val()+'",\n';
            if(self.$inputs.filter('[name="renderAnim"]:checked').val())
                code += '   renderAnim :' + self.$inputs.filter('[name="renderAnim"]').val()+',\n';
            if(self.$inputs.filter('[name="renderType"]').val())
                code += '   renderType : "' + self.$inputs.filter('[name="renderType"]').val()+'",\n';
            if(self.$inputs.filter('[name="frameHeight"]').val())
                code += '   frameHeight : "' + self.$inputs.filter('[name="frameHeight"]').val()+'",\n';
            if(self.$inputs.filter('[name="render"]:checked').val())
                code += '   render : function(date){},\n';
        }            
        
        /*events*/
        if(self.$inputs.filter('[name="onStop"]:checked').val())
            code += '   onStop : function(surplus){},\n';
        if(self.$inputs.filter('[name="onStep"]:checked').val())
            code += '   onStep : function(){},\n';
        if(self.$inputs.filter('[name="onCreate"]:checked').val())
            code += '   onCreate : function(){},\n';
        if(self.$inputs.filter('[name="onPlay"]:checked').val())
            code += '   onPlay : function(){},\n';
        if(self.$inputs.filter('[name="onPause"]:checked').val())
            code += '   onPause : function(){},\n';
        if(self.$inputs.filter('[name="onDestroy"]:checked').val())
            code += '   onDestroy : function(){},\n';
        if(self.$inputs.filter('[name="onDestroyHTML"]:checked').val())
            code += '   onDestroyHTML : function(){},\n';
            
        /*buttons*/
        if(self.$inputs.filter('[name="play"]').val() 
            || self.$inputs.filter('[name="pause"]').val()
            || self.$inputs.filter('[name="end"]').val()
        ){
            code += '   btns : {\n';
            if(self.$inputs.filter('[name="play"]').val())
                code += '       play :' + self.$inputs.filter('[name="play"]').val()+',\n';
            if(self.$inputs.filter('[name="pause"]').val())
                code += '       pause :' + self.$inputs.filter('[name="pause"]').val()+',\n';
            if(self.$inputs.filter('[name="end"]').val())
                code += '       end :' + self.$inputs.filter('[name="end"]').val()+'\n';
            code += '   }\n';
        }
        code += '});';
        
        self.$code.html(code);
        
        if(self.$inputs.filter('[name="type"]:checked').val() === 'html5'){
            code = '<span';
            if(self.$inputs.filter('[name="timeZone"]').val())
                code += ' data-timezone="'+self.$inputs.filter('[name="timeZone"]').val()+'"\n';    
            if(self.$inputs.filter('[name="direction"]').val())
                code += ' data-direction="'+self.$inputs.filter('[name="direction"]').val()+'"\n';    
            if(self.$inputs.filter('[name="autoStart"]:checked').val())
                code += ' data-auto-start="'+self.$inputs.filter('[name="autoStart"]').val()+'"\n';    
            if(self.$inputs.filter('[name="timer"]:checked').val())
                code += ' data-timer="'+self.$inputs.filter('[name="timer"]').val()+'"\n';    
            if(self.$inputs.filter('[name="startTime"]').val())
                code += ' data-start-time="' + self.$inputs.filter('[name="startTime"]').val()+'"\n';
            if(self.$inputs.filter('[name="timeDif"]').val())
                code += ' data-time-dif="'+self.$inputs.filter('[name="timeDif"]').val()+'"\n';
            if(self.$inputs.filter('[name="sRndrTpl"]').val())
                code += ' data-s-rndr-tpl="'+self.$inputs.filter('[name="sRndrTpl"]').val()+'"\n';
            if(self.$inputs.filter('[name="renderAnim"]:checked').val())
                code += ' data-render-anim="'+self.$inputs.filter('[name="renderAnim"]').val()+'"\n';    
            if(self.$inputs.filter('[name="renderType"]').val())
                code += ' data-render-type="'+self.$inputs.filter('[name="renderType"]').val()+'"\n';
            if(self.$inputs.filter('[name="frameHeight"]').val())
                code += ' data-frame-height="'+self.$inputs.filter('[name="frameHeight"]').val()+'"\n';
            code += '></span>';
            
            self.$codeHtml.text(code);
            self.$codeHtml.each(function(i, e){hljs.highlightBlock(e)});
        }else{
            self.$codeHtml.html(' ');
        }
    };
    
    
    _init();
}

app.ex__6 = function(){
    $('#ex__6 .clock').clock({
        btns : {
            play: $('#ex__6 .clock_play'),
            pause: $('#ex__6 .clock_pause'),
            stop: $('#ex__6 .clock_stop')
        }
    });
}
app.ex__7 = function(){
    $('#ex__7 .clock').clock({
        btns : {
            play: $('#ex__7 .clock_play'),
            pause: $('#ex__7 .clock_pause'),
            stop: $('#ex__7 .clock_stop')
        }
    });
}

app.Tile = function(options){
    var self = this;
    this.$elem = options.elem;
    this.$elem.data('tile', self);
    
    function _init(){
        self.$elem.click(_onClickHandler);
    }
    
    function _onClickHandler(e){
        /*if(e.delegateTarget == e.target && self.$elem.hasClass('ex__active')){
            self.hide();
        }else{
            self.show();
        }*/
        if(!self.$elem.hasClass('ex__active')){
            self.show();
        }
        e.stopPropagation();
    }
    
    this.show = function(){
        app.TileManager.hideAll();
        self.$elem.addClass('ex__active');
    };
    
    this.hide = function(){
        self.$elem.removeClass('ex__active');
    };
    
    _init();
}
app.TileManager = {
    aTiles : new Array(),
    init : function(){
        var self = this;
        $('.ex').each(function(){
            self.addTile(new app.Tile({elem : $(this)}));
        });
        $(window).click(function(){
            self.hideAll();
        });
    },
    
    addTile : function(tile){
        this.aTiles.push(tile);
    },
    
    hideAll : function(){
        $.each(this.aTiles, function(){
            this.hide();
        });
    }
}