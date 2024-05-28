//
{let e,t,r,o,n,l,s,f,i,h,w,a,d,u,_,c,S,g,y,b,m,v,j,x,O,V;s=Object.getPrototypeOf,i={},h=s(f={isConnected:1}),w=s(s),a=(e,t,r,o)=>(e??(setTimeout(r,o),new Set)).add(t),d=(e,t,o)=>{let n=r;r=t;try{return e(o)}catch(e){return console.error(e),o}finally{r=n}},u=e=>e.filter(e=>e.t?.isConnected),_=e=>n=a(n,e,()=>{for(let e of n)e.o=u(e.o),e.l=u(e.l);n=l},1e3),c={get val(){return r?.i?.add(this),this.rawVal},get oldVal(){return r?.i?.add(this),this.h},set val(o){r?.u?.add(this),o!==this.rawVal&&(this.rawVal=o,this.o.length+this.l.length?(t?.add(this),e=a(e,this,O)):this.h=o)}},S=e=>({__proto__:c,rawVal:e,h:e,o:[],l:[]}),g=(e,t)=>{let r={i:new Set,u:new Set},n={f:e},l=o;o=[];let s=d(e,r,t);s=(s??document).nodeType?s:new Text(s);for(let e of r.i)r.u.has(e)||(_(e),e.o.push(n));for(let e of o)e.t=s;return o=l,n.t=s},y=(e,t=S(),r)=>{let n={i:new Set,u:new Set},l={f:e,s:t};l.t=r??o?.push(l)??f,t.val=d(e,n,t.rawVal);for(let e of n.i)n.u.has(e)||(_(e),e.l.push(l));return t},b=(e,...t)=>{for(let r of t.flat(1/0)){let t=s(r??0),o=t===c?g(()=>r.val):t===w?g(r):r;o!=l&&e.append(o)}return e},m=(e,t,...r)=>{let[o,...n]=s(r[0]??0)===h?r:[{},...r],f=e?document.createElementNS(e,t):document.createElement(t);for(let[e,r]of Object.entries(o)){let o=t=>t?Object.getOwnPropertyDescriptor(t,e)??o(s(t)):l,n=t+","+e,h=i[n]??(i[n]=o(s(f))?.set??0),a=e.startsWith("on")?(t,r)=>{let o=e.slice(2);f.removeEventListener(o,r),f.addEventListener(o,t)}:h?h.bind(f):f.setAttribute.bind(f,e),d=s(r??0);e.startsWith("on")||d===w&&(r=y(r),d=c),d===c?g(()=>(a(r.val,r.h),f)):a(r)}return b(f,...n)},v=e=>({get:(t,r)=>m.bind(l,e,r)}),j=new Proxy(e=>new Proxy(m,v(e)),v()),x=(e,t)=>t?t!==e&&e.replaceWith(t):e.remove(),O=()=>{let r=0,o=[...e].filter(e=>e.rawVal!==e.h);do{t=new Set;for(let e of new Set(o.flatMap(e=>e.l=u(e.l))))y(e.f,e.s,e.t),e.t=l}while(++r<100&&(o=[...t]).length);let n=[...e].filter(e=>e.rawVal!==e.h);e=l;for(let e of new Set(n.flatMap(e=>e.o=u(e.o))))x(e.t,g(e.f,e.t)),e.t=l;for(let e of n)e.h=e.rawVal},V={add:b,tags:j,state:S,derive:y,hydrate:(e,t)=>x(e,g(t,e))},window.van=V;}

var ImpedanceChart = {}; // Interface for barcode_chart.js

(function(ImpedanceChart) { // Variable Scope Isolation

/*
* folder=정상데이터_폴더&el=#imp1
*/

// >>> 231212 hjkim - FDC에서 진입시, 파라미터 처리
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

/* -------------------------------------------------------------------------- */
/*                         스택진단메뉴 / 하단 그래프(고성능 UPLOT)           */
/* -------------------------------------------------------------------------- */
var UPLOT_LIB_LOADED = false;
// current path : /FDC/work/dev/js/imp.js
fn_load_css("../hjkim/lib/uPlot.min.css");
fn_load_js("/NEW/flot/color_palette.js", () => {
    fn_load_js("../hjkim/lib/uPlot.iife.min.js", () => { UPLOT_LIB_LOADED = true; });
});

function fn_load_js(src_url        , cb_init            ) {	
    var my_head = document.getElementsByTagName('head')[0];
    var my_js = document.createElement('script');
    my_js.type= 'text/javascript';
    my_js.async = true;
    my_js.src = src_url;
    if(cb_init !== null) my_js.onload = function (){if(typeof cb_init == "function"){cb_init();} };
    my_head.appendChild(my_js);
}
function fn_load_css(src_url        ) {
    var my_head = document.getElementsByTagName('head')[0];
    var my_css = document.createElement('link');
    my_css.type= 'text/css';
    my_css.async = true;
    my_css.rel = "stylesheet";
    my_css.href = src_url;
    my_head.appendChild(my_css);
}
function retry(condition       , interval       , limit       , fn_callback            ) {
    var _retry_cnt = 0;
    if(eval(condition) || _retry_cnt > limit) { fn_callback(); }
    var _retry_id = setInterval(() => {
        // console.log("retry : ", condition, _retry_cnt);
        if(eval(condition) || _retry_cnt > limit) {
            fn_callback();
            clearInterval(_retry_id);
        }
        _retry_cnt++;
    }, interval);
}

if(TITLE.includes("스택진단")) {
    /* -------------------------------------------------------------------------- */
    /*                           스택진단 / 하단 그래프 초기화                    */
    /* -------------------------------------------------------------------------- */
    window.addEventListener("load", () => {
        g_el.fullcell_graph_body = document.querySelector(".widget.fullcell-graph .widget-body");
        g_el.fullcell_graph_calendex = document.querySelector(".widget.fullcell-graph .widget-body .inner-content div");
        g_el.hz_graph_img = document.querySelector(".widget.fullcell-graph .widget-body .inner-content .row .col img");
        g_el.hz_graph_result = document.querySelector(".widget.fullcell-graph .widget-body .inner-content .row .col .result");
        
        
        g_el.hz_graph_parents = g_el.hz_graph_img.parentNode;
        g_el.hz_graph_parents.style.marginTop = 0;
        
        // 디자인 시안 삭제
        g_el.hz_graph_img.remove();
        g_el.hz_graph_result.remove();
        
        // >>> 캘린덱스를 스택, 암페어 필터로 전환이용
        g_el.fullcell_graph_calendex.querySelector("button").remove();
        g_el.fullcell_graph_calendex.querySelector("button").remove();
        // console.log("imp.js / yearly : ", g_el.yearly);
        // console.log("imp.js / monthly : ", g_el.monthly);
        g_el.fullcell_graph_calendex.querySelector("#daily").remove();
        g_el.fullcell_graph_calendex.querySelector("#timely").remove();
        // <<< 캘린덱스를 스택, 암페어 필터로 전환이용
        
        // 그래프 그릴 자리 마련
        let placeholder = g_el.hz_graph_parents;
        const padding = 10;
        pl_w = g_el.fullcell_graph_body.clientWidth-(padding*2);
        pl_h = g_el.fullcell_graph_body.clientHeight-(padding*2);
        
        // 그래프 초기화 데이터
        let data = [
            [1546300800, 1546387200],    // x-values (timestamps)
            [        35,         71],    // y-values (series 1)
            [        90,         15],    // y-values (series 2)
        ];
        // 그래프 옵션
        let opts = {
            id: "hz_chart1", class: "hz-chart",
            width: pl_w, height: pl_h,
            series: [],
            scales: {
                x: { time: false, },
                y: {},
            },
            axies: [
                {},
                {
                    show: true,
                    space: 50,
                    side: 1, 
                    label: "Real Ohm",
                    labelGap:8, 
                    labelSize: 30,
                    // labelFont: "bold 12px Arial",
                    // font: "12px Arial",
                    // gap: 5,
                    size: 50,
                    scale: "y",
                    values: (u, vals, space) => vals.map(v => +v.toFixed(1) + "Ohm"),
                }
            ],
            padding: [null, 0, null, 0],
        };
        window.uplot_default_opt = opts;
        window.uplot_placeholder = placeholder;
        
        const drawPoints = (u, seriesIdx, idx0, idx1) => {
            const pxRatio = 1.5;
            const size = 5 * pxRatio;
            u.ctx.save();
            uPlot.orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc) => {
                let d = u.data[seriesIdx];
                // u.ctx.fillStyle = series.stroke();
                u.ctx.strokeStyle = series.stroke();
                let deg360 = 2 * Math.PI;
                let p = new Path2D();
                
                for (let i = 0; i < d[0].length; i++) {
                    let xVal = d[0][i];
                    let yVal = d[1][i];
                    
                    if (xVal >= scaleX.min && xVal <= scaleX.max && yVal >= scaleY.min && yVal <= scaleY.max) {
                        let cx = valToPosX(xVal, scaleX, xDim, xOff);
                        let cy = valToPosY(yVal, scaleY, yDim, yOff);
                        
                        p.moveTo(cx + size/2, cy);
                        arc(p, cx, cy, size, 0, deg360);
                    }
                }
                u.ctx.stroke(p);
            });
            u.ctx.restore();
            return null;
        };
        
        const opts_scatter = {
            // title: "Scatter Plot",
            mode: 2,
            width: window.uplot_scatter_placeholder.clientWidth,
            height: window.uplot_scatter_placeholder.clientHeight-50,
            legend: { live: false, },
            hooks: {
                drawClear: [
                    u => { u.series.forEach((s, i) => { if (i > 0) s._paths = null; }); },
                ],
            },
            scales: {
                x: { time: false, },
                y: {},
            },
            series: [
                {},
                {
                    stroke: "blue",
                    paths: drawPoints,
                },
            ],
        };
        window.uplot_scatter_opts = opts_scatter;
        
        
        // g_el.fullcell_graph_calendex.remove();
        
    });
}

/* -------------------------------------------------------------------------- */
/*                      워커 쓰레드와 데이터 송수신                           */
/* -------------------------------------------------------------------------- */
function _selectbox_wait(onoff        ) {
    if(onoff == true) {
        g_el.yearly.setAttribute("disabled",  true);
        g_el.monthly.setAttribute("disabled", true);
    } else {
        g_el.yearly.removeAttribute("disabled");
        g_el.monthly.removeAttribute("disabled");
    }
}
var init_stack_change_handler_once = false;
function init_stack_change_handler() {
    if(init_stack_change_handler_once) return;
    init_stack_change_handler_once = true;
    g_el.yearly.addEventListener("change", (e) => {
        const selected = e.target.value;
        // 
        _selectbox_wait(true);
        const _url = `/ALL/data/impedance/${g_el.yearly.value}/${g_el.monthly.value}`.replaceAll("//", "/");
        console.log("imp.js / _url : ", _url);
        channel2.port2.postMessage({ msg: "HZ_DATAFETCH", url: _url});
    });
}
var init_amp_eventhandler_once = false;
function init_amp_eventhandler() {
    if(init_amp_eventhandler_once) return;
    init_amp_eventhandler_once = true;
    g_el.monthly.addEventListener("change", (e) => {
        const selected = e.target.value;
        // 
        _selectbox_wait(true);
        const _url = `/ALL/data/impedance/${g_el.yearly.value}/${g_el.monthly.value}`.replaceAll("//", "/");
        console.log("imp.js / _url : ", _url);
        channel2.port2.postMessage({ msg: "HZ_DATAFETCH", url: _url});
    });
}
// >>> 240321 hjkim - 스택 상태 그래프
window. color_cnt = 0;
channel2.port2.onmessage = (e) => {
    switch(e.data.msg) {
        case "DRAW_IMPDATA":
            var _grid_el = document.querySelector(".widget-body.d-grid");
            var _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
            var _e = { target: _pholder_arr[0] };
            ImpedanceChart.IAdd_series_in_imp_graph(_e, e.data.url, e.data.color);
        break;
        case "DRAW_NYQUIST":
            var _grid_el = document.querySelector(".widget-body.d-grid");
            var _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
            var _pad_x = (_pholder_arr[0].clientWidth  / 3) * 1;
            var _pad_y = (_pholder_arr[0].clientHeight / 3) * 1;
            ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 0, 50 /* 우측으로 쉬프트 */);
        break;
        case "DRAW_NYQUIST__RELATIVE":
            var _grid_el = document.querySelector(".widget-body.d-grid");
            var _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
            var _pad_x = (_pholder_arr[0].clientWidth  / 3) * 1;
            var _pad_y = (_pholder_arr[0].clientHeight / 3) * 1;
            // >>> 240418 상대좌표계를 위한 설정
            ImpedanceChart.graph_axis_reset();
            // e.data.color = color_palette[window.color_cnt];
            // <<< 240418 상대좌표계를 위한 설정
            switch(e.data.compact) {
                case "LTRB":
                    ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 1, 0 /*원점*/);
                break;
                case "LTB":
                    ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 2, 0 /*원점*/);
                break;
                case "LB":
                    ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 3, 0 /*원점*/);
                break;
                case "LBR":
                    ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 4, 0 /*원점*/);
                break;
            }
        break;
        // case "DRAW_NYQUIST__RELATIVE__GREEN":
        //     var _grid_el = document.querySelector(".widget-body.d-grid");
        //     var _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
        //     var _pad_x = (_pholder_arr[0].clientWidth  / 3) * 1;
        //     var _pad_y = (_pholder_arr[0].clientHeight / 3) * 1;
        //     // >>> 240418 상대좌표계를 위한 설정
        //     ImpedanceChart.graph_axis_reset();
        //     e.data.color = "#00FF00";
        //     // <<< 240418 상대좌표계를 위한 설정
        //     ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 1, 50);
        // break;
        // case "DRAW_NYQUIST__RELATIVE__BLUE":
        //     var _grid_el = document.querySelector(".widget-body.d-grid");
        //     var _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
        //     var _pad_x = (_pholder_arr[0].clientWidth  / 3) * 1;
        //     var _pad_y = (_pholder_arr[0].clientHeight / 3) * 1;
        //     // >>> 240418 상대좌표계를 위한 설정
        //     ImpedanceChart.graph_axis_reset();
        //     e.data.color = "#0000FF";
        //     // <<< 240418 상대좌표계를 위한 설정
        //     ImpedanceChart._draw_imp_data(e.data.data, e.data.color, _pholder_arr[0], _pad_x, _pad_y, 1, 50);
        // break;
        // case "UPLOT_IMPDATA":
        //     console.log("imp.js / UPLOT_IMPDATA / e.data.data : ", e.data.data);
        //     const data = e.data.data;
        //     window.uplot_scatter_data = data;
        //     retry(`window.uplot_scatter_opts != undefined && window.uplot_1scatter_placeholder != undefined`, 50, 10, () => {
        //         console.log("imp.js / UPLOT_IMPDATA / retry : ", [window.uplot_scatter_opts, window.uplot_scatter_data, window.uplot_1scatter_placeholder]);
        //         g_el.uplot_imp = new uPlot(window.uplot_scatter_opts, window.uplot_scatter_data, window.uplot_scatter_placeholder);
        //     });
        // break;
        case "STACK_LIST":
            var list = e.data.list;
            var _html = "<select>";
            var selected = "";
            list.map(value => {
                if(value.includes("stk2")) selected = "selected";
                _html+= `<option value="${value}" ${selected}>${value}</option>`;
            });
            _html+= "</select>";
            g_el.yearly.innerHTML = _html;
            // 이벤트 핸들러 바인딩
            setTimeout(init_stack_change_handler, 10);
            channel2.port2.postMessage({ msg: "GET_LIST", url: `/ALL/data/impedance/${list[0]}`, word: "A"});
        break;
        case "AMP_LIST":
            var list = e.data.list;
            var _html = "<select>";
            var selected = "";
            list.map(value => {
                if(value.includes("40A")) selected = "selected";
                _html+= `<option value="${value}" ${selected}>${value}</option>`;
            });
            _html+= "</select>";
            g_el.monthly.innerHTML = _html;
            // 이벤트 핸들러 바인딩
            setTimeout(init_amp_eventhandler, 10);
        break;
        case "UPDATE_DEFAULT_UPLOTOPT":
            var uplotopt_series = e.data.uplotopt_series;
            for(var i = 0; i < uplotopt_series.length; i++) {
                uplotopt_series[i].values = eval(uplotopt_series[i].values);
            }
            window.uplotopt_series = uplotopt_series;
            retry(`window.uplot_default_opt != undefined && window.uplot_default_opt["series"] != undefined`, 50, 10, () => {
                window.uplot_default_opt.series = uplotopt_series;
            });
        break;
        case "DRAW_HZDATA":
            if(g_el.uplot != undefined) {
                g_el.uplot.destroy();
                delete g_el.uplot;
            }
            const uplotdata = e.data.uplotdata;
            window.uplotdata = uplotdata;
            retry(`window.uplot_default_opt != null &&  window.uplotdata != null && window.uplot_placeholder != null`, 500, 10, () => {
                _selectbox_wait(false);
                if(g_el.uplot == undefined) g_el.uplot = new uPlot(window.uplot_default_opt, window.uplotdata, window.uplot_placeholder)
            });
        break;
    }
}
if(TITLE.includes("스택진단")) {
    channel2.port2.postMessage({ msg: "STACK_INIT", 
        upper_url: ["/FDC/work/bjy/impedance/normal/", "/FDC/work/bjy/impedance/recent/"],
        bottom_url: "/ALL/data/impedance/"});
    channel2.port2.postMessage({ msg: "GET_LIST", url: "/ALL/data/impedance/", word: "stk"});
    _selectbox_wait(true);
    channel2.port2.postMessage({ msg: "HZ_DATAFETCH", url: "/ALL/data/impedance/stk2/40A/"});
}

if(TITLE.includes("대시보드")) {
    var argv_qs, argv;
    var DATA_URL = ["/FDC/work/bjy/impedance/normal/", "/FDC/work/bjy/impedance/recent/"];
    var COLOR = ["#00cc00", "#0000cc"];
    argv_qs = get_qs_from_src();
    /* -------------------------------------------------------------------------- */
    /*                     대시모드 / 상단 그래프 초기화                          */
    /* -------------------------------------------------------------------------- */
    window.addEventListener("load", function() { 
        if(argv_qs != null) {
            // Parse Query String
            argv = get_argv_from_qs(argv_qs);
            var placeholder_el = document.querySelector(argv["el"]);
            
            // Run Impedance Chart
            Run_ImpedanceChart(ImpedanceChart);
            
            // >>> 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            var component_h = document.querySelector(".widget.stack-status");
            // >>> 240305 hjkim - 사이즈 조정
            //var _h = component_h.clientHeight - 70;
            var _w = component_h.clientWidth/2;
            var _h = component_h.clientHeight-50;
            var _square = (_w < _h) ? _w : _h;
            // <<< 240305 hjkim - 사이즈 조정
            // <<< 240105 hjkim - 미디어 쿼리 대신 그래프 세로 길이 조정
            
            // Clear Placehodler
            placeholder_el.innerHTML = "";
            placeholder_el.style.background = "";
            ImpedanceChart.IImpedanceChart_init( placeholder_el, _w, _h );
            
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
                var imp_url_list = ImpedanceChart.IMerge_imp_data_list(_content_arr);
                for(var i = 0; i < imp_url_list.length; i++) {
                    // Draw Impedance Graph
                    var _url = `${DATA_URL[0]}${imp_url_list[i]}`;
                    var _color = COLOR[0];
                    ImpedanceChart.IAdd_series_in_imp_graph(e, _url, _color);
                }
                
                setTimeout(function() {
                    // 최근 데이터 루프
                    access(DATA_URL[1], function(is_access, uri, contents) {
                        _content_arr2.push(contents);
                        var imp_url_list = ImpedanceChart.IMerge_imp_data_list(_content_arr2);
                        for(var i = 0; i < imp_url_list.length; i++) {
                            // Draw Impedance Graph
                            var _url = `${DATA_URL[1]}${imp_url_list[i]}`;
                            var _color = COLOR[1];
                            ImpedanceChart.IAdd_series_in_imp_graph(e, _url, _color);
                        }
                    });
                }, 500);
                
            });
        }
    });
}
if(TITLE.includes("수소전지 그래프")) {
    // Run Impedance Chart
    Run_ImpedanceChart(ImpedanceChart || (ImpedanceChart = {}));
}
// <<< 231212 hjkim - FDC에서 진입시, 파라미터 처리

window.g_DEBUG = false;

/* -------------------------------------------------------------------------- */
/*                                 GLOBAL_VAR                                 */
/* -------------------------------------------------------------------------- */
window.g_drawn_imp_data = {}; // 그려진 임피던스 그래프 데이터 저장(for 범례 토글 시 사용)
window.g_legend_disallow_list = ["전체범위용",  "범위"];  // 범례(클릭대상) 숨김 단어 목록
window.g_keyword_disallow_list = ["전체범위용", "범위"]; // 키워드(말풍선) 무시 단어 목록

/* -------------------------------------------------------------------------- */
/*                                임피던스 데이터 목록                           */
/* -------------------------------------------------------------------------- */
window.g_imp_base_url_list = {};
window.g_imp_base_url_list["선별"] = "/ALL/data/impedance/imp_data_bak/";
window.g_imp_base_url_list["선별_기타포함"] = "/ALL/data/impedance/imp_data_edit_etc/";
window.g_imp_base_url_list["로그"] = "/ALL/data/impedance/imp_data/";
window.g_imp_base_url_list["선별_보정"] = "/ALL/data/impedance/imp_data_bak/post_data/";
window.g_imp_base_url_list["로그_보정"] = "/ALL/data/impedance/imp_data/post_data/";
window.g_imp_base_url_sel = "선별";

// 파일 파싱용 식별
window.g_imp_file_prefix = {};
window.g_imp_file_prefix["선별"] = "d";
window.g_imp_file_prefix["로그"] = "d";
window.g_imp_file_prefix["선별_보정"] = "post_d";
window.g_imp_file_prefix["로그_보정"] = "post_d";
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
/*                               IMPEDANCE CHART                              */
/* -------------------------------------------------------------------------- */
function Run_ImpedanceChart(ImpedanceChart) {
    var g_curr_imp_data;
    var g_curr_filename;
    var g_normal_filtered_imp_data_list;
    var g_air_filtered_imp_data_list;
    var g_wat_filtered_imp_data_list;
    var g_thm_filtered_imp_data_list;
    var AXIS_MARGIN = { l: 50, t: 35, r: 35, b: 50 };//EUNG
    if(TITLE.includes("수소전지 그래프")) {
        AXIS_MARGIN = { l: 70, t: 35, r: 35, b: 70 };
    }
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
    // >>> 240305 hjkim - 
    var PX_RANGE_PADDING = 30;
    if(TITLE.includes("수소전지 그래프")) {
        PX_RANGE_PADDING = 100;
    }    
    // <<< 240305 hjkim - 
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
    const circle_radius = 10;
    var g_micro_ohm = { init: false,
        min_x: 0, min_y: 0, max_x: 0, max_y: 0,
        range_x: function () { return (this.max_x - this.min_x + circle_radius ); },
        range_y: function () { return (this.max_y - this.min_y + circle_radius ); }
    };
    // >>> 240418 hjkim - 상대
    function graph_axis_reset() {
        g_micro_ohm.init = false;
    }
    ImpedanceChart.graph_axis_reset = graph_axis_reset;
    // <<< 240418 hjkim - 
    function IImpedanceChart_add_data(data, filename) {
        if (filename === void 0) { filename = "imp_Datplot"; }
        if (g_impedence_canvas == null)
        return;
        var ctx = get_ctx(g_impedence_canvas);
        if (ctx == null)
        return;
        // TODO: 제목 겹칩 버그로 인해 구현 보류
        // ctx.save();
        // draw_title(ctx, AXIS_WIDTH/2, AXIS_MARGIN.t, `Nyquist Plot: ${filename}`);
        // ctx.restore();
        // 스케일 조정을 위한 변수 계산
        var idx;
        (function (idx) {
            idx[idx["HZ"] = 0] = "HZ";
            idx[idx["X"] = 1] = "X";
            idx[idx["Y"] = 2] = "Y";
        })(idx || (idx = {}));
        ;
        if (g_micro_ohm.init == false) {
            g_micro_ohm.min_x = data.reduce(function (acc, d) { return d[idx.X] < acc[idx.X] ? d : acc; })[idx.X];
            g_micro_ohm.max_x = data.reduce(function (acc, d) { return d[idx.X] > acc[idx.X] ? d : acc; })[idx.X];
            g_micro_ohm.min_y = 0;
            // g_micro_ohm.min_y = data.reduce(function (acc, d) { return d[idx.Y] < acc[idx.Y] ? d : acc; })[idx.Y];
            g_micro_ohm.max_y = data.reduce(function (acc, d) { return d[idx.Y] > acc[idx.Y] ? d : acc; })[idx.Y];
            g_micro_ohm.init = true;
        }
        var px__x_range = Math.abs(AXIS_ORIGIN.x - AXIS_RIGHT)  - PX_RANGE_PADDING;
        var px__y_range = Math.abs(AXIS_ORIGIN.y - AXIS_TOP)    - PX_RANGE_PADDING;
        // const X_PX_PER_TICK = (px__x_range) / (mohm__x_range); // scale 산출
        // 그래프를 그리기 위해 mOhm 스케일을 px 스케일로 변경하는 함수
        var fn_ohm2px_x = _get_range_convertor(g_micro_ohm.range_x(), px__x_range, g_micro_ohm.min_x);
        var fn_ohm2px_y = _get_range_convertor(g_micro_ohm.range_y(), px__y_range, g_micro_ohm.min_y);
        // >>>>>>> 230620 hjkim - x축 레이블을 위한 스케일 컨버터
        var fn_px2ohm_x = _get_range_convertor(px__x_range, g_micro_ohm.range_x(), AXIS_ORIGIN.x, g_micro_ohm.min_x);
        var fn_px2ohm_y = _get_range_convertor(px__y_range, g_micro_ohm.range_y(), AXIS_ORIGIN.y, g_micro_ohm.min_y);
        // <<<<<<< 230620 hjkim - x축 레이블을 위한 스케일 컨버터
        // >>>>>>> 230609 hjkim - y값이 양수인 것만 통과
        data = data.filter(function (val, idx, arr) {
            if (val[2] > 0) return true;
            else return false;
        });
        if(window.g_DEBUG) {
            console.log("micro_ohm_min_x : ");
            console.log(g_micro_ohm.min_x);
            console.log("micro_ohm_max_x : ");
            console.log(g_micro_ohm.max_x);
            console.log("micro_ohm_range_x : ");
            console.log(g_micro_ohm.range_x());
            console.log("micro_ohm_range_y : ");
            console.log(g_micro_ohm.range_y());
            console.log("px__x_range : ");
            console.log(px__x_range);
        }
        
        // <<<<<<< 230609 hjkim - y값이 양수인 것만 통과
        LegendTable.filename_to_classify(filename, function (date, selected_color, legend_name, class_name) {
            
            // 2. 스캐터 차트 그림
            ctx.save();
            draw_scatter(ctx, data, fn_ohm2px_x, fn_ohm2px_y, selected_color);
            ctx.restore();
            
            // 3. 최대 최소값 표기
            ctx.save();
            draw_minmax(ctx, g_micro_ohm, PX_RANGE_PADDING, PX_RANGE_PADDING);
            ctx.restore();
            
            // 4. x축 틱레이블
            ctx.save();
            draw_xtick_label(ctx, fn_px2ohm_x);
            ctx.restore();
            
            // 5. y축 틱레이블
            ctx.save();
            draw_ytick_label(ctx, fn_px2ohm_y);
            ctx.restore();
            
        });
    }
    ImpedanceChart.IImpedanceChart_add_data = IImpedanceChart_add_data;
    function IImpedanceChart_init(placeholder, w = 800, h = 800) {
        // data = [[], [], [hz, x, y], ..., []];
        // INIT 캔바스 엘리먼트
        var canvas = g_impedence_canvas = init_canvas(placeholder);
        if (canvas == null)
        return;
        var ctx = get_ctx(canvas);
        if (ctx == null)
        return;
        // INIT 캔바스 크기
        // canvas.width = document.body.clientWidth / 2; // 창의 폭의 1/4
        canvas.width  = w; // 너미 고정
        canvas.height = h; // 높이 고정
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
        
        // 2.축제목
        ctx.save();
        // draw_ytitle(ctx, AXIS_WIDTH/2, AXIS_ORIGIN.y-AXIS_HEIGHT/2, "-Imag impedance (mΩ)");
        draw_ytitle(ctx, AXIS_ORIGIN.x-20, AXIS_ORIGIN.y+60, "-Imag impedance (mΩ)"); //Eung
        // draw_xtitle(ctx, AXIS_WIDTH/2, AXIS_ORIGIN.y-AXIS_HEIGHT/2, "Real impedance (mΩ)");
        // draw_xtitle(ctx, AXIS_ORIGIN.x/2, AXIS_ORIGIN.y+35, "Real impedance (mΩ)");
        draw_xtitle(ctx, 0, AXIS_ORIGIN.y+20, "Real impedance (mΩ)"); //Eung
        ctx.restore();
    }
    ImpedanceChart.IImpedanceChart_init = IImpedanceChart_init;
    function _draw_imp_data(data, color, _el, PX_RANGE_PADDING__X = 30, PX_RANGE_PADDING__Y = 30, COMPACT_MODE = 0, SHIFT_X = 50) {
        if(window.g_DEBUG) { console.log("_draw_imp_data (data[0..2]):", data[0], data[1], data[2]); }
        var canvas_el, g_impedence_canvas_el;
        if(TITLE.includes("대시보드")) {
            canvas_el = _el.querySelector("[id^=\"impedence_graph__\"]");
        } else if(TITLE.includes("수소전지 그래프")) {
            canvas_el = document.querySelector("[id^=\"impedence_graph__\"]");
            g_impedence_canvas_el = canvas_el;
        } else {
            canvas_el = _el.querySelector("canvas");
        }
        if (canvas_el == null) {
            alert("캔바스를 찾을 수 없습니다.");
            return;
        }
        var ctx = get_ctx(canvas_el);
        if (ctx == null) {
            alert("캔바스 컨텍스트를 찾을 수 없습니다.");
            return;
        }
        // 스케일 조정을 위한 변수 계산
        var idx;
        (function (idx) {
            idx[idx["HZ"] = 0] = "HZ";
            idx[idx["X"] = 1] = "X";
            idx[idx["Y"] = 2] = "Y";
        })(idx || (idx = {}));

        if(COMPACT_MODE == 1) {      // 상대좌표계(LTRB Compact) (각각의 시계열에 대해서)
            g_micro_ohm.min_x = data.reduce(function (acc, d) { return d[idx.X] < acc[idx.X] ? d : acc; })[idx.X];
            g_micro_ohm.max_x = data.reduce(function (acc, d) { return d[idx.X] > acc[idx.X] ? d : acc; })[idx.X];
            g_micro_ohm.min_y = 0;
            g_micro_ohm.max_y = data.reduce(function (acc, d) { return d[idx.Y] > acc[idx.Y] ? d : acc; })[idx.Y];
            g_micro_ohm.init = true;
        } else if(COMPACT_MODE == 2) { // 상대좌표계(LTB Compact) (각각의 시계열에 대해서)
            if (g_micro_ohm.init == false) { // LTB 닫힘
                g_micro_ohm.min_x = data.reduce(function (acc, d) { return d[idx.X] < acc[idx.X] ? d : acc; })[idx.X];
                g_micro_ohm.min_y = 0;
                g_micro_ohm.max_y = data.reduce(function (acc, d) { return d[idx.Y] > acc[idx.Y] ? d : acc; })[idx.Y];
                g_micro_ohm.init = true;
            } else { // R 열림
                g_micro_ohm.max_x = data.reduce(function (acc, d) { return d[idx.X] > acc[idx.X] ? d : acc; })[idx.X];
            }
        } else if(COMPACT_MODE == 3) { // 상대좌표계(LB Compact) (각각의 시계열에 대해서)
            if (g_micro_ohm.init == false) { // LB 닫힘
                g_micro_ohm.min_x = data.reduce(function (acc, d) { return d[idx.X] < acc[idx.X] ? d : acc; })[idx.X];
                g_micro_ohm.min_y = 0;
            } else { // TR 열림
                g_micro_ohm.max_x = data.reduce(function (acc, d) { return d[idx.X] > acc[idx.X] ? d : acc; })[idx.X];
                g_micro_ohm.max_y = data.reduce(function (acc, d) { return d[idx.Y] > acc[idx.Y] ? d : acc; })[idx.Y];
                g_micro_ohm.init = true;
            }
        } else {                    // 고정좌표계
            if (g_micro_ohm.init == false) { // init = false 시점 이후 그려지는 모든 시계열 그룹에 대해서
                g_micro_ohm.min_x = data.reduce(function (acc, d) { return d[idx.X] < acc[idx.X] ? d : acc; })[idx.X];
                g_micro_ohm.max_x = data.reduce(function (acc, d) { return d[idx.X] > acc[idx.X] ? d : acc; })[idx.X];
                g_micro_ohm.min_y = 0;
                g_micro_ohm.max_y = data.reduce(function (acc, d) { return d[idx.Y] > acc[idx.Y] ? d : acc; })[idx.Y];
                g_micro_ohm.init = true;
            }
        }
        
        // console.log(`imp.js / min_x(${g_micro_ohm.min_x}), max_x(${g_micro_ohm.max_x})`);
        var px__x_range = Math.abs(AXIS_ORIGIN.x - AXIS_RIGHT) - PX_RANGE_PADDING__X;
        var px__y_range = Math.abs(AXIS_ORIGIN.y - AXIS_TOP) - PX_RANGE_PADDING__Y;
        // const X_PX_PER_TICK = (px__x_range) / (g_micro_ohm.range_x()); // scale 산출
        // 그래프를 그리기 위해 mOhm 스케일을 px 스케일로 변경하는 함수
        var fn_mohm2px_x = _get_range_convertor(g_micro_ohm.range_x(), px__x_range, g_micro_ohm.min_x, SHIFT_X);
        var fn_mohm2px_y = _get_range_convertor(g_micro_ohm.range_y(), px__y_range, g_micro_ohm.min_y, 0);
        
        // >>>>>>> 230609 hjkim - y값이 양수인 것만 통과
        data = data.filter(function (val, idx, arr) {
            if (val[2] > 0) return true;
            else return false;
        });
        // <<<<<<< 230609 hjkim - y값이 양수인 것만 통과
        // 2. 스캐터 차트 그림
        ctx.save();
        draw_scatter(ctx, data, fn_mohm2px_x, fn_mohm2px_y, color, COMPACT_MODE);
        ctx.restore();
    }
    ImpedanceChart._draw_imp_data = _draw_imp_data ;

    function IAdd_series_in_imp_graph(e, url, color) {
        if (color === void 0) { color = "blue"; }
        g_is_init_impedance_graph = true;
        g_is_init_ref_table = true;
        var doc = e.target.parentElement;
        var legend_el = doc.querySelector(".legend-table__signifier");
        if(window.g_DEBUG) console.log("legend_el", legend_el);
        // 토글기능
        if (legend_el != null && legend_el.innerHTML == "○") {
            // ------------------------- 토글 체크
            legend_el.innerHTML = "●";
            // 범례데이터 가져오기
            fopen(url, function (res) {
                if(window.g_DEBUG) {
                    console.log("IAdd_series_in_imp_graph BEFOR(res) : ", res);
                }
                var data = _parse_imp_data(res, function (arr) {
                    // ohm -> mohm 단위변환
                    arr[1] *= M_OHM; // x: Real Imp
                    arr[2] *= M_OHM * -1; // y: -Imag Imp
                });
                if(window.g_DEBUG) {
                    console.log("IAdd_series_in_imp_graph AFTER(data[0..2]) : ", data[0], data[1], data[2]);
                }
                // 그래프에 추가
                _draw_imp_data(data, color);

                // >>>>>>> 230731 hjkim - 체크 해제를 위해 추가된 그래프들은 저장
                // this.drawn_imp_data[url] = { data: data, color: color };
                window.g_drawn_imp_data[url] = { data: data, color: color };
                if(window.g_DEBUG) console.log(window.g_drawn_imp_data);
                // <<<<<<< 230731 hjkim - 체크 해제를 위해 추가된 그래프들은 저장ㄴ
            });
            
        } else if(legend_el != null) {
            // ------------------------- 토글 해제
            legend_el.innerHTML = "○";

            // 1. URL링크 삭제
            if(window.g_DEBUG) console.log("del before:", window.g_drawn_imp_data);
            delete window.g_drawn_imp_data[url];
            if(window.g_DEBUG) console.log("del after :", window.g_drawn_imp_data);
            
            // 2. 그래프 클리어
            ImpedanceChart.IClear_imp_graph_handler("GRAPH_ONLY");

            var keys = Object.keys(window.g_drawn_imp_data);
            if(window.g_DEBUG) console.log("keys:", keys);
            for(var i = 0; i < keys.length; i += 1) {
                var val = window.g_drawn_imp_data[keys[i]];
                // ImpedanceGraph.draw_imp_data(val.data, val.color, window.impedance_graph);
                _draw_imp_data(val.data, val.color);
            }
        } else {
		/* ====================================================
		 * 범례가 없는 경우
		 * ======================================================*/
        if(TITLE.includes("대시보드") || TITLE.includes("스택진단")) {
            // 범례데이터 가져오기
            fopen(url, function (res) {
                if(window.g_DEBUG) {
                    console.log("IAdd_series_in_imp_graph BEFOR(res) : ", res);
                }
                var data = _parse_imp_data(res, function (arr) {
                    // ohm -> mohm 단위변환
                    arr[1] *= M_OHM; // x: Real Imp
                    arr[2] *= M_OHM * -1; // y: -Imag Imp
                });
                if(window.g_DEBUG) {
                    console.log("IAdd_series_in_imp_graph AFTER(data[0..2]) : ", data[0], data[1], data[2]);
                }
                // 그래프에 추가
                _draw_imp_data(data, color, e.target);
                
                // >>>>>>> 230731 hjkim - 체크 해제를 위해 추가된 그래프들은 저장
                // this.drawn_imp_data[url] = { data: data, color: color };
                window.g_drawn_imp_data[url] = { data: data, color: color };
                if(window.g_DEBUG) console.log(window.g_drawn_imp_data);
                // <<<<<<< 230731 hjkim - 체크 해제를 위해 추가된 그래프들은 저장ㄴ
            });
        }
	}
    }
    ImpedanceChart.IAdd_series_in_imp_graph = IAdd_series_in_imp_graph;
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
    function draw_scatter(ctx, data, x_conv, y_conv, color, type = 0) {
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
            if(type == 0 && (i == 0 || i == data.length-1)) { // 처음과 끝에 출력
                ctx.font = "13 px sans-serif";
                ctx.textAlign = "center";
                var value = `(${Math.round(x)}, ${Math.round(y_1)})`;
                ctx.fillText(value, x_px, y_px-10);
            }
            // <<<<<<< 230620 hjkim - DEBUG
        }
    }
    
    // >>>>>>> 230620 hjkim - x축 틱 레이블
    function draw_xtick_label(ctx, px2data) {
        ctx.save();
        var SIZE = 13;
        ctx.font = SIZE + "px sans-serif";
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
    // <<<<<<< 230620 hjkim - x축 틱 레이블
    
    // >>>>>>> 230623 hjkim - y축 틱 레이블
    function draw_ytick_label(ctx, px2data) {
        ctx.save();
        var SIZE = 13;
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "center";
        var TOP_END = AXIS_TOP;;
        for(var y_px = AXIS_ORIGIN.y; y_px > TOP_END; y_px -= 100) {
            // console.log("y_px", y_px);
            var tick_value = Math.abs(Math.round(px2data(y_px)));
            ctx.fillText(tick_value, AXIS_ORIGIN.x-15, y_px);
        }
        var last_tick_value = Math.abs(px2data(TOP_END));
        ctx.fillText(Math.round(last_tick_value), AXIS_ORIGIN.x-15, TOP_END);
        ctx.restore();
    }
    // <<<<<<< 230623 hjkim - y축 틱 레이블
    
    // function draw_grid(ctx, step_x, step_y) {
    //     ctx.strokeStyle = 'lightgray';
    //     ctx.lineWidth = 0.5;
    //     // 세로 선
    //     for (var i = step_x + 0.5; i < ctx.canvas.width; i += step_x) {
    //         ctx.beginPath();
    //         ctx.moveTo(i, 0);
    //         ctx.lineTo(i, ctx.canvas.height);
    //         ctx.stroke();
    //     }
    //     // 가로 선
    //     for (var i = step_y + 0.5; i < ctx.canvas.height; i += step_y) {
    //         ctx.beginPath();
    //         ctx.moveTo(0, i);
    //         ctx.lineTo(ctx.canvas.width, i);
    //         ctx.stroke();
    //     }
    // }
    function draw_title(ctx, x, y, text) {
        if (text === void 0) { text = "Title"; }
        ctx.save();
        var SIZE = 12;
        if(TITLE.includes("수소전지 그래프")) {
            SIZE = 18;
        }
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y - (SIZE / 2));
        ctx.restore();
    }
    function draw_xtitle(ctx, x, y, text) {
        if (text === void 0) { text = "YTitle"; }
        ctx.save();
        var SIZE = 11; //Eung
        if(TITLE.includes("수소전지 그래프")) {
            SIZE = 18;
        }
        ctx.font = SIZE + "px sans-serif";
        ctx.textAlign = "left";
        ctx.translate(x, y);
        ctx.fillText(text, AXIS_HEIGHT / 2, 0);
        ctx.restore();
    }
    
    function draw_ytitle(ctx, x, y, text) {
        if (text === void 0) { text = "YTitle"; }
        ctx.save();
        var SIZE = 11; //EUNG
        if(TITLE.includes("수소전지 그래프")) {
            SIZE = 18;
        }
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
        var SIZE = 13;
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
        ImpedanceChart.IClear_imp_graph(type);
    }
    ImpedanceChart.IClear_imp_graph_handler = IClear_imp_graph_handler;

    function IClear_imp_graph(type = "ALL") {
        // 그래프 초기화
        g_is_init_impedance_graph = false;
        g_is_init_ref_table = false;
        g_micro_ohm.init = false;
        var impedance_graph_el = document.querySelector("#imp_graph");
        impedance_graph_el.innerHTML = "";
        
        // 그래프 그리기
        IImpedanceChart_init(impedance_graph_el);

        switch(type) {
            default:
            case "ALL":
                // 키워드 입력부 클리어
                var filter_input_el = document.querySelector("#filterInput");
                filter_input_el.value = "";

                window.g_drawn_imp_data = {}; // 캐시데이터 삭제
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
            case "GRAPH_ONLY":
                break;
        }
    }
    ImpedanceChart.IClear_imp_graph = IClear_imp_graph;

    function _parse_imp_data(d, cb) {
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
            cb(arr_arr_n);
            r.push(arr_arr_n);
        }
        return r;
    }
    function fopen(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
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
        for (var i = 0; i < el.length; i += 1) {
            var elm = el[i];
            elm.click();
        }
    }
    ImpedanceChart.IAllClick = IAllClick;
    
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

    // ImpedanceChart.IRef_table_refresh = _ref_table_refresh;

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
		filtered_imp_data_list.sort();
        window.g_filtered_imp_data_list = filtered_imp_data_list;
        if(window.g_DEBUG) { console.log("merge_imp_data_list(g_filtered_imp_data_list):", window.g_filtered_imp_data_list); }
        
        // >>>>>>> 230728 hjkim - 키워드 목록 갱신
        if(window.keyword_list != null) window.keyword_list.refresh(filtered_imp_data_list);
        // <<<<<<< 230728 hjkim - 키워드 목록 갱신

        return filtered_imp_data_list;
    }
    ImpedanceChart.IMerge_imp_data_list = merge_imp_data_list;
    
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
                            <button style="${_check_all_style}"    title="${_help_chk_all}" onclick="ImpedanceChart.IAllClick('.legend_all')">${_unicode_chk_all}</button>
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
                    url = base_url + "/" + r[0];
                    filename = r[0];
                }
            }
            if (url == "") {
                alert("매칭된 URL이 없습니다.");
                return;
            }
            // <<< 목록에서 현재 클릭한 box의 시간과 일치하는 url 경로 매칭
            // ### 1. INIT RIGHT SIDE CANVAS(impedence graph)
            var impedance_graph_el = document.querySelector("#imp_graph");
            fopen(url, function (res) {
                var data = _parse_imp_data(res, function (arr) {
                    // ohm -> mohm 단위변환
                    arr[1] *= M_OHM; // x: Real Imp
                    arr[2] *= M_OHM * -1; // y: -Imag Imp
                });
                g_curr_imp_data = data;
                g_curr_filename = filename;
                // 그래프 그리기
                IImpedanceChart_add_data(data, filename);
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

    ImpedanceChart.IImpedance_graph_handler = IImpedance_graph_handler;

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
    ImpedanceChart.ILeftRight_toggle_handler = ILeftRight_toggle_handler;
    
}
// >>> 240226 hjkim - 
ImpedanceChart.Interface = Run_ImpedanceChart;
// <<< 240226 hjkim - 

})( ImpedanceChart );



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
        //selected_color = "#0EFF00";
        selected_color = "#C6CCC8";	//임시 색변환 231201 bjy.
        class_name += " normal_legend";
    }
    else if (new RegExp(".*공기.*", "gi").test(legend_name)) {
        // selected_color = "#51E1AD";
        selected_color = "#000000";	//임시 색변환 231201 bjy.
        //selected_color = "#0EFF00";
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

function LegendTable($target, base_url = "/ALL/data/impedance/imp_data") {
    
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
            <span class="${class_name} legend-table__signifier" style="${style}" onclick="ImpedanceChart.IAdd_series_in_imp_graph(event, '${base}/${list_ith}', '${selected_color}')">○</span>
            <span class="${class_name} legend_all" title="${legend_name}" style="${_legend_all_style}" onclick="ImpedanceChart.IAdd_series_in_imp_graph(event, '${base}/${list_ith}', '${selected_color}')">${date} : ${legend_name.substring(0, 14)}</span>
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
/*                    스택진단 / 상단(스택상태) 그래프                        */
/* -------------------------------------------------------------------------- */
// <<< 240321 hjkim - 스택 상태 그래프
// >>> 240423 hjkim - 체크박스
function parse_html(html_str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html_str, "text/html");
    return doc.body.firstChild; // body의 첫 번째 자식 요소를 반환
}
// <<< 240423 hjkim - 체크박스
if(TITLE.includes("스택진단")) {
    const _grid_el = document.querySelector(".widget-body.d-grid");
    // >>> 240305 hjkim - 스택진단 메뉴 그래프 부착
    const _content_section_el = _grid_el.querySelector(".content-section");
    const _pholder_arr = _grid_el.querySelectorAll('.content-section>div:not(.float-end)');
    window.uplot_scatter_placeholder = _pholder_arr[0];
    const _img_el = _grid_el.querySelector('.content-section>div>img');
    
    // >>> 240425 hjkim - 체크박스(js-driven 버전)
    const {div, input, button, br} = van.tags;
    const org_toggle = van.state(false);
    window.org_state = van.state(0);
    const org_chkbox = div({style: `position:absolute; top:450px; right:30px; width:60px;`},
        input({ id: "shift_origin", type:"checkbox", onclick: async () => { org_toggle.val = !org_toggle.val} }), 
        "원점", br,
        button({class: "btn-of w-24", onclick: async () => { org_toggle.val = !org_toggle.val; clear_graph(); show_graph(org_toggle.val, false);}}, 
        () => `${org_toggle.val == false ? "원점이동" : "절대값"}`), br,
        button({class: "btn-of w-24", onclick: clear_graph}, "클리어"), 
    ); // DOM 생성
    van.derive(() => { // 체크박스와 org_toggle 상태 동기화
        try{
        var el = document.querySelector("#shift_origin");
        (org_toggle.val == false) ? el.removeAttribute("checked") : el.setAttribute("checked", "");
        return org_toggle.val;
        } catch(e) {}
    });
    van.add(_grid_el, org_chkbox); // 마운트
    // <<< 240425 hjkim - 체크박스(js-driven 버전)

    // >>> 240423 hjkim - 체크박스(dom-driven 버전)
    // const _style = "position:absolute; top:450px; right:30px;";
    // const ctrlbox_str = `<div style="${_style}"><input id="shift_origin" type="checkbox" onclick="toggle_origin()"/>원점이동<br>
    // <button class="btn-of w-24" onclick="clear_graph()">클리어</button></div>`;
    // const ctrlbox_el = parse_html(ctrlbox_str);
    // _grid_el.appendChild(ctrlbox_el);
    // <<< 240423 hjkim - 체크박스(dom-driven 버전)

    // 1. 초안 이미지 제거
    _img_el.remove();
    // 2. placeholder 사이즈 초기화
    _content_section_el.style.width = _grid_el.clientWidth +"px";
    _content_section_el.style.height= _grid_el.clientHeight+"px";
    _pholder_arr[0].style.height 	= _grid_el.clientHeight+"px";
    // <<< 240305 hjkim - 스택진단 메뉴 그래프 부착

    // 임피던스 차트 초기화
    ImpedanceChart.Interface(ImpedanceChart);
    ImpedanceChart.IImpedanceChart_init( _pholder_arr[0], _pholder_arr[0].clientWidth, _pholder_arr[0].clientHeight );
    // 
    // >>> 240417 hjkim - 그래프 보기 버튼 클릭
    window.addEventListener("load", () => {
        const show_graph_el = document.querySelector("#graph-btn"); // 그래프 보기 버튼
        const DELAY = { SINGLE: 250, DOUBLE: 500, TRIPLE: 750, TIMEOUT: 1000};
        var click = { counter: 0, first: 0 };
        var TIME_QUEUE = [];
        show_graph_el.addEventListener("click", () => { 
            window.org_state.val++;
            click.counter+= 1;
            var relative_time = new Date().getTime() - click.first;
            if(click.counter == 1) { // <-- 싱글 클릭
                click.first = new Date().getTime();
                TIME_QUEUE.push(setTimeout(single_click_handler, DELAY.SINGLE));
                TIME_QUEUE.push(setTimeout(double_click_handler, DELAY.DOUBLE));
                TIME_QUEUE.push(setTimeout(triple_click_handler, DELAY.TRIPLE));
                TIME_QUEUE.push(setTimeout(timeout_handler,      DELAY.TIMEOUT));
            } else if( (click.counter == 2) && relative_time <= DELAY.DOUBLE ) { // <-- 더블클릭
                clearTimeout(TIME_QUEUE[0]); // SINGLE CLICK 취소
            } else if( (click.counter == 3) && relative_time <= DELAY.TRIPLE ) { // <-- 트리플클릭
                clearTimeout(TIME_QUEUE[0]); // SINGLE CLICK 취소
                clearTimeout(TIME_QUEUE[1]); // DOUBLE CLICK 취소
            } else { // <-- 타임아웃
                clearTimeout(TIME_QUEUE[0]); // SINGLE CLICK 취소
                clearTimeout(TIME_QUEUE[1]); // DOUBLE CLICK 취소
                clearTimeout(TIME_QUEUE[2]); // TRIPLE CLICK 취소
                click.counter = 0;
            }
        });
        // 핸들러 함수
        function single_click_handler() { show_graph(org_toggle.val); clear_time_queue(); }
        function double_click_handler() { clear_graph(); clear_time_queue(); }
        function triple_click_handler() { /* NOP */ clear_time_queue(); }
        function timeout_handler() { clear_time_queue(); }
        function clear_time_queue() { TIME_QUEUE.map(tq => clearTimeout(tq)); click.counter = 0; TIME_QUEUE = []; }
    });
    // <<< 240417 hjkim - 그래프 보기 버튼 클릭
}

function clear_graph() {
    var el = document.querySelector(".impedence_graph").parentElement;
    el.innerHTML = "";
    ImpedanceChart.IImpedanceChart_init(el, el.clientWidth, el.clientHeight);
    ImpedanceChart.graph_axis_reset();
}
// >>> 240423 hjkim - 
function toggle_origin() {
    var el = document.querySelector("#shift_origin");
    clear_graph();
    if(el.checked == true) show_graph(2);
    else show_graph(1);
}
// <<< 240423 hjkim - 
function show_graph(is_origin = false, is_init = false, compact = "LB") {
    var _response_msg = "DRAW_NYQUIST";
    var _compact = "";
    // 파라미터로부터 아규먼트 정리
    if(is_origin == true) { _response_msg = "DRAW_NYQUIST__RELATIVE";
    } else { _response_msg = "DRAW_NYQUIST"; }
    // 파라미터로부터 아규먼트 정리
    if(is_origin == false) { _compact = ""; }
    else { _compact = compact }
    // 메시지 송신
    channel2.port2.postMessage({
        msg: "GET_STACK__STREAM",
        url_dir: "/FDC/work/bjy/impedance/selected",
        response_msg: _response_msg,
        compact : _compact,
    });
}
