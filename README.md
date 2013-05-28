jquery.clock.js
===============

Плагин для создания часов и счетчиков.

Документацию и примеры вы можете посмотреть в папке example/example.html

Использование
-----

1. Подключить стили и javascript:
```html
<link rel="stylesheet" href="path_to/clock.css">
<script type="text/javascript" src="path_to/jquery.clock.js"></script>
```

2. Создать DOM-элемент:
```html
<span id="clock"></span>
```

3. Создать часы/счетчик:
```javascript
$('#clock').clock();
/*or*/
var clock = new Clock({elem: $('#clock')});
```
