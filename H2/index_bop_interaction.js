// index_bop_interaction.js
// HW BOP 센서 모니터링 - HW BOP 센서 리스트 2개의 위젯 연동

// 범례에 대한 체크박스 ID 매핑
var legendCheckboxMapping = {
  '공기공급계': ['P_A_m_out', 'P_A_B_in', 'Air(%)', '​MFM3(Air)'],
  '물관리계': ['T_A_S_in', 'T_A_S_out', 'T_A_vent'],
  '열관리계': ['DI(%)', 'Water(%)​​', 'T_w_h_in']
};

// main.js에서 복사한 함수와 변수
var DATA_LEGEND_HIGHLIGHTED = "data_legend_highlighted";
// index_bop_interaction.js
// HW BOP 센서 모니터링 - HW BOP 센서 리스트 2개의 위젯 연동

// 상수 정의
var DATA_LEGEND_LABEL = "data_legend_label";
var DATA_LEGEND_CHECKED = "data_legend_checked";

// 범례 항목을 클릭했을 때의 이벤트 핸들러
function legendItemClick(e) {
  var el = e.target;
  var label = el.getAttribute(DATA_LEGEND_LABEL);

  // label에 해당하는 체크박스 ID들을 찾는다
  var checkboxIds = [];
  for (var key in legendCheckboxMapping) {
    if (legendCheckboxMapping[key].includes(label)) {
      checkboxIds.push(key);
    }
  }

  // 체크박스의 체크 상태를 토글한다
  checkboxIds.forEach(function(id) {
    var checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  });

  // 기존의 범례 항목 클릭 이벤트 로직을 실행한다
  // 실선 토글
  toggle_flot_by_label(label);
  // 범례 토글 
  toggle_legend(el);
}

// make_legend 함수 정의
function make_legend(col, label_data) {
  var placeholder = g_el.custom_legend;
    var k = 0;
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
                        var color_box_el = document.createElement("div");
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
    var text_el = [].slice.call(document.querySelectorAll(".legend_text"));
    var color_el = [].slice.call(document.querySelectorAll(".legend_color"));
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

  // 범례 항목에 이벤트 핸들러를 바인딩한다
  var text_el = [].slice.call(document.querySelectorAll(".legend_text"));
  text_el.forEach(function(el) {
    el.onclick = legendItemClick;
  });
}

// ... (기타 함수 및 이벤트 바인딩 코드)

// 페이지가 로드되면 범례를 생성하고 이벤트를 바인딩
window.onload = function() {
  adaptor_make_legend();
  // ... (나머지 코드)
};