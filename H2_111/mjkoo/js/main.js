//      
const TITLE = document.querySelector("title").text;
var path = window.location.pathname; // 현재 URL의 경로를 가져옵니다.
const FILENAME = path.substring(path.lastIndexOf('/') + 1); // 경로에서 파일 이름을 추출합니다.

// 메인스레드와 웹 워커 간의 통신채널
var channel1 = new MessageChannel(); 
var channel2 = new MessageChannel(); // main.js(STACK_INIT) --> data.js <--> imp.js
var channel3 = new MessageChannel(); // main.js(Calendex Change : MONTHLY_LIST | DAILY_LIST | TIMELY_LIST) <--> data.js

                   
                   
                  
                
                   
  

var g_graph_data               ;
var SW_SENSOR_RAW_REUSE = false;
var g_page_state = 0;
var g_ma_list;
const DATA_LEGEND_HIGHLIGHTED = "data_legend_highlighted";
const CALENDEX_COOKIE_EXPIRE = 30;
// >>> 240105 hjkim - SW센서 / BOP 진단결과
var g_is_sw_sensor_graph = false;
var g_FlotOption = {
    init_line_opt: null,
};
const g_sw_sensor_graph_h = 200;
// >>> 240105 hjkim - SW센서 / BOP 진단결과

                      
                            
                               
                                 
                                                             
                                    
                                       
                                         
                               
                                
                                   
                                      
                                       
                                                  
                                                   
                                                 
                                                  
                                       
                                  
                                        
 

var g_el                 = {
    graph: document.querySelector("#graph"),
    subgraph: document.querySelector("#subgraph"),
    graph_main: document.querySelector(".graph_main"),
    graph_controller: document.querySelector(".graph_controller"),
    custom_legend: document.querySelector("#custom_legend"),
    legend_btn: document.querySelector("#legend_btn"),
    recovery_btn: document.querySelector("#recovery_btn"),
    data_url: document.querySelector("#data_url"),
    event_url: document.querySelector("#event_url"),
    sel_data_url: document.querySelector("#sel_data_url"),
    sel_label_group: document.querySelector("#sel_scoped_label"),
    auto_reload: document.querySelector("#auto_reload"),
    yearly: document.querySelector("#yearly"),
    monthly: document.querySelector("#monthly"),
    daily: document.querySelector("#daily"),
    timely: document.querySelector("#timely"),
    // >>> 240105 hjkim - SW센서 / BOP 진단결과
    result_diagnosis: document.querySelector(".result .bop .graph .outline"),
    stack_event: document.querySelector(".result .stack .graph .outline"),
    barcode_graph: document.querySelectorAll(".result * .graph"),
    // >>> 240105 hjkim - SW센서 / BOP 진단결과
};


var g_graph_inst, g_graph_soft;
const DATA_LEGEND_CHECKED = "data_legend_checked";
const DATA_LEGEND_LABEL = "data_legend_label";

// >>> 240306 hjkim - calendex refactoring
var g_yearly_list = [2023, 2024];
var BASE_DATA_URI = "/ALL/data/";
//const BASE_DATA_URI = "../../../../var/H2/Daejeon/Raw";
// <<< 240306 hjkim - calendex refactoring

                          
                                                         
                                                            
 

var TimeSeriesPlot                  = {};

(function(Interface                 ) { // Variable Scope Isolation
    // >>> 231128 hjkim - main.js argument 수용
    // <script src="js/main.js?type=1&graph=#graph&yearly=#yearly&monthly=#monthly&daily=#daily&legend=#custom_legend"></script>
    /* Argument 
    * - type=1|2           : { HW 센서 | SW 센서 }
    * - graph="#graph"     : 그래프 <div> id
    * - yearly="#yearly"   : 년간 <select> id
    * - monthly="#monthly" : 월간 <select> id
    * - daily="#daily"     : 일간 <select> id
    * - timely="#timely"   : 시간 <select> id
    */
    
    // >>> 231215 hjkim - main.js bode플롯 수용
    // <script src="js/main.js?type=3&graph=.widget.stack-status>.widget-body>.row>.left-side>div"></script>
    // <script src="js/main.js?type=4&graph=.widget.stack-status>.widget-body>.row>.right-side>div"></script>
    /* Argument
    * - type=3|4             : { Nyquist | Bode 플롯 }
    * - graph="#graph"       : 그래프 <div> id
    */
    
    function get_qs_from_src()         {
        var srcEl                            = document.currentScript;
        if(srcEl != null) return srcEl.src.split('?')[1]; 
        else return "";
    }
    
    function get_argv_from_qs(qs        )     {
        var kv_arr = qs.split("&");
        if (kv_arr.length == 0) {return {}; }
        var r         = {};
        for (var i = 0; i < kv_arr.length; ++i) {
            var kv = kv_arr[i].split("=", 2);
            if(kv.length == 1 || kv[0] == null || kv[0] == "") { console.error("잘못된 QueryString 입니다."); }
            else r[kv[0]] = decodeURIComponent(kv[1].replace(/\+/g, " "));
        }
        return r;
    }
    // <<< 231128 hjkim - main.js argument 수용
    
    function _replaceAll(given_str        , niddle       , new_str       ) {
        return given_str.replace(new RegExp(__escapeRegExp(niddle), 'g'), new_str);
        function __escapeRegExp(str        ) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
    }
    
    // >>> 231128 hjkim - main.js argument 수용
    function init_accept_argument(_argv    ) {
        for(var i = 0, key_arr = Object.keys(_argv); i < key_arr.length; i++) {
            var k = key_arr[i], v = _argv[k];
            var _el            ;
            switch(k) {
                case "type":
                // TODO: 1: HW 그래프
                // TODO: 2: SW 그래프
                break;
                case "graph":
                _el = g_el.graph = document.querySelector(v);
                // 파라미터 에러 체크
                if(_el == null) { console.error(`${k} 파라미터 에러!`); }
                if(_el.tagName != "DIV") { console.error(`${k}가 DIV 태그가 아님!`); }
                break;
                case "yearly":
                case "monthly":
                case "daily":
                if(false) null;
                else if(k == "yearly")  _el = g_el.yearly = document.querySelector(v);
                else if(k == "monthly") _el = g_el.monthly = document.querySelector(v);
                else if(k == "daily")   _el = g_el.daily = document.querySelector(v);
                else if(k == "timely")  _el = g_el.timely = document.querySelector(v);
                // 파라미터 에러 체크
                if(_el == null) { console.error(`${k} 파라미터 에러!`); }
                if(_el.tagName != "SELECT") { console.error(`${k}가 SELECT 태그가 아님!`); }
                break;
                case "legend":
                _el = g_el.custom_legend = document.querySelector(v);
                // 파라미터 에러 체크
                if(_el == null) { console.error(`${k} 파라미터 에러!`); }
                if(_el.tagName != "DIV") { console.error(`${k}가 DIV 태그가 아님!`); }
                break;
            }
        }
    }
    // <<< 231128 hjkim - main.js argument 수용
    
    // >>> 231201 hjkim - 라이브러리 로딩
    var fn_load_js = function(src_url        , cb_init            ) {	
        var my_head = document.getElementsByTagName('head')[0];
        var my_js = document.createElement('script');
        my_js.type= 'text/javascript';
        my_js.async = true;
        my_js.src = src_url;
        if(cb_init !== null) my_js.onload = function (){if(typeof cb_init == "function"){cb_init();} };
        my_head.appendChild(my_js);
    }
    
    let fn_change_yearly_listener                = function(e     ) { 
        Calendex.refresh_monthly(e, function (last_item) {
            if (Calendex._fn_init_graph) { 
                if(g_el.monthly == null) throw "monthly 요소가 없습니다.";
                g_el.monthly.value = last_item; 
                Calendex.refresh_daily({}, fn_refresh_timely_cb); 
            }
        }, Calendex.refresh_monthly, Calendex._fn_init_graph);
        
        function fn_refresh_timely_cb(last_item        ) {
            if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
            g_el.daily.value = last_item;
            // 시 선택 갱신
            Calendex.refresh_timely({}, function (last_item) {
                
                // CSV / JPG 분류
                if(g_el.timely == null) { throw "timely 요소가 없습니다."; }
                g_el.timely.value = last_item;
                if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
                if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
                if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
                window.g_data_url = `${BASE_DATA_URI}/${g_el.yearly.value}/${g_el.monthly.value}${g_el.daily.value}${g_el.timely.value}`;
                
                if (g_graph_inst) { TimeSeriesPlot.reload_graph({ target: g_el.timely }); } /* 그래프가 있으면 그래프 갱신 */
                else {
                    if(fn_init_graph == null) throw "콜백함수가 없습니다.";
                    fn_init_graph(); /* 그래프가 없으면 그래프 초기화 함수 콜백 */
                }
            }, 
            Calendex.refresh_daily, /* 퇴각검색을 위한 콜백함수 */
            arguments.callee /* 퇴각검색을 위한 콜백파라미터 */);
        }
    };
    
    let fn_change_monthly_listener                = function (e     ) {
        Calendex.refresh_daily(e, (last_item) => {
            Calendex.refresh_timely(e, (last_item) => {
                TimeSeriesPlot.reload_graph(e); 
            });
        }); 
    };
    
    let fn_change_daily_listener                = function (e     ) {
        Calendex.refresh_timely(e, (last_item) => {
            TimeSeriesPlot.reload_graph(e); 
        }); 
    };
    
    let fn_change_timely_listener                = function (e     ) { 
        TimeSeriesPlot.reload_graph(e); 
    };
    
    // >>> 240119 hjkim - 아파치 서버 포팅 작업
    function init_page(_num ) {
        var _h         = 0;
        var _sync_flag        ;
        var component_h             ;
        var COMPONENT_SELECTOR        ;
        console.log("init_page", _num);
        switch(_num) {
            case 1:
            console.log("main.js / init_page(num) : ", _num);
            var argv_qs = get_qs_from_src();
            var argv = get_argv_from_qs(argv_qs);
            // >>>>>> !!!순서가 중요
            init_accept_argument(argv);
            // STEP 1.
            // >>> 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            COMPONENT_SELECTOR = ".widget.BOP-graph";
            component_h = document.querySelector(COMPONENT_SELECTOR);
            _h = component_h.clientHeight - 55;
            // <<< 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            // STEP 2.
            // >>> 240105 hjkim - 그래프 Placeholder 생성
            g_el.graph.parentElement.innerHTML = `<div id="graph" style="width:100%; height:${_h}px;">`;
            // <<< 240105 hjkim - 그래프 Placeholder 생성
            // STEP 3.
            // <<<<<< !!!순서가 중요
            _sync_flag = {cnt : 0, max : 5 };
            fn_load_js(location.origin+"/NEW/flot/color_palette.js", () => {
                fn_load_js(location.origin+"/NEW/flot/jquery-3.2.1.js", () => {
                    fn_load_js(location.origin+"/NEW/flot/jquery.flot.js", () => {
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.time.js",             () => { all_done(_sync_flag); } );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.tooltip.js",          () => { all_done(_sync_flag); } );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.crosshair.js",        () => { all_done(_sync_flag); } );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.selection.drag.js",   () => { all_done(_sync_flag); } );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.resize.js",           () => { all_done(_sync_flag); } );
                    });
                });
            });
            break;
            case 2:
            console.log("main.js / init_page(num) : ", _num);
            break;
            case 3:
            console.log("main.js / init_page(num) : ", _num);
            // >>> 231228 hjkim - BOP 진단에 그래프 추가
            var argv_qs = get_qs_from_src();
            var argv = get_argv_from_qs(argv_qs);
            // >>>>>> !!!순서가 중요
            // STEP 1.
            // >>> 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            COMPONENT_SELECTOR = ".widget.HW-bop-senser-monitoring";
            component_h = document.querySelector(COMPONENT_SELECTOR);
            _h = component_h.clientHeight - 55;
            // <<< 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            // STEP 2.
            // >>> 240105 hjkim - 그래프 Placeholder 생성
            var _placeholder = document.querySelector(".widget.HW-bop-senser-monitoring .widget-body");
            var _graph_el = document.createElement("div");
            _graph_el.id = "graph";
            // _graph_el.style = `height: ${_h}px`;
            _graph_el.style.height = `${_h}px`;
            if(_placeholder == null) { console.error("_placeholder가 없습니다."); return; }
            _placeholder.appendChild(_graph_el);
            // <<< 240105 hjkim - 그래프 Placeholder 생성
            // STEP 3.
            argv["graph"] = ".widget.HW-bop-senser-monitoring .widget-body #graph";
            init_accept_argument(argv);
            // <<<<<< !!!순서가 중요
            
            // >>> 240105 hjkim - SW센서 / BOP 진단결과
            g_is_sw_sensor_graph = true;
            // <<< 240105 hjkim - SW센서 / BOP 진단결과
            
            _sync_flag = {cnt: 0, max: 5};
            fn_load_js(location.origin+"/NEW/flot/color_palette.js", () => {
                fn_load_js(location.origin+"/NEW/flot/jquery-3.2.1.js", () => {
                    fn_load_js(location.origin+"/NEW/flot/jquery.flot.js", () => {
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.time.js",             () => all_done(_sync_flag) );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.tooltip.js",          () => all_done(_sync_flag) );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.crosshair.js",        () => all_done(_sync_flag) );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.selection.drag.js",   () => all_done(_sync_flag) );
                        fn_load_js(location.origin+"/NEW/flot/jquery.flot.resize.js",           () => all_done(_sync_flag) );
                    });
                });
            });
            // <<< 231228 hjkim - BOP 진단에 그래프 추가
            break;
            default:
            console.error("Fail to init_page().");
            break;
        }
    }


    // 페이지 초기화
    if(TITLE.includes("대시보드")) {
        init_page(1);
        g_page_state = 1;
    }
    if(TITLE.includes("BOP진단")) {
        init_page(3);
        g_page_state = 3;
    }
    switch(location.pathname) {
        case "/NEW":
        case "/NEW/":
        case "/NEW/index.html":
        init_page(2);
        g_page_state = 2;
        break;
    }
    // >>> 240119 hjkim - 아파치 서버 포팅 작업
    function renew_element_after_innerHTML(_selector        ) { return document.querySelector(_selector); }
    
    function all_done(_sync_flag        ) { 
        var CALENDEX_COOKIE_EXPIRE = 30;
        if(++_sync_flag.cnt === _sync_flag.max) {
            console.log("main.js / all_done() / _sync_flag : ", _sync_flag);
            
            // >>> 엘리먼트 초기화
            g_el.graph = renew_element_after_innerHTML("#graph");
            Calendex.init_el(g_el.graph);
            g_el.graph = renew_element_after_innerHTML("#graph");
            // <<< 엘리먼트 초기화
            
            // >>> 캘린덱스 초기화
            Calendex.enroll_callback(function () {
                console.log("main.js / 캘린덱스 초기화 완료");
                console.log("main.js / g_data_url : ", window.g_data_url );
                // var _retry_cnt = 0;
                // var _retry: IntervalID = setInterval(() => {
                //     if(_retry_cnt++ > 100) clearInterval(_retry);
                //     if(window.g_data_url == null) return;
                //     get_data(window.g_data_url, g_event_url); 
                //     clearInterval(_retry);
                // }, 100);
                get_data(g_data_url, g_event_url);
            });
            // <<< 캘린덱스 초기화
            // fn_onload();
        }
    }
    // <<< 231201 hjkim - 라이브러리 로딩
    function legend_show(e     ) {
        // console.log(g_el.legend_btn.innerText);
        if(g_el.legend_btn == null) { console.error("legend_btn 가 없습니다."); return; }
        if (g_el.legend_btn.innerText == "범례숨김") {
            g_el.legend_btn.innerText = "범례보임";
        }
        else {
            g_el.legend_btn.innerText = "범례숨김";
        }
        if(g_el.custom_legend == null) { console.error("custom_legend 가 없습니다."); return; }
        if (g_el.custom_legend.style.visibility == "") {
            g_el.custom_legend.setAttribute("style", "visibility: hidden;");
            //
            if(g_el.graph_main == null) { console.error("graph_main 가 없습니다."); return; }
            g_el.graph_main.className += " expand";
            if(g_el.graph_controller == null) { console.error("graph_controller가 없습니다."); return; }
            g_el.graph_controller.className += " shrink";
        }
        else {
            if(g_el.custom_legend == null) { console.error("custom_legend 가 없습니다."); return; }
            g_el.custom_legend.setAttribute("style", "");
            //
            if(g_el.graph_main == null) { console.error("graph_main 이 없습니다."); return; }
            g_el.graph_main.className = _replaceAll(g_el.graph_main.className, " expand", "");
            
            if(g_el.graph_controller == null) console.error("graph_controller 가 없습니다.");
            else g_el.graph_controller.className = _replaceAll(g_el.graph_controller.className, " shrink", "");
        }
    }
    
    function make_legend(col        , label_data              ) {
        var placeholder = g_el.custom_legend;
        if(placeholder == null) { console.error("custom_legend가 없습니다."); return; }
        
        // TABLE INIT
        var table_el = document.createElement("table");
        for (var k = 0; k < label_data.length;) {
            var tr_el = document.createElement("tr");
            for (var j = 0; j < col; j++) {
                var td_el_color = document.createElement("td");
                var td_el_text = document.createElement("td");
                if (k == 0 && j == 0) {
                    // INIT SELECTED LEGEND
                    var color_box_el = document.createElement("div");
                    // color_box_el.style = "width:0px; height:0; border:10px solid white; overflow:hidden";
                    color_box_el.setAttribute("style", "width:0px; height:0; border:10px solid white; overflow:hidden");
                    td_el_color.id = "selected_legend";
                    td_el_color.append(color_box_el);
                    toggle_color_box(color_box_el);
                    toggle_color_box(color_box_el);
                    // INIT CLEAR LEGEND
                    td_el_text.id = "clear_legend";
                    td_el_text.innerText = "클리어";
                    // td_el_text.style = "text-decoration: underline; cursor:pointer";
                    td_el_text.setAttribute("style", "text-decoration: underline; cursor:pointer");
                    td_el_text.setAttribute("toggle", "on");
                    tr_el.append(td_el_color, td_el_text);
                    continue;
                }
                td_el_color.setAttribute("class", "legend_color");
                td_el_text.setAttribute("class", "legend_text");
                try {
                    if (label_data[k].label != undefined) {
                        // COLOR
                        if (label_data[k].color != undefined) {
                            color_box_el = document.createElement("div");
                            // color_box_el.style = "width:0px;height:0;border:10px solid " + label_data[k].color + ";overflow:hidden";
                            color_box_el.setAttribute("style", "width:0px;height:0;border:10px solid " + label_data[k].color + ";overflow:hidden");
                            // HTML 속성에 상태 데이터를 저장
                            color_box_el.setAttribute(DATA_LEGEND_LABEL, label_data[k].label);
                            color_box_el.setAttribute(DATA_LEGEND_HIGHLIGHTED, "false");
                            td_el_color.append(color_box_el);
                        }
                        // TEXT
                        td_el_text.innerText = label_data[k].label;
                        // HTML 속성에 상태 데이터를 저장
                        td_el_text.setAttribute(DATA_LEGEND_LABEL, label_data[k].label);
                        td_el_text.setAttribute(DATA_LEGEND_CHECKED, "true");
                        k++;
                    }
                }
                catch (e) {
                    // console.error(label_data[k]);
                    // console.error(label_data[k-1]);
                }
                tr_el.append(td_el_color, td_el_text);
            }
            table_el.append(tr_el);
        }
        placeholder.append(table_el);
        // LEGEND INIT  
        toggle_all_on_legend();
        // EVENT BINDING -- SELECTED LEAGEND
        var selected_el = document.querySelector("#selected_legend");
        if (selected_el)
        selected_el.addEventListener("click", init_select_highlighted);
        // EVENT BINDING -- CLEAR LEAGEND
        var clear_legend = document.querySelector("#clear_legend");
        if (clear_legend) {
            clear_legend.addEventListener("click", function (e) {
                if (clear_legend.getAttribute("toggle") == "on") {
                    line_all_off();
                    toggle_all_off_legend();
                    clear_legend.innerText = "전체";
                    clear_legend.setAttribute("toggle", "off");
                }
                else {
                    line_all_on();
                    toggle_all_on_legend();
                    clear_legend.innerText = "클리어";
                    clear_legend.setAttribute("toggle", "on");
                }
            });
        }
        
        // EVENT BINDING -- EACH LEGEND
        var text_el = document.querySelectorAll(".legend_text");
        var color_el = document.querySelectorAll(".legend_color");
        
        for (var i = 0; i < text_el.length; i++) {
            text_el[i].onclick = function (e) {
                var el = e.target;
                // 실선 토글
                toggle_flot_by_label(el.getAttribute(DATA_LEGEND_LABEL));
                // 범례 토글 
                toggle_legend(e.target);
            };
            color_el[i].onclick = function (e) {
                var el = e.target;
                // 범례 하이라이트
                toggle_highlight_line_by_label(el.getAttribute(DATA_LEGEND_LABEL));
                // 범례 컬러박스 토글
                toggle_color_box(e.target);
            };
        }
    }
    
    function init_select_highlighted() {
        // 선택된 애들만 켜지도록 해야됨.
        var selected_el = document.querySelectorAll(".legend_color [" + DATA_LEGEND_HIGHLIGHTED + "='true']");
        // 그래프 선 부분
        line_all_off();
        selected_el.forEach(function (el) { return line_on_by_label( el.getAttribute(DATA_LEGEND_LABEL) || "" ); });
        // 범례 부분
        toggle_all_off_legend();
        selected_el.forEach(function (el) {
            if(el.parentElement == null || el.parentElement.nextElementSibling == null) { console.error("다음 엘리먼트가 없습니다."); return ; }
            toggle_on_legend( el.parentElement.nextElementSibling );
        });
    }
    
    function toggle_color_box(target             ) {
        if(target == null || target.parentElement == null) { console.error("toggle_color_box()에 필요한 요소가 없습니다."); return; }
        let p_el       = target.parentElement;
        if (target.getAttribute(DATA_LEGEND_HIGHLIGHTED) == "false") {
            // style_target_el.style = "background-color: yellow;";
            p_el.style = "border: 2px solid black;";
            target.setAttribute(DATA_LEGEND_HIGHLIGHTED, "true");
        }
        else {
            // style_target_el.style = "background-color: none;";
            p_el.style = "border: none;";
            target.setAttribute(DATA_LEGEND_HIGHLIGHTED, "false");
        }
    }
    
    function toggle_legend(target             ) {
        if (target.getAttribute(DATA_LEGEND_CHECKED) == "true")
        toggle_off_legend(target);
        else
        toggle_on_legend(target);
    }
    
    function line_on_by_label(label        ) {
        var d = g_graph_inst.getData();
        for (var idx = 0; idx < d.length; idx++) {
            if (d[idx].label.includes(label)) {
                d[idx].lines.show = true;
            }
        }
        g_graph_inst.draw();
    }
    
    function toggle_highlight_line_by_label(label        ) {
        var d = g_graph_inst.getData();
        for (var idx = 0; idx < d.length; idx++) {
            if (d[idx].label.includes(label)) {
                toggle_highlight_line(d[idx]);
            }
        }
    }
    Interface.toggle_highlight_line_by_label = toggle_highlight_line_by_label;
    
    function toggle_highlight_line(series              ) {
        if (series.lines.lineWidth < 2) {
            series.lines.lineWidth *= 3;
        }
        else {
            series.lines.lineWidth = 1.5;
        }
        g_graph_inst.draw();
    }
    
    var recovery_btn_state = {
        toggle_on: false,
        url: '/ALL/data/data_1424__1524.tsv'
    };
    // EVENT HANDLER
    // g_el.recovery_btn.onclick = function (e) {
    //     if(recovery_btn_state.toggle_on) recovery_btn_state.toggle_on = false;
    //     else recovery_btn_state.toggle_on = true;
    //     recovery_btn_render();
    //     get_data(recovery_btn_state.url, g_event_url);
    // }
    // FUNCTION
    var recovery_btn_render = function () {
        if(g_el.recovery_btn == null) { console.error("recovery_btn 이 없습니다."); return; }
        if (recovery_btn_state.toggle_on)
        g_el.recovery_btn.disabled = false;
        else
        g_el.recovery_btn.setAttribute("disabled", "true");
    };
    
    var g_subgraph_inst;
    var g_event_data;
    var _CSV_TYPE_ = "RAW_DATA";
    // var g_data_url        = "/ALL/data/data_1424__1524.tsv";
    window.g_data_url = null;
    var g_event_url = "/ALL/data/raw/event.csv";
    
    var fn_onload = function() {
        
        console.log("fn_onload");
        
        // 카랜덱스 초기화 후, 그래프 초기화
        // Calendex.init(function () {
        
        // 	var _retry_cnt = 0;
        // 	var _retry: IntervalID = setInterval(() => {
        // 		if(_retry_cnt++ > 100) clearInterval(_retry);
        // 		if(window.g_data_url == null) return;
        // 		get_data(window.g_data_url, g_event_url); 
        // 		clearInterval(_retry);
        // 	}, 100);
        // 	//get_data(g_data_url, g_event_url);
        // 	setInterval(refresh_graph, 60000);
        // });
        
        // EVENT HANDLER
        // 데이터 선택 시에 실행
        // let fn_change_sel_data_url_handler: EventListener = (e: any) => {
        //     // CLEAR
        //     Calendex.init();
        //     g_graph_inst.destroy();
        //     // $FlowFixMe
        //     $(g_el.graph).off("plotclick").off("plotselected").off("plothover");
        //     // INIT
        //     window.g_data_url = e.target.value;
        //     get_data(window.g_data_url, g_event_url);
        // };
        
        // if(g_el.sel_data_url !== null) g_el.sel_data_url.addEventListener("change", fn_change_sel_data_url_handler);
        // // 라벨 그룹 선택 시에 실행
        // if(g_el.sel_label_group !== null) g_el.sel_label_group.addEventListener("change", refresh_legend);
    };
    /* -------------------------------------------------------------------------- */
    /*                                  EVENT HANDLER                             */
    /* -------------------------------------------------------------------------- */
    function run_diagnostic(url        , p_url        ) {
        window.g_data_url = url;
        recovery_btn_state.toggle_on = true;
        recovery_btn_state.url = p_url;
        recovery_btn_render();
        get_data(window.g_data_url, g_event_url);
    }
    function zoom_in() {
        var sel = g_graph_inst.getSelection();
        // $.each(plot.getXAxes(), function(_, axis) {
        //     var opts = axis.options;
        //     opts.min = ranges.xaxis.from;
        //     opts.max = ranges.xaxis.to;
        // });
        g_graph_inst.getXAxes().map(function (axis, idx) {
            var opts = axis.options;
            opts.min = sel.xaxis.from;
            opts.max = sel.xaxis.to;
        });
        g_graph_inst.setupGrid();
        g_graph_inst.draw();
        g_graph_inst.clearSelection();
    }
    function zoom_out() {
        g_graph_inst.getXAxes().map(function (axis, idx) {
            var opts = axis.options;
            delete opts.min;
            delete opts.max;
        });
        g_graph_inst.setupGrid();
        g_graph_inst.draw();
        g_graph_inst.clearSelection();
    }
    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTION SET                              */
    /* -------------------------------------------------------------------------- */
    //(A)BM, (A)AM, (A)Bl, (A)FL, (A)Pr, (W)Hu, (W)SI, (W)SO, (H)EX, (H)DI, (H)Wa, (H)SI, (H)SO, (H)EO
    
                         
                  
                      
                  
                        
                                    
                      
                   
                    
                           
                        
                    
                   
     
    // var graph_el = document.querySelector("#graph");
    
                        
                    
                     
                     
                      
                      
     
    
    function mark_flot(json               ) {
        var line_opt = init_line_opt(g_graph_data);
        // >>>>>>> 그래프에 마킹
        line_opt = init_mark_opt(line_opt, g_graph_data, json);
        // <<<<<<< 그래프에 마킹
        // $FlowFixMe
        g_graph_inst = $.plot(g_el.graph, g_graph_data, line_opt);
        //
        var CLICK_CNT = 0;
        var TIME_QUEUE = [];
        var FIRST_CLICK = 0;
        var DELAY = { SINGLE: 250, DOUBLE: 500, TIMEOUT: 750, DROP: 1000 };
        // 
        function clear_time_queue() {
            for (var i = 0; i < TIME_QUEUE.length; i++) {
                clearTimeout(TIME_QUEUE[i]);
            }
            CLICK_CNT = 0;
            TIME_QUEUE = [];
        }
        // $FlowFixMe
        $(g_el.graph)
        .on("plotclick", function (event, pos, item) {
            if (item == undefined)
            return;
            CLICK_CNT++;
            if (CLICK_CNT == 1) {
                FIRST_CLICK = new Date().getTime();
                function packet1() {
                    console.log("[plotclick]", item.series);
                    // 범례 하이라이트
                    toggle_highlight_line(item.series);
                    var label = item.series.label;
                    var elm                    = document.querySelector(`["${DATA_LEGEND_LABEL}=${label}"]`);
                    if(elm == null) { console.error("elm 이 없습니다."); return; }
                    // 범례 컬러박스 토글
                    toggle_color_box(elm);
                    // CLEAR
                    clearTimeout(TIME_QUEUE[0]);
                    clearTimeout(TIME_QUEUE[2]);
                    CLICK_CNT = 0;
                    TIME_QUEUE = [];
                }
                function packet2() {
                    console.log("[plotdblclick]", item.series);
                    // TODO: 그래프 확대
                    clear_time_queue();
                }
                function packet3() {
                    console.log("[plottripleclick]", event, pos, item);
                    // TODO: 선 하나만 표시
                    // CLEAR
                    clearTimeout(TIME_QUEUE[0]);
                    clearTimeout(TIME_QUEUE[1]);
                }
                function drop_packet() {
                    console.log("[drop]", event, pos, item);
                    clear_time_queue();
                }
                TIME_QUEUE.push(setTimeout(packet1, DELAY.SINGLE));
                TIME_QUEUE.push(setTimeout(packet2, DELAY.DOUBLE));
                TIME_QUEUE.push(setTimeout(packet3, DELAY.TIMEOUT));
                TIME_QUEUE.push(setTimeout(drop_packet, DELAY.DROP));
            }
            else if (CLICK_CNT == 2) {
                if ((new Date().getTime() - FIRST_CLICK) <= DELAY.DOUBLE) {
                    // console.log("double click", TIME_QUEUE);
                    clearTimeout(TIME_QUEUE[0]); // SINGLE CLICK 취소
                }
                else {
                    // console.log("loose double click", TIME_QUEUE);
                    clear_time_queue();
                }
            }
            else {
                // console.log("triple click", CLICK_CNT, TIME_QUEUE);
                clearTimeout(TIME_QUEUE[0]); // SINGLE CLICK 취소
                clearTimeout(TIME_QUEUE[1]); // DOUBLE CLICK 취소
                CLICK_CNT = 0;
            }
        })
        .on("plotselected", function (e, ranges) { });
        // INIT FLOT DEFAULT SELECTION
        g_graph_inst.setSelection({ yaxis: { from: 0, to: 100 } });
    }
    Interface.mark_flot = mark_flot;
    
    function ParseCSVToKeyValueJSON(txt        ) {
        var header          ;
        var json = txt.split("\n").map((row, idx        ) => {
            var map     ;
            header = row.split(",");
            if(idx != 0) { 
                header.map((col, jdx        ) => map[header[jdx]] = col); 
            }
            return map;
        })
        .reduce((acc       , d    , i) => {
            if(i == 0) return acc;
            else { acc.push(d); return acc; }
        }, []);
        return json;
    }
    
                      
                                
                            
                          
                                         
                             
                       
                                
                                
                                
                               
                                   
                                       
                                      
                                       
                                       
                                       
                                        
                                      
                                       
                                      
                                       
                            
                                    
                                   
                                    
                                    
                                   
                                     
                                     
                                     
                                    
                                    
                           
                                    
                                   
                                    
                       
                           
                                
                                
                                
     
    
    function xhr1_resolve(response     )               {
        // euc-kr decode
        var euckr_data = new Uint8Array(response);
        var decoder = new TextDecoder('euc-kr');
        var data = decoder.decode(euckr_data);
        _CSV_TYPE_ = "RAW_DATA";
        //
        var json              = DataPreprocessing.parse_csv(data);
        if (json.length == 0) throw "csv 내용이 없습니다.";
        
        var currentVal        ;
        if (json.length <= 100) {
            currentVal = json[json.length - 1].Current;
        } else {
            currentVal = json[99].Current;
        }
        
        var currentValInt = Math.round(parseInt(currentVal) * 10) / 10;
        var currentValDiv = document.getElementById("current_val");
        if(currentValDiv !== null) currentValDiv.innerHTML = "Current : " + currentValInt + "A";
        
        // >>> CHECK TIME ORDERING
        var time_order_idx = [], time_order_cnt = 0;
        for (var i = 0; i < json.length - 1; i++) {
            if (json[i].Time > json[i + 1].Time) {
                time_order_idx.push(i);
                time_order_cnt++;
            }
        }
        
        if (time_order_cnt > 0) {
            var msg = time_order_cnt + "개의 시간이 정렬 되어있지 않습니다.";
            // alert(msg);
            console.error(msg, time_order_idx.join(","));
        }
        // <<< CHECK TIME ORDERING
        
        var header_list = Object.keys(json[0]);
        // >>> 240112 hjkim - SW센서 / BOP 진단결과
        if(g_is_sw_sensor_graph) {
            var flot_json              ;
            // >>> 240122 hjkim - SW센서 / 소프트 그래프
            if(!SW_SENSOR_RAW_REUSE && g_ma_list && g_ma_list.length > 0) { 
                if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
                if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
                if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
                if(g_ma_list[0] == null) { throw "g_ma_list 내용이 없습니다."; }
                var _ma_url         = `${BASE_DATA_URI}/${g_el.yearly.value}/${g_el.monthly.value}/${g_el.daily.value}/${g_ma_list[0]}`;
                var _once = true;
                fetch(_ma_url).then(d => d.text())
                .then((txt        ) => ParseCSVToKeyValueJSON(txt))
                .then((json             ) => DataPreprocessing.json_to_flotdata(json))
                // .then(debug => {console.log("debug:", debug); return debug;})
                // .then(flot_data => flot_data.filter(d => ((d.label.indexOf("R_") > -1) || (d.label.indexOf("Result") > -1))) )
                .then((flot_data              ) => flot_data.filter((d           ) => ((d.label.indexOf("R_") > -1))) )
                .then(soft_sensor => {
                    console.log("main.js / soft_sensor:", soft_sensor);
                    if(soft_sensor.length) SoftSensor.Init_sw_sensor_graph(soft_sensor);
                    else { console.error("MA를 fetch 했지만, Soft 센서가 데이터가 없음!");
                    SoftSensor.Init_sw_sensor_graph({});
                }
            });
        } else {
            flot_json = DataPreprocessing.json_to_flotdata(json);
            var soft_sensor = flot_json.filter(
                (d            ) => (d.label.indexOf("R_") > -1)
                );
                if(soft_sensor.length) {
                    SoftSensor.Init_sw_sensor_graph(soft_sensor);
                }
                else {
                    console.error("raw데이터를 REUSE 했지만, Soft 센서 데이터가 없음!");
                    SoftSensor.Init_sw_sensor_graph({});
                };
            }
            // <<< 240122 hjkim - SW센서 / 소프트 그래프
            SoftSensor.Init_bop_barchart(json);
            // g_graph_data = json.filter(d => ((d.label.indexOf("R_") < 0) && (d.label.indexOf("Result") < 0)) ); // SW센서 제외
            if(flot_json == null) { throw "flot_json 이 없습니다."; }
            g_graph_data = flot_json.filter( (d            )  => (
                (d.label.indexOf("P_A_m_out") == 0) ||
                (d.label.indexOf("P_A_B_in") == 0)  ||
                (d.label.indexOf("Air") == 0) 	||
                (d.label.indexOf("MFM3") == 0) 	||
                (d.label.indexOf("T_A_S_in") == 0)  ||
                (d.label.indexOf("T_A_S_out") == 0) ||
                (d.label.indexOf("T_A_vent") == 0)  ||
                (d.label.indexOf("DI(") == 0) 	||
                (d.label.indexOf("Water") == 0) 	||
                (d.label.indexOf("T_w_h_in") == 0) 	||
                // >>> 240306 hjkim - 주요 변수 추가
                (d.label.indexOf("T_w_h_out") == 0)
                // >>> 240306 hjkim - 주요 변수 추가
                // >>> 240307 hjkim - 주요 변수 추가
                || (d.label.indexOf("T_A_B_in") == 0)
                || (d.label.indexOf("T_A_m_out") == 0)
                || (d.label.indexOf("P_A_S_in") == 0)
                || (d.label.indexOf("P_A_S_out") == 0)
                || (d.label.indexOf("T_w_t_in") == 0)
                || (d.label.indexOf("T_w_t_out") == 0)
                || (d.label.indexOf("P_w_p_in") == 0)
                || (d.label.indexOf("P_w_p_out") == 0)
                || (d.label.indexOf("MFM1") == 0)
                || (d.label.indexOf("P_w_h_out") == 0)
                || (d.label.indexOf("T_DI_h_out") == 0)
                || (d.label.indexOf("T_DI_s_out") == 0)
                || (d.label.indexOf("DI_Conductivity") == 0)
                || (d.label.indexOf("P_DI_p_in") == 0)
                || (d.label.indexOf("P_DI_p_out") == 0)
                || (d.label.indexOf("MFM2") == 0)
                || (d.label.indexOf("T_DI_S_in") == 0)
                || (d.label.indexOf("T_F_S_in") == 0)
                || (d.label.indexOf("T_F_S_out") == 0)
                || (d.label.indexOf("P_F_S_in") == 0)
                || (d.label.indexOf("MFC1") == 0)
                || (d.label.indexOf("MFC2") == 0)
                || (d.label.indexOf("Voltage") == 0)
                || (d.label.indexOf("Current") == 0)
                // <<< 240307 hjkim - 주요 변수 추가
                )); // 범례 센서 리스트
            }
            // >>> 240112 hjkim - SW센서 / BOP 진단결과
            else {
                g_graph_data  = DataPreprocessing.json_to_flotdata(json);
            }
            return g_graph_data;
        }
        function _get_location(href        ) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        }
        function get_data(data_url        , event_url        , cb_done            ) {
            // var url = "/HJ_FOLDER/230106__guided_chart/sample_data.csv";
            // 2개의 XHR을 동기화 하는 플래그
            var xhr1_complete = false;
            var xhr2_complete = false;
            // var xhr3_complete = false;
            // function is_complete_all() { return xhr1_complete && xhr2_complete && xhr3_complete; }
            function is_complete_all() { return xhr1_complete && xhr2_complete; }
            var xhr1 = new XMLHttpRequest();
            var xhr2 = new XMLHttpRequest();
            // var xhr3 = new XMLHttpRequest();
            xhr1.open("GET", data_url, true); // 상단 그래프 데이터 & 하단 그래프 데이터
            // >>>>>>> 230531 hjkim - 파일 캐시 요청
            _cache_work(xhr1, data_url);
            // <<<<<<< 230531 hjkim - 파일 캐시 요청
            //xhr1.setRequestHeader("Accept", "text/csv");
            xhr1.responseType = 'arraybuffer';
            xhr2.open("GET", event_url, true); // 상단 그래프 이벤트 데이터
            // xhr3.open("GET", 'min_max.csv'+"?cache_disabled="+new Date().getTime(), true);  // 상단 그래프 min/max 데이터
            xhr1.addEventListener("load", function (res) {
                if (res.target == null)
                throw "target is null";
                xhr1_complete = true;
                resolve_all();
            });
            xhr2.addEventListener("load", function (res) {
                // 가이드선 그리기
                if (res.target == null)
                throw "target is null";
                xhr2_complete = true;
                resolve_all();
            });
            // xhr3.addEventListener("load", function(res) {
            //     // 가이드선 그리기
            //     if(res.target == null) throw "target is null";
            //     xhr3_complete = true;
            //     resolve_all();
            // });
            xhr1.send(); // 그래프 
            xhr2.send();
            // xhr3.send();
            // -------------------------------------
            function resolve_all() {
                if (is_complete_all()) {
                    // >>>>>>> 230531 hjkim - 파일 캐시 작업
                    if (xhr1.getResponseHeader("Last-Modified") != null) {
                        // console.log("#cache", xhr1.responseURL, xhr1.getResponseHeader("Last-Modified"));
                        localStorage.setItem(_get_location(xhr1.responseURL).pathname, xhr1.getResponseHeader("Last-Modified"));
                    }
                    // <<<<<<< 230531 hjkim - 파일 캐시 작업
                    g_graph_data = xhr1_resolve(xhr1.response);
                    xhr2_resolve();
                    crosshair_resolve();
                    // 230324 hjkim - HIDE Series
                    try {
                        document.querySelectorAll(".legend_text")[35].click();
                        document.querySelectorAll(".legend_text")[36].click();    
                    } catch (error) {
                        //console.error("범례 div가 마련되지 않았습니다.");
                    }
                    
                    // >>> 240112 hjkim - SW센서 / BOP 진단결과
                    if(g_graph_data.length) {
                        let stimestamp = g_graph_data[0].data[0][0];
                        let etimestamp = g_graph_data[0].data[g_graph_data[0].data.length-1][0];
                        // >>> 240222 hjkim - stack bar 드로잉
                        let _filtered_data = g_impedentce_uri_list
                        .filter(d => (stimestamp <= d.timestamp && d.timestamp <= etimestamp));
                        let unique_ts_arr = [... new Set(_filtered_data)];
                        SoftSensor.Init_stack_barchart(_filtered_data, stimestamp, etimestamp);
                        // <<< 240222 hjkim - stack bar 드로잉
                    }
                    
                    // $FlowFixMe
                    document.body.dispatchEvent(new CustomEvent("data_refreshed"));
                    // <<< 240112 hjkim - SW센서 / BOP 진단결과
                    // >>> 240307 hjkim - 	
                    if(cb_done) cb_done();
                    // <<< 240307 hjkim - 
                }
            }
            function xhr2_resolve() {
                // 이벤트 데이터 파싱 후 전역변수(g_event_data)에 저장
                _CSV_TYPE_ = "EVENT_DATA";
                var data = xhr2.responseText;
                var event_json               = DataPreprocessing.parse_csv_event(data);
                g_event_data = event_json;
                
                var _retry_cnt = 0;
                var _retry            = setInterval( () => {
                    if(_retry_cnt++ > 100) clearInterval(_retry);
                    if(g_graph_data == null) return;
                    // 그래프에 마킹
                    mark_flot(event_json);
                    clearInterval(_retry);
                }, 500);
                
                if(g_el.custom_legend == null) return;
                g_el.custom_legend.innerHTML = "";
                make_legend(4, g_graph_data);
                // var subgraph_json = g_graph_data.filter(function (n, i, arr) { return (n.label.includes("Result")); });
                
                // SUBGRAPH PART
                try {
                    // $FlowFixMe
                    BarcodeChart.IBarcode_chart_done();
                    // $FlowFixMe
                    BarcodeChart.IBarcode_chart_init(g_impedentce_uri_list);    
                } catch (error) {
                    //console.error("BarcodeChart js가 로딩되지 않았습니다.");
                }
                
            }
            
            function crosshair_resolve() {
                // 230324 hjkim - Plot Crosshair Sync
                // $FlowFixMe
                $(g_el.graph).bind("plothover", function (e, pos) {
                    // g_subgraph_inst.setCrosshair(pos); 
                    try {
                        // $FlowFixMe
                        if (BarcodeChart.IBarcode_vertical_crosshair != undefined) {
                            // $FlowFixMe
                            BarcodeChart.IBarcode_vertical_crosshair(pos.pageX);
                        }
                    } catch (error) {
                        //console.error("BarcodeChart가 로딩되지 않았습니다.");
                    }
                });
                // $FlowFixMe
                $(g_el.subgraph).bind("plothover", function (e, pos) { g_graph_inst.setCrosshair(pos); });
            }
        }
        var COLOR_RED_OPACITY = "rgba(255, 0, 0, 1)";
        var COLOR_GREY = "rgba(128, 128, 128, 1)";
        var COLOR_GREY_OPACITY = "rgba(128, 128, 128, .5)";
        var COLOR_GREEN_OPACITY = "rgba(0, 255, 0, .5)";
        var COLOR_GREEN = "rgba(0, 255, 0, 1)";
        var COLOR_CYAN_OPACITY = "rgba(0, 255, 255, .5)";
        var COLOR_CYAN = "rgba(0, 255, 255, 1)";
        var COLOR_YELLOW_OPACITY = "rgba(255, 255, 0, .5)";
        var COLOR_YELLOW = "rgba(255, 255, 0, 1)";
        var COLOR_BLACK = "rgba(0, 0, 0, 1)";
        var g_toggle_marking = true;
        
        function toggle_marking() {
            if (g_toggle_marking) {
                g_toggle_marking = false;
                clear_mark_opt();
            }
            else {
                g_toggle_marking = true;
                init_mark_opt(g_graph_inst.getOptions(), g_graph_data, g_event_data);
            }
        }
        
        function clear_mark_opt() {
            g_graph_inst.getOptions().grid.markings = function () { return false; };
            g_graph_inst.draw();
        }
        
                         
                            
                           
                      
                        
                           
                        
                         
                       
                       
                       
          
        
        function init_mark_opt(option          , data               , event               ) {
            // 
            if (event == undefined || event == null)
            throw "init_mark_opt() arg2 error.";
            // 
            function get_marking() {
                // [ {sTime: unixtime, eTime: unixtime, Memo: string}, ...]
                var r = [];
                for (var i = 0; i < event.length; i += 1) {
                    // if(event[i].Memo.includes("정상")) {
                    var tag_pos        = 0;
                    // >>>>>>> 이벤트 유형 분류
                    if (event[i].Type.includes('N')) { // N_ : 정상
                        r.push({ color: COLOR_GREEN_OPACITY, xaxis: { from: event[i].sTime, to: event[i].eTime } }); // 레이블 마커 색칠
                        tag_pos = (event[i].eTime - event[i].sTime) / 2 + event[i].sTime;
                        r.push({ color: COLOR_GREEN, xaxis: { from: tag_pos, to: tag_pos - 1, tag: event[i].Memo } }); // 레이블 태그명
                    }
                    else if (event[i].Type.includes('C')) { // C_ : 온도
                        tag_pos = (event[i].eTime - event[i].sTime) / 2 + event[i].sTime;
                        r.push({ color: COLOR_GREY, xaxis: { from: tag_pos, to: tag_pos, tag: event[i].Memo } }); // 레이블 태그명
                    }
                    else if (event[i].Type.includes('IM')) { // IM : 임피던스 측정
                        r.push({ color: COLOR_YELLOW_OPACITY, xaxis: { from: event[i].sTime, to: event[i].eTime } }); // 레이블 마커 색칠
                        tag_pos = (event[i].eTime - event[i].sTime) / 2 + event[i].sTime;
                        r.push({ color: COLOR_BLACK, xaxis: { from: tag_pos, to: tag_pos - 1, tag: event[i].Memo } }); // 레이블 태그명
                    }
                    else { // FT : 실패 등등..
                        r.push({ color: COLOR_GREY_OPACITY, xaxis: { from: event[i].sTime, to: event[i].eTime } }); // 레이블 마커 색칠
                        tag_pos = (event[i].eTime - event[i].sTime) / 2 + event[i].sTime;
                        r.push({ color: COLOR_RED_OPACITY, xaxis: { from: tag_pos, to: tag_pos - 1, tag: event[i].Memo } }); // 레이블 태그명
                    }
                }
                return r;
            }
            //
            option.grid.markings = function () { return get_marking(); };
            return option;
        }
        
                           
                              
                                
                          
                          
                        
                                
         
        
                       
                            
                            
                          
                              
                        
                        
                      
                         
                                  
                          
                                 
                               
                               
                             
                         
                          
         
        
        function init_line_opt(data              ) {
            
            function toolTipFuncForTraffic(label        , xval        , yval        , flotItem            ) {
                // console.log("tooltip/data", data);
                // var data = g_graph_data; // 230316 hjkim - 그래프 갱신 후, 툴팁 오류 수정
                // 범례명 : label
                // x축 값 : xval
                // y축 값 : yval
                // 그래프 옵션 : flotItem
                var html = "<b>▶%x</b><br>";
                var xpos = flotItem.datapoint[0];
                var ypos = flotItem.datapoint[1];
                var timestamp = Math.floor(xpos / 1000) * 1000;
                var adjXpos;
                var i;
                var max;
                // 스플라인을 위한 x축 인덱스 조정.
                for (i = 0, max = data[0].data.length; i < max; i += 1) {
                    if (timestamp == data[0].data[i][0]) {
                        adjXpos = i;
                        break;
                    }
                }
                // bps 차트 툴팁
                for (i = 0, max = data.length; i < max; i += 1) {
                    // if (i === max / 2) {
                    //     html += "<hr style='border-top: 1px solid #333; margin: 3px 0px;'></hr>";
                    // }
                    if (flotItem.seriesIndex === i) {
                        // 선택한 시계열 하이라이트 처리
                        html += "<div style='width:4px;height:0;border:5px solid ";
                        html += data[i].color + ";overflow:hidden;display:inline-block;'></div> ";
                        // 레이블 명
                        html += "<b><u>" + data[i].label + ":" + (ypos);
                        // 데이터 값
                        html += "</u></b>" + "<br>";
                    }
                    else {
                        html += "<div style='width:4px;height:0;border:5px solid ";
                        html += data[i].color + ";overflow:hidden;display:inline-block;'></div> ";
                        // 레이블 명 : 데이터 값
                        html += data[i].label + ":" + (data[i].data[flotItem.dataIndex][1]);
                        html += "<br>";
                    }
                }
                return html;
            }
            var line_opt = {
                series: {
                    stack: false,
                    lines: { show: true, lineWidth: 1.5 },
                    // curvedLines: {
                    //     apply: true, active: true, monotonicFit: true
                    // },
                    shadowSize: 0
                },
                legend: {
                    show: false,
                    container: document.querySelector("#legend_container"),
                    noColumns: 4
                },
                axisLabels: { show: true },
                xaxis: {
                    position: "bottom",
                    axisLabel: "Time",
                    show: true,
                    mode: "time",
                    timezone: "browser",
                    tickLength: 0
                },
                yaxis: {
                    axisLabel: "℃", labelWidth: 30, autoscalMargin: 0.02
                },
                yaxes: [{
                    position: "left", axisLabel: "℃", show: true, min: -5, max: 100,
                    tickFormatter: function (v        , axis        ) { return (v * 1).toFixed(axis.tickDecimals) + "℃"; }
                }, {
                    position: "right", axisLabel: "kPa", min: -10, max: 120,
                    tickFormatter: function (v        , axis        ) { return (v * 1).toFixed(axis.tickDecimals) + "kPa"; }
                }],
                crosshair: {
                    mode: "x",
                    color: "rgba(200, 0, 0, 0.7)",
                    lineWidth: 1
                },
                selection: {
                    mode: "x",
                    color: "#00BFFF",
                    minSize: 10 //number of pixels
                },
                grid: {
                    backgroundColor: "white",
                    clickable: true,
                    hoverable: true,
                    autoHighlight: true,
                    borderColor: {
                        top: "#e8e8e8",
                        right: "#e8e8e8",
                        bottom: "#e8e8e8",
                        left: "#e8e8e8"
                    },
                    margin: {
                        top: 30,
                        right: 10,
                        bottom: 20
                    },
                    borderWidth: {
                        top: 2,
                        right: 2,
                        bottom: 2,
                        left: 2
                    }
                },
                tooltip: {
                    show: true,
                    cssClass: "flotTip",
                    content: toolTipFuncForTraffic
                    // xDateFormat: "%y-%m-%d %h:%M:%S"
                }
            };
            return line_opt;
        }
        g_FlotOption.init_line_opt = init_line_opt;
        
        function parse_query_string(qs        ) {
            var kv_arr = location.search.substr(1).split("&");
            if (kv_arr.length == 0)
            return {};
            var result         = {};
            for (var i = 0; i < kv_arr.length; ++i) {
                var kv = kv_arr[i].split("=", 2);
                if (kv.length == 1)
                result[kv[0]] = "";
                else
                result[kv[0]] = decodeURIComponent(kv[1].replace(/\+/g, " "));
            }
            return result;
        }
        
        var qs = parse_query_string(location.search);
        var arr           = [];
        if (qs.result != undefined) {
            arr = qs.result.trim().split(",");
        }
        
        // 230116 hjkim - DataPreprocessing : Pure function -> Object
        
                                    
                                                   
                                                                 
                           
                                                                        
                                                     
                                              
                                                     
                                                             
                                                
                                                              
                                                             
         
        
        // $FlowFixMe
        var DataPreprocessing                      = {};
        
        // $FlowFixMe
        DataPreprocessing.g_filter_arr = get_sensor(arr[0], arr[1]);
        
        // $FlowFixMe
        DataPreprocessing.parse_xsv = function(text        , DELIM        ) {
            if (text == undefined) {
                throw "parse_tsv() arg1 is null";
            }
            if (DELIM != "\t" && DELIM != ",")
            throw "parse_xsv() arg2 is error.";
            var json = [];
            text = text.trim();
            var rows          = text.split("\n");
            var header          = rows[0].split(DELIM);
            this.trim_all(header);
            // >>> Find Time Column
            var TIME_COLUMN = 1;
            for (var i = 0; i < header.length; i += 1) {
                if (header[i].includes("Time")) TIME_COLUMN = i;
            }
            // console.log("TIME_COLUMN: ", TIME_COLUMN);
            if (i == header.length) i = -1;
            // <<< Find Time Column
            for (i = 1; i < rows.length; i += 1) {
                if(rows[i][0] == "#" && rows[i][1] == "#") continue; // 230630 hjkim - 주석처리 패싱
                var rows_row          = rows[i].split(DELIM);
                this.trim_all(rows_row);
                var json_row         = {};
                for (var j = 0; j < header.length; j += 1) {
                    if (rows_row[j] == "")
                    continue;
                    // console.log("TIME_COLUMN:", TIME_COLUMN);
                    switch (_CSV_TYPE_) {
                        case "RAW_DATA":
                        if (j == TIME_COLUMN && TIME_COLUMN > -1) {
                            rows_row[j] = this.datestr_to_unixtime(rows_row[j - 1], rows_row[j]);
                        }
                        break;
                        case "EVENT_DATA":
                        if (0 <= j && j < 2) {
                            // console.log("EVENT_DATA/ rows_row[j] :", rows_row[j]);
                            rows_row[j] = new Date(rows_row[j]).getTime().toString();
                        }
                        break;
                        default:
                        if (j == TIME_COLUMN && TIME_COLUMN > -1) {
                            rows_row[j] = this.datestr_to_unixtime(rows_row[j - 1], rows_row[j]);
                        }
                        break;
                    }
                    json_row[header[j]] = rows_row[j];
                }
                json.push(json_row);
            }
            return json;
        };
        
        // $FlowFixMe
        DataPreprocessing.parse_tsv = function (text        ) {
            return this.parse_xsv(text, "\t");
        };
        // $FlowFixMe
        DataPreprocessing.parse_csv_event = function (text        )                 {
            return this.parse_xsv(text, ",");
        }
        // $FlowFixMe
        DataPreprocessing.parse_csv = function (text        )               {
            return this.parse_xsv(text, ",");
        };
        DataPreprocessing.trim_all = function (obj          )        {
            for (var i = 0; i < obj.length; i += 1) {
                obj[i] = obj[i].trim();
            }
        };
        DataPreprocessing.is_it_disallow = function (key        )          {
            // console.log("is it disallow : ", key);
            if (key.includes("blank"))
            return true;
            // if(key.includes("P_A_B_in")) return true;
            if (key.includes("Power"))
            return true;
            return false;
        };
        DataPreprocessing.datestr_to_unixtime = function (date, time) {
            if (date == null || date == undefined)
            throw "datestr_to_unixtime() arg1 is null.";
            if (time == null || time == undefined)
            throw "datestr_to_unixtime() arg2 is null.";
            var unixtime = 0;
            var datestr = date.replaceAll("-", "/");
            datestr += " ";
            datestr += time.replaceAll("-", ":");
            // console.log("datestr : ", datestr);
            unixtime = new Date(datestr).getTime();
            return unixtime;
        };
        DataPreprocessing.prev_t;
        // $FlowFixMe
        DataPreprocessing.json_to_flotdata = function (arr             ) {
            var flotdata = [];
            var header = Object.keys(arr[0]);
            for (var i = 2; i < header.length; i += 1) {
                var k = header[i];
                // $FlowFixMe
                if (!this.is_in_filter(k)) continue;
                // $FlowFixMe
                if (this.is_it_disallow(k)) continue;
                // series : { label : "sth", data : [ [x,y], ...]}
                // series : { label : "sth", data : [ [x,y], ...], yaxis: 2}
                // series : { label : "sth", data : [ [x,y], ...], yaxis: 2, color: "#EFEFEF" }
                var series            ;
                // $FlowFixMe
                let _color = color_palette[i];
                if (_includes(k, "kPa")) {
                    series = { label: k, data: [], color: _color, yaxis: 2 };
                }
                else {
                    series = { label: k, data: [], color: _color };
                }
                for (var j = 0; j < arr.length; j += 1) {
                    var t;
                    if (isNaN(arr[j]["Time"])) {
                        if (j == 0) { t = new Date().getTime(); }
                        // $FlowFixMe
                        else { t = (this.prev_t + 1); }
                        series.data.push([t, arr[j][k]]);
                        // $FlowFixMe
                        this.prev_t = t;
                    }
                    else series.data.push([arr[j]["Time"], arr[j][k]]);
                }
                flotdata.push(series);
            }
            return flotdata;
        };
        // $FlowFixMe
        DataPreprocessing.is_in_filter = function (key       ) {
            if (this.g_filter_arr == null) return true;
            if (this.g_filter_arr.length == 0) return true;
            var is_true = false;
            for (var i = 0; i < this.g_filter_arr.length; i++) {
                if (key.includes(this.g_filter_arr[i]))
                return true;
            }
            return is_true;
        };
        /* -------------------------------------------------------------------------- */
        /*                                  FUNCTION SET                              */
        /* -------------------------------------------------------------------------- */
        // >>>>>>> 230531 hjkim - 파일 캐시 요청
        var _IS_CACHE_WORK = false;
        function _cache_work(xhr               , data_url        ) {
            // >>> 240119 hjkim - 아차피 포팅 작업
            if(_IS_CACHE_WORK == false) return;
            // <<< 240119 hjkim - 아차피 포팅 작업
            xhr.setRequestHeader("Cache-Control", "public, max-age=86400");
            var agent = window.navigator.userAgent.toLowerCase();
            
            if (agent.indexOf("chrome") > -1 && !!window.chrome) { // 크롬일 경우에만 파일 캐시 요청
                if (localStorage.getItem(data_url)) {
                    var cached_date = localStorage.getItem(data_url);
                    if(cached_date == null) { console.error("캐쉬된 데이터가 없습니다."); return; }
                    xhr.setRequestHeader("If-Modified-Since", cached_date);
                }
                else { }
            }
        }
        // <<<<<<< 230531 hjkim - 파일 캐시 요청
        function refresh_graph() {
            console.log("main.js / refresh_graph() ");
            if (g_el.auto_reload != null && !g_el.auto_reload.checked) return; // 자동갱신 ON/OFF
            var xhr = new XMLHttpRequest();
            
            xhr.open("GET", window.g_data_url, true);
            // >>>>>>> 230531 hjkim - 파일 캐시 요청
            _cache_work(xhr, window.g_data_url);
            // <<<<<<< 230531 hjkim - 파일 캐시 요청
            
            xhr.responseType = 'arraybuffer';
            
            xhr.addEventListener("load", function (res) {
                
                console.log("#XHR.response");
                g_graph_data = xhr1_resolve(xhr.response);
                
                // REFRESH GRAPH
                setTimeout(() => {
                    var line_opt = init_line_opt(g_graph_data);
                    init_mark_opt(line_opt, g_graph_data, g_event_data);
                    g_graph_inst.setData(g_graph_data);
                    g_graph_inst.setupGrid();
                    console.log("g_graph_inst.draw()");
                    g_graph_inst.draw(); 
                    
                    // >>> 240306 hjkim - 데이터 갱신 후, 범례 토글
                    // $FlowFixMe
                    document.body.dispatchEvent(new CustomEvent("data_refreshed"));	
                    // <<< 240306 hjkim - 데이터 갱신 후, 범례 토글
                }, 100);
                refresh_legend(null);
                
                // REFRESH BARCORD CHART
                // $FlowFixMe
                if(typeof BarcodeChart != 'undefined') {
                    // $FlowFixMe
                    BarcodeChart.IBarcode_chart_done();
                    // $FlowFixMe
                    BarcodeChart.IBarcode_chart_init(g_impedentce_uri_list);
                }
                
            });
            xhr.send(null);
        }
        
        function reload_graph(e     , cb_done             )       {
            // CLEAR
            if(g_graph_inst != null) g_graph_inst.destroy();
            // g_subgraph_inst.destroy();
            // $FlowFixMe
            $(g_el.graph).off("plotclick").off("plotselected").off("plothover");
            // $FlowFixMe
            $(g_el.subgraph).off("plotclick").off("plotselected").off("plothover");
            // INIT
            // g_data_url = `${BASE_DATA_URI}/${g_el.yearly.value}/${g_el.monthly.value}/${g_el.daily.value}/${g_el.timely.value};reqtime=${new Date().getTime()}`;
            if(g_el.yearly == null) { console.error("yearly 요소가 없습니다."); return; }
            if(g_el.monthly == null) { console.error("monthly 요소가 없습니다."); return; }
            if(g_el.daily == null) { console.error("daily 요소가 없습니다."); return; }
            if(g_el.timely == null) { console.error("timely 요소가 없습니다."); return; }
            window.g_data_url = `${BASE_DATA_URI}/${g_el.yearly.value}/${g_el.monthly.value}/${g_el.daily.value}/${g_el.timely.value}`;
            get_data(window.g_data_url, g_event_url, cb_done);
            // SUBGRAPH PART
            try {
                // $FlowFixMe
                BarcodeChart.IBarcode_chart_done();
                // $FlowFixMe
                BarcodeChart.IBarcode_chart_init(g_impedentce_uri_list);    
            } catch (error) {
                console.error("BarcordChart js가 로딩되지 않았습니다.");
            }
        }
        Interface.reload_graph = reload_graph;
        
    })(TimeSeriesPlot);
    
    function zero_pad(n        ) { return (n < 10) ? "0" + n : n; }
    const IMPEDANCE_LIST = "/ALL/data/impedance/imp_data/";
    var g_impedentce_uri_list = []; // 임피던스 이미지 데이터로 서브 그래프 툴팁에서 사용
    
                               
                       
                                 
                                        
                                          
                                        
                                                            
                                               
                                                       
                                                     
                                                      
      
    
    function _compose_url_ymd(y_el             , m_el             , d_el             , t_el             )         {
        if(y_el == null) { throw "yearly 요소가 없습니다."; }
        if(m_el == null) { throw "monthly 요소가 없습니다."; }
        if(d_el == null) { throw "daily 요소가 없습니다."; }
        if(t_el == null) { throw "timely 요소가 없습니다."; }
        // $FlowFixMe
        return `${BASE_DATA_URI}/${y_el.value}/${m_el.value}${d_el.value}${t_el.value}`;
    }
    
    /* -------------------------------------------------------------------------- */
    /*                                  CALENDEX                                  */
    /* -------------------------------------------------------------------------- */
    var Calendex              = {
        backtracking_cnt: 0, // 퇴각 검색 카운터로 콜백함수의 동작의 분기 제어
        _fn_init_graph: null,
        // >>> 231201 hjkim - default calendex
        init_el: (_el             ) => {
            console.log("main.js / init_el:", _el, g_el.yearly);
            
            if(g_el.yearly == null) { // 캘린덱스가 없을 경우 생성
                var xml_str = `
                <div style="position: relative; margin-bottom: 20px">
                <div class="btn-wrapper" style="position: absolute; right:0; z-index: 1; padding: 4px">
                <button ontouchstart="zoom_in()" onclick="zoom_in()" class="btn-of mid-size w50px ">
                <span class="icon-zoom-in"></span>
                </button>
                <button ontouchstart="zoom_out()" onclick="zoom_out()" class="btn-of mid-size w50px">
                <span class="icon-zoom-out"></span>
                </button>
                <select id="yearly">
                <option value=-1 disabled>-년 선택-</option>
                </select>
                <select id="monthly">
                <option value=-1 disabled>-월 선택-</option>
                </select>
                <select id="daily">
                <option value=-1 disabled>-일 선택-</option>
                </select>
                <select id="timely">
                <option value=-1 disabled>-시 선택-</option>
                </select>
                </div>
                </div>
                `;
                var doc = new DOMParser().parseFromString(xml_str, "text/xml");
                _el.parentElement.innerHTML = xml_str + _el.parentElement.innerHTML;
            }
            g_el.yearly  = document.querySelector("#yearly");
            g_el.monthly = document.querySelector("#monthly");
            g_el.daily   = document.querySelector("#daily");
            g_el.timely  = document.querySelector("#timely");
            
            // if(g_el.yearly == null) throw "yearly 요소가 없습니다.";
            // g_el.yearly.innerHTML = "<option value=-1 disabled>-년 선택-</option>";
            // if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
            // g_el.monthly.innerHTML  = "<option value=-1 disabled>-월 선택-</option>";
            // if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
            // g_el.daily.innerHTML    = "<option value=-1 disabled>-일 선택-</option>";
            // if(g_el.timely == null) { throw "timely 요소가 없습니다."; }
            // g_el.timely.innerHTML   = "<option value=-1 disabled>-시 선택-</option>";
            Calendex.enroll_eventhandler();
        },
        // <<< 231201 hjkim - default calendex
        enroll_eventhandler: () => {
            var CALENDEX_COOKIE_EXPIRE = 30;
            console.log("main.js / enroll_eventhandler()");
            // >>> Date Picker Change 이벤트 핸들러
            if(g_el.yearly == null) { console.error("yearly 가 없습니다.");}
            else g_el.yearly.addEventListener("change", (e) => {
                const yearly = e.target.value;
                var _url = `${BASE_DATA_URI}/${yearly}`;
                _url = _url.replaceAll("//", "/");
                channel3.port2.postMessage({msg: "CH3/(1)GET_DIR", url: _url, response:"CH3/(a)MONTHLY_LIST"});
            });
            
            if(g_el.monthly == null) { console.error("monthly 가 없습니다.");}
            else g_el.monthly.addEventListener("change", (e) => {
                const yearly = g_el.yearly.value;
                const monthly = e.target.value;
                var _url = `${BASE_DATA_URI}/${yearly}/${monthly}`;
                _url = _url.replaceAll("//", "/");
                channel3.port2.postMessage({msg: "CH3/(1)GET_DIR", url: _url, response:"CH3/(b)DAILY_LIST"});
            } );
            
            if(g_el.daily == null) { console.error("daily 가 없습니다.");}
            else g_el.daily.addEventListener("change", (e) => {
                const yearly = g_el.yearly.value;
                const monthly = g_el.monthly.value;
                const daily = e.target.value;
                var _url = `${BASE_DATA_URI}/${yearly}/${monthly}/${daily}`;
                _url = _url.replaceAll("//", "/");
                channel3.port2.postMessage({msg: "CH3/(1)GET_DIR", url: _url, response:"CH3/(c)TIMELY_LIST"});
            } );
            
            if(g_el.timely == null) { console.error("timely 가 없습니다.");}
            else g_el.timely.addEventListener("change", (e) => {
                const yearly = g_el.yearly.value;
                const monthly = g_el.monthly.value;
                const daily = g_el.daily.value;
                const timely = e.target.value;
                save_calendex_state();
                var _url = `${BASE_DATA_URI}/${yearly}/${monthly}/${daily}/${timely}`;
                _url = _url.replaceAll("//", "/");
                window.g_data_url = _url;
                channel1.port2.postMessage({msg: "CH1/(4)BOP_DATA_FETCH", url: _url, imp_url: "/ALL/data/impedance/imp_data/" });
            } );
            
            // main.js <--> data.js 통신
            channel3.port2.onmessage = (e) => {
                switch(e.data.msg) {
                    case "CH3/(a)MONTHLY_LIST":
                    Calendex.refresh_monthly(e.data.list);
                    Calendex.refresh_daily([]);
                    Calendex.refresh_timely([]);
                    break;
                    case "CH3/(b)DAILY_LIST":
                    Calendex.refresh_daily(e.data.list);
                    Calendex.refresh_timely([]);
                    break;
                    case "CH3/(c)TIMELY_LIST":
                    Calendex.refresh_timely(e.data.list);
					g_el.timely.selectedIndex = 1;
					var event = new Event('change');
					g_el.timely.dispatchEvent(event);
                    break;
                }
            }
            // <<< Date Picker Change 이벤트 핸들러
        },
        enroll_callback: (fn_init_graph           ) => {
            console.log("main.js / Calendex.init() be called");
            if(fn_init_graph != null) { Calendex._fn_init_graph = fn_init_graph; }
        },
        init_calendex : (fn_init_graph) => {
            
            // >>> 240108 hjkim - 선택된 항목 쿠키에서 읽기
            var d = new Date();
            var yyyy = (get_cookie("calendex_yearly") != null) ? get_cookie("calendex_yearly") : d.getFullYear();
            var mm      = zero_pad((d.getMonth() * 1 + 1));
            var dd      = zero_pad(d.getDate());
            // <<< 240108 hjkim - 선택된 항목 쿠키에서 읽기
            
            // 파일목록 추출
            if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
            // $FlowFixMe
            // g_el.yearly.value = "" + yyyy;
            // Calendex.refresh_monthly({}, function (last_item) {
            //     // >>> 240108 hjkim - 선택된 항목 쿠키에서 읽기
            //     last_item = (get_cookie("calendex_monthly") != null) ? get_cookie("calendex_monthly") : last_item;
            //     // <<< 240108 hjkim - 선택된 항목 쿠키에서 읽기
                
            //     if (fn_init_graph) { 
            //         if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
            //         // $FlowFixMe
            //         g_el.monthly.value = last_item; 
            //         Calendex.refresh_daily({}, fn_refresh_timely_cb); 
            //     }
            // }, Calendex.refresh_monthly, arguments.callee);
            
            // 일간 선택의 콜백함수로 arguments.callee를 쓰려면 익명함수를 쓸 수 없다.
            function fn_refresh_timely_cb(last_item         ) {
                // >>> 240108 hjkim - 선택된 항목 쿠키에서 읽기
                last_item = (get_cookie("calendex_daily") != null) ? get_cookie("calendex_daily") : last_item;
                // <<< 240108 hjkim - 선택된 항목 쿠키에서 읽기
                if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
                // $FlowFixMe
                g_el.daily.value = last_item;
                // 시 선택 갱신
                Calendex.refresh_timely({}, function (last_item) {
                    // CSV / JPG 분류
                    if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
                    if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
                    if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
                    if(g_el.timely == null) { throw "timely 요소가 없습니다."; }
                    // $FlowFixMe
                    g_el.timely.value = last_item;
                    // $FlowFixMe
                    window.g_data_url = `${BASE_DATA_URI}/${g_el.yearly.value}/${g_el.monthly.value}/${g_el.daily.value}/${g_el.timely.value}`;
                    
                    if (g_graph_inst) { TimeSeriesPlot.reload_graph({ target: g_el.timely }); } /* 그래프가 있으면 그래프 갱신 */
                    else {
                        if(fn_init_graph == null) throw "fn_init_graph 가 없습니다.";
                        fn_init_graph(); /* 그래프가 없으면 그래프 초기화 함수 콜백 */
                    }
                }, 
                Calendex.refresh_daily, /* 퇴각검색을 위한 콜백함수 */
                arguments.callee /* 퇴각검색을 위한 콜백파라미터 */);
            }
        },
        refresh_yearly: (url_list         ) => {
            if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
            g_el.yearly.innerHTML = `<option value=-1 selected>-월(${(url_list.length)}개)-</option>`;
            url_list.map(_value => {
                if(g_el.yearly == null) { throw "yearly 요소가 없습니다."; }
                g_el.yearly.innerHTML += `<option value="${_value}" >${_value}</option>`; 
            });
        },
        refresh_monthly: (url_list         ) => {
            if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
            g_el.monthly.innerHTML = `<option value=-1 selected>-월(${(url_list.length)}개)-</option>`;
            url_list.map(_value => {
                if(g_el.monthly == null) { throw "monthly 요소가 없습니다."; }
                g_el.monthly.innerHTML += `<option value="${_value}" >${_value}</option>`; 
            });
        },
        refresh_daily: (url_list         ) => {
            if(g_el.daily == null) { throw "daily 요소가 없습니다."; }
            g_el.daily.innerHTML = `<option value=-1 selected>-일(${(url_list.length)}개)-</option>`;
            url_list.map(_value => {
                if(_value == null) { throw "_value 값이 없습니다."; }
                g_el.daily.innerHTML += `<option value="${_value}" >${_value}</option>`;
            });
        },
        refresh_timely: (url_list         ) => {
            if(g_el.timely == null) { throw "timely 요소가 없습니다."; }
            g_el.timely.innerHTML = `<option value=-1 selected>-시(${(url_list.length)}개)-</option>`;
            url_list.map(_value => {
                if(_value == null) { throw "_value 값이 없습니다."; }
                g_el.timely.innerHTML += `<option value="${_value}" >${_value}</option>`;
            });
        }
    };
    
    
    /* =======================================================
    FUNCTION SET
    ======================================================*/
    // >>> 240108 hjkim - 선택된 항목 쿠키에 저장
    function set_cookie(name        , value        , days_to_expire        ) {
        var expiration_date = new Date();
        expiration_date.setDate(expiration_date.getDate() + days_to_expire);
        var cookie_str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiration_date.toUTCString()}; path=/`;
        document.cookie = cookie_str;
    }
    function get_cookie(name       )         {
        name += "=";
        var decoded_cookie = decodeURIComponent(document.cookie);
        var cookie_arr = decoded_cookie.split(";");
        for(var i = 0; i < cookie_arr.length; i++) {
            var cookie = cookie_arr[i].trim();
            if(cookie.indexOf(name) == 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return "";
    }
    // <<< 240108 hjkim - 선택된 항목 쿠키에 저장
    
    function access(uri        , cb                                          ) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        return cb(true, uri, xhr.responseText);
                    }
                    else {
                        return cb(false, uri);
                    }
                }
                else {}
            };
            xhr.onerror = function () {
                return cb(false, uri);
            };
            xhr.open("GET", uri, true);
            xhr.send();
        }
        catch (e) {
            return cb(false, uri);
        }
    }
    var _IS_APACHE_SERVER = true;
    function extract_uri_list(html        ) {
        if(_IS_APACHE_SERVER) {
            return extract_uri_list_apache(html);
        } else {
            return extract_uri_list_org(html);
        }
    }
    function extract_uri_list_apache(html        ) {
        var uri_list = [];
        var dom = new DOMParser().parseFromString(html, "text/html");
        var a_el = dom.querySelectorAll("td a");
        for (var i = 0; i < a_el.length; i++) {
            // console.log(a_el[i]);
            // console.log(a_el[i].getAttribute("href"));
            // console.log(li_el[i].innerHTML);
            var _uri = a_el[i].getAttribute("href");
            if(_uri != null && _uri.indexOf("%") > 0) _uri = decodeURIComponent(_uri);
            uri_list.push(_uri);
        }
        return uri_list;
    }
    function extract_uri_list_org(html        ) {
        var uri_list = [];
        // 
        var lines = html.split('\n');
        lines.splice(0, 1);
        html = lines.join('\n');
        //
        var dom = new DOMParser().parseFromString(html, "text/xml");
        var a_el = dom.querySelectorAll("li a");
        for (var i = 0; i < a_el.length; i++) {
            // console.log(a_el[i]);
            // console.log(a_el[i].getAttribute("href"));
            // console.log(li_el[i].innerHTML);
            uri_list.push(a_el[i].getAttribute("href"));
        }
        return uri_list;
    }
    
    function refresh_legend(e     ) {
        var text_el;
        var i;
        if (e != null) { // 메뉴 상단에서 범례 그룹으로 갱신할 경우,
            var v = e.target.value.split(",");
            // 그래프 라벨 토글
            // - 모두 끔
            line_all_off();
            toggle_all_off_legend();
            // - 원하는 것만 켬
            var arr = get_sensor(v[0], v[1]);
            if (v[0] == 0) {
                // 전체 범례 ON
                line_all_on();
                toggle_all_on_legend();
            }
            else {
                // 부분 범례 ON
                text_el = document.querySelectorAll(".legend_text");
                for (var j = 0; j < text_el.length; j += 1) { // 범례 루프
                    if(arr == null) throw "arr 값이 없습니다.";
                    for (i = 0; i < arr.length; i += 1) { // 범례 그룹 필터
                        if (text_el[j].getAttribute(DATA_LEGEND_LABEL) != null
                        // && text_el[j].getAttribute(DATA_LEGEND_LABEL).includes(arr[i])) { // 범례 매칭
                        &&arr[i] == null
                        && _includes(text_el[j].getAttribute(DATA_LEGEND_LABEL), arr[i])) { // 범례 매칭
                            toggle_flot_by_label(text_el[j].getAttribute(DATA_LEGEND_LABEL)); // 범례 토글
                            
                            var target = text_el[j];
                            // 범례 체크
                            if (target.getAttribute(DATA_LEGEND_CHECKED) == "true") {
                                // target.style = "text-decoration:line-through; color: grey;";
                                target.style.textDecoration = "line-through";
                                target.style.color = "grey";
                                target.setAttribute(DATA_LEGEND_CHECKED, "false");
                            }
                            else {
                                // target.style = "text-decoration:none;";
                                target.style.textDecoration = "none";
                                target.setAttribute(DATA_LEGEND_CHECKED, "true");
                            }
                            break;
                        }
                    }
                }
            }
        }
        else { // 그래프 갱신 후 범례를 갱신할 경우,
            
            // 선택된 범례만 갱신
            line_all_off();
            
            // 부분 범례 ON
            text_el = document.querySelectorAll(".legend_text[" + DATA_LEGEND_CHECKED + "='true']");
            for (i = 0; i < text_el.length; i += 1) { // 범례 루프
                if (text_el[i].getAttribute(DATA_LEGEND_LABEL) != null) { // 범례 매칭
                    toggle_flot_by_label(text_el[i].getAttribute(DATA_LEGEND_LABEL)); // 범례 토글
                }
            }
            
            // 하이라이트된 범례만 갱신
            if (!DATA_LEGEND_HIGHLIGHTED) return;
            var elms = document.querySelectorAll("td [" + DATA_LEGEND_HIGHLIGHTED + "='true']");
            console.log("# 하이라이트된 범례만 갱신 / elms", elms);
            
            for (i = 0; i < elms.length; i++) {
                // 범례 하이라이트
                TimeSeriesPlot.toggle_highlight_line_by_label(elms[i].getAttribute(DATA_LEGEND_LABEL));
            }
        }
    }
    
    function IRefresh_Legend(value        ) {
        var e = { target: { value: "" } };
        switch (value) {
            case "STK":
            e.target.value = "1,0";
            break;
            case "FUE":
            case "UNK":
            e.target.value = "6,0";
            break;
            case "THM":
            e.target.value = "5,0";
            break;
            case "WTR":
            e.target.value = "4,0";
            break;
            case "AIR":
            e.target.value = "3,0";
            break;
            default:
            case "NOR":
            e.target.value = "0,0";
            break;
        }
        // $FlowFixMe
        g_el.sel_label_group.value = e.target.value;
        refresh_legend(e);
    }
    function line_all_off() {
        var d = g_graph_inst.getData();
        for (var idx = 0; idx < d.length; idx++) {
            d[idx].lines.show = false;
        }
        g_graph_inst.draw();
    }
    function toggle_all_off_legend() {
        var text_el = document.querySelectorAll(".legend_text");
        for (var i = 0; i < text_el.length; i += 1) {
            toggle_off_legend(text_el[i]);
        }
    }
    function toggle_off_legend(element             ) {
        element.style = "text-decoration:line-through; color: grey;";
        element.setAttribute(DATA_LEGEND_CHECKED, "false");
    }
    function get_sensor(s        , c        ) {
        var map_to_sensor = [
            [],
            ["Current", "Voltage", "T_DI_h_out", "T_DI_S_out"],
            [],
            // 3,0~5: 공기공급계
            //["Voltage", "Current", //에기연 공기 변수
            //"T_A_B_in", "P_A_B_in", "P_A_m_out", "T_A_m_out", "MFM1","Air"], //에기연 공기 변수
            ["P_A_S_in", "P_A_m_out", "Air"],
            // 4,0~2: 물관리계
            //["T_A_S_out", "T_A_m_out", "T_A_S_in", "T_A_vent"], //에기연 물 변수
            ["T_A_S_out", "T_A_S_in", "T_A_vent"],
            // 5,0~12: 열관리계
            //["Voltage", "Current", "T_w_h_out", "T_w_h_in", "T_DI_h_out", "T_DI_S_out", "T_DI_S_in", "T_w_t_out", //에기연 열 변수
            //"MFM3", "MFM2", "DI_Pump(%)", "Water_Pump(%)" , "DI" , "Water"], //에기연 열 변수
            ["T_w_h_out", "T_DI_S_in", "T_A_S_out", "DI_Pump(%)", "MFM2(DI", "DI(%)", "Water"],
            // 6,0
            //["Voltage", "Currnt"],
            ["Voltage", "Current", "P_A_S_in", "P_A_m_out", "Air", "T_A_S_out", "T_A_S_in", "T_A_vent", "T_w_h_out", "T_DI_S_in", "DI_Pump(%)", "MFM2(DI", "DI(%)", "Water", "P_A_S_in"],
        ];
        if (0 < s && c == 0)
        return map_to_sensor[s];
        if (0 < s && 0 < c)
        return [map_to_sensor[s][c]];
    }
    function _includes(str, niddle) {
        return str.indexOf(niddle) !== -1;
    }
    
    function str_diff(a, b) {
        a = a.toLowerCase(); 
        b = b.toLowerCase();
        var diff = 0;
        var len = a.length < b.length ? a.length : b.length;
        for(var i = 0; i < len; i++){
            // diff += Math.abs(a.charCodeAt(i) - b.charCodeAt(i));
            if(a.charCodeAt(i) != b.charCodeAt(i)) diff++;
        }
        return diff;
    }
    
    function toggle_flot_by_label(label) {
        var d = g_graph_inst.getData();
        for (var idx = 0; idx < d.length; idx++) {
            if (d[idx].label.includes(label)) {
                d[idx].lines.show = !d[idx].lines.show;
            }
        }
        g_graph_inst.draw();
    }
    function line_all_on() {
        var d = g_graph_inst.getData();
        for (var idx = 0; idx < d.length; idx++) {
            d[idx].lines.show = true;
        }
        g_graph_inst.draw();
    }
    function toggle_all_on_legend() {
        var text_el = document.querySelectorAll(".legend_text");
        for (var i = 0; i < text_el.length; i += 1) {
            toggle_on_legend(text_el[i]);
        }
    }
    function toggle_on_legend(element) {
        element.style = "text-decoration:none; background-color: yellow;";
        element.setAttribute(DATA_LEGEND_CHECKED, "true");
    }
    
    /* 
    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    │ 소프트센서 / BOP 진단결과                                                                                         │
    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
    */
    
    /* 
    * .소프트센서
    *   .소프트센서 그래프
    *       @requirement {XHR1} /ALL/data/yyyy/mm/dd/*_ma_softsensor.csv 질의결과
    *       @param  json
    *       @description    소프트센서 그래프는 SoftSensor.Init_sw_sensor_graph()로 트리거 되며 파라미터를 1개 넘겨 받는다.
    *       json은 /ALL/data/yyyy/mm/dd/*.csv 중 MA가 처리된 MA데이터이다.
    *
    *   .스택 바차트
    *       @requirement /ALL/data/impedance/imp_data/ 질의결과
    *       @requirement {XHR1} /ALL/data/yyyy/mm/dd/*.csv 질의결과 
    *       @param  g_impedentce_uri_list
    *       @param  stimestamp
    *       @parma  etimestamp
    *       @description   스택 바차트는 SoftSensor.Init_stack_barchart()로 트리거 되며 파라미터를 3개 넘겨 받는다. 
    *       g_impedentce_uri_list는 /ALL/data/impedance/imp_data/의 파일목록으로부터 필요한 정보를 얻어오므로
    *       임피던스 측정 기록에 대한 파일명이 필수이다. stimestamp와 etimestamp는 g_graph_data로부터 얻어 오는데
    *       /ALL/data/yyyy/mm/dd/*.csv의 첫번째 시각과 마지막 시각이 그 출처이다.
    *
    *   .BOP 바차트
    *       @requirement {XHR1} /ALL/data/yyyy/mm/dd/*.csv 질의결과
    *       @param  json
    *       @description   BOP 바차트는 SoftSensor.Init_bop_barchart()로 트리거 되며 파라미터를 1개 넘겨 받는다.
    *       json은 /ALL/data/yyyy/mm/dd/*.csv의 csv로부터 JSON을 도출하고 해당 JSON을 변환하여 Flot입력을 위한
    *       JSON으로 변환한 것이다.
    *   .
    */
                           
                     
                    
                         
                   
      
    
    // >>> 240105 hjkim =======================소프트 센서 / BOP 진단결과 ==========================
    var SoftSensor = {
        // >>> 240226 hjkim - Redirect to stack.html
        impedance_url: "",
        // <<< 240226 hjkim - Redirect to stack.html
        Init_sw_sensor_graph: (_data           ) => {
            // 이미지 태그 삭제
            var _img_el = document.querySelector(".widget.soft-senser-monitoring .widget-body img");
            var _sw_el = document.querySelector(".widget.soft-senser-monitoring .widget-body .sw_sensor_graph");
            if(_sw_el) { _sw_el.remove(); }
            if(_img_el) { _img_el.remove(); }
            // 그래프 그리k
            var _placeholder_el = document.querySelector(".widget.soft-senser-monitoring .widget-body");
            
            // >>> 240223 hjkim - 툴팁 오버플로우 문제
            var _overflow_el = document.querySelector(".widget.soft-senser-monitoring");
            _overflow_el.style.overflow = "visible";
            // <<< 240223 hjkim - 툴팁 오버플로우 문제
            
            var _div_el = document.createElement("div");
            _div_el.className = "sw_sensor_graph";
            
            // >>> 240227 hjkim - 날짜 컨트롤러 이동
            _div_el.style = `height: ${_overflow_el.clientHeight-100}px;`;
            let _before_el = document.querySelector(".widget.soft-senser-monitoring .widget-body .result"); 
            _placeholder_el.insertBefore(_div_el, _before_el);
            // <<< 240227 hjkim - 날짜 컨트롤러 이동
            
            var _opt = g_FlotOption.init_line_opt(_data);
            _opt.yaxes[0].max = 20;
            _opt.yaxes[0].min = -10;
            // >>> 240305 hjkim - Change y-axis label on softsensor.
            _opt.yaxes[0].tickFormatter = (v, axis) => (v*1).toFixed(axis.tickDecimals);
            // <<< 240305 hjkim - Change y-axis label on softsensor.
            g_graph_soft = $.plot(_div_el, _data, _opt);
        },
        // <<< 240117 hjkim - SW센서 그래프
        
        // >>> 240115 hjkim - 스택 측정 상태 바차트
        Init_stack_barchart: (_data                 , timestamp_s       , timestamp_e       ) => {
            // 스택 그래프 그리기
            SoftSensor.init_sth_for_stack();
            // >>> 240222 hjkim - stack bar 드로잉
            let _range = timestamp_e - timestamp_s;
            
            let _group_by_data = {};
            _data.map(d => {
                if(!_group_by_data[d.label]) _group_by_data[d.label] = [];
                _group_by_data[d.label].push(d);
            });
            //const html = _group_by_data[Object.keys(_group_by_data)[0]]
            const html = _data
            .reduce((acc_html, d, idx) => {
                acc_html += SoftSensor.run_sth_for_stack(d, _range, timestamp_s)
                return acc_html;
            }, "");
            SoftSensor.done_sth_for_stack(html);
            // <<< 240222 hjkim - stack bar 드로잉
        },
        // <<< 240115 hjkim - 스택 측정 상태 바차트
        // >>> 240115 hjkim - BOP 진단 상태 바차트
        Init_bop_barchart: (_data           ) => {
            // 진단 그래프 그리기
            SoftSensor.init_sth_for_bop_result();
            const html = _data.filter(d => d.label.indexOf("Result") == 0)
            .map(d => {
                
                var len = d.data.length;
                var stime = d.data[0][0], etime = d.data[len-1][0];
                
                // >>> 240228 hjkim - RUN LENGTH 알고리즘
                var time_flag = {};
                const WINDOW_SIZE = 30*60*1000;
                for(var i = 0; i < d.data.length; i++) {
                    for(var j = 0; j < WINDOW_SIZE; j++) {
                        if(i+j >= d.data.length) break;
                        if( _get_group(d.data[i][1]) != _get_group(d.data[i+j][1]) ) {
                            time_flag[ d.data[i+j][0] ] = d.data[i+j][1];
                            i += j;
                            break;
                        }
                    }
                }
                // <<< 240228 hjkim - RUN LENGTH 알고리즘 
                
                // HTML 생성
                return d.data.map(d => {
                    return [d[0]/*timestamp*/, d[1]/*result*/, stime, etime];
                })
                .reduce((acc_html, d, idx) => {
                    acc_html += SoftSensor.run_sth_for_bop_result( (d[0]-stime), d[1], (etime-stime), len, d, time_flag );
                    return acc_html;
                }, "");
            });
            SoftSensor.done_sth_for_bop_result(html);
            
            function _get_group(n) {
                if(n == 0) return 1;
                else if(1 <= n && n < 6) return 2;
                else if(6 <= n && n < 9) return 3;
                else if(9 <= n && n < 15) return 4;
                else return 5;
            }
        },
        // <<< 240115 hjkim - BOP 진단 상태 바차트
        
        /* 
        ┌─────────────────────────────────────────────────────────────────────────────┐
        │     FUNCTION SET for stack                                                  │
        └─────────────────────────────────────────────────────────────────────────────┘
        */
        init_sth_for_stack: () => {
            if(g_el.stack_event == null) return;
            g_el.stack_event.innerHTML = "";
            // >>> 240223 hjkim - stack chart 드로잉
            if(g_el.barcode_graph == null) return;
            for(var i = 0; i < g_el.barcode_graph.length; i++) {
                g_el.barcode_graph[i].style.float = "left";
            }
            // <<< 240223 hjkim - stack chart 드로잉 
        },
        run_sth_for_stack: (_data, _total_range, _timestamp_s) => {
            if(g_el.stack_event == null) return;
            
            const STACK_CLASSNAME = "stack-bg-color";
            // >>> 240222 hjkim - stack bar 드로잉
            const TIME_PADDING = 1000*60*15; // +-15min = 1h
            const s_ts = _data.timestamp - TIME_PADDING;
            const e_ts = _data.timestamp + TIME_PADDING;
            // console.log("main.js / _data.timestamp, _timestamp_s : ",  _data.timestamp, _timestamp_s);
            const _left_pos = (_data.timestamp - _timestamp_s) - TIME_PADDING;
            // <<< 240222 hjkim - stack bar 드로잉
            
            let s_date = new Date(s_ts);
            let e_date = new Date(e_ts);
            let s_hh = s_date.getHours();
            let e_hh = e_date.getHours();
            let s_mm = s_date.getMinutes();
            let e_mm = e_date.getMinutes();
            function zero_pad(n) { return (n < 10) ? "0" + n : n; }
            const s_time = `${zero_pad(s_hh)}:${zero_pad(s_mm)}`;
            const e_time = `${zero_pad(e_hh)}:${zero_pad(e_mm)}`;
            let msg = _data.label.split('_').join("<br>") + "<br>측정중...";
            // >>> 240223 hjkim - stack 클릭 이벤트
            // console.log("main.js / _left_pos, _total_range : ", _left_pos, _total_range);
            // console.log("main.js / _left_pos : ", _left_pos/_total_range*100);
            var res = render_html(STACK_CLASSNAME, _left_pos/_total_range*100, (TIME_PADDING*2)/_total_range*100, `${s_time}~${e_time}`, msg, _data.url);
            // <<< 240223 hjkim - stack 클릭 이벤트
            // >>> 240227 hjkim - 스택바의 최근 값 출력
            SoftSensor.impedance_url = _data.url; // last one
            // >>> 240227 hjkim - 스택바의 최근 값 출력
            return res;
            
            function render_html(_sth_class, _left_pos, _time_padding, _date_text, _msg, _url) {
                // console.log("main.js / _left_pos2 : ", _left_pos);
                /*
                <div class="line stack-bg-color" style="width: 3%;left: 12%">
                <span class="tooltip-box">
                <div class="tooltip-box-inner">
                <div class="date">10:45~10:50</div>
                <div class="text">Stack 측정</div>
                </div>
                </span>
                </div>
                */
                // >>> 240223 hjkim - stack 클릭 이벤트
                return `
                <div class="line ${_sth_class}" style="position:absolute; width:${_time_padding}%; left:${_left_pos}%;" onclick="SoftSensor.stack_click_handler('${_url}', event)">
                <span class="tooltip-box">
                <div class="tooltip-box-inner">
                <div class="date">${_date_text}</div>
                <div class="text">${_msg}</div>
                </div>
                </span>    
                </div>`;
                // <<< 240223 hjkim - stack 클릭 이벤트 
            }
            
        },
        // >>> 240226 hjkim - Draw Nyquist Plot
        stack_click_handler: (_url, e) => {
            // >>> 240228 hjkim - Stack bar에 데이터가 없을 경우,
            if(g_el.stack_event.lastElementChild == null) return;
            // <<< 240228 hjkim - Stack bar에 데이터가 없을 경우,
            // >>> 240227 hjkim - 선택시 클래스 표시
            if(e == null) g_el.stack_event.lastElementChild.classList.add("active");
            else {
                let _active_el = g_el.stack_event.querySelectorAll(".active");
                _active_el.forEach(el => el.classList.remove("active")); 
                e.target.classList.add("active");
            }
            // <<< 240227 hjkim - 선택시 클래스 표시
            
            // >>> 240227 hjkim - 스택바의 최근 값 출력
            SoftSensor.impedance_url = _url;
            // <<< 240227 hjkim - 스택바의 최근 값 출력 
            const _placeholder_el = document.querySelector(".widget.bop-senser-data .widget-body");
            _placeholder_el.innerHTML = "";
            
            // Nyquist Plot - Init
            var NyquistPlot = {};
            ImpedanceChart.Interface( NyquistPlot );
            NyquistPlot.IImpedanceChart_init( _placeholder_el, _placeholder_el.clientWidth, _placeholder_el.clientHeight );
            
            // Fetch impedance data from server.
            const M_OHM = 1000;
            const COLOR = "#00FF00";
            fetch(_url).then(d => d.text())
            .then( txt => txt.split("\n") )
            .then( row => row.map(d => d.split(" ") ) ) // to Arr
            .then( arr => arr.map(d => d.map( _d => _d*1) ) ) // to Number
            .then( arr => arr.map(d => { d[1]*= M_OHM; d[2]*= M_OHM*-1; return d; }))
            .then( d => {
                // Nyquist Plot - Run(Add Point)
                NyquistPlot._draw_imp_data( d, COLOR, _placeholder_el );
            });
            
            // Update Gadget Link
            const _gadget_el = document.querySelector(".widget.bop-senser-data .widget-head .widget-head-gadget");
            // >>> 240227 hjkim - gadget 링크에 이벤트 핸들러 추가
            _gadget_el.removeEventListener("click", SoftSensor.head_gadget_click_handler);
            _gadget_el.addEventListener("click", SoftSensor.head_gadget_click_handler);
            // >>> 240227 hjkim - gadget 링크에 이벤트 핸들러 추가
        },
        // >>> 240227 hjkim - gadget 링크에 이벤트 핸들러 추가
        head_gadget_click_handler: () => {
            location.href = "stack.html?url=" + SoftSensor.impedance_url;
        },
        // >>> 240227 hjkim - gadget 링크에 이벤트 핸들러 추가
        // <<< 240226 hjkim - Draw Nyquist Plot
        done_sth_for_stack: (_html) => {
            if(g_el.stack_event == null) return;
            g_el.stack_event.style.position = "relative";
            g_el.stack_event.innerHTML = _html;
            // >>> 240227 hjkim - 스택바의 최근 값 출력 
            SoftSensor.stack_click_handler(SoftSensor.impedance_url);
            // >>> 240227 hjkim - 스택바의 최근 값 출력
        },
        /* 
        ┌─────────────────────────────────────────────────────────────────────────────┐
        │     FUNCTION SET for BOP                                                    │
        └─────────────────────────────────────────────────────────────────────────────┘
        */
        init_sth_for_bop_result : () => {
            if(g_el.result_diagnosis == null) return;
            g_el.result_diagnosis.innerHTML = "";
        },
        run_sth_for_bop_result : (relative_time, value, range, total_unit, d, time_flag) => {
            if(g_el.result_diagnosis == null) return;
            /*
            Result
            0  : 정상
            1  : (공기)MFM 전 누설
            2  : (공기)MFM 후 누설
            3  : (공기)블로워
            4  : (공기)유량센서
            5  : (공기)압력센서
            6  : (물)가습기
            7  : (물)스택 입구 온도센서
            8  : (물)스택 출구 온도센서
            9  : (열)열교환기
            10 : (열)1차 냉각수 펌프
            11 : (열)2차 냉각수 펌프
            12 : (열)스택 입구 온도센서
            13 : (열)스택 출구 온도센서
            14 : (열)열교환기 출구 온도센서
            15 : 진단불가
            */
            var bg_color = "";
            var normal_color = "";
            // >>> 240228 hjkim - tooltip contents
            var tooltip_contents = "";
            // <<< 240228 hjkim - tooltip contents
            switch(value) {
                case "0": // green
                bg_color = "";
                // >>> 240228 hjkim - tooltip contents
                tooltip_contents = "";
                // <<< 240228 hjkim - tooltip contents
                break;
                case "1": // skyblue
				bg_color = "air-bg-color";
				tooltip_contents = "공기공급계(1)<br>MFM전누설";
				break;
                case "2": // skyblue
				bg_color = "air-bg-color";
				tooltip_contents = "공기공급계(2)<br>MFM후누설";
				break;
                case "3": // skyblue
				bg_color = "air-bg-color";
				tooltip_contents = "공기공급계(3)<br>블로워";
				break;
                case "4": // skyblue
				bg_color = "air-bg-color";
				tooltip_contents = "공기공급계(4)<br>유량센서";
				break;
                case "5": // skyblue
				bg_color = "air-bg-color";
				tooltip_contents = "공기공급계(5)<br>압력센서";
				break;
                case "6": // blue
				bg_color = "water-bg-color";
				tooltip_contents = "물관리계(6)<br>가습기";
				break;
                case "7": // blue
				bg_color = "water-bg-color";
				tooltip_contents = "물관리계(7)<br>스택 입구 온도센서(물)";
				break;
                case "8": // blue
                bg_color = "water-bg-color";
				tooltip_contents = "물관리계(8)<br>스택 출구 온도센서(물)";
                break;
                case "9": // pink
				bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(9)<br>열교환기";
				break;
                case "10": // pink
				bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(10)<br>1차 냉각수 펌프";
				break;
                case "11": // pink
				bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(11)<br>2차 냉각수 펌프";
				break;
                case "12": // pink
				bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(12)<br>스택 입구 온도센서(열)";
				break;
                case "13": // pink
				bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(13)<br>스택 출구 온도센서(열)";
				break;
                case "14": // pink
                bg_color = "heat-bg-color";
				tooltip_contents = "열관리계(14)<br>열교환기 출구 온도센서";
                break;
                default:
                bg_color = "";
                // >>> 240228 hjkim - tooltip contents
                tooltip_contents = "";
                // <<< 240228 hjkim - tooltip contents
                break;
            }
            // >>> 240228 hjkim - tooltip contents
            function zero_pad(n) { return (n < 10) ? "0" + n : n; }
            var tooltip = "";
            if( time_flag[d[0]] && tooltip_contents != "") {
                var date = new Date( d[0] );
                tooltip = `<span class="tooltip-box">
                <div class="tooltip-box-inner">
                <div class="date">${zero_pad( date.getHours() )}:${zero_pad( date.getMinutes() )}</div>
                <div class="text">${tooltip_contents}</div>
                </div>
                </span>`;
            }
            // <<< 240228 hjkim - tooltip contents
            return `
            <div class="line ${bg_color}" debug="${value}" style="width:calc(${1/total_unit*100}%); ${normal_color}">
            ${tooltip}
            </div>`;
        },
        done_sth_for_bop_result : (_html) => {
            if(g_el.result_diagnosis == null) return;
            g_el.result_diagnosis.innerHTML = _html;
        }
    };
    
    
    // >>> 240122 hjkim - 범례 초기화 작업
    const hard_system = [
        // >>> 240307 hjkim - 주요 변수 추가
        //["P_A_m_out", "P_A_B_in", "Air", "MFM3"],
        ["T_A_B_in", "P_A_B_in", "MFM3", "Air", "P_A_m_out", "T_A_m_out"],
        //["T_A_S_in", "T_A_S_out", "T_A_vent"],
        ["T_A_S_in", "T_A_S_out", "T_A_vent", "P_A_S_in", "P_A_S_out"],
        // <<< 240307 hjkim - 주요 변수 추가
        // >>> 240306 hjkim - 주요 변수 추가
        //["DI", "Water", "T_w_h_in"],
        //["DI", "Water", "T_w_h_in", "T_w_h_out"],
        ["T_w_t_in", "T_w_t_out", "P_w_p_in", "P_w_p_out", "MFM1", "Water", "T_w_h_out", "T_w_h_in", "P_w_h_out", "T_DI_h_out",
        "T_DI_S_out", "DI_Conductivity", "P_DI_p_out", "DI", "P_DI_p_out", "MFM2", "T_DI_S_in"],
        ["T_F_S_in", "T_F_S_out", "P_F_S_in", "MFC1", "MFC2", "Current", "Voltage"],
        // <<< 240306 hjkim - 주요 변수 추가
    ];
    const soft_system = [
        ["R_Air_deltaP", "R_Air_U", "R_Air_P1", "R_Air_V"],
        ["R_Water_R1", "R_Water_R2", "R_Water_R3"],
        ["R_heat", "R_Ms", "R_Mr"],
    ];
    const hard_label = hard_system.join(",").split(",");
    const soft_label = soft_system.join(",").split(",");
    // const hard_graph = g_graph_inst;
    // const soft_graph = g_graph_soft;
    function adaptor_make_legend() {
        const chk_els = document.querySelectorAll(".widget.HW-bop-senser-list input[type='checkbox']");
        const chk_els2 = document.querySelectorAll(".widget.soft-senser-list input[type='checkbox']");
        const group_els = document.querySelectorAll(".widget.HW-bop-senser-list span.group-title"); 
        const deco_els = document.querySelectorAll(".widget.HW-bop-senser-list span.deco");
        const group_els2 = document.querySelectorAll(".widget.soft-senser-list span.group-title"); 
        const deco_els2 = document.querySelectorAll(".widget.soft-senser-list span.deco");
        const check_all = document.querySelector(".widget.HW-bop-senser-list .widget-head-gadget .mini:nth-child(1)");
        const except_all = document.querySelector(".widget.HW-bop-senser-list .widget-head-gadget .mini:nth-child(2)");
        const check_all2 = document.querySelector(".widget.soft-senser-list .widget-head-gadget .mini:nth-child(1)");
        const except_all2 = document.querySelector(".widget.soft-senser-list .widget-head-gadget .mini:nth-child(2)");
        // >>> 240123 hjkim - Hard 범례 바인딩
        // 전체 선택/해제
        check_all.addEventListener("click",  () => all_graph("on") );
        except_all.addEventListener("click", () => all_graph("off") );
        check_all2.addEventListener("click",  () => all_graph("on", g_graph_soft) );
        except_all2.addEventListener("click", () => all_graph("off", g_graph_soft) );
        // 그룹 범례 바인딩
        Array.from(chk_els).filter(el => (el.nextSibling == null))
        .map((el, idx)  => { el.click(); 
            return el.addEventListener('change', () => { var _status = el.checked;
                set_x_system_graph(idx, hard_system, g_graph_inst, _status);
            });
        });
        // 개별 범례 바인딩
        Array.from(chk_els).filter(el => (el.nextSibling != null))
        .map((el, idx)  => {
            el.addEventListener('change', () => { __group_chk_valid(el);
                toggle_nth_graph(idx);
            });
        });
        // 그룹 범례 볼드 바인딩
        Array.from(group_els)
        .map((el, idx)  => { el.style.fontWeight = "normal"; el.style.cursor = "pointer";
        return el.addEventListener('click', () => { var _status = __style_bold(el);
            Array.from(el.parentElement.querySelectorAll("span.deco:not(.square) span"))
            .map(el => { el.style.fontWeight = _status; });
            set_x_system_bold(idx, hard_system, g_graph_inst, _status);
        });
    });
    // 개별 범례 볼드 바인딩
    Array.from(deco_els).filter(el => (el.className.indexOf("square") == -1))
    .map((el, idx) => { var new_span = document.createElement('span'); new_span.textContent = el.textContent;
    el.lastChild.nodeValue = ""; el.appendChild(new_span); return new_span; })
    .map((el, idx) => { el.style.fontWeight = "normal"; el.style.cursor = "pointer";
    return el.addEventListener('click', () => { __style_bold(el); toggle_nth_bold(idx)} );
});
// <<< 240123 hjkim - Hard 범례 바인딩

// >>> 240123 hjkim - Soft 범례 바인딩
// 그룹 범례 바인딩
Array.from(chk_els2).filter(el => (el.nextSibling == null))
.map((el, idx)  => { el.click(); 
    return el.addEventListener('change', () => { var _status = el.checked;
        set_x_system_graph(idx, soft_system, g_graph_soft, _status);
    });
});
// 개별 범례 바인딩
Array.from(chk_els2).filter(el => (el.nextSibling != null))
.map((el, idx)  => {
    el.addEventListener('change', () => { __group_chk_valid(el);
        toggle_nth_graph(idx, soft_label, g_graph_soft);
    });
});
// 그룹 범례 볼드 바인딩
Array.from(group_els2)
.map((el, idx)  => { el.style.fontWeight = "normal"; el.style.cursor = "pointer";
return el.addEventListener('click', () => { var _status = __style_bold(el);
    Array.from(el.parentElement.querySelectorAll("span.deco:not(.square) span"))
    .map(el => { el.style.fontWeight = _status; });
    set_x_system_bold(idx, soft_system, g_graph_soft, _status);
});
});
// 개별 범례 볼드 바인딩
Array.from(deco_els2).filter(el => el.className.indexOf("square") == -1)
.map((el, idx) => { var new_span = document.createElement('span'); new_span.textContent = el.textContent;
el.lastChild.nodeValue = ""; el.appendChild(new_span); return new_span; })
.map((el, idx) => { el.style.fontWeight = "normal"; el.style.cursor = "pointer";
return el.addEventListener('click', () => { __style_bold(el);
    toggle_nth_bold(idx, soft_label, g_graph_soft)} );
});
// <<< 240123 hjkim - Soft 범례 바인딩

// >>> 240123 hjkim - 데이터 변경 바인딩
document.body.addEventListener("data_refreshed", () => {
    // Hard 범례 갱신
    Array.from(chk_els).filter(el => (el.nextSibling != null))
    .map((el, idx) => {if(!el.checked) toggle_nth_graph(idx); } );
    
    // Soft 범례 갱신
    setTimeout(() => {
        Array.from(chk_els2).filter(el => (el.nextSibling != null))
        .map((el, idx) => {if(!el.checked) toggle_nth_graph(idx, soft_label, g_graph_soft); } );
    }, 50);
});
// <<< 240123 hjkim - 데이터 변경 바인딩
}

function __style_bold(el) { return el.style.fontWeight = (el.style.fontWeight == "bold") ? "normal" : "bold"; }
function __line_show(d, l) { if(d.label.indexOf(l) == 0) { d.lines.show = !d.lines.show; } }
function __set_line_show(d, l, t) { if(d.label.indexOf(l) == 0) { d.lines.show = t; } }
function __line_bold(d, l) { 
    if(d.label.indexOf(l) != 0) return;
    if (d.lines.lineWidth < 2) { d.lines.lineWidth *= 3; } else { d.lines.lineWidth = 1.5; }
}
function __set_line_bold(d, l, t) {
    if(d.label.indexOf(l) != 0) return;
    d.lines.lineWidth = 1.5; t == "bold" ? d.lines.lineWidth *= 3 : d.lines.lineWidth = 1.5;
}
function __group_chk_valid(el) {
    var _group_el = el.parentElement.parentElement.parentElement.parentElement;
    var _group_chk = _group_el.querySelector("summary input[type='checkbox']");
    var _detail_chk = _group_el.querySelectorAll("ul>li>span>input[type='checkbox']");
    var _detail_chked = _group_el.querySelectorAll("ul>li>span>input[type='checkbox']:checked");
    if(_detail_chk.length == _detail_chked.length) { _group_chk.checked = true; }
}
function all_graph(onoff = "on", _graph_type = g_graph_inst) {
    const d = _graph_type.getData();
    if(onoff == "on") d.map(d => {d.lines.show = true;} );
    else d.map(d => {d.lines.show = false;} );
    _graph_type.draw();
}
function toggle_x_system_graph(num = 0, _label_system = hard_system, _graph_type = g_graph_inst) {
    const d = _graph_type.getData(), l = _label_system[num];
    d.map(d => { l.map(l => __line_show(d, l)); });
    _graph_type.draw();
}
function set_x_system_graph(num = 0, _label_system = hard_system, _graph_type = g_graph_inst, _type = true) {
    const d = _graph_type.getData(), l = _label_system[num];
    d.map(d => { l.map(l => __set_line_show(d, l, _type)); });
    _graph_type.draw();
}
function toggle_nth_graph(num = 0, _label = hard_label, _graph_type = g_graph_inst) {
    const d = _graph_type.getData(), l = _label[num];
    console.log("main.js / d, l : ", d, l);
    d.map(d => {
        console.log("main.js / d : ", d);
        __line_show(d, l);
    });
    _graph_type.draw();
}
function toggle_x_system_bold(num  = 0, _label_system = hard_system, _graph_type = g_graph_inst) {
    const d = _graph_type.getData(), l = _label_system[num];
    d.map(d => { l.map(l =>  __line_bold(d, l)); });
    _graph_type.draw();
}
function set_x_system_bold(num  = 0, _label_system = hard_system, _graph_type = g_graph_inst, _type = "bold") {
    const d = _graph_type.getData(), l = _label_system[num];
    d.map(d => { l.map(l => __set_line_bold(d, l, _type)); });
    _graph_type.draw();
}
function toggle_nth_bold(num = 0, _label = hard_label, _graph_type = g_graph_inst) {
    const d = _graph_type.getData(), l = _label[num];
    d.map(d => __line_bold(d, l));
    _graph_type.draw();
}
// <<< 240122 hjkim - 범례 초기화 작업


/* -------------------------------------------------------------------------- */
/*                               WEB WORKER                                   */
/* -------------------------------------------------------------------------- */

function parse_recurse(url        , map, lv, fn_apply_el) {
    if(url == "/ALL/data") return;
    var last_idx = url.lastIndexOf("/");
    var parent_url = url.slice(0, last_idx + 1);
    var sel_list = map[parent_url];
    fn_apply_el(sel_list, lv);
    parse_recurse(parent_url.slice(0, -1), map, ++lv, fn_apply_el);
}

// 웹 워커 생성
const worker = new Worker("js/data.js");
channel1.port2.onmessage = (e) => {
    // console.log("main.js / channel1.port2 / e.data.msg : ", e.data.msg);
    var url, url_history, data, html;
    switch(e.data.msg) {
        
        case "CH1/(a)DASHBOARD_DATA":
        console.log("main.js / CH1/(a)DASHBOARD_DATA / url: ", e.data.url);
        url = e.data.url;
        url_history = e.data.history;
        // 전역변수에 질의할 URL 반영
        window.g_data_url = url;
        retry(`(g_el.timely != null) && (Calendex._fn_init_graph != null)`, 10, 100, () => {
            const sel_el = [g_el.timely, g_el.daily, g_el.monthly, g_el.yearly];
            // URL 파싱해서 Select 박스 UI에 적용.
            parse_recurse(url, url_history.map, 0, (sel_list, lv) => {
                 // 초기화
                var _t = "";
                lv == 0 ? _t = "년" : lv == 1 ? _t = "월" : lv == 2 ? _t = "일" : lv == 3 ? _t = "시" : _t = "";
                sel_el[lv].innerHTML = `<option value=-1 selected>-${_t}(${(sel_list.length)}개)-</option>`;
                sel_list.map((d, idx) => {
                    var is_selected = (url.includes(d)) ? "selected":"";
                    sel_el[lv].innerHTML += `<option value="${d}" ${is_selected}>${d}</option>`;
                });
            });
            Calendex._fn_init_graph();
        });
        // var retry_cnt = 0;
        // var retry_id = setInterval(() => {
        //     const sel_el = [g_el.timely, g_el.daily, g_el.monthly, g_el.yearly];
        //     console.log("main.js / CH1(a)DASHBOARD_DATA / sel_el: ", sel_el);
        //     if(sel_el[0] == null) return;
        //     // 그래프 초기화 함수 존재 여부 || 시도횟수 제한
        //     if(Calendex._fn_init_graph != null || retry_cnt++ > (10*2)) {
        //         // URL 파싱해서 Select 박스 UI에 적용.
        //         parse_recurse(url, url_history.map, 0, (sel_list, lv) => {
        //             sel_list.map((d, idx) => {
        //                 var is_selected = (url.includes(d)) ? "selected":"";
        //                 sel_el[lv].innerHTML += `<option value="${d}" ${is_selected}>${d}</option>`;
        //             });
        //         });
        //         Calendex._fn_init_graph();
        //         clearInterval(retry_id);
        //     }
        // }, 500);
        break;

        case "CH1/(b)YEARLY_REFRESH":
            retry(`g_el.yearly != null`, 10, 100, () => {
                Calendex.refresh_yearly(e.data.list);
                g_el.yearly.value = get_cookie("FDC_calendex_yearly");
            });
        break;
        case "CH1/(c)MONTHLY_REFRESH":
            retry(`g_el.monthly != null`, 10, 100, () => {
                Calendex.refresh_monthly(e.data.list);
                g_el.monthly.value = get_cookie("FDC_calendex_monthly");
            });
        break;
        case "CH1/(d)DAILY_REFRESH":
            retry(`g_el.daily != null`, 10, 100, () => {
                Calendex.refresh_daily(e.data.list);
                g_el.daily.value = get_cookie("FDC_calendex_daily");
            });
        break;
        case "CH1/(e)TIMELY_REFRESH":
            retry(`g_el.timely != null`, 10, 100, () => {
                Calendex.refresh_timely(e.data.list);
                g_el.timely.value = get_cookie("FDC_calendex_timely");
            });
        break;

        case "CH1/(f)BOP_DATA":
        console.log("main.js / CH1/(f)BOP_DATA / url: ", e.data.url);
        url = e.data.url;
        window.g_data_url = url; // 현재 url을 전역변수에 저장
        url_history = e.data.history;
        // 
        retry(`(g_el.timely != null) && (Calendex._fn_init_graph != null)`, 10, 100, () => {
            const sel_el = [g_el.timely, g_el.daily, g_el.monthly, g_el.yearly];
            // URL 파싱해서 Select 박스 UI에 적용.
            parse_recurse(url, url_history.map, 0, (sel_list, lv) => {
                // 초기화
                var _t = "";
                lv == 0 ? _t = "년" : lv == 1 ? _t = "월" : lv == 2 ? _t = "일" : lv == 3 ? _t = "시" : _t = "";
                sel_el[lv].innerHTML = `<option value=-1 selected>-${_t}(${(sel_list.length)}개)-</option>`;
                sel_list.map((d, idx) => {
                    var is_selected = (url.includes(d)) ? "selected":"";
                    sel_el[lv].innerHTML += `<option value="${d}" ${is_selected}>${d}</option>`;
                });
            });
            Calendex._fn_init_graph();
        });

        // 날짜 선택자 초기화
        // var retry_cnt = 0;
        // var retry_id;
        // const sel_el = [g_el.timely, g_el.daily, g_el.monthly, g_el.yearly];
        // if(sel_el[0] != null) fn_select_ui_apply();
        // else retry_id = setInterval(fn_select_ui_apply, 500);
        // function fn_select_ui_apply() {
        //     if(sel_el[0] == null) return false;
        //     // 그래프 초기화 함수 존재 여부 || 시도횟수 제한
        //     if(Calendex._fn_init_graph != null || retry_cnt++ > (10*2)) {
        //         // URL 파싱해서 Select 박스 UI에 적용.
        //         parse_recurse(url, url_history.map, 0, (sel_list, lv) => {
        //             sel_list.map((d, idx) => {
        //                 var is_selected = (url.includes(d)) ? "selected":"";
        //                 console.log("main.js / BOP_DATA / init <select> / d, lv: ", d, lv);``
        //                 sel_el[lv].innerHTML += `<option value="${d}" ${is_selected}>${d}</option>`;
        //             });
        //         });
        //         Calendex._fn_init_graph();
        //         clearInterval(retry_id);
        //     }
        // }

        // flot_data fetch
        channel1.port2.postMessage({msg: "CH1/(4)BOP_DATA_FETCH", url: url, imp_url: "/ALL/data/impedance/imp_data/" });
        break;
        case "CH1/(g)BOP_SOFT_FLOTDATA":
        // 소프트센서그래프와 HW센서 그래프 드로잉
        // console.log("main.js / CH1/(g)BOP_SOFT_FLOTDATA / e.data: ", e.data);
        const softsensor_flotdata = e.data.flotdata;
        if(softsensor_flotdata.length) SoftSensor.Init_sw_sensor_graph(softsensor_flotdata);
        break;
        case "CH1/(h)BOP_HARD_FLOTDATA":
        // console.log("main.js / CH1/(h)BOP_HARD_FLOTDATA / e.data: ", e.data);
        g_graph_data = e.data.flotdata;
        TimeSeriesPlot.mark_flot([]);
        break;
        case "CH1/(i)BOP_BARDATA":
        // console.log("main.js / CH1/(i)BOP_BARDATA / e.data: ", e.data);
        // FLOTDATA
        SoftSensor.init_sth_for_bop_result();
        data = e.data.bardata;
        const stime = e.data.stime;
        const etime = e.data.etime;
        const len = e.data.len;
        const time_flag = e.data.time_flag;
        html = data.reduce((acc_html, d, idx) => {
            acc_html += SoftSensor.run_sth_for_bop_result( (d[0]-stime), d[1], (etime-stime), len, d, time_flag );
            return acc_html;
        }, "");
        SoftSensor.done_sth_for_bop_result(html);
        break;
        case "CH1/(j)STACK_BARDATA":
        console.log("main.js / STACK_BARDATA / e.data: ", e.data);
        // /ALL/data/impedance/imp_data/ & FLOTDATA
        SoftSensor.init_sth_for_stack();
        data = e.data.bardata;
        const _range = e.data.range;
        const timestamp_s = e.data.timestamp_s;
        html = data.reduce((acc_html, d, idx) => {
            acc_html += SoftSensor.run_sth_for_stack(d, _range, timestamp_s)
            return acc_html;
        }, "");
        SoftSensor.done_sth_for_stack(html);
        break;
    }
}

// if(location.pathname.includes("dev/index.html")) {
if(TITLE.includes("대시보드")) {
    worker.postMessage({ msg: "INIT_CHANNEL1", url: BASE_DATA_URI}, [channel1.port1]);
    worker.postMessage({ msg: "INIT_CHANNEL3"}, [channel3.port1]);
	var _state = load_calendex_state();
    if(_state == false) {
        // 
        // CH1/(1)DASHBOARD_INIT ---> CH1/(a)DASHBOARD_DATA
        // 
        channel1.port2.postMessage({ msg: "CH1/(1)DASHBOARD_INIT", url: BASE_DATA_URI});
    } else {
        // 
        // CH1/(2)GET_DIR ---> CH1/(b)YEARLY_REFRESH
        //                |--> CH1/(c)MONTHLY_REFRESH
        //                |--> CH1/(d)DAILY_REFRESH
        //                `--> CH1/(e)TIMELY_REFRESH
        // 
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(b)YEARLY_REFRESH",  url: BASE_DATA_URI });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(c)MONTHLY_REFRESH", url: [BASE_DATA_URI, _state[0]].join("") });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(d)DAILY_REFRESH",   url: [BASE_DATA_URI, _state[0], _state[1]].join("") });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(e)TIMELY_REFRESH",  url: [BASE_DATA_URI, _state[0], _state[1], _state[2]].join("") });
        // 
        window.g_data_url = [BASE_DATA_URI, _state.join("")].join("");
        retry(`Calendex._fn_init_graph != null`, 10, 100, () => {
            Calendex._fn_init_graph();
        });
    }
}

// if(location.pathname.includes("dev/bop.html")) {
if(TITLE.includes("BOP진단")) {
    worker.postMessage({ msg: "INIT_CHANNEL1"}, [channel1.port1]);
    worker.postMessage({ msg: "INIT_CHANNEL3"}, [channel3.port1]);
    var _state = load_calendex_state();
    if(_state == false) {
        // CH1/(3)BOP_INIT ---> CH1/(f)BOP_DATA ---> CH1/(4)BOP_DATA_FETCH ---> CH1/(g)BOP_SOFT_FLOTDATA
        //                                                                 |--> CH1/(h)BOP_HARD_FLOTDATA
        //                                                                 |--> CH1/(i)BOP_BARDATA
        //                                                                 `--> CH1/(j)STACK_BARDATA
        channel1.port2.postMessage({ msg: "CH1/(3)BOP_INIT", url: BASE_DATA_URI});
    } else {
        // 
        // CH1/(2)GET_DIR ---> CH1/(b)YEARLY_REFRESH
        //                |--> CH1/(c)MONTHLY_REFRESH
        //                |--> CH1/(d)DAILY_REFRESH
        //                `--> CH1/(e)TIMELY_REFRESH
        // 
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(b)YEARLY_REFRESH",  url: BASE_DATA_URI });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(c)MONTHLY_REFRESH", url: [BASE_DATA_URI, _state[0]].join("") });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(d)DAILY_REFRESH",   url: [BASE_DATA_URI, _state[0], _state[1]].join("") });
        channel1.port2.postMessage({ msg: "CH1/(2)GET_DIR", response: "CH1/(e)TIMELY_REFRESH",  url: [BASE_DATA_URI, _state[0], _state[1], _state[2]].join("") });
        const _url = [BASE_DATA_URI, _state[0], _state[1], _state[2], _state[3]].join("");
        channel1.port2.postMessage({msg: "CH1/(4)BOP_DATA_FETCH", url: _url, imp_url: "/ALL/data/impedance/imp_data/" });
        
    }
    // setInterval(() => {
    // const msg_obj = { msg: "BOP_DATA_FETCH",  url: window.g_data_url, imp_url: "/ALL/data/impedance/imp_data/"};
    // channel1.port2.postMessage(msg_obj);
    // console.log("main.js / refresh 60s / msg_obj : ", msg_obj);
    // }, 60000);
}

// if(location.pathname.includes("dev/stack.html")) {
if(TITLE.includes("스택진단")) {
    worker.postMessage({ msg: "INIT_CHANNEL2"}, [channel2.port1]);
    // 나머지는 imp.js 로 이전
}

// >>> 240403 hjkim - FDC 캘린덱스 쿠키로 저장
function save_calendex_state() {
	const yearly = g_el.yearly.value;
	const monthly = g_el.monthly.value;
	const daily = g_el.daily.value;
	const timely = g_el.timely.value;
	console.log("cookie : ", [g_el.yearly.value, g_el.monthly.value, g_el.daily.value, g_el.timely.value]);
	set_cookie("FDC_calendex_yearly", yearly, CALENDEX_COOKIE_EXPIRE);
	set_cookie("FDC_calendex_monthly", monthly, CALENDEX_COOKIE_EXPIRE);
	set_cookie("FDC_calendex_daily", daily, CALENDEX_COOKIE_EXPIRE);
	set_cookie("FDC_calendex_timely", timely, CALENDEX_COOKIE_EXPIRE);
	console.log("saved cookie : ", [ get_cookie("FDC_calendex_yearly"), get_cookie("FDC_calendex_monthly"), get_cookie("FDC_calendex_daily"), get_cookie("FDC_calendex_timely") ]);
	return [ get_cookie("FDC_calendex_yearly"), get_cookie("FDC_calendex_monthly"), get_cookie("FDC_calendex_daily"), get_cookie("FDC_calendex_timely") ];
}

function load_calendex_state() {
	if(get_cookie("FDC_calendex_yearly") == "" 
	|| get_cookie("FDC_calendex_monthly") == ""
	|| get_cookie("FDC_calendex_daily") == ""
	|| get_cookie("FDC_calendex_timely") == "") return false;
	return [ get_cookie("FDC_calendex_yearly"), get_cookie("FDC_calendex_monthly"), get_cookie("FDC_calendex_daily"), get_cookie("FDC_calendex_timely") ];
}

function retry(condition       , interval       , limit       , fn_callback            ) {
    var _retry_cnt = 0;
    var is_already_be_called = false;
    if(eval(condition) || _retry_cnt > limit) { fn_callback(); is_already_be_called = true; }
    if(is_already_be_called == false) {
        var _retry_id = setInterval(() => {
            // console.log("retry : ", condition, _retry_cnt);
            if(eval(condition) || _retry_cnt > limit) {
                fn_callback();
                clearInterval(_retry_id);
            }
            _retry_cnt++;
        }, interval);
    }
}

window.g_applying_calendex_state = false;
function apply_calendex_state() {
	retry(`window.g_applying_calendex_state == false`, 10, 100, () => {
		
	window.g_applying_calendex_state = true;
	var r = load_calendex_state();
	if(r == false) return r;
	var _saved_value = r;

	const change_event = new Event("change");
	g_el.yearly.value = _saved_value[0];
	g_el.yearly.dispatchEvent(change_event);

	retry(`g_el.monthly.value != '' && g_el.monthly.value != '-1'`, 10, 100, () => {
	//var change_event = new Event('change');
	g_el.monthly.value = _saved_value[1];
	g_el.monthly.dispatchEvent(change_event);
		retry(`g_el.daily.value != '' && g_el.daily.value != '-1'`, 10, 100, () => {
		//var change_event = new Event('change');
		g_el.daily.value = _saved_value[2];
		g_el.daily.dispatchEvent(change_event);
			retry(`g_el.timely.value != '' && g_el.timely.value != '-1'`, 10, 100, () => {
			//var change_event = new Event('change');
			g_el.timely.value = _saved_value[3];
			g_el.timely.dispatchEvent(change_event);
			window.g_applying_calendex_state = false;
			});
		});
	});
	
	});
}

// <<< 240403 hjkim - FDC 캘린덱스 쿠키로 저장