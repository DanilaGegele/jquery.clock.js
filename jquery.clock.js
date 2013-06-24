(function($, window){
    "use strict";
    
    window.Clock = function(options){
        var self = this;
        this.elem = options.elem;
        this.timeDif = options.timeDif || options.elem.data('timeDif') || false;
        this.timeZone = +options.timeZone || +options.elem.data('timezone');
        this.direction = options.direction || options.elem.data('direction');//value = up/down
        this.timer = options.timer || options.elem.data('timer') || false;
        //этот параметр призван восстановить состояние таймера например при перезагрузке страницы
        this.startTime = options.startTime || options.elem.data('startTime') || 0;
        
        this.autoStart = options.autoStart !== undefined ? options.autoStart : (options.elem.data('autoStart') !== undefined ? options.elem.data('autoStart') : true);

        this.isPlay = false;
        this.isStop = false;
        /*render*/
        this.sRndrTpl = options.sRndrTpl || options.elem.data('sRndrTpl') || 'dd;.;mm;.;yy; ;hh;:;min;:;ss';
        this.render = options.render || false;
        this.renderType = options.renderType || options.elem.data('renderType') || 'num';
        this.renderAnim = options.renderAnim || options.elem.data('renderAnim') || false;
        this.frameHeight = options.frameHeight || options.elem.data('frameHeight') || 32;
        this.rndrItems={};
        /*render end*/
        var date, timeEnd, interval
        ;
        var prevTime={
                dd:'00',
                mm:'00',
                yy:'0000',
                hh:'00',
                min:'00',
                ss:'00'
            }
        ;
            
        function _init(){
            var _date = new Date();
            if(!self.timeZone){
                self.timeZone = -_date.getTimezoneOffset()/60;
            }

            /*если нужен таймер*/
            if(self.timer){
                /*приводим часы к виду 00:00:00*/
                _date.setUTCSeconds(0);
                _date.setUTCMinutes(0);
                _date.setUTCHours(0);
                if(self.direction === 'down'){
                    /*приводим часы к виду 00:00:10 для 10 секунд*/
                    _date.setUTCSeconds(self.timeDif);
                }
            }
            /*создаем основной объект часов, с которым работаем на каждом шаге*/
            date = new Date(_date.getTime());
            if(!self.timer){
                /*задаем необходимую дату, используя смещение*/
                date.setUTCHours(date.getUTCHours() + self.timeZone);
            }
            
            /*если есть параметры окончания*/
            if(self.timeDif){
                /*Задаем дату окончания*/
                if(self.direction === 'down'){
                    self.timeDif *=-1;
                }

                /*создаем основной объект окончания работы часов*/  
                timeEnd = new Date(date.getTime());    
                if(self.timer){
                    if(self.direction === 'down'){
                        timeEnd.setUTCSeconds(0);
                        timeEnd.setUTCMinutes(0);
                        timeEnd.setUTCHours(0);
                    }else{
                        timeEnd.setUTCSeconds(timeEnd.getUTCSeconds() + self.timeDif);
                    }
                }else{
                    timeEnd.setUTCSeconds(timeEnd.getUTCSeconds() + self.timeDif);
                }
            }
            
            if(self.timer && self.startTime){
                /*уточняем положение таймера*/
                date.setUTCSeconds(self.startTime);
            }
            if(self.timer){
                prevTime = _createDateObj(date);
            }
            
            _validate();
            _events();
            /*Если пользователь не передал свой рендер, то генерируем дом*/
            if(!$.isFunction(self.render)){
                self.render = _render;
                _generateDom();
            }
            self.render(date);
            _btnsController();

            self.elem.triggerHandler('clock.onCreate');
            
            if(self.autoStart){
                self.play();
            }
        }
        
        function _step(){
            if(self.direction === 'down'){
                date.setUTCSeconds(date.getUTCSeconds()-1);
            }else{
                date.setUTCSeconds(date.getUTCSeconds()+1);
            }
            
            self.render(date);
            
            self.elem.triggerHandler('clock.onStep');
            
            if(timeEnd){
                if(self.direction === 'down'){
                    if(date-timeEnd <= 0){
                        self.isStop = true;
                    }
                }else{
                    if(date-timeEnd >= 0){
                        self.isStop = true;
                    }
                }
                if(self.isStop){
                    self.stop();
                }
            }
        }
        
        function _validate(){
            if((self.direction === 'down' && date-timeEnd <= 0) || (self.direction === 'up' && date-timeEnd >= 0)){
                if(console){console.log("Внимение: таймер не имеет шага");}
            }
        }
        
        function _btnsController(){
            if(options.btns){
                $.each(options.btns, function(key,value){
                    $(value).click(function(){
                        self.elem.triggerHandler('clock.'+key);
                    });
                });
            }
        }
        
        function _events(){
            /*Позволяем делать вызов методов через .trigger('clock.play');*/
            self.elem.on('clock.play', onPlayHandler);
            self.elem.on('clock.pause', onPauseHandler);
            self.elem.on('clock.stop', onStopHandler);
            self.elem.on('clock.destroy', onPlayDestroy);
            self.elem.on('clock.destroyHTML', onPauseDestroyHTML);
            
            /*Подписываем переданные колбеки на события*/
            _addHandler('onCreate');
            _addHandler('onPlay');
            _addHandler('onStep');
            _addHandler('onPause');
            _addHandler('onStop');
            _addHandler('onDestroy');
            _addHandler('onDestroyHTML');
        }
        
        function onPlayHandler(){
            self.play();
        }
        
        function onPauseHandler(){
            self.pause();
        }
        
        function onStopHandler(){
            self.stop();
        }
        
        function onPlayDestroy(){
            self.destroy();
        }
        
        function onPauseDestroyHTML(){
            self.destroyHTML();
        }
        
        this.play = function(){
            if(!self.isPlay && !self.isStop){
                self.isPlay = true;
                interval = setInterval(_step, 1000);
                self.elem.triggerHandler('clock.onPlay');
            }
        };
        
        this.pause = function(){
            var _isPlay = self.isPlay;
            _pause();
            if(_isPlay){
                self.elem.triggerHandler('clock.onPause');
            }
        };
        
        function _pause(){
            if(self.isPlay){
                self.isPlay = false;
                clearInterval(interval);
            }
        }
        
        this.stop = function(){
            _pause();
            self.isStop = true;
            self.elem.triggerHandler('clock.onStop', [self.getSurplus()]);
        };
        
        this.getSurplus = function(){
            return Math.abs(date-timeEnd)/1000;
        };
        
        this.destroy = function(){
            _destroy();
            self.elem.triggerHandler('clock.onDestroy');
            self.elem.off('clock');
        };
        
        function _destroy(){
             if(options.btns){
                $.each(options.btns, function(){
                    $(this).off('click');
                });
            }
            self.stop();
            self.elem.data('clock', null);
        }
        
        this.destroyHTML = function(){
            _destroy();
            self.elem.html('');
            self.elem.triggerHandler('clock.onDestroyHTML');
            self.elem.off('clock');
        };
        
        function _generateDom(){
           
            _generateBaseDom();
            
            function _generateBaseDom(){
                var dt = _createDateObj(date);
                
                var aTpl = self.sRndrTpl.split(';');
                
                var _class = 'clock_rndr__'+self.renderType;
                
                var template = '<div class="clock_rndr '+_class+'">';
                
                    if(self.renderAnim){
                        $.each(aTpl, function(key, val){
                            switch (val) {
                                case 'hh':
                                    template += _generateTplItem({id:'hh', value:dt.hh, cnt1:2, cnt2:9});
                                break;
                                case 'min':
                                    template += _generateTplItem({id:'min', value:dt.min, cnt1:5, cnt2:9});
                                break;
                                case 'ss':
                                    template += _generateTplItem({id:'ss', value:dt.ss, cnt1:5, cnt2:9});
                                break;
                                default:
                                    template += _generateTplDelim(key, val);
                                break;
                            }
                        });
                    }else{
                        $.each(aTpl, function(key, val){
                            switch (val) {
                                case 'dd':
                                    template += _generateTplItem({id:'dd', value:dt.dd});
                                break;
                                case 'mm':
                                    template += _generateTplItem({id:'mm', value:dt.mm});
                                break;
                                case 'yy':
                                    template += _generateTplItem({id:'yy', value:dt.yy});
                                break;
                                case 'hh':
                                    template += _generateTplItem({id:'hh', value:dt.hh});
                                break;
                                case 'min':
                                    template += _generateTplItem({id:'min', value:dt.min});
                                break;
                                case 'ss':
                                    template += _generateTplItem({id:'ss', value:dt.ss});
                                break;
                                default:
                                    template += _generateTplDelim(key, val);
                                break;
                            }
                        });
                    }
                    
                template += '</div>';

                self.elem.html(template);
                
                if(self.renderAnim){
                    self.elem.find('.clock_rndr-dig-set').each(function(){
                        $(this).height($(this).find('.clock_rndr-dig-set-item').length*self.frameHeight);
                    });
                }
                
                self.rndrItems = {
                    dd:{1:self.elem.find('[data-part="dd-1"]'),2:self.elem.find('[data-part="dd-2"]')},
                    mm:{1:self.elem.find('[data-part="mm-1"]'),2:self.elem.find('[data-part="mm-2"]')},
                    yy:{1:self.elem.find('[data-part="yy-1"]'),2:self.elem.find('[data-part="yy-2"]')},
                    hh:{1:self.elem.find('[data-part="hh-1"]'),2:self.elem.find('[data-part="hh-2"]')},
                    min:{1:self.elem.find('[data-part="min-1"]'),2:self.elem.find('[data-part="min-2"]')},
                    ss:{1:self.elem.find('[data-part="ss-1"]'),2:self.elem.find('[data-part="ss-2"]')}
                };
            }
            
            /**
             * Создает дом элемента из шаблона.
             *
             * @param id {String} строка для формирования data-part: hh/min/ss.
             * @param value {String} значение для hh/min/ss
             * @param len {Number} количество символов hh-2, yyyy-4
             * @param cnt1 {Number} максимальное значение первой цифры
             * @param cnt2 {Number} максимальное значение второй цифры
             * @param type {String} тип элемента
             * @return {String} Верстка элемента
             * id, value, cnt1, cnt2, type
             */
            function _generateTplItem(params){
                if(!params.len){
                    params.len = 2;
                }
                var _class = 'clock_rndr-dig clock_rndr-dig__'+self.renderType;
                if(self.renderAnim){
                    _class += ' clock_rndr-dig__anim';
                }
                
                var templateItem = '';
                for (var i = 1; i <= params.len; i++) {
                    templateItem += '<div class="'+_class+'" data-part="'+params.id+'-'+i+'">';
                        /*if(self.renderType === 'img'){*/
                        if(self.renderAnim){
                            templateItem += '<div class="clock_rndr-dig-set clock_rndr-dig-set__'+self.direction+'">';
                                templateItem += itemsSet(Number(params.value.charAt(i-1)), i===1 ? params.cnt1+1 : params.cnt2+1);
                            templateItem += '</div>';
                        }else{
                            templateItem += params.value.charAt(i-1);
                        }
                    templateItem += '</div>';
                }
                
                return templateItem;
                
                function itemsSet(start, cnt){
                    var str = '', 
                        sClass = '';
                    var j = 0;
                    for (var i = 0; i < cnt; i++) {
                        j = i+start;
                        if(self.direction === 'down'){
                            j++;
                        }
                        if(j>=cnt){
                            j = j-cnt;
                        }
                        sClass = 'clock_rndr-dig-set-item';
                        if(self.renderType === 'img'){
                            sClass += ' clock_rndr-dig-set-item__img';
                        }
                        sClass += ' clock_rndr-dig-set-item__'+j;
                        str += '<div class="'+sClass+'">';
                        if(self.renderType === 'num'){
                            str += j;
                        }
                        str += '</div>';
                    }
                    return str;
                }
            }
            
            function _generateTplDelim(key, val){
                var templateItem = '';
                templateItem += '<div class="clock_rndr-delim clock_rndr-delim__'+key+'">';
                    templateItem += val;
                templateItem += '</div>';
                return templateItem;
            }
        }
        
        function _render(){
            if(self.renderAnim){
                _renderAnim();
            }else{
                _renderStatic();
            }
            
            function _renderAnim(){
                
                var dt = _createDateObj(date);
                
                _move(_getCharObj(self.rndrItems.hh[1], dt.hh, 0), 'hh', dt.hh, 0);
                _move(_getCharObj(self.rndrItems.hh[2], dt.hh, 1), 'hh', dt.hh, 1);
                _move(_getCharObj(self.rndrItems.min[1], dt.min, 0), 'min', dt.min, 0);
                _move(_getCharObj(self.rndrItems.min[2], dt.min, 1), 'min', dt.min, 1);
                _move(_getCharObj(self.rndrItems.ss[1], dt.ss, 0), 'ss', dt.ss, 0);
                _move(_getCharObj(self.rndrItems.ss[2], dt.ss, 1), 'ss', dt.ss, 1);
                
                $.extend(prevTime, dt);
 
                function _move($obj, key, value, part){
                    if(prevTime[key].charAt(part) !== value.charAt(part)){
                        if(self.direction === 'down'){
                            $obj.animate({'margin-top': self.frameHeight},function(){
                                $obj.parent().prepend($obj.siblings(':last'));
                                $obj.css({'margin-top': 0});
                            });
                        }else{
                            $obj.animate({'margin-top': -self.frameHeight},function(){
                                $obj.parent().append($obj);
                                $obj.css({'margin-top': 0});
                            });
                        }
                    }
                }
                
                function _getCharObj(obj, str, pos){
                    if(self.direction === 'down'){
                        return obj.find('>div>div:first');
                    }else{
                        return obj.find('.clock_rndr-dig-set-item__'+str.charAt(pos)).prev();
                    }
                }
                
            }
            
            
            function _renderStatic(){
                var dt = _createDateObj(date);
                
                _renderItem("dd");
                _renderItem("mm");
                _renderItem("yy");
                _renderItem("hh");
                _renderItem("min");
                _renderItem("ss");

                function _renderItem(key){
                    for (var i = 1; i <= 2; i++) {
                        self.rndrItems[key][i].html(dt[key].charAt(i-1));
                    }
                }
            }
        }
        
        /*Хелперы*/
        
        function _addHandler(name){
            if($.isFunction(options[name])){
                self.elem.on('clock.'+name, options[name]);
            }
        }
        
        function _createDateObj(date){
            var obj={
                dd:'',
                mm:'',
                yy:'',
                hh:'',
                min:'',
                ss:''
            };
            obj.dd = date.getUTCDate();
            if ( obj.dd < 10 ){obj.dd = '0' + obj.dd;}
            obj.dd = obj.dd.toString();
            
            obj.mm = date.getUTCMonth()+1;
            if ( obj.mm < 10 ){obj.mm = '0' + obj.mm;}
            obj.mm = obj.mm.toString();
            
            obj.yy = date.getUTCFullYear() % 100;
            if ( obj.yy < 10 ){obj.yy = '0' + obj.yy;}
            obj.yy = obj.yy.toString();
            
            obj.hh = date.getUTCHours();
            if ( obj.hh < 10 ){obj.hh = '0' + obj.hh;}
            obj.hh = obj.hh.toString();
            
            obj.min = date.getUTCMinutes();
            if ( obj.min < 10 ){obj.min = '0' + obj.min;}
            obj.min = obj.min.toString();
            
            obj.ss = date.getUTCSeconds();
            if ( obj.ss < 10 ){obj.ss = '0' + obj.ss;}
            obj.ss = obj.ss.toString();
            
            return obj;
        }
        
        
        _init();
    };
    
    $.fn.clock = function (option) {
        return this.each(function () {
            var $this = $(this),
            data = $this.data('clock'),
            options = typeof option === 'object' ? option : {};
            options.elem = $this;
            if(!data){
                data = new window.Clock(options);
                $this.data('clock', data);
            }
            if (typeof option === 'string'){data[option]();}
        });
    };
})(window.jQuery, window);