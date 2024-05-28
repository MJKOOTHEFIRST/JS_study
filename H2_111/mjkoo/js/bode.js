//      

/*
* <script src="bode.js?folder=정상데이터_폴더&el=#imp1" />
*/

// >>> 240305 hjkim - 
window.g_xtick_label={};
window.g_ytick_label={};
window.g_xtick_label["/FDC/work/dev/index.html"] = false;
window.g_ytick_label["/FDC/work/dev/index.html"] = false;
// >>> 240305 hjkim - 

window.g_DEBUG = false;

// >>> 231212 hjkim - FDC에서 진입시, 파라미터 처리
var NEW_SITE = "/NEW/index.html";
var NEW_SITE_BODE = "/NEW/index.bode.html";

function get_qs_from_src() {
    var srcEl = document.currentScript;
    if(srcEl == null) return;
    return srcEl.src.split('?')[1]; 
}
function get_argv_from_qs(qs) {
    var kv_arr = qs.split("&");
    if (kv_arr.length == 0) {return { result: undefined }; }
    var r = {};
    for (var i = 0; i < kv_arr.length; ++i) {
        var kv = kv_arr[i].split("=", 2);
        if (kv.length == 1) r[kv[0]] = "";
        else r[kv[0]] = decodeURIComponent(kv[1].replace(/\+/g, " "));
    }
    return r;
}

var argv_qs, argv;
var ImpedanceChart;
if(TITLE.includes("대시보드")) {
    var DATA_URL = ["/FDC/work/bjy/impedance/normal/", "/FDC/work/bjy/impedance/recent/"];
    var COLOR = ["#00cc00", "#0000cc"];
    
    argv_qs = get_qs_from_src();
    
    window.addEventListener("load", function() { 
        if(argv_qs != null) {
            // Parse Query String
            argv = get_argv_from_qs(argv_qs);
            var placeholder_el = document.querySelector(argv["el"]);
            
            // Clear Placehodler
            placeholder_el.innerHTML = "";
            placeholder_el.style.background = "";
            
            // >>> 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            var component_h = document.querySelector(".widget.stack-status");
            
            // >>> 240305 hjkim - 사이즈 조정
            //var _h = component_h.clientHeight - 55;
            var _w = component_h.clientWidth/2;
            var _h = component_h.clientHeight-50;
            var _square = (_w < _h) ? _w : _h;
            // <<< 240305 hjkim - 사이즈 조정
            
            // <<< 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            
            // Run_BodeChart
            var _BodeChart;
            Run_BodeChart( (_BodeChart || (_BodeChart = {})) );
            _BodeChart.IImpedanceChart_init( placeholder_el, _w, _h );
            
            // >>> 240305 hjkim - 사이즈 조정
            //placeholder_el.style.width = "";
            placeholder_el.firstChild.style.width="";
            // <<< 240305 hjkim - 사이즈 조정
            
            
            // Get Data List
            var _content_arr = [];
            var _content_arr2 = [];
            var e = { target : placeholder_el };
            // 정상 데이터 루프
            access(DATA_URL[0], function(is_access, uri, contents) {
                _content_arr.push(contents);
                var imp_url_list = _BodeChart.IMerge_imp_data_list(_content_arr);
                for(var i = 0; i < imp_url_list.length; i++) {
                    // Draw Impedance Graph
                    var _url = `${DATA_URL[0]}${imp_url_list[i]}`;
                    var _color = COLOR[0];
                    _BodeChart.IAdd_series_in_imp_graph(e, _url, _color);
                }
                
                setTimeout(function() {
                    // 최근 데이터 루프
                    access(DATA_URL[1], function(is_access, uri, contents) {
                        _content_arr2.push(contents);
                        var imp_url_list = _BodeChart.IMerge_imp_data_list(_content_arr2);
                        for(var i = 0; i < imp_url_list.length; i++) {
                            // Draw Impedance Graph
                            var _url = `${DATA_URL[1]}${imp_url_list[i]}`;
                            var _color = COLOR[1];
                            _BodeChart.IAdd_series_in_imp_graph(e, _url, _color);
                        }
                    });
                }, 50);
                
            });
        }
    });
}

switch(location.pathname) {
	case NEW_SITE:
	case NEW_SITE_BODE:
		// Run_BodeChart
		Run_BodeChart( (ImpedanceChart || (ImpedanceChart = {})) );
	break;
}
// <<< 231212 hjkim - FDC에서 진입시, 파라미터 처리


/* -------------------------------------------------------------------------- */
/*                                 GLOBAL_VAR                                 */
/* -------------------------------------------------------------------------- */
window.g_local_imp_data         = {}; // 그래프 토글용 전역변수
window.g_legend_disallow_list   = ["전체범위용",  "범위"];  // 범례(클릭대상) 숨김 단어 목록
window.g_keyword_disallow_list  = ["전체범위용", "범위"]; // 키워드(말풍선) 무시 단어 목록

/* -------------------------------------------------------------------------- */
/*                                임피던스 데이터 목록                           */
/* -------------------------------------------------------------------------- */
window.g_imp_base_url_list = {};
window.g_imp_base_url_list["선별"] = "/ALL/data/impedance/imp_data_bak/";
window.g_imp_base_url_list["선별_기타포함"] = "/ALL/data/impedance/imp_data_edit_etc/";
window.g_imp_base_url_list["로그"] = "/ALL/data/impedance/imp_data/";
window.g_imp_base_url_list["선별_보정"] = "/ALL/data/impedance/imp_data_bak/post_data/";
window.g_imp_base_url_list["로그_보정"] = "/ALL/data/impedance/imp_data_1120/post_data/";
window.g_imp_base_url_sel = "선별";

// 파일 파싱용 식별
window.g_imp_file_prefix = {};
window.g_imp_file_prefix["선별"] = "d";
window.g_imp_file_prefix["로그"] = "d";
window.g_imp_file_prefix["선별_보정"] = "post_d";
window.g_imp_file_prefix["로그_보정"] = "post_d";
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                그래프 상태 변수                               */
/* -------------------------------------------------------------------------- */
window.fn = { init: false };
window.point_helper_twice = 0;
window.tf_imp_data = {}; 
window.is_tranform_axis = false;
window.is_axis_label =  false;
/* -------------------------------------------------------------------------- */

function ImpedanceGraph(id) {
    this.init = function(id) {
        this.$id = id;
    }
    this.template = function() {
        return `<div id="${this.$id}"></div>`;
    }
    /* Constructor */
    this.init(id);
}

function FilterTable(id) {
    this.init = function(id) {
        this.$id = id;
    }
    this.template = function(A, B, C) {
        var style = "max-width: 300px;";
        return `
        <table style="${style}">
            <tbody id="${this.$id}">
            <tr><td>${A}</td></tr>
            <tr><td>${B}</td></tr>
            <tr><td>${C}</td></tr>
            </tbody>
        </table>
        `;
    }
    /* Constructor */
    this.init(id);
}

function ReferenceTable(id) {
    this.init = function(id) {
        this.$id = id;
    }
    this.template = function() {
        var style = "max-width: 300px; font-size: 12px;";
        return `
        <table style="${style}">
            <tbody id="${this.$id}">
            </tbody>
        </table>
        `;
    }
    /* Constroctor */
    this.init(id);
}
/* -------------------------------------------------------------------------- */
/*                                Classification Menu                         */
/* -------------------------------------------------------------------------- */
// 검색어 선택박스 핸들러
ClassificationMenu.onchange_handler = function(imp_base_url_sel) {

    // 목록 받아오기
    window.g_imp_base_url_sel = imp_base_url_sel;
    var _base_url = window.g_imp_base_url_list[imp_base_url_sel];
    var _content_arr = [];
    
    // 키워드 입력부 클리어
    var filter_input_el = document.querySelector("#filterInput");
        filter_input_el.value = "";

    // 임피던스 목록 갱신
    access(_base_url, function(is_access, uri, contents) {
        _content_arr.push(contents);
        // 범례 갱신
        ImpedanceChart.IMerge_imp_data_list(_content_arr);
        // ImpedanceChart.IRef_table_refresh(_base_url, window.g_filtered_imp_data_list);
        // 범례 갱신
        var data_tbl_el = document.querySelector("#ref_table");
        window.g_legend_table = new LegendTable(data_tbl_el, window.g_imp_base_url_list[window.g_imp_base_url_sel]);
    });
}

function ClassificationMenu(base_url_obj, legend_table_inst) {

    this.init = function() {
        // 옵션 선택자
        this.$state = { 
            keys : Object.keys(base_url_obj),
        };
    }
    
    this.template = function() {
        // var style = "width: calc(33% - 5px); padding: 10px;";
        var style = "width: calc(33% - 5px); padding: 5px;";
        return `
        <select style="${style}"
            onchange ="ClassificationMenu.onchange_handler(event.target.value)">
            ${this.$state.keys.map(item => `<option>${item}</option>`).join('')}
        </select>`;
        /*
        return `
        <select id="sub_sel" style="${style}" 
            onchange ="ClassificationMenu.onchange_handler(0, event.target.value)">
            ${this.$state.sub.map(item => `<option>${item}</option>`).join('')}
        </select>
        <select id="amp_sel" style="${style}"
            onchange ="ClassificationMenu.onchange_handler(1, event.target.value)">>
            ${this.$state.amp.map(item => `<option>${item}</option>`).join('')}
        </select>
        <select id="etc_sel" style="${style}"
            onchange ="ClassificationMenu.onchange_handler(2, event.target.value)">>
            ${this.$state.etc.map(item => `<option>${item}</option>`).join('')}
        </select>
        `;
        */
    }

    /* Constructor */
    this.init();
}

/* -------------------------------------------------------------------------- */
/*                                KEYWORD LIST                                */
/* -------------------------------------------------------------------------- */
KeywordList.filename_to_keyword = function(filename, keyword_list) {
    // 파일명 파싱
    filename.substring(1, 11 + 6);
    var legend_name = filename.substring(17 + 10, filename.length - 4);
    var k_arr = legend_name.split("_");
    for(var i = 0; i < k_arr.length; i++) {
        keyword_list[k_arr[i]] = 1;
    }
}
KeywordList.onclick_handler = function(el) { 
    var input_el = document.querySelector("#filterInput");
    // console.log(el.innerText, input_el.value);
    if(input_el.value == "") { // 첫번째 키워드
        input_el.value = el.innerText;
    } else { // 두번째 키워드 이상
        
        if(input_el.value.indexOf(","+el.innerText) > -1) { // 토글 경우 1
            console.log("토글 경우 1");
            input_el.value = input_el.value.replace(","+el.innerText, "");
        } else if(input_el.value.indexOf(el.innerText+",") > -1) { // 토글 경우 2
            console.log("토글 경우 2");
            input_el.value = input_el.value.replace(el.innerText+",", "");
        } else if(input_el.value.indexOf(el.innerText) > -1) { // 토글 경우 3
            console.log("토글 경우 3");
            input_el.value = input_el.value.replace(el.innerText, "");
        } else { // 토글 아님
            console.log("토글 아님");
            input_el.value += ("," + el.innerText);
        }
    }

    var btn_el = document.querySelector("#filterButton");
    btn_el.click();
}
KeywordList.string_to_color = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function KeywordList() {
    
    this.init = function() {
        this.$state = { keyword_arr: [],
                        disallow_list: window.g_keyword_disallow_list };
        this.$style = `font-size: 13px; font-weight: bold;
        cursor:pointer; margin:2px; padding:2px; border:1px solid black;
        border-radius:13px;display:inline-block; margin-top:5px;`;
    }

    this.render = function($target) {
        var html = this.template();
        $target.innerHTML = html;
    }

    this.sort = function(list_arr) {
        var keyword_hashmap = {};
        for(var i = 0; i < list_arr.length; i++) {
            KeywordList.filename_to_keyword(list_arr[i], keyword_hashmap);
        }
        this.$state.keyword_arr = Object.keys(keyword_hashmap);
        this.$state.keyword_arr.sort();
    }

    this.template = function() {
        var html = "";
        var opacity = "88";
        for(var i = 0; i < this.$state.keyword_arr.length; i++) {
            var keyword = this.$state.keyword_arr[i];
            // >>>>>>> 230817 hjkim - 키워드 필터 아웃
            if(keyword == "") continue;
            var is_filterout = false;
            for(var j = 0; j < this.$state.disallow_list.length; j += 1) {
                if(keyword.indexOf(this.$state.disallow_list[j]) > -1) {
                    is_filterout = true;
                    break;
                }
            }
            // <<<<<<< 230817 hjkim - 키워드 필터 아웃
            if(!is_filterout) {
                var hex_color = KeywordList.string_to_color(keyword)+opacity;
                var style = `background-color:${hex_color}; ${this.$style}`;
                html += `<span class="keword-list" style="${style}" onclick="KeywordList.onclick_handler(this)">${keyword}</span>`;
            }
        }
        return html;
    }

    this.clear = function() {
        var els = document.querySelectorAll(".keword-list");
        for(var i = 0; i < els.length; i++) {
            els[i].remove();
        }
    }

    this.refresh = function(list_arr) {
        this.clear();
        this.sort(list_arr);
        this.render(document.querySelector("#keyword_list_wrapper"));
    }

    /* Constructor */
    this.init();
}

/* -------------------------------------------------------------------------- */
/*                                SEARCH INPUT                                */
/* -------------------------------------------------------------------------- */

SearchInput.onkeydown_handler = function(e) {
    if(e.keyCode == 13) SearchInput.onclick_handler();
}

SearchInput.onclick_handler = function() {
    var input_el = document.querySelector("#filterInput");
    var text = input_el.value;
    var text_arr = text.split(",");
    var f_data = window.g_filtered_imp_data_list.filter(function(val, idx, arr) {
        var and_cnt = 0;
        for(var i = 0; i < text_arr.length; i++) {
            and_cnt += val.includes(text_arr[i]);
        }
        return (and_cnt == text_arr.length);
    });
    
    // >>>>>>> 230726 hjkim - 범례 테이블 갱신
    window.g_legend_table.refresh(f_data);
    // <<<<<<< 230726 hjkim - 범례 테이블 갱신
}

function SearchInput() {
    
    this.init = function() {
        this.$state = { list: [] };
    }

    this.template = function() {
        console.log("template", this.$state);
        var btn_style   = "width:60px; padding:10px;";
        var input_style = "padding:10px;";
        var btn2_style  = "width:60px; padding:10px;";
        return `
        <tr><td>
            <button style="${btn_style}" onclick="ImpedanceChart.IAllClick('.legend_all')">범례</button>
            <input  style="${input_style}" id="filterInput" type="text" onkeydown="SearchInput.onkeydown_handler(event)"/>
            <button style="${btn2_style}"  id="filterButton" onclick="SearchInput.onclick_handler()">Set</button>
        </td></tr>
        `;
    }

    /* Constructor */
    this.init();
}

/* -------------------------------------------------------------------------- */
/*                                LEGEND TABLE                                */
/* -------------------------------------------------------------------------- */

/* 파일명을 인수로 받아서 분류하는 함수 */
LegendTable.filename_to_classify = function(filename, cb) {

    var filename = filename.replace(window.g_imp_file_prefix[window.g_imp_base_url_sel], "");
    // 파일명 파싱
    var date = filename.substring(0, 16);
    var _PAD_STR_ = "_imp_data_";
    var _POSTFIX_ = ".txt";
    var legend_name = filename.substring(16 + _PAD_STR_.length, filename.length - _POSTFIX_.length);
    var class_name = "";
    var selected_color;
    // 범례색 분류
    if (0) { }
    else if (new RegExp(".*범위용.*", "gi").test(legend_name)) {
        selected_color = "#FFFFFFFF";
        class_name += " scope_point hidden";
    }
    else if (new RegExp(".*유량센서.*", "gi").test(legend_name)) {
        selected_color = "#FF0000";
        class_name += " flow_sensor";
    }
    else if (new RegExp(".*정상.*", "gi").test(legend_name)) {
        selected_color = "#0EFF00";
        class_name += " normal_legend";
    }
    else if (new RegExp(".*공기.*", "gi").test(legend_name)) {
        // selected_color = "#51E1AD";
        selected_color = "#000000";
        class_name += " air_legend";
    }
    else if (new RegExp(".*물.*", "gi").test(legend_name)) {
        selected_color = "#5FAFF9";
        class_name += " water_legend";
    }
    else if (new RegExp(".*열.*", "gi").test(legend_name)) {
        selected_color = "#F49B9B";
        class_name += " thermal_legend";
    }
    else {
        selected_color = "black";
    }
    cb(date, selected_color, legend_name, class_name);
}

function LegendTable($target, base_url = "/ALL/data/impedance/imp_data/") {
    
    this.init = function() {
        this.$state = { base_url: base_url,
                        disallow_list: window.g_legend_disallow_list };

        var self = this;
        var _content_arr = [];
        access(base_url, function(is_access, uri, contents) {
            _content_arr.push(contents);
            self.$state.list = ImpedanceChart.IMerge_imp_data_list(_content_arr);
            self.refresh(self.$state.list);
            // this.$target.innerHTML = "";
        });
    }
    
    this.render_callback = function(date, selected_color, legend_name, class_name, list_ith) {
        this.$target.innerHTML += this.template(date, selected_color, legend_name, class_name, list_ith);
    }
    
    this.template = function(date, selected_color, legend_name, class_name, list_ith) {
        var base  = this.$state.base_url;
        var style = `color:${selected_color}; cursor:pointer;`;
        var _legend_all_style= `cursor:pointer; text-decoration:underline; color:blue; text-overflow:ellipsis;`;
        var _tr_style = "";
        // >>>>>>> 230817 hjkim - 데이터 축설정 범례 hidden
        for(var i = 0; i < this.$state.disallow_list.length; i += 1) {
            if(legend_name.indexOf(this.$state.disallow_list[i]) > -1) {
                _tr_style = "display: none;"; 
                break;
            }
        }
        // <<<<<<< 230817 hjkim - 데이터 축설정 범례 hidden
        return `
        <tr class="legend-table" style="${_tr_style}"><td>
            <span class="${class_name} legend-table__signifier" style="${style}" onclick="ImpedanceChart.IAdd_series_in_imp_graph(event, '${base}${list_ith}', '${selected_color}')">○</span>
            <span class="${class_name} legend_all" title="${legend_name}" style="${_legend_all_style}" onclick="ImpedanceChart.IAdd_series_in_imp_graph(event, '${base}${list_ith}', '${selected_color}')">${date} : ${legend_name.substring(0, 14)}</span>
        </td></tr>
        `;
    }

    this.clear = function() {
        var els = document.querySelectorAll(".legend-table");
        for(var i = 0; i < els.length; i++) {
            els[i].remove();
        }
    }

    this.refresh = function(list_arr) {
        // >>>>>>> 230816 hjkim - 최신 순서로 정렬
        list_arr = list_arr.sort().reverse();
        if(window.g_DEBUG) { console.log("Legend Refresh(list_arr):", list_arr); }
        // <<<<<<< 230816 hjkim - 최신 순서로 정렬

        // >>>>>>> 230816 hjkim - 필터아웃
        // list_arr = list_arr.filter(function (val, idx, arr) {
        //     if(val.indexOf("post_") > -1) return false;
        //     else return true;
        // });
        // <<<<<<< 230816 hjkim - 필터아웃

        this.clear();
        var self = this;
        for(var i = 0; i < list_arr.length; i++) {
            LegendTable.filename_to_classify(list_arr[i], function (date, selected_color, legend_name, class_name) {
                self.render_callback(date, selected_color, legend_name, class_name, list_arr[i]);
            });
        }
    }
    
    /* Constructor */
    this.$target = $target;
    this.$state = {};
    this.init();
}



/* -------------------------------------------------------------------------- */
/*                               IMPEDANCE CHART                              */
/* -------------------------------------------------------------------------- */
function Run_BodeChart(BodeChart) {
    var g_curr_imp_data;
    var g_curr_filename;
    var g_normal_filtered_imp_data_list;
    var g_air_filtered_imp_data_list;
    var g_wat_filtered_imp_data_list;
    var g_thm_filtered_imp_data_list;
    // >>> 240305 hjkim - 
    var AXIS_MARGIN = { l: 50, t: 35, r: 35, b: 50 };
    switch(location.pathname) {
      case NEW_SITE:
        AXIS_MARGIN = { l: 70, t: 35, r: 35, b: 70 };
      break;
    }
    // <<< 240305 hjkim - 
    var HORIZONTAL_TICK_SPACING = 10;
    var VERTICAL_TICK_SPACING = 10;
    var TICK_WIDTH = 5;
    var TICKS_LINEWIDTH = 1;
    var TICKS_COLOR = "grey";
    var AXIS_LINEWIDTH = 1.0;
    var GRID_LINEWIDTH = 1.0;
    // const AXIS_COLOR = "blue";
    var AXIS_COLOR = "grey";
    var AXIS_ORIGIN = { x: AXIS_MARGIN.l, y: -1 };
    var AXIS_TOP = AXIS_MARGIN.t;
    var AXIS_RIGHT = AXIS_MARGIN.r;
    var AXIS_WIDTH = AXIS_MARGIN.r - AXIS_MARGIN.l;
    var AXIS_HEIGHT = AXIS_MARGIN.b - AXIS_MARGIN.t;
    var NUM_VERTICAL_TICKS = AXIS_HEIGHT / VERTICAL_TICK_SPACING;
    var NUM_HORIZONTAL_TICKS = AXIS_WIDTH / HORIZONTAL_TICK_SPACING;
    var M_OHM = 1000; // 단위 변환 상수    
    var PX_RANGE_PADDING = 100;
    /* -------------------------------------------------------------------------- */
    /*                                    MAIN                                    */
    /* -------------------------------------------------------------------------- */
    function _get_range_convertor(RANGE_A, to_RANGE_B, RANGE_A_MIN, RANGE_B_MIN=0) {
        var fn = function (data) {
            // console.log("#imp / fn_inner : ", mohm_range, px_range, (px_range / mohm_range));
            return ((data - RANGE_A_MIN) * (to_RANGE_B / RANGE_A)) + RANGE_B_MIN;
        };
        return fn;
    }
    var g_impedence_canvas;
    var g_micro_ohm = { init: false,
        min_z: 99999, max_z: 0, min_x: 99999, max_x: 0, max_y: 0, min_y: 99999,
        nyquist_range_x: function () { return Math.abs(this.max_x - this.min_x); },
        nyquist_range_y: function () { return Math.abs(this.max_y - this.min_y); },
        bode_range_z: function () { return Math.round(Math.abs(g_micro_ohm.max_z - g_micro_ohm.min_z)); },
        bode_range_x: function () { return Number(Math.abs(g_micro_ohm.max_x - g_micro_ohm.min_x).toFixed(2)); }
    };
    var g_imp_plot = {
        range_x : function () { return Math.abs(AXIS_ORIGIN.x - AXIS_RIGHT) - PX_RANGE_PADDING; },
        range_y : function() { return Math.abs(AXIS_ORIGIN.y - AXIS_TOP) - PX_RANGE_PADDING; }
    };

    /* 바코드 차트 클릭시 초기화로 한번만 호출되는 함수
    * @data: Array[3, k] 
    *           [ ..., [z, x, y], ...]
    *           ※ z: HZ, x: Real Imp., y: Image Imp.
    * @filename: string
    *           d{yyyy}-{MM}-{dd}-{hh}-{mm}_imp_Data_{label1}_{label2}_{label3}_{label4}.txt
    */
    function IImpedanceChart_add_data(raw_data, filename) {
        if (filename === void 0) { filename = "imp_Datplot"; }
        if (g_impedence_canvas == null) return;
        var ctx = get_ctx(g_impedence_canvas);
        if (ctx == null) return;


        /* ------------------------------ 차트의 제목을 그린다. ------------------------------ */
        ctx.save();
        // draw_title(ctx, AXIS_WIDTH/2, AXIS_MARGIN.t, "Nyquist Plot");
        draw_title(ctx, (AXIS_WIDTH/2)+70, AXIS_MARGIN.t-20, "Bode    Plot");
        ctx.restore();

        // 파일명을 통해 색상을 알아낸다.
        LegendTable.filename_to_classify(filename, function (date, selected_color, legend_name, class_name) {
            // 그래프 그리기 공통 API
            draw_graph_common_api(raw_data, selected_color, filename);
        });
    }
    BodeChart.IImpedanceChart_add_data = IImpedanceChart_add_data;
    function IImpedanceChart_init(placeholder, W = 800, H = 800, type="ALL") {
        var ctx;
        if(type == "ALL") {
            // data = [[], [], [hz, x, y], ..., []];
            // INIT 캔바스 엘리먼트
            var canvas = g_impedence_canvas = init_canvas(placeholder);
            if (canvas == null) return;
            ctx = get_ctx(canvas);
            if (ctx == null) return;
            // INIT 캔바스 크기
            // canvas.width = document.body.clientWidth / 2; // 창의 폭의 1/4
            canvas.width = W; // 너미 고정
            canvas.height = H; // 높이 고정
            canvas.style.width = '100%'; // 캔바스 디스플레이 크기
            // INIT 축설정
            AXIS_ORIGIN = { x: AXIS_MARGIN.l, y: canvas.height - AXIS_MARGIN.t };
            // console.log("#imp / AXIS_ORIGIN: ", AXIS_ORIGIN);
            AXIS_RIGHT = canvas.width - AXIS_MARGIN.r;
            AXIS_WIDTH = AXIS_RIGHT - AXIS_ORIGIN.x;
            AXIS_HEIGHT = AXIS_ORIGIN.y - AXIS_TOP;
            NUM_VERTICAL_TICKS = AXIS_HEIGHT / VERTICAL_TICK_SPACING;
            NUM_HORIZONTAL_TICKS = AXIS_WIDTH / HORIZONTAL_TICK_SPACING;
            // console.log("#imp / NUM_HORIZONTAL_TICKS", NUM_HORIZONTAL_TICKS, AXIS_WIDTH, HORIZONTAL_TICK_SPACING);
        } else {
            var canvas = placeholder.querySelector("canvas");
            console.log(canvas);
            ctx = get_ctx(canvas);
        }
        // grid
        ctx.save();
        draw_horizontal_grid(ctx);
        draw_vertical_grid(ctx);
        ctx.restore();
        // draw_grid(ctx, 10, 10);
        
        // 1.축그림
        ctx.save();
        draw_axes(ctx);
        ctx.restore();
        
    }

    BodeChart.IImpedanceChart_init = IImpedanceChart_init;
    
    // 그래그 그리기 공통 API
    function draw_graph_common_api(raw_data, selected_color, _filename, type = "RAW_DATA") {
		// console.log("draw_graph_common_api");
        //var canvas_el = document.querySelector("[id^=\"impedence_graph__\"]");
		var canvas_el = g_impedence_canvas;
        if (canvas_el == null) {
            alert("캔바스를 찾을 수 없습니다."); return;
        }
        var ctx = get_ctx(canvas_el)
        if (ctx == null) {
            alert("캔바스 컨텍스트를 찾을 수 없습니다."); return;
        }

        /* --------------------------- 0. 데이터를 전처리 한다. ---------------------------
        * bode plot의 경우, z값은 log_10(z)을 한다.
        *                  x값은 log_10(x*1000)을 한다.
        */
        var data;
        if(type == "RAW_DATA") {
            data = _parse_imp_data(raw_data, function(arr) {
                    // >>> Nyquist Plot 전처리
                    // arr[1] *= M_OHM; // x: Real Imp
                    // arr[2] *= M_OHM * -1; // y: -Imag Imp
                    // <<< Nyquist Plot 전처리
                    // >>> Bode Plot 전처리
                    var z = arr[0];
                    var x = arr[1];
                    var y = arr[2];
                    arr[0] = Math.log10(arr[0]);
                    arr[1] = Math.log10(arr[1]*1000);
                    if(isNaN(arr[0]) || isNaN(arr[1]) || isNaN(arr[2])) {
                        console.log("L599 전처리[z,x,y]", z,x,y);
                        console.log("L600 전처리[z,x,y]", arr[0], arr[1], arr[2]);
                        console.log("L601 전처리[filename]", _filename);
                    }
                    // <<< Bode Plot 전처리
            });
        } else {
            data = raw_data;
        }
        /* --------------------------------- 전역 변수에 데이터 로드 --------------------------------- */
        window.g_local_imp_data[_filename] = [data, selected_color];

        /* ------------------------- 1. 해당 데이터에 대한 (z,x,y) * (min,max)값을 구한다. ------------------------- */
        if(window.is_tranform_axis == false) {
            // Bode Plot용 패딩
            var _Z_PADDING = 0.25;
            var _X_PADDING = 0.03;

            var new_min_z = data.reduce(function (acc, d) { return d[0] < acc[0] ? d : acc; })[0] - _Z_PADDING;
            var new_max_z = data.reduce(function (acc, d) { return d[0] > acc[0] ? d : acc; })[0] + _Z_PADDING;
            var new_min_x = data.reduce(function (acc, d) { return d[1] < acc[1] ? d : acc; })[1] - _X_PADDING;
            var new_max_x = data.reduce(function (acc, d) { return d[1] > acc[1] ? d : acc; })[1] + _X_PADDING;
            var new_min_y = 0; // Nyquist Plot에서 Imag Imp.의 음수는 버리므로
            var new_max_y = data.reduce(function (acc, d) { return d[2] > acc[2] ? d : acc; })[2];
            var IS_NEW_MIN_Z = (new_min_z < g_micro_ohm.min_z);
            var IS_NEW_MAX_Z = (new_max_z > g_micro_ohm.max_z);
            var IS_NEW_MIN_X = (new_min_x < g_micro_ohm.min_x);
            var IS_NEW_MAX_X = (new_max_x > g_micro_ohm.max_x);
            var IS_NEW_MIN_Y = (new_min_y < g_micro_ohm.min_y);
            var IS_NEW_MAX_Y = (new_max_y > g_micro_ohm.max_y);
            // 최소, 최대값 갱신시, 그래프 좌표계를 다시 그린다.
            var IS_AXIS_RENEW = (IS_NEW_MIN_Z || IS_NEW_MAX_Z || IS_NEW_MIN_X || IS_NEW_MAX_X || IS_NEW_MIN_Y || IS_NEW_MAX_Y);
            g_micro_ohm.min_z = IS_NEW_MIN_Z ? new_min_z : g_micro_ohm.min_z;
            g_micro_ohm.max_z = IS_NEW_MAX_Z ? new_max_z : g_micro_ohm.max_z;
            g_micro_ohm.min_x = IS_NEW_MIN_X ? new_min_x : g_micro_ohm.min_x;
            g_micro_ohm.max_x = IS_NEW_MAX_X ? new_max_x : g_micro_ohm.max_x;
            g_micro_ohm.min_y = IS_NEW_MIN_Y ? new_min_y : g_micro_ohm.min_y; 
            g_micro_ohm.max_y = IS_NEW_MAX_Y ? new_max_y : g_micro_ohm.max_y;

        /* --------------------- TODO: 2. (h,v) 방향으로 필요한 그리드 갯수를 계산한다. --------------------
        *       만약, 5.51~5.62일 경우, 범위는 0.11 이고 v방향 필요한 그리드의 갯수는 12개이다.
        *           -1.30~2.40일 경우, 범위는 3.7 이고 h방향 필요한 그리드의 갯수는 37개이다.
        */

        
            // Nyquist Plot을 위한 좌표변환 함수
            // >>>>>>> 230620 hjkim - x축 레이블을 위한 스케일 컨버터
            window.fn.ohm2px_x = _get_range_convertor(g_micro_ohm.nyquist_range_x(), g_imp_plot.range_x(), g_micro_ohm.min_x);
            window.fn.ohm2px_y = _get_range_convertor(g_micro_ohm.nyquist_range_y(), g_imp_plot.range_y(), g_micro_ohm.min_y);
            window.fn.px2ohm_x = _get_range_convertor(g_imp_plot.range_x(), g_micro_ohm.nyquist_range_x(), AXIS_ORIGIN.x,   g_micro_ohm.min_x);
            window.fn.px2ohm_y = _get_range_convertor(g_imp_plot.range_y(), g_micro_ohm.nyquist_range_y(), AXIS_TOP,        g_micro_ohm.min_y);
            // <<<<<<< 230620 hjkim - x축 레이블을 위한 스케일 컨버터
            
            // Bode Plot을 위한 좌표변환 함수
            window.fn.bode2px_x = _get_range_convertor(g_micro_ohm.bode_range_z(), g_imp_plot.range_x(), g_micro_ohm.min_z);
            window.fn.bode2px_y = _get_range_convertor(g_micro_ohm.bode_range_x(), g_imp_plot.range_y(), g_micro_ohm.min_x);
            window.fn.px2bode_x = _get_range_convertor(g_imp_plot.range_x(), g_micro_ohm.bode_range_z(), AXIS_ORIGIN.x,     g_micro_ohm.min_z);
            window.fn.px2bode_y = _get_range_convertor(g_imp_plot.range_y(), g_micro_ohm.bode_range_x(), AXIS_TOP,          g_micro_ohm.min_x);
            window.is_tranform_axis = true;
        }

        // >>>>>>> 230609 hjkim - Nyquist Plot일 경우, y값이 양수인 것만 통과
        // data = data.filter(function (val, idx, arr) {
        //     if (val[2] > 0) return true;
        //     else return false;
        // });
        // <<<<<<< 230609 hjkim - Nyquist Plot일 경우, y값이 양수인 것만 통과

        // 2. 스캐터 차트 그림
        ctx.save();
        draw_scatter_bode(ctx, data, window.fn.bode2px_x, window.fn.bode2px_y, selected_color);
        ctx.restore();
        

        if(window.is_axis_label == false) {

            // 3. 최대 최소값 표기
            ctx.save();
            // draw_minmax(ctx, g_micro_ohm, PX_RANGE_PADDING, PX_RANGE_PADDING);
            ctx.restore();

	// >>> 240305 hjkim - 
	if(window.g_xtick_label[location.pathname]) {
            // 4. x축 틱레이블
            ctx.save();
            // draw_xtick_label(ctx, fn_px2ohm_x);
            draw_xtick_label_bode(ctx, window.fn.px2bode_x);a
            ctx.restore();
	}
	// <<< 240305 hjkim - 
	
	// >>> 240305 hjkim - 
	if(window.g_xtick_label[location.pathname]) {
            // 5. y축 틱레이블
            ctx.save();
            // draw_ytick_label(ctx, fn_px2ohm_y);
            draw_ytick_label_bode(ctx, window.fn.px2bode_y);
            ctx.restore();
	}
	// <<< 240305 hjkim - 

            // 6.축제목
            ctx.save();
            // draw_xtitle(ctx, 0, AXIS_ORIGIN.y+35, "Real impedance (mΩ)");
            draw_xtitle(ctx, 0, AXIS_ORIGIN.y+30, "Frequency Log_10(hz)"); //Eung
            // draw_ytitle(ctx, AXIS_ORIGIN.x-35, AXIS_ORIGIN.y+50, "-Imag impedance (mΩ)");
            draw_ytitle(ctx, AXIS_ORIGIN.x-30, AXIS_ORIGIN.y+90, "Real impedance Log_10(mΩ*1000)"); //Eung
            ctx.restore();

            window.is_axis_label = true;
        }
    }

    // 범례 클릭시 시계열 추가마다 호출되는 함수
    function IAdd_series_in_imp_graph(e, url, color) {
        if (color === void 0) { color = "blue"; }
        g_is_init_impedance_graph = true;
        g_is_init_ref_table = true;
        var doc = e.target.parentElement;
        var legend_el = doc.querySelector(".legend-table__signifier");
        // 토글기능
		if(legend_el == null || TITLE.includes("대시보드")) {
			// 범례데이터 가져오기
            fopen(url, function (res) {
                // url->filename 파싱
                var tmp = url.split("/");
                var filename = tmp[tmp.length-1];
                
                // 그래프 그리기 공통 API
                draw_graph_common_api(res, color, filename);
            });
        } else if (legend_el.innerHTML == "○") {
            // ------------------------- 토글 체크
            legend_el.innerHTML = "●";
            // 범례데이터 가져오기
            fopen(url, function (res) {
                // url->filename 파싱
                var tmp = url.split("/");
                var filename = tmp[tmp.length-1];
                
                // 그래프 그리기 공통 API
                draw_graph_common_api(res, color, filename);
            });
            
        } else {
            // ------------------------- 토글 해제
            legend_el.innerHTML = "○";

            // 1. URL링크 삭제
            // url->filename 파싱
            var tmp = url.split("/");
            var filename = tmp[tmp.length-1];
            delete window.g_local_imp_data[filename];
            
            // 2. 그래프 클리어
            BodeChart.IClear_imp_graph_handler("GRAPH_ONLY");

            var keys = Object.keys(window.g_local_imp_data);
            for(var i = 0; i < keys.length; i += 1) {
                var _filename = keys[i];
                var local = window.g_local_imp_data[_filename];
                console.log("L743[_filename]:", _filename, local);
                // 그래프 그리기 공통 API
                draw_graph_common_api(local[0], local[1], _filename, "LOCAL_DATA");
            }
        }
            
    }
    BodeChart.IAdd_series_in_imp_graph = IAdd_series_in_imp_graph;
    /* -------------------------------------------------------------------------- */
    /*                                FUNCTION SET                                */
    /* -------------------------------------------------------------------------- */
    function init_canvas(container) {
        if (container == null) {
            console.error("그래프를 그릴 컨테이너가 없습니다.");
            return null;
        }
        else {
            container.style.position = "relative";
            var c = document.createElement("canvas");
            c.id = "impedence_graph__" + new Date().getTime();
            c.className = "impedence_graph";
            container.appendChild(c);
            return c;
        }
    }

    function get_ctx(canvas) {
        try {
            var ctx = canvas.getContext("2d");
            if (ctx == null) {
                console.error(".barcode_chart 캔버스 요소의 2D 문맥을 얻을 수 없습니다.");
            }
            return ctx;
        }
        catch (error) {
            console.error("캔버스 요소의 2D 문맥을 얻는 동안 에러가 발생함:", error);
            return null;
        }
    }

    function draw_scatter(ctx, data, x_conv, y_conv, color) {
        if (color === void 0) { color = "blue"; }
        var y = -1;
        for (var i = 0; i < data.length; i += 1) {
            var x = data[i][1];
            var y_1 = data[i][2];
            var x_px = x_conv(x);
            var y_px = y_conv(y_1);
            if(isNaN(x) || isNaN(y)) {
                console.log("draw_scatter(x,y):", x, y);
                console.log("draw_scatter(x_px,y_px):", x_px, y_px);
            }
            x_px = Math.round(AXIS_ORIGIN.x + x_px);
            y_px = Math.round(AXIS_ORIGIN.y - y_px);
            // STK  STYLE
            ctx.strokeStyle = color;
            var radius = 5;
            ctx.beginPath();
            ctx.arc(x_px, y_px, radius, 0, Math.PI * 2);
            ctx.stroke();
            // >>>>>>> 230620 hjkim - DEBUG
            if(i == 0 || i == data.length-1) {
                ctx.font = "13 px sans-serif";
                ctx.textAlign = "center";
                var value = `(${Math.round(x)}, ${Math.round(y_1)})`;
                ctx.fillText(value, x_px, y_px-10);
            }
            // <<<<<<< 230620 hjkim - DEBUG
        }
    }

    function draw_scatter_bode(ctx, data, x_conv, y_conv, color) {
        if (color === void 0) { color = "blue"; }
        for (var i = 0; i < data.length; i += 1) {
            // raw  points
            var z = data[i][0];
            var x = data[i][1];
            // draw points 
            var x_px = x_conv(z);
            var y_px = y_conv(x);
            // error check
            if(isNaN(z) || isNaN(x)) {
                console.log("L818[z,x]:", z, x);
                console.log("L819[x_px,y_px]:", x_px, y_px);
            }
            x_px = Math.round(AXIS_ORIGIN.x + x_px);
            y_px = Math.round(AXIS_ORIGIN.y - y_px);
            // STK  STYLE
            ctx.strokeStyle = color;
            var radius = 5;
            ctx.beginPath();
            ctx.arc(x_px, y_px, radius, 0, Math.PI * 2);
            ctx.stroke();
            if(i == 0 || i == data.length-1) { // 처음데이터와 마지막 데이터만
                if(window.point_helper_twice < 2) {
                    // window.point_helper_twice++;
                    // // >>>>>>> 230620 hjkim - DEBUG
                    // ctx.font = "13px sans-serif";
                    // ctx.textAlign = "center";
                    // var value = `(${(z).toFixed(2)}, ${(x).toFixed(2)})`;
                    // var value2 = `[${(z).toFixed(2)}hz, ${(x).toFixed(2)}mΩ]`;
                    // ctx.fillText(value2, x_px, y_px-20);
                    // ctx.fillText(value,  x_px,  y_px-5);
                    // // <<<<<<< 230620 hjkim - DEBUG
                }
            }
            
        }
    }
    
    // >>>>>>> 230620 hjkim - x축 틱 레이블
    function draw_xtick_label(ctx, px2data) {
        ctx.save();
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        var RIGHT_END = AXIS_RIGHT;
        for(var x_px = AXIS_ORIGIN.x; x_px < RIGHT_END; x_px += 100) {
            var tick_value = Math.round(px2data(x_px));
            ctx.fillText(tick_value, x_px, AXIS_ORIGIN.y+15);
        }
        var last_tick_value = px2data(RIGHT_END);
        ctx.fillText(Math.round(last_tick_value), RIGHT_END, AXIS_ORIGIN.y+15);
        ctx.restore();
    }
    function draw_xtick_label_bode(ctx, px2data) {
        ctx.save();
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        var RIGHT_END = AXIS_RIGHT;

        var TICKS = 54; // 틱이 54개
        var _TICK_SPACING = (AXIS_WIDTH / TICKS).toFixed(0)*5; // 배율*5
        var _RESOLUTION = 0.5;
        
        // 원점 (하단)
        var first_tick_value = (px2data(AXIS_ORIGIN.x)).toFixed(2)*1;
        ctx.fillText(first_tick_value, AXIS_ORIGIN.x, AXIS_ORIGIN.y+15);
        
        // 중간점
        for(var x_px = AXIS_ORIGIN.x; x_px < RIGHT_END; x_px += 1) {
            var tick_value = (px2data(x_px)).toFixed(2)*1;
            // 포인트 해상도별 레이블 (상단)
            if((tick_value % _RESOLUTION) == 0) { 
                ctx.fillText(tick_value, x_px, AXIS_TOP-10);
            }
            // 틱 간격별 레이블 (하단)
            if((x_px % _TICK_SPACING) == 0) { 
                ctx.fillText(tick_value, x_px, AXIS_ORIGIN.y+15);
            }
        }

        // 끝점 (하단)
        var last_tick_value = px2data(RIGHT_END).toFixed(2)*1;
        ctx.fillText(last_tick_value, RIGHT_END, AXIS_ORIGIN.y+15);
        ctx.restore();
    }
    // <<<<<<< 230620 hjkim - x축 틱 레이블
    
    // >>>>>>> 230623 hjkim - y축 틱 레이블
    function draw_ytick_label(ctx, px2data) {
        ctx.save();
        var SIZE = 9; //Eung
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "center";
        var TOP_END = AXIS_TOP;

        for(var y_px = AXIS_ORIGIN.y; y_px > TOP_END; y_px -= 100) {
            // console.log("y_px", y_px);
            var tick_value = Math.abs(Math.round(px2data(y_px)));
            ctx.fillText(tick_value, AXIS_ORIGIN.x-15, y_px);
        }

        var last_tick_value = Math.abs(px2data(TOP_END));
        ctx.fillText(Math.round(last_tick_value), AXIS_ORIGIN.x-15, TOP_END);
        ctx.restore();
    }
    function draw_ytick_label_bode(ctx, px2data) {
        ctx.save();
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        var TOP_END = AXIS_TOP;
        
        var TICKS = 54; // 틱이 54개
        var _TICK_SPACING = (AXIS_WIDTH / TICKS).toFixed(0)*5; // 배율*5
        var _RESOLUTION = 0.1;

        // 원점
        var first_tick_value = px2data(TOP_END).toFixed(2)*1;
        ctx.fillText(first_tick_value, AXIS_ORIGIN.x-15, AXIS_ORIGIN.y);
        
        // 중간점
        for(var y_px = AXIS_ORIGIN.y; y_px > TOP_END; y_px -= 5) {
            var tick_value2 = px2data(y_px).toFixed(3)*1;
            // 포인트 해상도별 레이블 (좌단)
            if((tick_value2 % _RESOLUTION) < (_RESOLUTION/70)) {
                ctx.fillText(tick_value2.toFixed(1), AXIS_ORIGIN.x-15, (TOP_END+AXIS_ORIGIN.y)-y_px);
            }
        }
        // 중간점
        for(var y_px = AXIS_ORIGIN.y; y_px > TOP_END; y_px -= 1) {
            var tick_value = px2data(y_px).toFixed(2)*1;
            // 틱 간격별 레이블 (우단)
            if((y_px % _TICK_SPACING) == 0) {
                ctx.fillText(tick_value, AXIS_RIGHT+15, (TOP_END+AXIS_ORIGIN.y)-y_px);
            }
        }
        
        // 끝점
        var last_tick_value = Math.abs(px2data(AXIS_ORIGIN.y));
        ctx.fillText(Math.round(last_tick_value), AXIS_ORIGIN.x-15, TOP_END);
        ctx.restore();
    }
    // <<<<<<< 230623 hjkim - y축 틱 레이블
    
    function draw_grid(ctx, step_x, step_y) {
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 0.5;
        // 세로 선
        for (var i = step_x + 0.5; i < ctx.canvas.width; i += step_x) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, ctx.canvas.height);
            ctx.stroke();
        }
        // 가로 선
        for (var i = step_y + 0.5; i < ctx.canvas.height; i += step_y) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }
    }
    function draw_title(ctx, x, y, text) {
        if (text === void 0) { text = "Title"; }
        ctx.save();
        var SIZE = 11; //Eung
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y - (SIZE / 2));
        ctx.restore();
    }
    function draw_xtitle(ctx, x, y, text) {
        if (text === void 0) { text = "YTitle"; }
        ctx.save();
        var SIZE = 11; //Eung
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "left";
        ctx.translate(x, y);
        ctx.fillText(text, AXIS_HEIGHT / 2, 0);
        ctx.restore();
    }
    
    function draw_ytitle(ctx, x, y, text) {
        if (text === void 0) { text = "YTitle"; }
        ctx.save();
        var SIZE = 11; //Eung
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "left";
        ctx.translate(x, y);
        // ctx.rotate(-Math.PI/4);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(text, AXIS_HEIGHT / 2, 0);
        ctx.restore();
    }
    
    function draw_axes(ctx) {
        ctx.save();
        // Axis Style
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = 'black';
        _draw_horizontal_axis(ctx);
        _draw_vertical_axis(ctx);
        _draw_horizontal_axis_top(ctx);
        _draw_vertical_axis_right(ctx);
        // Tick Style
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = 'black';
        _draw_horizontal_axis_ticks(ctx);
        _draw_vertical_axis_ticks(ctx);
        _draw_horizontal_axis_ticks_top(ctx);
        _draw_vertical_axis_ticks_right(ctx);
        ctx.restore();
    }
    function draw_minmax(ctx, min_max, maxx_right_end=0, maxy_up_end=0) {
        var PADDING_POS = 30;
        ctx.save();
        var minx_text  = `|<--${Math.round(min_max.min_x)}(min_x)`;
        var maxx_text = `(max x)${Math.round(min_max.max_x)}-->|`;
        var miny_text  = `|<--${Math.round(min_max.min_y)}(min_y)`;
        var maxy_text = `(max_y)${Math.round(min_max.max_y)}-->|`;
        var SIZE = 11; //Eung
        ctx.fillStyle = "red";
        ctx.font = `${SIZE}px sans-serif`;
        ctx.textAlign = "left";
        ctx.translate(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "left";
        ctx.fillText(miny_text, 0, -PADDING_POS-5);
        ctx.textAlign = "right";
        ctx.fillText(maxy_text, AXIS_HEIGHT-maxy_up_end, -PADDING_POS-5);
        ctx.restore();
        
        ctx.save();
        ctx.fillStyle = "red";
        ctx.font = `${SIZE}px sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(minx_text,  AXIS_ORIGIN.x, AXIS_ORIGIN.y+PADDING_POS);
        ctx.textAlign = "right";
        ctx.fillText(maxx_text, AXIS_RIGHT-maxx_right_end, AXIS_ORIGIN.y+PADDING_POS);
        ctx.restore();
    }
    function _draw_horizontal_axis(ctx) {
        /* 0.5를 더해주는 이유는 (어떠 어떠한 이유로 해서) 결과적으로 라인이 더 뚜렷하게 나오기 때문이다. */
        ctx.beginPath();
        ctx.moveTo(AXIS_ORIGIN.x + 0.5, AXIS_ORIGIN.y + 0.5);
        ctx.lineTo(AXIS_RIGHT + 0.5, AXIS_ORIGIN.y + 0.5);
        ctx.stroke();
    }
    function _draw_horizontal_axis_top(ctx) {
        ctx.beginPath();
        ctx.moveTo(AXIS_ORIGIN.x + 0.5, AXIS_TOP + 0.5);
        ctx.lineTo(AXIS_RIGHT + 0.5, AXIS_TOP + 0.5);
        ctx.stroke();
    }
    function _draw_vertical_axis(ctx) {
        ctx.beginPath();
        ctx.moveTo(AXIS_ORIGIN.x + 0.5, AXIS_ORIGIN.y + 0.5);
        ctx.lineTo(AXIS_ORIGIN.x + 0.5, AXIS_TOP + 0.5);
        ctx.stroke();
    }
    function _draw_vertical_axis_right(ctx) {
        ctx.beginPath();
        ctx.moveTo(AXIS_RIGHT + 0.5, AXIS_ORIGIN.y + 0.5);
        ctx.lineTo(AXIS_RIGHT + 0.5, AXIS_TOP + 0.5);
        ctx.stroke();
    }
    function _draw_vertical_axis_ticks(ctx) {
        var delta_x;
        var TICKS = 35;
        var TICK_SPACING = AXIS_HEIGHT / TICKS;
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0)
            delta_x = TICK_WIDTH * 1.5;
            else
            delta_x = TICK_WIDTH;
            ctx.moveTo(AXIS_ORIGIN.x, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.lineTo(AXIS_ORIGIN.x + delta_x, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.stroke();
        }
    }
    function _draw_vertical_axis_ticks_right(ctx) {
        var delta_x;
        var TICKS = 35;
        var TICK_SPACING = AXIS_HEIGHT / TICKS;
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0)
            delta_x = TICK_WIDTH * 1.5;
            else
            delta_x = TICK_WIDTH;
            ctx.moveTo(AXIS_RIGHT, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.lineTo(AXIS_RIGHT - delta_x, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.stroke();
        }
    }
    function _draw_horizontal_axis_ticks(ctx) {
        var delta_y;
        var TICKS = 27 * 2;
        var TICK_SPACING = AXIS_WIDTH / TICKS;
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0)
            delta_y = TICK_WIDTH * 1.5;
            else
            delta_y = TICK_WIDTH;
            ctx.moveTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_ORIGIN.y - delta_y);
            ctx.lineTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_ORIGIN.y);
            ctx.stroke();
        }
    }
    function _draw_horizontal_axis_ticks_top(ctx) {
        var delta_y;
        var TICKS = 27 * 2;
        var TICK_SPACING = AXIS_WIDTH / TICKS;
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0)
            delta_y = TICK_WIDTH * 1.5;
            else
            delta_y = TICK_WIDTH;
            ctx.moveTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_TOP);
            ctx.lineTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_TOP + delta_y);
            ctx.stroke();
        }
    }
    function draw_horizontal_grid(ctx) {
        var TICKS = 35;
        var TICK_SPACING = AXIS_HEIGHT / TICKS;
        ctx.strokeStyle = 'lightgray';
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            ctx.moveTo(AXIS_RIGHT, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.lineTo(AXIS_RIGHT - AXIS_WIDTH, 0.5 + AXIS_ORIGIN.y - i * TICK_SPACING);
            ctx.stroke();
        }
        ctx.strokeStyle = 'black';
    }
    function draw_vertical_grid(ctx) {
        var TICKS = 27 * 2;
        var TICK_SPACING = AXIS_WIDTH / TICKS;
        ctx.strokeStyle = 'lightgray';
        for (var i = 1; i < TICKS; ++i) {
            ctx.beginPath();
            ctx.moveTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_TOP);
            ctx.lineTo(0.5 + AXIS_ORIGIN.x + i * TICK_SPACING, AXIS_TOP + AXIS_HEIGHT);
            ctx.stroke();
        }
        ctx.strokeStyle = 'black';
    }

    function IClear_imp_graph_handler(type = "GRAPH_ONLY") {
        console.log("IClear_imp_graph_handler:", type);
        // @type: {ALL, GRAPH_ONLY, AXIS_RENEW}
        Bode.IClear_imp_graph(type);
    }
    BodeChart.IClear_imp_graph_handler = IClear_imp_graph_handler;

    function IClear_imp_graph(type = "ALL") {
        window.is_tranform_axis = false;
        window.is_axis_label = false;
        // 그래프 초기화
        g_is_init_ref_table = false;
        window.point_helper_twice = 0;


        var impedance_graph_el = document.querySelector("#imp_graph");
        var canvas_el = document.querySelector("#imp_graph canvas");
        
        if(type != "AXIS_RENEW") {
            impedance_graph_el.innerHTML = "";
            // 그리드 그리기
            IImpedanceChart_init(impedance_graph_el);
        } else {
            console.log("1.clear Rect");
            var ctx = canvas_el.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, canvas_el.width, canvas_el.height);
            ctx.restore();
            IImpedanceChart_init(impedance_graph_el, "CTX_RENEW");
        }

        switch(type) {
            default:
            case "ALL":
                g_is_init_impedance_graph = false;
                // 키워드 입력부 클리어
                var filter_input_el = document.querySelector("#filterInput");
                filter_input_el.value = "";

                window.g_local_imp_data = {}; // 로컬 데이터 클리어
                window.tf_imp_data = {};

                // 필터요소 초기화
                var filter_input_el = document.querySelector("#filterInput");
                filter_input_el.value = "";
                // >>> 기존코드
                // 범례 테이블 갱신
                // window.legend_table.refresh(window.g_filtered_imp_data_list);
                // <<< 기존코드
                // 범례 갱신
                var _base_url = window.g_imp_base_url_list[window.g_imp_base_url_sel];
                var data_tbl_el = document.querySelector("#ref_table");
                window.g_legend_table = new LegendTable(data_tbl_el, _base_url);
                break;
            case "AXIS_RENEW":
            case "GRAPH_ONLY":
                break;
        }
        
    }
    BodeChart.IClear_imp_graph = IClear_imp_graph;

    function _parse_imp_data(d, callback) {
        var r = [];
        var arr = d.split("\n");
        for (var i = 0; i < arr.length; i++) {
            var arr_arr = [];
            arr_arr = arr[i].split(" ");
            if(window.g_DEBUG) {
                console.log("_parse_imp_data(arr_arr) : ", arr_arr);
            }
            var z = Number(arr_arr[0]);
            var x = Number(arr_arr[1]);
            var y = Number(arr_arr[2]);
            var arr_arr_n = [z, x, y];
            if(window.g_DEBUG) {
                console.log("_parse_imp_data(arr_arr_n) : ", arr_arr_n);
            }
            callback(arr_arr_n);
            r.push(arr_arr_n);
        }
        return r;
    }
    function fopen(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        // console.log("L1241[url]:", url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText.trim());
                    return true;
                }
                else
                return false;
            }
            else
            return false;
        };
        xhr.send();
    }
    function _string_to_color(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    function IAllClick(classname) {
        var el = document.querySelectorAll(classname);
        for (var i = 0; i < el.length; i += 1) { el[i].click(); }
    }
    BodeChart.IAllClick = IAllClick;
    
    var IMG_WIDTH = 1472;
    var IMG_HEIGHT = 575;
    function _get_img_height() {
        if (document.body.clientHeight > IMG_HEIGHT) {
            return g_barcode_tooltip_el.clientHeight;
        }
        else {
            return document.body.clientHeight;
        }
    }
    function _get_img_width() {
        if (document.body.clientWidth > IMG_WIDTH) {
            return IMG_WIDTH;
        }
        else {
            return document.body.clientWidth;
        }
    }
    function _get_img_half_width() {
        if (document.body.clientWidth > IMG_WIDTH) {
            return IMG_WIDTH / 2;
        }
        else {
            return document.body.clientWidth / 2;
        }
    }
    /* 툴팁 엘리먼트 위치 조정 */
    function adjust_position_over(top_pos, left_pos) {
        // >>>>>>> VERTICAL POSITION OVER
        if (top_pos < 0) {
            g_barcode_tooltip_el.style.top = "0px";
        }
        // else if((top_pos+g_barcode_tooltip_el.clientHeight) > e.clientY) {
        //     g_barcode_tooltip_el.style.top  = (dot.y-10)-g_barcode_tooltip_el.clientHeight +"px";
        // }
        // <<<<<<< VERTICAL POSITION OVER
        // >>>>>>> HORIZONTAL POSITION OVER
        if (left_pos < 0) {
            g_barcode_tooltip_el.style.left = "0px";
            // } else if((left_pos+g_barcode_tooltip_el.clientWidth) > window.innerWidth) {
        }
        else if ((left_pos + _get_img_width()) > document.body.clientWidth) {
            // g_barcode_tooltip_el.style.left = (document.body.clientWidth-g_barcode_tooltip_el.clientWidth) +"px";
            g_barcode_tooltip_el.style.left = (document.body.clientWidth - _get_img_width()) + "px";
        }
        // <<<<<<< HORIZONTAL POSITION OVER
    }
    
    function _ref_table_refresh(base_url, filtered_imp_data_list) {
        // >>>>>>> 정상 범례 분류
        // var normal_filtered_imp_data_list = filtered_imp_data_list.filter(function (val, idx, arr) {
        //     var re = ".*\uC815\uC0C1.*.txt";
        //     if (val) { return new RegExp(re, "gi").test(val); }
        //     else return false;
        // });
        // var air_filtered_imp_data_list = filtered_imp_data_list.filter(function (val, idx, arr) {
        //     var re = ".*\uACF5\uAE30.*.txt";
        //     if (val) { return new RegExp(re, "gi").test(val); }
        //     else return false;
        // });
        // var thm_filtered_imp_data_list = filtered_imp_data_list.filter(function (val, idx, arr) {
        //     var re = ".*\uC5F4.*.txt";
        //     if (val) { return new RegExp(re, "gi").test(val); }
        //     else return false;
        // });
        // var wat_filtered_imp_data_list = filtered_imp_data_list.filter(function (val, idx, arr) {
        //     var re = ".*\uBB3C.*.txt";
        //     if (val) { return new RegExp(re, "gi").test(val); }
        //     else return false;
        // });
        
        // >>>>>>> 230726 hjkim - 범례 테이블
        var data_tbl_el = document.querySelector("#ref_table");
        window.g_legend_table = new LegendTable(data_tbl_el, filtered_imp_data_list, base_url);
        // <<<<<<< 230726 hjkim - 범례 테이블
        
        // >>> 범례 테이블 스크롤 높이 조정
        // setTimeout(_adjust_legend_scroll_height, 500);
        // <<< 범례 테이블 스크롤 높이 조정
    }

    // BodeChart.IRef_table_refresh = _ref_table_refresh;

    function merge_imp_data_list(content_arr, contents) {
        var imp_data_list = [];
        for(var i = 0; i < content_arr.length; i++) {
            // >>> impedance 데이터 URI 목록 추출
            var arr = extract_uri_list(content_arr[i]);
            imp_data_list = imp_data_list.concat(arr);
        }
        if(window.g_DEBUG) { console.log("merge_imp_data_list(imp_data_list):", imp_data_list); }
        // >>>>>>> 범례가 달린 파일만 처리
        var filtered_imp_data_list = imp_data_list.filter(function (val, idx, arr) {
            // var url_regex = "^d[0-9]+-[0-9]+-[0-9]+-[0-9]+-[0-9]+_imp_Data.+.txt";
            var url_regex = "d[0-9]+-[0-9]+-[0-9]+-[0-9]+-[0-9]+_imp_Data.+.txt";
            var URL_REGEX = new RegExp(url_regex, "gi");
            if (URL_REGEX.test(val)) { return true;  }
            else                     { return false; }
        });

        window.g_filtered_imp_data_list = filtered_imp_data_list;
        if(window.g_DEBUG) { console.log("merge_imp_data_list(g_filtered_imp_data_list):", window.g_filtered_imp_data_list); }
        
        // >>>>>>> 230728 hjkim - 키워드 목록 갱신
        if(window.keyword_list != null) window.keyword_list.refresh(filtered_imp_data_list);
        // <<<<<<< 230728 hjkim - 키워드 목록 갱신

        return filtered_imp_data_list;
    }
    BodeChart.IMerge_imp_data_list = merge_imp_data_list;
    
    /* 임피던스 그래프 핸들러 */
    var g_is_init_impedance_graph = false;
    var g_is_init_ref_table = false;
    function IImpedance_graph_handler(info) {
        function zero_pad(n) { return (n < 10) ? "0" + n : n; }
        /* -------------------------------------------------------------------------- */
        /*                                   TOOLTIP                                  */
        /* -------------------------------------------------------------------------- */
        // console.log("#POS/get_clientY_in_page():", get_clientY_in_page(), get_barcode_canvasY_in_page());
        
        // >>>>>>> 230508 hjkim - 임피던스 그래프 Init
        if (!g_is_init_impedance_graph) {
            
            // g_barcode_tooltip_el.innerHTML = _get_imp_graph_html("imp_graph", "ref_table", "filter_table");
            
            // >>>>>>> 230727 hjkim - 다이얼로그

            // 스타일 목록
            var style  = "float:right; width:30px; height:30px; margin-top:10px; margin-right:10px;";
            var style2 = "width:100%; display:inline-block;";
            var style3 = "width:calc(100% - 350px); display:inline-block; position:relative; top:0; left:0; min-width:400px;";
            var style4 = "float:right; min-width:300px; height:100%; margin:0; padding:0;";
            var style5 = "max-height:800px; overflow:auto;";
            
            // 컴포넌트 목록
            var impedance_graph = new ImpedanceGraph("imp_graph");
            var filter_table    = new FilterTable("filter_table");
            var reference_table = new ReferenceTable("ref_table");
            // >>>>>>> 230725 hjkim - 범례 검색창
            var classification_menu = new ClassificationMenu(window.g_imp_base_url_list);
            var keyword_list        = new KeywordList();
                window.keyword_list = keyword_list;
            var search_input        = new SearchInput();
            // <<<<<<< 230725 hjkim - 범례 검색창

            // -----------------------------STYLE---------------------------------------------
            var _classification_menu_style = "width:calc(100% - 5px); padding:8px;";
            var _keyword_list_style = "font-size: 13px; font-weight: bold;";
            _keyword_list_style += "cursor:pointer; margin:2px; padding:2px; border:1px solid black;";
            _keyword_list_style += "border-radius:13px;display:inline-block; margin-top:5px;";
            var _check_all_style    = "padding:5px;";
            var _search_input_style = "padding:5px;";
            var _search_find_style  = "padding:5px;";
            var _clear_btn_style    = "padding:5px;";
            var _filter_tbl_style   = "max-width: 300px;";
            var _unicode_clear      = "&#129529;";
            var _unicode_find       = "&#128269;";
            var _unicode_chk_all    = "&#9989;";
            var _help_clear = "그래프와 범례를 클리어합니다.";
            var _help_chk_all = "범례를 클릭하여 반전합니다.";
            var _help_find = "키워드를 검색합니다.";

            /*
            ${keyword_list.$state.keyword_arr.map(item => {
                var _opacity = 88;
                var _hex_color = KeywordList.string_to_color(keyword) + _opacity;
                var _style = `background-color:${_hex_color}; ${_keyword_list_style}`;
                return `<span class="keword-list" style="${_style}" onclick="KeywordList.onclick_handler(this)">${item}</span>`
            })}
            */

            // -----------------------------HTML----------------------------------------------
            g_barcode_tooltip_el.innerHTML = `
            <section>
                <button onclick="ImpedanceChart.ILeftRight_toggle_handler()">↔</button>
                <button onclick="BarcodeChart.IClose_tooltip_handler()" style="${style}">X</button>
            </section>
            <div id="wrapper" style="${style2}">
                <div style="${style3}">${impedance_graph.template()}</div>
                <div style="${style4}">
                    
                    <table style="${_filter_tbl_style}">
                        <tbody id="imp_graph">
                        <tr><td>
                        <!-- 분류 메뉴 -->
                        <select style="${_classification_menu_style}" onchange ="ClassificationMenu.onchange_handler(event.target.value)">
                            ${classification_menu.$state.keys.map(item => `<option>${item}</option>`).join('')}
                        </select>
                        </td></tr>
                        <tr><td>
                        <!-- 키워드 풍선 -->
                        <div id="keyword_list_wrapper">
                            ${keyword_list.template()}
                        </div>
                        </td></tr>
                        <tr><td>
                        <!-- 검색 상자 -->
                        <tr><td>
                            <button style="${_clear_btn_style}"    title="${_help_clear}"   onclick="ImpedanceChart.IClear_imp_graph()">${_unicode_clear}</button>
                            <button style="${_check_all_style}"    title="${_help_chk_all}" onclick="ImpedanceChart.IAllClick('.legend_all:not(.hidden)')">${_unicode_chk_all}</button>
                            <input  style="${_search_input_style}" id="filterInput" type="text" onkeydown="SearchInput.onkeydown_handler(event)"/>
                            <button style="${_search_find_style}"  title="${_help_find}"    id="filterButton" onclick="SearchInput.onclick_handler()">${_unicode_find}</button>
                        </td></tr>
                        </tbody>
                    </table>

                    <div id="table-scroll" style="${style5}">${reference_table.template()}</div>
                </div>
            </div>`;
            // -----------------------------HTML----------------------------------------------
            // <<<<<<< 230727 hjkim - 다이얼로그

            var impedance_graph_el = document.querySelector("#imp_graph");
            IImpedanceChart_init(impedance_graph_el);
            g_is_init_impedance_graph = true;
        }
        // console.log("#imp / info : ", info);

        // >>>>>>> 1. 임피던스 데이터 목록 가져오기
        // var _base_url = window.g_imp_base_url_list[window.g_imp_base_url_sel];
        var _base_url = window.g_imp_base_url_list["로그"];
        var _content_arr = [];
        
        access(_base_url, function(is_access, uri, contents) {
            _content_arr.push(contents);
            var imp_list = merge_imp_data_list(_content_arr);
            handler(imp_list, _base_url);
        });
        
        // <<<<<<< 1. 임피던스 데이터 목록 가져오기

        function handler(imp_data_list, base_url) {
            // <<< impedance 데이터 URI 목록 추출
            // >>> 목록에서 현재 클릭한 box의 시간과 일치하는 url 경로 매칭
            var box_date = new Date(info.time);
            var y = zero_pad(box_date.getFullYear());
            var m = zero_pad(box_date.getMonth() + 1);
            var d = zero_pad(box_date.getDate());
            var h = zero_pad(box_date.getHours());
            var min = zero_pad(box_date.getMinutes());
            // 경로 : /ALL/data/impedance/imp_data/d2023-04-04-10-51_imp_Data.txt
            var url_regex = "d" + y + "-" + m + "-" + d + "-" + h + "-" + min + "_imp_Data.*.txt";
            var URL_REGEX = new RegExp(url_regex, "gi");
            var url = "";
            for (var i = 0; i < imp_data_list.length; i += 1) {
                var r = imp_data_list[i].match(URL_REGEX);
                if (r != null) {
                    url = base_url + r[0];
                    filename = r[0];
                }
            }
            if (url == "") {
                alert("매칭된 URL이 없습니다.");
                return;
            }
            // <<< 목록에서 현재 클릭한 box의 시간과 일치하는 url 경로 매칭
            // ### 1. INIT RIGHT SIDE CANVAS(impedence graph)
            fopen(url, function (res) {
                // 그래프 그리기
                IImpedanceChart_add_data(res, filename);
            });

            // 범례 갱신
            var data_tbl_el = document.querySelector("#ref_table");
            window.g_legend_table = new LegendTable(data_tbl_el, window.g_imp_base_url_list[window.g_imp_base_url_sel]);
            
            // if (!g_is_init_ref_table) {
            //     _ref_table_refresh(base_url, window.g_filtered_imp_data_list);
            //     g_is_init_ref_table = true;
            // }
        }
    }

    BodeChart.IImpedance_graph_handler = IImpedance_graph_handler;

    function _adjust_legend_scroll_height() {
        var wrapper_el = document.querySelector("#imp_graph");
        var wrapper_h = wrapper_el === null || wrapper_el === void 0 ? void 0 : wrapper_el.clientHeight;
        var table_scroll_el = document.querySelector("#table-scroll");
        var saved_style = table_scroll_el === null || table_scroll_el === void 0 ? void 0 : table_scroll_el.getAttribute("style");
        table_scroll_el === null || table_scroll_el === void 0 ? void 0 : table_scroll_el.setAttribute("style", saved_style + ("max-height:" + wrapper_h + "px;"));
    }
    
    var g_is_right_side = true;
    function ILeftRight_toggle_handler() {
        var barcode_tooltip_el = document.querySelector("#barcode_tooltip");
        console.log(barcode_tooltip_el, g_is_right_side);
        if(g_is_right_side) {
            barcode_tooltip_el.style.left = "0px";
            barcode_tooltip_el.style.right = "";
            g_is_right_side = false;
        } else {
            barcode_tooltip_el.style.left = "";
            barcode_tooltip_el.style.right = "0px";
            g_is_right_side = true;
        }
    }
    BodeChart.ILeftRight_toggle_handler = ILeftRight_toggle_handler;
    
}
