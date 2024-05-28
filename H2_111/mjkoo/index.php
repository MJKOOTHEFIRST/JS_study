<?php 
include("auth.php");
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="./css/common.css" rel="stylesheet">
  <link href="./css/main.css" rel="stylesheet">
  <link href="./css/diagram.css" rel="stylesheet">
  <script src="./js/bootstrap.js"></script>
  <!-- <script src="js/include.js"></script> -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  
  <script type="module" src="./js/main/dataManager.js"></script> <!--한번에 total_data.conf 뿌려주는 파일-->
  <script type="module" src="./js/main/eventManager.js"></script> <!-- DOMloaded때 이벤트 핸들링만 하는 파일--> 
  <script type="module" src="./js/main/system-info.js"></script> <!--우측 하단 시스템정보-->
  <script type="module" src="./js/main/alarm.js"></script> <!-- 알람로그 -->
  <script type="module" src="./js/main/realTimeProduction.js"></script> <!-- 실시간 생산량 반도넛 -->
  <script type="module" src="./js/main/operationRate.js"></script> <!-- 발전량 / 가동율 누적차트 -->
  <script type="module" src="./js/main/dayMonthProductionBar.js"></script> <!--금일/금월 전기/열생산량 바그래프-->
  <script type="module" src="./js/main/qoe.js"></script>
</head>
<body>
  <header>
    <!-- <nav include-html="./components/nav.html"></nav>  -->
    <nav class="navbar navbar-expand-xxl bg-body-tertiary">
      <div class="container-fluid">
        <div class="logo-container">
          <a href="./index.html">
            <div class="logo"></div>
          </a>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarToggler">
          <ul class="navbar-nav">
            <li><a href="#"><span class="icon-quality-management"></span>품질관리</a></li>
            <li><a href="#"><span class="icon-stack-diagnosis"></span>스택진단</a></li>
            <li><a href="bop.html"><span class="icon-BOP-diagnosis"></span>BOP진단</a></li>
            <li><a href="#"><span class="icon-device-manage"></span>장치관리</a></li>
          </ul>
          <div class="login">
            <div class="stack-place">부안연료전지 #1호기</div>
            <button class="btn btn-primary float-end"><span class="icon-exit"></span><span class="xxl-only">로그아웃</span></button>
          </div>
        </div>
      </div>
    </nav>    
  </header>
  <main>
    <div class="row">
      <div class="col-xxl-5 col-12">
        <div class="row">
          <div class="col-xxl-2 col-4">
            <div class="widget qoe">
              <div class="widget-head">
                품질지수
                <div class="widget-head-gadget"><span class="icon-arrow-right2"></span></div>
              </div>
              <div class="widget-body">
                <div class="title">QOE</div>
                <div class="result" id="qoeValue"><!--qoe value--></div>
              </div>
            </div>
          </div>
          <div class="col-xxl-5 col-8">
            <div class="widget watt-operation-rate">
                <div class="widget-head ">
                    발전량 / 가동율
                    <div class="widget-head-gadget"><span class="icon-arrow-right2"></span></div>
                </div>
                <div class="widget-body">
                    <div class="top-side">
                        <div class="row">
                            <div class="col-6 select">
                                <span>누적</span>
                                <span id="operationRate-Year" class="time-select">년</span>
                                <span id="operationRate-Month" class="time-select">월</span>
                                <span id="operationRate-Day" class="time-select">일</span>
                            </div>
                            <div class="col-6">
                                <div class="result-unit">kW</div>
                                <div class="operation-result"><!--kW 수치 들어갈 부분--></div>
                            </div>
                        </div>
                    </div>
                    <div class="bottom-side">
                        <div class="operation-rate">
                        <!-- % 수치 들어갈 부분 -->
                            <sup>%</sup>
                        </div>
                        <div class="graph-wrapper">
                            <div class="graph" style="height: 60px; text-align:center;">
                                <canvas id="eProductionChartYear" class="operationRate-chart"></canvas>
                            </div>
                        </div>
                        <div class="graph-wrapper">
                            <div class="graph" style="height: 60px; text-align:center;">
                                <canvas id="eProductionChartMonth" class="operationRate-chart"></canvas>
                            </div>
                        </div>
                        <div class="graph-wrapper">
                            <div class="graph" style="height: 60px; text-align:center;">
                                <canvas id="eProductionChartDay" class="operationRate-chart"></canvas>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
          </div>
          <div class="col-xxl-5">
            <div class="widget realtime-watt">
              <div class="widget-head">
                실시간 생산량
                <div class="widget-head-gadget"><span class="icon-arrow-right2"></span></div>
              </div>
              <div class="widget-body row realtime-widget-body">
                <div class="col-6 left-side">
                    <div class="canvas-container">
                        <canvas id="realtime-eProduction"></canvas>
                        <div class="">
                            <div class="realtime-e-percentage"><!--전기 실시간 퍼센트--></div>
                            <div class="realtime-percentage">현재전력생산(%)</div>
                        </div>
                    </div>
                    <hr/>
                    <div class="bottom-side e-bottom-side">
                        <!--e_realtime_production--><sub>kW</sub>
                    </div>
                </div>
                <div class="col-6 right-side">
                    <div class="canvas-container">
                        <canvas id="realtime-tProduction"></canvas>
                        <div class="">
                            <div class="realtime-t-percentage"><!--열 실시간 퍼센트--></div>
                            <div class="realtime-percentage">현재열생산(%)</div>
                        </div>
                    </div>
                  <hr/>
                  <div class="bottom-side t-bottom-side">
                  <!--t_realtime_production--><sub>kW</sub>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xxl-12">
            <div class="widget diagram">
              <div class="widget-head ">
                시스템 구조도
                <div class="widget-head-gadget"><span class="icon-arrow-right2"></span></div>
              </div>
              <div class="widget-body scrollmini scrollmini-noborder">

                <!-- <div class="diagram-main" include-html="./components/diagram.html"></div> -->

                <div class="diagram-main">
                  <div class="diagram-detail">
                      <svg
                          width="715"
                          height="526"
                          viewbox="0 0 715 526"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <g id="Diagram">
                              <g id="FUEL-MANAGE-BOX">
                                  <rect width="289" height="136" transform="translate(426)" fill="#FFDB80"></rect>
                                  <g id="SteamReformaerFlame">
                                      <rect width="80" height="91" transform="translate(513 45)" fill="#FFB800"></rect>
                                      <text
                                          id="Steam Reformer"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="534.895" y="116.232">Steam
                                          </tspan>
                                          <tspan x="526.158" y="128.232">Reformer</tspan>
                                      </text>
                                      <g id="Steam Reformaer">
                                          <path
                                              d="M530.578 94.3241C530.578 96.6204 532.415 98.4819 534.681 98.4819H564.613V102H563.298V100.081H534.681C531.544 100.081 529 97.5036 529 94.3241V58.9296C529 55.7502 531.544 53.1194 534.681 53.1194V52H536.154L536.154 54.7719L534.681 54.7719C532.415 54.7719 530.578 56.6334 530.578 58.9296L530.578 94.3241Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M569.445 54.8252C571.737 54.8252 573.595 56.6867 573.595 58.9829V82.4371H577V81.0512H575.191V58.9829C575.191 55.8035 572.618 53.226 569.445 53.226L540.501 53.226V52L539.065 52V54.8252L569.445 54.8252Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M543.826 64.9725L541.741 66.4495V67.3843H546.032V66.3467H543.848V66.3186L544.372 65.9447C544.798 65.6409 545.127 65.3791 545.358 65.1594C545.589 64.9397 545.749 64.7395 545.838 64.5588C545.928 64.3765 545.972 64.1934 545.972 64.0096C545.972 63.712 545.882 63.4526 545.702 63.2313C545.524 63.0101 545.27 62.8387 544.94 62.7172C544.613 62.5941 544.225 62.5326 543.777 62.5326C543.344 62.5326 542.966 62.598 542.644 62.7289C542.322 62.8597 542.073 63.0467 541.896 63.2898C541.72 63.5328 541.631 63.8226 541.631 64.1592H543.073C543.073 64.0252 543.102 63.9114 543.16 63.8179C543.218 63.7245 543.3 63.6536 543.406 63.6053C543.513 63.557 543.637 63.5328 543.777 63.5328C543.917 63.5328 544.041 63.557 544.148 63.6053C544.256 63.652 544.34 63.719 544.4 63.8063C544.462 63.8935 544.492 63.9987 544.492 64.1218C544.492 64.2339 544.465 64.336 544.411 64.4279C544.358 64.5198 544.281 64.6094 544.181 64.6967C544.083 64.7824 543.965 64.8743 543.826 64.9725Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M569.445 98.5352C571.737 98.5352 573.595 96.6737 573.595 94.3774V86.7548H577V88.1407H575.191V94.3774C575.191 97.5569 572.618 100.134 569.445 100.134V102H568.115V98.5352H569.445Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M563.759 86.4216L563.766 86.4164C564.111 86.1712 564.191 85.6942 563.945 85.3511C563.698 85.0079 563.218 84.9284 562.873 85.1736L563.319 85.795C562.873 85.1736 562.872 85.1741 562.872 85.1742L562.867 85.1777L562.855 85.1864L562.812 85.2176C562.775 85.2447 562.722 85.2843 562.653 85.337C562.514 85.4425 562.312 85.6006 562.048 85.8161C561.521 86.2471 560.749 86.9074 559.757 87.8354C559.354 88.212 558.952 88.6334 558.568 89.0665C558.082 88.5481 557.585 87.8376 557.365 87.1041C557.232 86.6639 557.208 86.2459 557.313 85.8613C557.415 85.4847 557.659 85.0784 558.168 84.6783C560.843 82.5783 564.502 81.5616 567.499 81.4205C567.268 82.819 566.866 84.6675 566.318 86.4194C565.982 87.4941 565.596 88.5148 565.169 89.3658C564.736 90.2309 564.292 90.8556 563.868 91.2031C563.165 91.7786 562.643 91.8017 562.248 91.7176C562.024 91.6699 561.807 91.5792 561.583 91.4652C561.476 91.4105 561.375 91.3543 561.268 91.2951L561.252 91.2865C561.146 91.2277 561.025 91.1606 560.908 91.1045C560.526 90.9212 560.066 91.0804 559.882 91.4603C559.697 91.8401 559.858 92.2966 560.24 92.48C560.309 92.5131 560.39 92.5576 560.504 92.6204L560.524 92.6316C560.627 92.6887 560.749 92.7567 560.881 92.8239C561.163 92.9676 561.516 93.1238 561.926 93.211C562.798 93.3968 563.796 93.2416 564.846 92.3815C565.517 91.8316 566.077 90.9812 566.546 90.0466C567.021 89.0978 567.435 87.994 567.786 86.8727C568.487 84.631 568.957 82.2485 569.154 80.739L569.266 79.8872L568.401 79.877C565.001 79.8373 560.496 80.9039 557.215 83.4799C556.48 84.0573 556.028 84.7316 555.829 85.4618C555.632 86.1841 555.698 86.8993 555.892 87.5415C556.22 88.6328 556.938 89.5987 557.576 90.246C557.355 90.5228 557.146 90.7919 556.955 91.0444C556.576 91.5451 556.259 91.9874 556.037 92.3049C555.926 92.4638 555.838 92.5917 555.778 92.6804C555.748 92.7248 555.724 92.7594 555.708 92.7831L555.69 92.8106L555.683 92.821C555.45 93.1733 555.548 93.6469 555.902 93.8788C556.257 94.1107 556.734 94.013 556.967 93.6608L556.968 93.6594L556.972 93.6538L556.988 93.63C557.002 93.6087 557.023 93.5767 557.052 93.535C557.108 93.4516 557.192 93.3295 557.299 93.1769C557.513 92.8716 557.818 92.4452 558.183 91.9627C558.92 90.9904 559.878 89.8192 560.81 88.9476C561.778 88.0427 562.524 87.4049 563.025 86.9958C563.275 86.7912 563.464 86.6438 563.588 86.5489C563.617 86.5275 563.641 86.5088 563.663 86.4927C563.689 86.473 563.71 86.4572 563.727 86.4451L563.759 86.4216Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M541.046 81.7253L541.046 87.667C541.046 88.0316 541.344 88.3272 541.711 88.3272C542.078 88.3272 542.375 88.0316 542.375 87.667L542.375 83.3191L546.941 87.8563L547.881 86.9226L543.315 82.3855L547.691 82.3855C548.058 82.3855 548.355 82.0899 548.355 81.7253C548.355 81.3607 548.058 81.0651 547.691 81.0651H541.711C541.344 81.0651 541.046 81.3607 541.046 81.7253Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M548.365 80.3955L548.365 74.4538C548.365 74.0892 548.662 73.7936 549.029 73.7936H555.009C555.376 73.7936 555.674 74.0892 555.674 74.4538C555.674 74.8184 555.376 75.114 555.009 75.114L550.633 75.114L555.2 79.6511L554.26 80.5848L549.694 76.0477V80.3955C549.694 80.7602 549.396 81.0557 549.029 81.0557C548.662 81.0557 548.365 80.7602 548.365 80.3955Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M555.569 67.2956L555.569 73.2373C555.569 73.602 555.867 73.8975 556.234 73.8975C556.6 73.8975 556.898 73.602 556.898 73.2373V68.8895L561.464 73.4266L562.404 72.4929L557.838 67.9558H562.214C562.581 67.9558 562.878 67.6602 562.878 67.2956C562.878 66.931 562.581 66.6354 562.214 66.6354H556.234C555.867 66.6354 555.569 66.931 555.569 67.2956Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M534.419 61.2305V67.3843H536.371V64.9805H538.954V67.3843H540.906V61.2305H538.954V63.6343H536.371V61.2305H534.419Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <g id="NaturalGasFlame">
                                      <rect
                                          x="630.5"
                                          y="55.5"
                                          width="75"
                                          height="40"
                                          rx="20"
                                          stroke="#666666"
                                          stroke-width="3"></rect>
                                      <text
                                          id="Naturalâ€¨Gas"
                                          fill="#666666"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="14"
                                          font-weight="bold"
                                          letter-spacing="0em">
                                          <tspan x="642.242" y="73.604">Natural
                                          </tspan>
                                          <tspan x="655.381" y="88.604">Gas</tspan>
                                      </text>
                                  </g>
                                  <g id="H2Frame">
                                      <rect
                                          x="445.5"
                                          y="56.5"
                                          width="40"
                                          height="40"
                                          rx="20"
                                          stroke="#27C5F8"
                                          stroke-width="3"></rect>
                                      <g id="H2">
                                          <text
                                              fill="#27C5F8"
                                              xml:space="preserve"
                                              style="white-space: pre"
                                              font-family="Noto Sans KR"
                                              font-size="10"
                                              font-weight="bold"
                                              letter-spacing="0em">
                                              <tspan x="467.849" y="82.104">2</tspan>
                                          </text>
                                          <text
                                              fill="#27C5F8"
                                              xml:space="preserve"
                                              style="white-space: pre"
                                              font-family="Noto Sans KR"
                                              font-size="14"
                                              font-weight="bold"
                                              letter-spacing="0em">
                                              <tspan x="457.253" y="82.104">H</tspan>
                                          </text>
                                      </g>
                                  </g>
                                  <text
                                      id="연료공급계"
                                      fill="black"
                                      fill-opacity="0.6"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="18"
                                      font-weight="bold"
                                      letter-spacing="0em">
                                      <tspan x="624" y="25.8119">연료공급계</tspan>
                                  </text>
                              </g>
                              <g id="AIR-SUPPORT-BOX">
                                  <rect width="115" height="145" transform="translate(0 380)" fill="#7DF5CA"></rect>
                                  <g id="blowerFlame">
                                      <rect width="80" height="100" transform="translate(0 425)" fill="#40E0A7" class="warning-box"></rect>
                                      <text
                                          id="Air"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="32.084" y="510.232">Air</tspan>
                                      </text>
                                      <g id="blower">
                                          <path
                                              d="M36.875 491C48.9531 491 58.75 481.116 58.75 468.931C58.75 466.74 58.4376 464.628 57.8436 462.626H61.875V463.611C61.875 464.478 62.578 465.187 63.4375 465.187C64.3126 465.187 65 464.478 65 463.611V442.576C65 441.709 64.3126 441 63.4375 441C62.578 441 61.875 441.709 61.875 442.576V443.709L39.9531 443.709C34.7811 443.709 31.333 445.298 31.333 445.298C31.333 445.298 27.7075 446.85 25.2539 448.882C18.1249 454.054 15 460.592 15 468.931C15 481.116 24.7968 491 36.875 491ZM21.8906 457.581C30.8093 445.569 49.5283 448.326 54.5469 462.626C58.867 474.732 49.9108 487.847 36.875 487.847C26.5312 487.847 18.1249 479.367 18.1249 468.931C18.1253 464.675 19.5156 460.75 21.8906 457.581Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M33.8221 487.334C37.8118 482.982 38.7469 478.168 37.545 472.91L39.5797 472.445C40.9194 478.305 39.8581 483.838 35.3607 488.744L33.8221 487.334Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M39.8457 451.471C35.8561 455.823 34.9209 460.637 36.1229 465.895L34.0881 466.361C32.7484 460.5 33.8098 454.967 38.3071 450.061L39.8457 451.471Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M54.7651 472.414C50.413 468.425 45.599 467.49 40.3411 468.692L39.8759 466.657C45.7363 465.317 51.2697 466.378 56.1755 470.876L54.7651 472.414Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M18.9028 466.391C23.2549 470.38 28.0689 471.316 33.3268 470.114L33.7919 472.148C27.9315 473.488 22.3982 472.427 17.4923 467.929L18.9028 466.391Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M47.3835 484.211C47.1273 478.313 44.3845 474.248 39.8167 471.38L40.9266 469.612C46.0178 472.809 49.1799 477.472 49.4688 484.121L47.3835 484.211Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M26.2843 454.594C26.5406 460.492 29.2834 464.557 33.8512 467.425L32.7413 469.193C27.6501 465.996 24.4879 461.333 24.199 454.684L26.2843 454.594Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M51.6428 458.853C45.7444 459.109 41.6791 461.852 38.8111 466.42L37.0434 465.31C40.24 460.219 44.9032 457.057 51.5522 456.768L51.6428 458.853Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M22.025 479.952C27.9235 479.696 31.9888 476.953 34.8568 472.385L36.6245 473.495C33.4279 478.586 28.7647 481.749 22.1156 482.037L22.025 479.952Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <text
                                      id="공기공급계"
                                      fill="black"
                                      fill-opacity="0.6"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="18"
                                      font-weight="bold"
                                      letter-spacing="0em">
                                      <tspan x="10" y="410.848">공기공급계</tspan>
                                  </text>
                              </g>
                              <g id="WATER-MANAGE-BOX">
                                  <rect width="115" height="145" transform="translate(180 381)" fill="#97CDFF"></rect>
                                  <g id="huminiferFlame">
                                      <rect width="80" height="100" transform="translate(180 426)" fill="#50A9FB"></rect>
                                      <text
                                          id="Humidifier"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="188.285" y="511.232">Humidifier</tspan>
                                      </text>
                                      <g id="huminifer">
                                          <path
                                              d="M209.052 443.163C209.052 443.805 208.526 444.326 207.877 444.326C207.228 444.326 206.702 443.805 206.702 443.163C206.702 442.521 207.228 442 207.877 442C208.526 442 209.052 442.521 209.052 443.163Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.263 470.898L219.24 470.938C218.797 471.551 214.717 476.455 208.508 471.449C207.71 470.836 206.735 470.325 205.759 470.121C203.808 469.712 202.654 470.325 202.122 470.938C201.679 471.347 201.058 471.347 200.703 470.836C200.349 470.325 200.349 469.611 200.792 469.202C201.767 468.18 203.453 467.158 206.202 467.771C207.444 468.078 208.685 468.691 209.661 469.508C214.304 473.242 217.13 470.098 217.711 469.43C217.761 469.347 217.823 469.27 217.897 469.202C218.872 468.18 220.557 467.158 223.307 467.771C224.548 468.078 225.79 468.691 226.766 469.508C231.466 473.288 234.305 470.019 234.837 469.406C235.191 468.895 235.812 468.895 236.256 469.304C236.523 469.508 236.611 469.814 236.611 470.121C236.611 470.427 236.523 470.632 236.345 470.938C235.901 471.551 231.822 476.455 225.613 471.449C224.815 470.836 223.839 470.325 222.864 470.121C220.956 469.722 219.811 470.299 219.263 470.898Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.24 477.096L219.263 477.056C219.811 476.457 220.956 475.88 222.864 476.279C223.839 476.484 224.815 476.995 225.613 477.607C231.822 482.613 235.901 477.709 236.345 477.096C236.523 476.79 236.611 476.585 236.611 476.279C236.611 475.973 236.523 475.666 236.256 475.462C235.812 475.053 235.191 475.053 234.837 475.564C234.305 476.177 231.466 479.446 226.766 475.666C225.79 474.849 224.548 474.236 223.307 473.929C220.557 473.317 218.872 474.338 217.897 475.36C217.823 475.428 217.761 475.505 217.711 475.588C217.13 476.256 214.304 479.4 209.661 475.666C208.685 474.849 207.444 474.236 206.202 473.929C203.453 473.317 201.767 474.338 200.792 475.36C200.349 475.769 200.349 476.484 200.703 476.995C201.058 477.505 201.679 477.505 202.122 477.096C202.654 476.484 203.808 475.871 205.759 476.279C206.735 476.484 207.71 476.995 208.508 477.607C214.717 482.613 218.797 477.709 219.24 477.096Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.263 483.213L219.24 483.254C218.797 483.867 214.717 488.77 208.508 483.765C207.71 483.152 206.735 482.641 205.759 482.436C203.808 482.028 202.654 482.641 202.122 483.254C201.679 483.662 201.058 483.662 200.703 483.152C200.349 482.641 200.349 481.926 200.792 481.517C201.767 480.495 203.453 479.474 206.202 480.087C207.444 480.393 208.685 481.006 209.661 481.823C214.304 485.557 217.13 482.414 217.711 481.745C217.761 481.662 217.823 481.585 217.897 481.517C218.872 480.495 220.557 479.474 223.307 480.087C224.548 480.393 225.79 481.006 226.766 481.823C231.466 485.603 234.305 482.334 234.837 481.722C235.191 481.211 235.812 481.211 236.256 481.62C236.523 481.823 236.611 482.13 236.611 482.436C236.611 482.743 236.523 482.947 236.345 483.254C235.901 483.867 231.822 488.77 225.613 483.765C224.815 483.152 223.839 482.641 222.864 482.436C220.956 482.037 219.811 482.614 219.263 483.213Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.092 444.326C219.741 444.326 220.267 443.805 220.267 443.163C220.267 442.521 219.741 442 219.092 442C218.444 442 217.917 442.521 217.917 443.163C217.917 443.805 218.444 444.326 219.092 444.326Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M231.484 443.163C231.484 443.805 230.957 444.326 230.309 444.326C229.66 444.326 229.134 443.805 229.134 443.163C229.134 442.521 229.66 442 230.309 442C230.957 442 231.484 442.521 231.484 443.163Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M209.266 447.708C209.915 447.708 210.441 447.188 210.441 446.546C210.441 445.903 209.915 445.383 209.266 445.383C208.617 445.383 208.091 445.903 208.091 446.546C208.091 447.188 208.617 447.708 209.266 447.708Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M221.656 446.546C221.656 447.188 221.13 447.708 220.481 447.708C219.832 447.708 219.306 447.188 219.306 446.546C219.306 445.903 219.832 445.383 220.481 445.383C221.13 445.383 221.656 445.903 221.656 446.546Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M231.697 447.708C232.346 447.708 232.872 447.188 232.872 446.546C232.872 445.903 232.346 445.383 231.697 445.383C231.048 445.383 230.522 445.903 230.522 446.546C230.522 447.188 231.048 447.708 231.697 447.708Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M209.693 450.034C209.693 450.676 209.166 451.197 208.518 451.197C207.869 451.197 207.343 450.676 207.343 450.034C207.343 449.392 207.869 448.871 208.518 448.871C209.166 448.871 209.693 449.392 209.693 450.034Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.627 451.197C220.276 451.197 220.802 450.676 220.802 450.034C220.802 449.392 220.276 448.871 219.627 448.871C218.978 448.871 218.452 449.392 218.452 450.034C218.452 450.676 218.978 451.197 219.627 451.197Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M232.017 450.034C232.017 450.676 231.491 451.197 230.842 451.197C230.194 451.197 229.667 450.676 229.667 450.034C229.667 449.392 230.194 448.871 230.842 448.871C231.491 448.871 232.017 449.392 232.017 450.034Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M206.702 454.05C207.351 454.05 207.877 453.53 207.877 452.887C207.877 452.245 207.351 451.725 206.702 451.725C206.053 451.725 205.527 452.245 205.527 452.887C205.527 453.53 206.053 454.05 206.702 454.05Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.093 452.887C219.093 453.53 218.566 454.05 217.918 454.05C217.269 454.05 216.743 453.53 216.743 452.887C216.743 452.245 217.269 451.725 217.918 451.725C218.566 451.725 219.093 452.245 219.093 452.887Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M229.027 454.05C229.676 454.05 230.202 453.53 230.202 452.887C230.202 452.245 229.676 451.725 229.027 451.725C228.378 451.725 227.852 452.245 227.852 452.887C227.852 453.53 228.378 454.05 229.027 454.05Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M206.702 456.271C206.702 456.913 206.176 457.434 205.527 457.434C204.878 457.434 204.352 456.913 204.352 456.271C204.352 455.629 204.878 455.108 205.527 455.108C206.176 455.108 206.702 455.629 206.702 456.271Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M216.743 457.434C217.392 457.434 217.918 456.913 217.918 456.271C217.918 455.629 217.392 455.108 216.743 455.108C216.094 455.108 215.568 455.629 215.568 456.271C215.568 456.913 216.094 457.434 216.743 457.434Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M229.134 456.271C229.134 456.913 228.608 457.434 227.959 457.434C227.31 457.434 226.784 456.913 226.784 456.271C226.784 455.629 227.31 455.108 227.959 455.108C228.608 455.108 229.134 455.629 229.134 456.271Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M206.168 461.344C206.817 461.344 207.343 460.824 207.343 460.181C207.343 459.539 206.817 459.019 206.168 459.019C205.519 459.019 204.993 459.539 204.993 460.181C204.993 460.824 205.519 461.344 206.168 461.344Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M218.452 460.181C218.452 460.824 217.926 461.344 217.277 461.344C216.628 461.344 216.102 460.824 216.102 460.181C216.102 459.539 216.628 459.019 217.277 459.019C217.926 459.019 218.452 459.539 218.452 460.181Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M228.493 461.344C229.142 461.344 229.668 460.824 229.668 460.181C229.668 459.539 229.142 459.019 228.493 459.019C227.844 459.019 227.318 459.539 227.318 460.181C227.318 460.824 227.844 461.344 228.493 461.344Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M209.372 463.036C209.372 463.678 208.846 464.199 208.197 464.199C207.548 464.199 207.022 463.678 207.022 463.036C207.022 462.394 207.548 461.873 208.197 461.873C208.846 461.873 209.372 462.394 209.372 463.036Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M219.413 464.199C220.062 464.199 220.588 463.678 220.588 463.036C220.588 462.394 220.062 461.873 219.413 461.873C218.764 461.873 218.238 462.394 218.238 463.036C218.238 463.678 218.764 464.199 219.413 464.199Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M231.804 463.036C231.804 463.678 231.278 464.199 230.629 464.199C229.98 464.199 229.454 463.678 229.454 463.036C229.454 462.394 229.98 461.873 230.629 461.873C231.278 461.873 231.804 462.394 231.804 463.036Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M200.341 447.268C198.276 447.268 196.602 449.127 196.602 451.421V486.067C196.602 488.361 198.276 490.22 200.341 490.22H236.659C238.724 490.22 240.398 488.361 240.398 486.067V451.421C240.398 449.127 238.724 447.268 236.659 447.268V445.488C239.609 445.488 242 448.144 242 451.421V486.067C242 489.344 239.609 492 236.659 492H200.341C197.391 492 195 489.344 195 486.067V451.421C195 448.144 197.391 445.488 200.341 445.488V447.268Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <text
                                      id="물관리계"
                                      fill="black"
                                      fill-opacity="0.6"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="18"
                                      font-weight="bold"
                                      letter-spacing="0em">
                                      <tspan x="190" y="411.848">물관리계</tspan>
                                  </text>
                              </g>
                              <g id="HEAT-MANAGE-BOX">
                                  <rect width="327" height="355" transform="translate(387 170)" fill="#FFD3D3"></rect>
                                  <g id="WaterTankFlame">
                                      <rect width="80" height="100" transform="translate(634 426)" fill="#F69393"></rect>
                                      <text
                                          id="WaterTank"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="656.33" y="507.232">Water
                                          </tspan>
                                          <tspan x="659.178" y="519.232">Tank</tspan>
                                      </text>
                                      <g id="WaterTank_2">
                                          <path
                                              d="M675.216 475.69L674.671 476.144V476.178H676.94V477.437H672.483V476.303L674.649 474.511C674.792 474.392 674.915 474.28 675.017 474.176C675.121 474.07 675.201 473.962 675.255 473.85C675.312 473.739 675.34 473.615 675.34 473.479C675.34 473.33 675.308 473.202 675.244 473.096C675.182 472.99 675.095 472.909 674.983 472.852C674.872 472.794 674.743 472.764 674.598 472.764C674.452 472.764 674.324 472.794 674.212 472.852C674.102 472.911 674.017 472.997 673.957 473.11C673.896 473.224 673.866 473.362 673.866 473.524H672.369C672.369 473.116 672.461 472.764 672.644 472.469C672.827 472.175 673.086 471.948 673.421 471.789C673.756 471.63 674.148 471.551 674.598 471.551C675.063 471.551 675.465 471.626 675.805 471.775C676.148 471.922 676.411 472.13 676.596 472.399C676.784 472.667 676.877 472.982 676.877 473.343C676.877 473.566 676.831 473.788 676.738 474.009C676.646 474.228 676.479 474.471 676.239 474.738C675.999 475.004 675.658 475.322 675.216 475.69Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M684.487 475.807C684.81 475.236 684.972 474.535 684.972 473.704C684.972 472.873 684.81 472.173 684.487 471.604C684.164 471.033 683.728 470.602 683.179 470.31C682.629 470.016 682.017 469.869 681.341 469.869C680.661 469.869 680.046 470.016 679.497 470.31C678.95 470.602 678.515 471.033 678.192 471.604C677.871 472.173 677.711 472.873 677.711 473.704C677.711 474.53 677.871 475.229 678.192 475.8C678.515 476.369 678.95 476.801 679.497 477.098C680.046 477.392 680.661 477.539 681.341 477.539C682.017 477.539 682.629 477.393 683.179 477.101C683.728 476.807 684.164 476.376 684.487 475.807ZM682.708 472.574C682.827 472.88 682.887 473.257 682.887 473.704C682.887 474.151 682.827 474.529 682.708 474.838C682.592 475.144 682.418 475.377 682.187 475.538C681.959 475.696 681.677 475.775 681.341 475.775C681.006 475.775 680.723 475.696 680.492 475.538C680.263 475.377 680.09 475.144 679.971 474.838C679.854 474.529 679.796 474.151 679.796 473.704C679.796 473.257 679.854 472.88 679.971 472.574C680.09 472.265 680.263 472.032 680.492 471.874C680.723 471.714 681.006 471.633 681.341 471.633C681.677 471.633 681.959 471.714 682.187 471.874C682.418 472.032 682.592 472.265 682.708 472.574Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M664.879 469.971V477.437H666.906V474.521H669.589V477.437H671.616V469.971H669.589V472.887H666.906V469.971H664.879Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M655.159 442C651.758 442 649 444.758 649 448.159V486.027C649 489.428 651.758 492.186 655.159 492.186H693.027C696.428 492.186 699.186 489.428 699.186 486.027V448.159C699.186 444.758 696.428 442 693.027 442H655.159ZM697.475 448.159C697.475 445.702 695.483 443.711 693.027 443.711H655.159C652.702 443.711 650.711 445.702 650.711 448.159V456.14C650.816 456.094 650.931 456.068 651.053 456.068C653.118 456.068 654.716 455.572 655.79 455.083C656.328 454.838 656.734 454.596 657.001 454.419C657.134 454.33 657.232 454.258 657.294 454.211C657.325 454.187 657.347 454.17 657.359 454.16L657.371 454.15L658.015 453.595L658.572 454.237L658.573 454.237L658.583 454.249C658.594 454.261 658.612 454.281 658.639 454.307C658.691 454.361 658.774 454.442 658.884 454.54C659.106 454.738 659.438 455.001 659.865 455.256C660.72 455.764 661.932 456.222 663.42 456.073C665.009 455.913 666.266 455.423 667.122 454.975C667.55 454.751 667.875 454.538 668.09 454.386C668.197 454.31 668.276 454.249 668.326 454.209C668.351 454.189 668.369 454.174 668.379 454.165L668.388 454.157L668.88 453.722L669.428 454.088L669.434 454.092L669.456 454.106C669.477 454.12 669.509 454.141 669.552 454.168C669.637 454.221 669.764 454.3 669.924 454.394C670.247 454.584 670.702 454.837 671.234 455.089C672.323 455.606 673.625 456.068 674.726 456.068C675.823 456.068 677.09 455.608 678.144 455.093C678.658 454.842 679.097 454.59 679.406 454.401C679.56 454.307 679.681 454.229 679.763 454.176C679.803 454.149 679.834 454.129 679.853 454.115L679.875 454.101L679.879 454.098L680.465 453.69L680.968 454.19L680.978 454.199C680.988 454.208 681.006 454.225 681.032 454.248C681.085 454.294 681.168 454.364 681.282 454.451C681.51 454.625 681.858 454.863 682.319 455.103C683.241 455.582 684.615 456.068 686.4 456.068C688.18 456.068 689.352 455.585 690.062 455.138C690.421 454.912 690.669 454.69 690.823 454.534C690.899 454.455 690.952 454.393 690.982 454.355C690.997 454.336 691.007 454.324 691.011 454.318L691.012 454.316L691.577 453.476L692.31 454.181L692.31 454.182L692.317 454.189L692.322 454.192C692.333 454.203 692.353 454.221 692.38 454.244C692.435 454.292 692.521 454.364 692.636 454.452C692.867 454.628 693.213 454.868 693.658 455.109C694.55 455.592 695.82 456.068 697.361 456.068C697.399 456.068 697.438 456.071 697.475 456.076V448.159ZM655.159 490.475C652.702 490.475 650.711 488.483 650.711 486.027V457.708C650.816 457.754 650.931 457.779 651.053 457.779C653.399 457.779 655.238 457.214 656.498 456.64C657.069 456.381 657.521 456.119 657.849 455.908C658.13 456.149 658.513 456.442 658.99 456.726C660.065 457.366 661.642 457.97 663.591 457.775C665.439 457.59 666.907 457.018 667.915 456.49C668.372 456.251 668.736 456.02 669.002 455.836L669.057 455.869C669.412 456.077 669.913 456.356 670.5 456.634C671.648 457.179 673.232 457.779 674.726 457.779C676.222 457.779 677.776 457.177 678.896 456.63C679.468 456.35 679.954 456.071 680.297 455.862L680.305 455.857C680.597 456.075 681.007 456.349 681.53 456.621C682.651 457.204 684.294 457.779 686.4 457.779C688.511 457.779 689.998 457.2 690.974 456.585C691.313 456.372 691.587 456.156 691.802 455.963C692.073 456.158 692.423 456.386 692.843 456.614C693.913 457.193 695.464 457.779 697.361 457.779C697.399 457.779 697.438 457.777 697.475 457.772V486.027C697.475 488.483 695.483 490.475 693.027 490.475H655.159Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <g id="DIWaterTankFlame">
                                      <rect width="80" height="100" transform="translate(634 214)" fill="#F79393"></rect>
                                      <text
                                          id="DIWater"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="667.953" y="296.232">DI
                                          </tspan>
                                          <tspan x="657.33" y="308.232">Water</tspan>
                                      </text>
                                      <g id="DIWater_2">
                                          <path
                                              d="M678.502 267.557C678.597 267.096 678.299 266.645 677.838 266.551C677.377 266.457 676.927 266.754 676.832 267.215C676.56 268.542 676.114 269.192 675.738 269.513C675.37 269.828 674.978 269.908 674.641 269.905C674.17 269.901 673.785 270.279 673.781 270.75C673.777 271.22 674.155 271.605 674.626 271.609C675.261 271.615 676.089 271.457 676.847 270.808C677.597 270.166 678.181 269.126 678.502 267.557Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M674.057 274.432C677.728 274.432 680.705 271.472 680.705 267.822C680.705 261.73 674.057 255.682 674.057 255.682C674.057 255.682 667.409 261.838 667.409 267.822C667.409 271.472 670.385 274.432 674.057 274.432ZM674.057 272.727C676.796 272.727 679 270.522 679 267.822C679 265.335 677.61 262.67 676.005 260.473C675.315 259.53 674.623 258.723 674.065 258.117C673.504 258.733 672.807 259.553 672.112 260.51C670.5 262.728 669.114 265.391 669.114 267.822C669.114 270.522 671.318 272.727 674.057 272.727Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M649 236.136C649 232.747 651.747 230 655.136 230H692.864C696.253 230 699 232.747 699 236.136V273.864C699 277.253 696.253 280 692.864 280H655.136C651.747 280 649 277.253 649 273.864V236.136ZM650.705 236.136C650.705 233.689 652.689 231.705 655.136 231.705H692.864C695.311 231.705 697.295 233.689 697.295 236.136V247.222C697.258 247.217 697.221 247.214 697.182 247.214C695.647 247.214 694.382 246.74 693.493 246.259C693.049 246.019 692.705 245.779 692.475 245.604C692.36 245.516 692.274 245.444 692.22 245.397C692.192 245.373 692.173 245.356 692.162 245.345L692.157 245.341L692.151 245.335L692.15 245.334L691.42 244.631L690.857 245.468L690.856 245.47C690.852 245.476 690.842 245.489 690.827 245.507C690.797 245.545 690.744 245.607 690.668 245.685C690.516 245.841 690.268 246.062 689.911 246.287C689.203 246.733 688.036 247.214 686.262 247.214C684.483 247.214 683.115 246.729 682.196 246.252C681.736 246.013 681.39 245.776 681.163 245.603C681.049 245.516 680.966 245.446 680.914 245.401C680.888 245.378 680.87 245.361 680.86 245.351L680.85 245.342L680.348 244.844L679.765 245.251L679.761 245.254L679.74 245.268C679.72 245.281 679.69 245.302 679.649 245.328C679.568 245.382 679.447 245.459 679.294 245.553C678.986 245.741 678.549 245.992 678.037 246.242C676.987 246.756 675.724 247.214 674.631 247.214C673.534 247.214 672.238 246.754 671.152 246.238C670.622 245.987 670.168 245.735 669.847 245.546C669.687 245.452 669.561 245.374 669.476 245.32C669.434 245.293 669.402 245.273 669.381 245.259L669.358 245.245L669.353 245.241L668.807 244.876L668.317 245.31L668.307 245.318L668.289 245.333C668.28 245.341 668.269 245.35 668.255 245.361C668.205 245.401 668.126 245.462 668.02 245.538C667.806 245.69 667.481 245.901 667.055 246.124C666.202 246.571 664.95 247.06 663.367 247.218C661.884 247.367 660.677 246.911 659.825 246.404C659.4 246.151 659.069 245.888 658.848 245.692C658.738 245.594 658.656 245.513 658.603 245.46C658.577 245.433 658.559 245.413 658.548 245.401L658.538 245.39L658.537 245.389L657.982 244.749L657.341 245.303L657.329 245.312C657.316 245.323 657.294 245.34 657.264 245.364C657.202 245.411 657.104 245.482 656.971 245.571C656.706 245.747 656.301 245.989 655.765 246.232C654.695 246.719 653.103 247.214 651.046 247.214C650.924 247.214 650.809 247.239 650.705 247.285V236.136ZM651.046 248.919C650.924 248.919 650.809 248.893 650.705 248.848V273.864C650.705 276.311 652.689 278.295 655.136 278.295H692.864C695.311 278.295 697.295 276.311 697.295 273.864V248.911C697.258 248.916 697.221 248.919 697.182 248.919C695.292 248.919 693.747 248.335 692.681 247.758C692.262 247.531 691.914 247.303 691.644 247.109C691.43 247.302 691.157 247.516 690.819 247.729C689.847 248.342 688.365 248.919 686.262 248.919C684.164 248.919 682.527 248.345 681.41 247.764C680.889 247.493 680.48 247.221 680.189 247.003L680.182 247.008C679.839 247.217 679.355 247.495 678.785 247.774C677.67 248.319 676.122 248.919 674.631 248.919C673.143 248.919 671.564 248.321 670.421 247.778C669.836 247.5 669.336 247.223 668.983 247.015L668.928 246.983C668.664 247.166 668.301 247.396 667.846 247.634C666.841 248.16 665.379 248.73 663.537 248.914C661.596 249.109 660.024 248.507 658.954 247.869C658.478 247.586 658.096 247.294 657.817 247.054C657.49 247.265 657.04 247.525 656.471 247.784C655.215 248.355 653.383 248.919 651.046 248.919Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <g id="HeatExchangerFlame">
                                      <rect width="80" height="100" transform="translate(512 314)" fill="#F69393"></rect>
                                      <text
                                          id="HeatExchanger"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="540.564" y="394.232">Heat
                                          </tspan>
                                          <tspan x="524.445" y="406.232">Exchanger</tspan>
                                      </text>
                                      <g id="HeatExchanger_2">
                                          <path
                                              d="M535.651 378.292C533.206 378.292 531.223 376.303 531.223 373.85V342.871H529.52V373.85C529.52 377.246 532.265 380 535.651 380H573.349C576.735 380 579.48 377.246 579.48 373.85H577.777C577.777 376.303 575.794 378.292 573.349 378.292H535.651Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M573.349 331.708C575.794 331.708 577.777 333.697 577.777 336.15L577.777 367.129H579.48L579.48 336.15C579.48 332.754 576.735 330 573.349 330L535.651 330C532.265 330 529.52 332.754 529.52 336.15L531.223 336.15C531.223 333.697 533.206 331.708 535.651 331.708L573.349 331.708Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M526 339.226C526 338.597 526.508 338.087 527.135 338.087V339.226V340.365C526.508 340.365 526 339.855 526 339.226ZM581.865 370.319C581.865 371.458 581.864 371.458 581.864 371.458H539.297C537.856 371.458 536.727 370.826 535.991 369.864C535.28 368.934 534.974 367.752 534.987 366.631C535 365.51 535.333 364.339 536.042 363.421C536.773 362.474 537.884 361.831 539.297 361.831H570.441C571.065 361.831 571.514 361.551 571.85 361.052C572.21 360.517 572.423 359.732 572.417 358.879C572.412 358.027 572.187 357.236 571.82 356.693C571.474 356.182 571.027 355.911 570.441 355.911H539.297C537.798 355.911 536.627 355.254 535.863 354.254C535.124 353.287 534.803 352.056 534.816 350.885C534.829 349.714 535.177 348.493 535.914 347.538C536.674 346.553 537.827 345.885 539.297 345.885H570.441C571.174 345.885 571.679 345.581 572.031 345.116C572.407 344.62 572.631 343.9 572.631 343.125C572.631 342.349 572.407 341.63 572.031 341.133C571.679 340.669 571.174 340.365 570.441 340.365H527.135C527.135 340.365 527.135 340.365 527.135 339.226C527.135 338.087 527.135 338.087 527.135 338.087H570.441C571.925 338.087 573.083 338.757 573.839 339.755C574.571 340.72 574.901 341.951 574.901 343.125C574.901 344.299 574.571 345.529 573.839 346.495C573.083 347.492 571.925 348.163 570.441 348.163H539.297C538.58 348.163 538.071 348.463 537.71 348.932C537.327 349.429 537.095 350.145 537.087 350.911C537.078 351.677 537.294 352.383 537.665 352.869C538.011 353.322 538.524 353.633 539.297 353.633H570.441C571.902 353.633 573.004 354.387 573.698 355.413C574.372 356.408 574.68 357.666 574.688 358.863C574.697 360.06 574.406 361.324 573.732 362.326C573.034 363.365 571.92 364.109 570.441 364.109H539.297C538.637 364.109 538.17 364.385 537.838 364.816C537.482 365.276 537.266 365.942 537.257 366.658C537.249 367.374 537.45 368.029 537.793 368.478C538.11 368.893 538.58 369.18 539.297 369.18H581.864C581.864 369.18 581.865 369.18 581.865 370.319ZM581.865 370.319L581.864 371.458C582.491 371.458 583 370.948 583 370.319C583 369.69 582.491 369.18 581.864 369.18L581.865 370.319Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <text
                                      id="열관리계"
                                      fill="black"
                                      fill-opacity="0.6"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="18"
                                      font-weight="bold"
                                      letter-spacing="0em">
                                      <tspan x="640" y="199.848">열관리계</tspan>
                                  </text>
                              </g>
                              <g id="STACK-MODULE-BOX">
                                  <g id="stackModuleShape">
                                      <path d="M180 0H324.5L425 171V316H281L180 144V0Z" fill="#ECF29E"></path>
                                      <path d="M180 0H324.5L425 171V316H281L180 144V0Z" fill="#ECF29E"></path>
                                  </g>
                                  <g id="inverterFrame">
                                      <rect width="80" height="100" transform="translate(180 36)" fill="#C3D300"></rect>
                                      <text
                                          id="DC/AC Inverter"
                                          fill="white"
                                          xml:space="preserve"
                                          style="white-space: pre"
                                          font-family="Noto Sans KR"
                                          font-size="12"
                                          font-weight="500"
                                          letter-spacing="0em">
                                          <tspan x="202.363" y="114.232">DC/AC
                                          </tspan>
                                          <tspan x="197.23" y="126.232">Inverter</tspan>
                                      </text>
                                      <g id="inverter">
                                          <path
                                              d="M201.67 91.4403C201.337 91.7732 201.337 92.3128 201.67 92.6456C202.003 92.9785 202.543 92.9785 202.875 92.6456L240.534 54.9873C240.867 54.6544 240.867 54.1148 240.534 53.782C240.201 53.4491 239.661 53.4491 239.328 53.782L201.67 91.4403Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M206.591 62.6322C206.795 62.6013 207.024 62.6532 207.298 62.8295C207.58 63.0102 207.86 63.2923 208.118 63.6231C208.372 63.9487 208.579 64.2885 208.724 64.5509C208.796 64.6809 208.851 64.7889 208.888 64.8628C208.906 64.8997 208.919 64.9278 208.928 64.9458L208.936 64.9647L208.938 64.9679L208.942 64.9774L208.955 65.006C208.966 65.0291 208.981 65.0604 209 65.0986C209.038 65.1748 209.093 65.2796 209.165 65.4034C209.308 65.6491 209.525 65.9795 209.817 66.3136C210.389 66.9684 211.346 67.7373 212.686 67.7373C213.995 67.7373 215.059 66.9981 215.731 66.3798C216.079 66.0596 216.354 65.7419 216.543 65.5047C216.638 65.3854 216.712 65.2847 216.764 65.212C216.79 65.1755 216.81 65.1459 216.825 65.1244L216.842 65.0981L216.848 65.0897L216.85 65.0867L216.851 65.0846C217.107 64.6898 216.995 64.162 216.601 63.9056C216.206 63.6496 215.679 63.7614 215.422 64.1548L215.422 64.1558L215.421 64.1569L215.414 64.1672C215.406 64.1788 215.393 64.1979 215.375 64.2234C215.339 64.2745 215.283 64.3507 215.209 64.4438C215.06 64.6312 214.844 64.8796 214.576 65.1256C214.018 65.6396 213.356 66.0327 212.686 66.0327C212.046 66.0327 211.518 65.6693 211.1 65.1917C210.897 64.9597 210.742 64.7239 210.638 64.5451C210.586 64.4565 210.548 64.3844 210.525 64.3368C210.513 64.3131 210.505 64.2957 210.5 64.2856L210.496 64.2761L210.495 64.2738L209.716 64.6204C210.495 64.2738 210.494 64.2729 210.494 64.2729L210.494 64.2716L210.492 64.2683L210.487 64.2582L210.472 64.2252C210.459 64.1976 210.441 64.1592 210.418 64.1114C210.371 64.0161 210.303 63.8831 210.216 63.7256C210.043 63.413 209.787 62.992 209.462 62.5745C209.14 62.1622 208.723 61.7189 208.22 61.3954C207.709 61.0675 207.065 60.8363 206.335 60.9469C205.08 61.1373 204.115 62.0548 203.524 62.7665C203.213 63.1402 202.97 63.5012 202.804 63.7681C202.721 63.9022 202.656 64.0143 202.611 64.0947C202.588 64.135 202.571 64.1674 202.558 64.1907L202.544 64.2189L202.539 64.2277L202.537 64.2307L202.536 64.2328C202.322 64.652 202.489 65.1653 202.908 65.3794C203.327 65.5933 203.839 65.4274 204.054 65.0091C204.054 65.0091 204.054 65.008 203.323 64.6343L204.055 65.0072L204.063 64.9926C204.07 64.9786 204.082 64.9559 204.099 64.926C204.133 64.8659 204.184 64.7768 204.252 64.6676C204.388 64.448 204.587 64.1544 204.835 63.8558C205.361 63.2228 205.98 62.7249 206.591 62.6322ZM203.295 64.6204L202.536 64.2328C202.536 64.2328 202.536 64.2328 203.295 64.6204ZM216.136 64.6204L216.851 65.0846C216.851 65.0846 216.851 65.0846 216.136 64.6204Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M238.693 82.1694H225.795V80.4648H238.693V82.1694Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M231.477 86.146H225.795V84.4414H231.477V86.146Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              d="M233.068 86.146H238.75V84.4414H233.068V86.146Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                          <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M195 54.1364C195 50.7473 197.747 48 201.136 48H238.864C242.253 48 245 50.7473 245 54.1364V91.8636C245 95.2527 242.253 98 238.864 98H201.136C197.747 98 195 95.2527 195 91.8636V54.1364ZM196.705 54.1364C196.705 51.6887 198.689 49.7045 201.136 49.7045H238.864C241.311 49.7045 243.295 51.6887 243.295 54.1364V91.8636C243.295 94.3113 241.311 96.2955 238.864 96.2955H201.136C198.689 96.2955 196.705 94.3113 196.705 91.8636V54.1364Z"
                                              fill="black"
                                              fill-opacity="0.4"></path>
                                      </g>
                                  </g>
                                  <g id="Anode">
                                      <g clip-path="url(#clip0_368_592)">
                                          <rect
                                              x="303"
                                              y="316"
                                              width="146"
                                              height="38"
                                              rx="5"
                                              transform="rotate(-90 303 316)"
                                              fill="#C3D300"></rect>
                                          <text
                                              id="Anode_2"
                                              transform="translate(308 267) rotate(-90)"
                                              fill="white"
                                              xml:space="preserve"
                                              style="white-space: pre"
                                              font-family="Noto Sans KR"
                                              font-size="16"
                                              font-weight="500"
                                              letter-spacing="0em">
                                              <tspan x="0.0390625" y="18.476">Anode</tspan>
                                          </text>
                                      </g>
                                  </g>
                                  <g id="Cathode">
                                      <g clip-path="url(#clip1_368_592)">
                                          <rect
                                              x="346"
                                              y="316"
                                              width="146"
                                              height="38"
                                              rx="5"
                                              transform="rotate(-90 346 316)"
                                              fill="#C3D300"></rect>
                                          <text
                                              id="Cathode_2"
                                              transform="translate(353 275) rotate(-90)"
                                              fill="white"
                                              xml:space="preserve"
                                              style="white-space: pre"
                                              font-family="Noto Sans KR"
                                              font-size="16"
                                              font-weight="500"
                                              letter-spacing="0em">
                                              <tspan x="0.242188" y="18.476">Cathode</tspan>
                                          </text>
                                      </g>
                                  </g>
                                  <g id="Coolant">
                                      <g clip-path="url(#clip2_368_592)">
                                          <rect
                                              x="387"
                                              y="316"
                                              width="146"
                                              height="38"
                                              rx="5"
                                              transform="rotate(-90 387 316)"
                                              fill="url(#paint0_linear_368_592)"></rect>
                                          <text
                                              id="Coolant_2"
                                              transform="translate(391 273) rotate(-90)"
                                              fill="white"
                                              xml:space="preserve"
                                              style="white-space: pre"
                                              font-family="Noto Sans KR"
                                              font-size="16"
                                              font-weight="500"
                                              letter-spacing="0em">
                                              <tspan x="0.335938" y="18.476">Coolant</tspan>
                                          </text>
                                      </g>
                                  </g>
                                  <text
                                      id="스택모듈"
                                      fill="black"
                                      fill-opacity="0.6"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="18"
                                      font-weight="bold"
                                      letter-spacing="0em">
                                      <tspan x="186" y="25.848">스택모듈</tspan>
                                  </text>
                              </g>
                              <g id="lines">
                                  <path
                                      id="STACK-vent-line"
                                      d="M289.293 343.707C288.902 343.317 288.902 342.683 289.293 342.293L295.657 335.929C296.047 335.538 296.681 335.538 297.071 335.929C297.462 336.319 297.462 336.953 297.071 337.343L291.414 343L297.071 348.657C297.462 349.047 297.462 349.681 297.071 350.071C296.681 350.462 296.047 350.462 295.657 350.071L289.293 343.707ZM322 343L323 343L323 344L322 344L322 343ZM323 318L323 320.083L321 320.083L321 318L323 318ZM323 324.25L323 328.417L321 328.417L321 324.25L323 324.25ZM323 332.583L323 336.75L321 336.75L321 332.583L323 332.583ZM323 340.917L323 343L321 343L321 340.917L323 340.917ZM322 344L320 344L320 342L322 342L322 344ZM316 344L312 344L312 342L316 342L316 344ZM308 344L304 344L304 342L308 342L308 344ZM300 344L296 344L296 342L300 342L300 344ZM292 344L290 344L290 342L292 342L292 344Z"
                                      fill="#ABABAB"></path>
                                  <text
                                      id="STACK-vent"
                                      fill="#ABABAB"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="14"
                                      font-weight="500"
                                      letter-spacing="0em">
                                      <tspan x="257" y="347.104">vent</tspan>
                                  </text>
                                  <path
                                      id="WATER-vent-line"
                                      d="M323.707 508.707C324.098 508.317 324.098 507.683 323.707 507.293L317.343 500.929C316.953 500.538 316.319 500.538 315.929 500.929C315.538 501.319 315.538 501.953 315.929 502.343L321.586 508L315.929 513.657C315.538 514.047 315.538 514.681 315.929 515.071C316.319 515.462 316.953 515.462 317.343 515.071L323.707 508.707ZM323 507H321.063V509H323V507ZM317.188 507H313.313V509H317.188V507ZM309.438 507H305.563V509H309.438V507ZM301.688 507H297.813V509H301.688V507ZM293.938 507H290.063V509H293.938V507ZM286.188 507H282.313V509H286.188V507ZM278.438 507H274.563V509H278.438V507ZM270.688 507H266.813V509H270.688V507ZM262.938 507H261V509H262.938V507Z"
                                      fill="#ABABAB"></path>
                                  <text
                                      id="WATER-vent"
                                      fill="#ABABAB"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="14"
                                      font-weight="500"
                                      letter-spacing="0em">
                                      <tspan x="327" y="512.104">vent</tspan>
                                  </text>
                                  <path
                                      id="GAS-vent-line"
                                      d="M683.707 155.293C684.098 155.683 684.098 156.317 683.707 156.707L677.343 163.071C676.953 163.462 676.319 163.462 675.929 163.071C675.538 162.681 675.538 162.047 675.929 161.657L681.586 156L675.929 150.343C675.538 149.953 675.538 149.319 675.929 148.929C676.319 148.538 676.953 148.538 677.343 148.929L683.707 155.293ZM551 156L551 157L550 157L550 156L551 156ZM683 157L681.059 157L681.059 155L683 155L683 157ZM677.176 157L673.294 157L673.294 155L677.176 155L677.176 157ZM669.412 157L665.529 157L665.529 155L669.412 155L669.412 157ZM661.647 157L657.765 157L657.765 155L661.647 155L661.647 157ZM653.882 157L650 157L650 155L653.882 155L653.882 157ZM646.118 157L642.235 157L642.235 155L646.118 155L646.118 157ZM638.353 157L634.471 157L634.471 155L638.353 155L638.353 157ZM630.588 157L626.706 157L626.706 155L630.588 155L630.588 157ZM622.824 157L618.941 157L618.941 155L622.824 155L622.824 157ZM615.059 157L611.176 157L611.176 155L615.059 155L615.059 157ZM607.294 157L603.412 157L603.412 155L607.294 155L607.294 157ZM599.529 157L595.647 157L595.647 155L599.529 155L599.529 157ZM591.765 157L587.882 157L587.882 155L591.765 155L591.765 157ZM584 157L580.118 157L580.118 155L584 155L584 157ZM576.235 157L572.353 157L572.353 155L576.235 155L576.235 157ZM568.471 157L564.588 157L564.588 155L568.471 155L568.471 157ZM560.706 157L556.823 157L556.823 155L560.706 155L560.706 157ZM552.941 157L551 157L551 155L552.941 155L552.941 157ZM550 156L550 153.625L552 153.625L552 156L550 156ZM550 148.875L550 144.125L552 144.125L552 148.875L550 148.875ZM550 139.375L550 137L552 137L552 139.375L550 139.375Z"
                                      fill="#ABABAB"></path>
                                  <text
                                      id="GAS-vent"
                                      fill="#ABABAB"
                                      xml:space="preserve"
                                      style="white-space: pre"
                                      font-family="Noto Sans KR"
                                      font-size="13"
                                      font-weight="500"
                                      letter-spacing="0em">
                                      <tspan x="686" y="158.168">vent</tspan>
                                  </text>
                                  <path
                                      id="STACK-OUT-line"
                                      d="M-1.19209e-07 77L20 88.547V65.453L-1.19209e-07 77ZM180 75L18 75V79L180 79V75Z"
                                      fill="#939F00"></path>
                                  <path
                                      id="anode-inverter-line"
                                      d="M220.744 135.301L221.166 158.391L240.952 146.481L220.744 135.301ZM292.5 254.5L290.787 255.531L291.368 256.498L292.497 256.5L292.5 254.5ZM302.503 252.516L292.503 252.5L292.497 256.5L302.497 256.516L302.503 252.516ZM294.213 253.468L231.741 149.691L228.314 151.754L290.787 255.531L294.213 253.468Z"
                                      fill="#939F00"></path>
                                  <path
                                      id="waterTank-heatExchanger-line"
                                      d="M568 414L562.227 424L573.774 424L568 414ZM568 445L567 445L567 446L568 446L568 445ZM634 444L568 444L568 446L634 446L634 444ZM569 445L569 423L567 423L567 445L569 445Z"
                                      fill="#B86E6E"></path>
                                  <path
                                      id="heatExchanger-waterTank-line"
                                      d="M634 478L624 472.226L624 483.774L634 478ZM537 478L536 478L536 479L537 479L537 478ZM536 414L536 478L538 478L538 414L536 414ZM537 479L625 479L625 477L537 477L537 479Z"
                                      fill="#B86E6E"></path>
                                  <path
                                      id="DIWater-STACK-line"
                                      d="M425 238L435 243.774V232.226L425 238ZM635 237L434 237V239L635 239V237Z"
                                      fill="#B86E6E"></path>
                                  <path
                                      id="heatExchanger-DIWater-line"
                                      d="M635 282L625 276.227L625 287.774L635 282ZM568 282L568 281L567 281L567 282L568 282ZM569 314L569 282L567 282L567 314L569 314ZM568 283L626 283L626 281L568 281L568 283Z"
                                      fill="#B86E6E"></path>
                                  <path
                                      id="STACK-heatExchanger-line"
                                      d="M538 314L532.226 304L543.773 304L538 314ZM538 282L538 281L539 281L539 282L538 282ZM538 283L425 283L425 281L538 281L538 283ZM537 305L537 298L539 298L539 305L537 305ZM537 298L537 282L539 282L539 298L537 298Z"
                                      fill="#B86E6E"></path>
                                  <path
                                      id="h2-STACK-line"
                                      d="M322 170L327.773 160L316.226 160L322 170ZM322 77L322 76L321 76L321 77L322 77ZM445 76L322 76L322 78L445 78L445 76ZM321 77L321 161L323 161L323 77L321 77Z"
                                      fill="#27C5F8"></path>
                                  <path
                                      id="steamReformer-h2-line"
                                      d="M486 77L496 82.7735V71.2265L486 77ZM513 76H495V78H513V76Z"
                                      fill="#27C5F8"></path>
                                  <path
                                      id="gas-steamReformer-line"
                                      d="M593 76L603 81.7735V70.2265L593 76ZM629 75H602V77H629V75Z"
                                      fill="#666666"></path>
                                  <path
                                      id="STACK-WATER-line"
                                      d="M237 381L242.773 371L231.226 371L237 381ZM237 153L237 152L236 152L236 153L237 153ZM364 153L365 153L365 152L364 152L364 153ZM365 167.136L365 165.369L363 165.369L363 167.136L365 167.136ZM365 161.835L365 158.301L363 158.301L363 161.835L365 161.835ZM365 154.767L365 153L363 153L363 154.767L365 154.767ZM364 152L362.016 152L362.016 154L364 154L364 152ZM358.047 152L354.078 152L354.078 154L358.047 154L358.047 152ZM350.109 152L346.141 152L346.141 154L350.109 154L350.109 152ZM342.172 152L338.203 152L338.203 154L342.172 154L342.172 152ZM334.234 152L330.266 152L330.266 154L334.234 154L334.234 152ZM326.297 152L322.328 152L322.328 154L326.297 154L326.297 152ZM318.359 152L314.391 152L314.391 154L318.359 154L318.359 152ZM310.422 152L306.453 152L306.453 154L310.422 154L310.422 152ZM302.484 152L298.516 152L298.516 154L302.484 154L302.484 152ZM294.547 152L290.578 152L290.578 154L294.547 154L294.547 152ZM286.609 152L282.641 152L282.641 154L286.609 154L286.609 152ZM278.672 152L274.703 152L274.703 154L278.672 154L278.672 152ZM270.734 152L266.766 152L266.766 154L270.734 154L270.734 152ZM262.797 152L258.828 152L258.828 154L262.797 154L262.797 152ZM254.859 152L250.891 152L250.891 154L254.859 154L254.859 152ZM246.922 152L242.953 152L242.953 154L246.922 154L246.922 152ZM238.984 152L237 152L237 154L238.984 154L238.984 152ZM236 153L236 155.036L238 155.036L238 153L236 153ZM236 159.107L236 163.179L238 163.179L238 159.107L236 159.107ZM236 167.25L236 171.321L238 171.321L238 167.25L236 167.25ZM236 175.393L236 179.464L238 179.464L238 175.393L236 175.393ZM236 183.536L236 187.607L238 187.607L238 183.536L236 183.536ZM236 191.679L236 195.75L238 195.75L238 191.679L236 191.679ZM236 199.821L236 203.893L238 203.893L238 199.821L236 199.821ZM236 207.964L236 212.036L238 212.036L238 207.964L236 207.964ZM236 216.107L236 220.179L238 220.179L238 216.107L236 216.107ZM236 224.25L236 228.321L238 228.321L238 224.25L236 224.25ZM236 232.393L236 236.464L238 236.464L238 232.393L236 232.393ZM236 240.536L236 244.607L238 244.607L238 240.536L236 240.536ZM236 248.679L236 252.75L238 252.75L238 248.679L236 248.679ZM236 256.821L236 260.893L238 260.893L238 256.821L236 256.821ZM236 264.964L236 269.036L238 269.036L238 264.964L236 264.964ZM236 273.107L236 277.179L238 277.179L238 273.107L236 273.107ZM236 281.25L236 285.321L238 285.321L238 281.25L236 281.25ZM236 289.393L236 293.464L238 293.464L238 289.393L236 289.393ZM236 297.536L236 301.607L238 301.607L238 297.536L236 297.536ZM236 305.679L236 309.75L238 309.75L238 305.679L236 305.679ZM236 313.821L236 317.893L238 317.893L238 313.821L236 313.821ZM236 321.964L236 326.036L238 326.036L238 321.964L236 321.964ZM236 330.107L236 334.178L238 334.178L238 330.107L236 330.107ZM236 338.25L236 342.321L238 342.321L238 338.25L236 338.25ZM236 346.393L236 350.464L238 350.464L238 346.393L236 346.393ZM236 354.536L236 358.607L238 358.607L238 354.536L236 354.536ZM236 362.678L236 366.75L238 366.75L238 362.678L236 362.678ZM236 370.821L236 374.893L238 374.893L238 370.821L236 370.821Z"
                                      fill="#339DFF"></path>
                                  <path
                                      id="WATER-STACK-line"
                                      d="M364 316L358.226 326H369.774L364 316ZM364 455V456H365V455H364ZM260 456H364V454H260V456ZM365 455V325H363V455H365Z"
                                      fill="#339DFF"></path>
                                  <path
                                      id="AIR-WATER-line"
                                      d="M180 455L170 449.226V460.774L180 455ZM80 456H171V454H80V456Z"
                                      fill="#31B586"></path>
                                  <path
                                      id="OUR-AIR-line"
                                      d="M57 381L62.7735 371H51.2265L57 381ZM57 287H58V286H57V287ZM1 288H57V286H1L1 288ZM56 287L56 372H58L58 287H56Z"
                                      fill="#31B586"></path>
                              </g>
                          </g>
                          <defs>
                              <lineargradient
                                  id="paint0_linear_368_592"
                                  x1="460"
                                  y1="316"
                                  x2="460"
                                  y2="354"
                                  gradientunits="userSpaceOnUse">
                                  <stop stop-color="#C3D300"></stop>
                                  <stop offset="1" stop-color="#F69393"></stop>
                              </lineargradient>
                              <clippath id="clip0_368_592">
                                  <rect
                                      x="303"
                                      y="316"
                                      width="146"
                                      height="38"
                                      rx="5"
                                      transform="rotate(-90 303 316)"
                                      fill="white"></rect>
                              </clippath>
                              <clippath id="clip1_368_592">
                                  <rect
                                      x="346"
                                      y="316"
                                      width="146"
                                      height="38"
                                      rx="5"
                                      transform="rotate(-90 346 316)"
                                      fill="white"></rect>
                              </clippath>
                              <clippath id="clip2_368_592">
                                  <rect
                                      x="387"
                                      y="316"
                                      width="146"
                                      height="38"
                                      rx="5"
                                      transform="rotate(-90 387 316)"
                                      fill="white"></rect>
                              </clippath>
                          </defs>
                      </svg>
                  </div>
                  <div class="tags">
                      <div class="tag air temp" id="T_A_B_in">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">23<sup>℃</sup>
                              </div>
                              <div class="name">T_A_B_in</div>
                          </div>
                      </div>
                      <div class="tag air pressure" id="P_A_B_in">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">-0.9<sup>kPa</sup>
                              </div>
                              <div class="name">P_A_B_in</div>
                          </div>
                      </div>
                      <div class="tag air motor" id="Pump-Air">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">45<sup>%</sup>
                              </div>
                              <div class="name">Pump(Air)</div>
                          </div>
                      </div>
                      <div class="tag air pressure" id="P_A_m_out">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">6.9<sup>kPa</sup>
                              </div>
                              <div class="name">P_A_m_out</div>
                          </div>
                      </div>
                      <div class="tag air flow warning" id="MFM-Air">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">30<sup>lpm</sup>
                              </div>
                              <div class="name">MFM(Air)</div>
                          </div>
                      </div>
                      <div class="tag water temp" id="T_A_vent">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">38<sup>℃</sup>
                              </div>
                              <div class="name">T_A_vent</div>
                          </div>
                      </div>
                      <div class="tag water pressure" id="P_A_S_in">
                          <div class="tag-title">
                              <div class="number">6<sup>kPa</sup>
                              </div>
                              <div class="name">P_A_S_in</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag water temp" id="T_A_S_in">
                          <div class="tag-title">
                              <div class="number">48<sup>℃</sup>
                              </div>
                              <div class="name">T_A_S_in</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag water temp" id="T_A_S_out">
                          <div class="tag-title">
                              <div class="number">56<sup>℃</sup>
                              </div>
                              <div class="name">T_A_S_out</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag heat temp" id="T_DI_S_out">
                          <div class="tag-title">
                              <div class="number">60<sup>℃</sup>
                              </div>
                              <div class="name">T_DI_S_out</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag heat temp" id="T_w_h_out">
                          <div class="tag-title">
                              <div class="number">58<sup>℃</sup>
                              </div>
                              <div class="name">T_w_h_out</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag heat flow" id="MFM-Water">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">30<sup>lpm</sup>
                              </div>
                              <div class="name">MFM(Water)</div>
                          </div>
                      </div>
                      <div class="tag heat motor" id="Pump-Water">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">21<sup>%</sup>
                              </div>
                              <div class="name">Pump(water)</div>
                          </div>
                      </div>
                      <div class="tag heat temp" id="T_DI_h_out">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">53<sup>℃</sup>
                              </div>
                              <div class="name">T_DI_h_out</div>
                          </div>
                      </div>
                      <div class="tag heat flow" id="MFM-DI">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">30<sup>lpm</sup>
                              </div>
                              <div class="name">MFM(DI)</div>
                          </div>
                      </div>
                      <div class="tag heat motor" id="Pump-DI">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title">
                              <div class="number">72<sup>%</sup>
                              </div>
                              <div class="name">Pump(DI)</div>
                          </div>
                      </div>
                      <div class="tag heat temp" id="T_DI_S_in">
                          <div class="tag-title">
                              <div class="number">52<sup>℃</sup>
                              </div>
                              <div class="name">T_DI_S_in</div>
                          </div>
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                      </div>
                      <div class="tag generator current" id="A-current">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title one-line">
                              <div class="number">40<sup>A</sup>
                              </div>
                          </div>
                      </div>
                      <div class="tag generator volt" id="V-volt">
                          <div class="tag-header">
                              <div class="circle"></div>
                              <div class="icon"></div>
                          </div>
                          <div class="tag-title one-line">
                              <div class="number">25<sup>V</sup>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="diagram-tag-line">
                      <svg
                          width="715"
                          height="526"
                          viewbox="0 0 715 526"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <g id="Diagram">
                              <g id="tag-line">
                                  <rect id="T_DI_S_in-line" x="505" y="229" width="2" height="8" fill="#E95858"></rect>
                                  <rect id="MFM(DI)-line" x="552" y="229" width="2" height="8" fill="#E95858"></rect>
                                  <rect id="Pump(DI)-line" x="552" y="239" width="2" height="8" fill="#E95858"></rect>
                                  <rect id="T_DI_S_out-line" x="505" y="283" width="2" height="8" fill="#E95858"></rect>
                                  <rect id="T_DI_h_out-line" x="608" y="283" width="2" height="42" fill="#E95858"></rect>
                                  <rect id="MFM(Water)-line" x="608" y="382" width="2" height="62" fill="#E95858"></rect>
                                  <rect id="Pump(Water)-line" x="626" y="414" width="2" height="30" fill="#E95858"></rect>
                                  <rect id="T_w_h_out-line" x="517" y="444" width="20" height="2" fill="#E95858"></rect>
                                  <rect id="T_A_S_out-line" x="227" y="253" width="9" height="2" fill="#339DFF"></rect>
                                  <rect id="T_A_S_in-line" x="354" y="381" width="9" height="2" fill="#339DFF"></rect>
                                  <rect id="P_A_S_in-line" x="354" y="414" width="9" height="2" fill="#339DFF"></rect>
                                  <rect id="T_A_vent-line" x="294" y="493" width="2" height="14" fill="#339DFF"></rect>
                                  <rect id="Pump(Air)-line" x="85" y="456" width="2" height="40" fill="#31B586"></rect>
                                  <rect id="MFM(Air)-line" x="109" y="456" width="2" height="8" fill="#31B586"></rect>
                                  <rect id="P_A_m_out-line" x="96" y="446" width="2" height="8" fill="#31B586"></rect>
                                  <rect id="current-line" x="77" y="67" width="2" height="8" fill="#C0CF00"></rect>
                                  <rect id="volt-line" x="77" y="79" width="2" height="8" fill="#C0CF00"></rect>
                                  <rect id="T_A_B_in-line" x="58" y="306" width="9" height="2" fill="#31B586"></rect>
                                  <rect id="P_A_B_in-line" x="58" y="339" width="9" height="2" fill="#31B586"></rect>
                              </g>
                          </g>
                      </svg>
                  </div>
                </div>




              </div>
            </div>            
          </div>
        </div>
        <div class="row">
          <div class="col-xxl-7 order-2 order-xxl-1">
            <div class="widget alram-log">
              <div class="widget-head">
                알람로그
                <div class="widget-head-gadget widget-head-gadget-alarm">
                  <button class="mini all-C">전항목</button>
                  <div class="btn-wrapper">
                    <button class="mini normal-C">정상</button>
                    <button class="mini watchout-C">점검요망</button>
                    <button class="mini warning-C">경고</button>
                    <button class="mini critical-C">비상</button>
                  </div>
                  <select id="alarmCountSelect">
                    <option value="10">10개</option>
                    <option value="20" selected>20개</option>
                    <option value="30">30개</option>
                  </select>
                  <span class="icon-arrow-right2"></span>
                </div>
              </div>
              <div class="widget-body">
                  <div class="table-responsive">
                    <table class="table table-fixed table-striped">
                      <thead>
                        <tr>
                          <th class="col-4">시간</th>
                          <th class="col-6">내용</th>
                          <th class="col-2">상태</th>
                        </tr>
                      </thead>
                      <tbody class="scrollmini" id="alarm-log">
                        <!--    
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6">스택 측정을 시작했습니다.</td>
                          <td class="col-2">정상</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6 watchout-C">스택 측정을 시작했습니다.</td>
                          <td class="col-2 watchout-C">점검요망</td>
                        </tr>
                        <tr>
                          <td  class="col-4">2023.11.03 22:22</td>
                          <td  class="col-6 warning-C">스택 측정을 시작했습니다.</td>
                          <td  class="col-2 warning-C">경고</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6 critical-C">스택 측정을 시작했습니다.</td>
                          <td class="col-2 critical-C">비상</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6">스택 측정을 시작했습니다.</td>
                          <td class="col-2">정상</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6">스택 측정을 시작했습니다.</td>
                          <td class="col-2">정상</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6">스택 측정을 시작했습니다.</td>
                          <td class="col-2">정상</td>
                        </tr>
                        <tr>
                          <td class="col-4">2023.11.03 22:22</td>
                          <td class="col-6">스택 측정을 시작했습니다.</td>
                          <td class="col-2">정상</td>
                        </tr>
                    -->
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>
          </div>
          <div class="col-xxl-5 order-1  order-xxl-2">
            <div class="widget HW-BOP-sensor-info">
              <div class="widget-head">
                HW BOP 센서 정보
                <div class="widget-head-gadget">
                  <span class="icon-arrow-right2"></span>
                </div>
              </div>
              <div class="widget-body scrollmini scrollmini-noborder">
                <div class="row">
                    <div class="col-4">
                        <div class="sensor air">P_A_m_out(102)</div>
                        <div class="sensor air">P_A_B_in(105)</div>
                        <div class="sensor air">Air(%)</div>
                        <div class="sensor water warning">MFM3(Air)</div>
                        <div class="sensor water">T_A_S_in(113)</div>
                        <div class="sensor water">T_A_S_out(109)</div>
                        <div class="sensor water">T_A_vent(115)</div>
                    </div>
                    <div class="col-4">
                        <div class="sensor heat">DI(%)</div>
                        <div class="sensor heat">Water(%)</div>
                        <div class="sensor heat">T_w_h_in(104)</div>
                        <div class="sensor heat">T_A_B_in(116)</div>
                        <div class="sensor generator">Current</div>
                        <div class="sensor generator">Voltage</div>
                        <div class="sensor heat">T_DI_S_out(108)</div>
                    </div>
                    <div class="col-4">
                        <div class="sensor heat">T_DI_h_out(107)</div>
                        <div class="sensor heat">T_w_t_in(101)</div>
                        <div class="sensor heat">T_w_t_out(102)</div>
                    </div>
                    <div class="col"></div>
                    <div class="col"></div>
                </div>
              </div>
            </div>
          </div>
        </div>        
      </div>
      <div class="col-xxl-7">
        <div class="row">
          <div class="col-xxl-8">
            <div class="row">
              <div class="col-xxl-12">
                <div class="widget stack-status">
                  <div class="widget-head">
                    스택상태
                    <div class="widget-head-gadget">
                      <span class="icon-arrow-right2"></span>
                    </div>
                  </div>
                  <div class="widget-body scrollmini scrollmini-noborder">
                    <div class="row">
                      <div class="col-6 left-side">
                        <div style="
                        height: 100%;
                        text-align:center;
                        background: #ddd;">GRAPH 1</div>
                      </div>
                      <div class="col-6 right-side">
                        <div style="
                        height: 100%;
                        text-align:center;
                        background: #ddd;">GRAPH 2</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-xxl-12">
                <div class="widget BOP-graph" >
                  <div class="widget-head">
                    BOP 그래프
                    <div class="widget-head-gadget">
                      <span class="icon-arrow-right2"></span>
                    </div>
                  </div>
                  <div class="widget-body scrollmini scrollmini-noborder">
                    <div style="
                    height: 542px;
                    text-align:center;
                    background: #ddd;">GRAPH 2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xxl-4">
            <div class="row">
              <div class="col-xxl-12">
                <div class="widget day-month-watt" id="e_production">
                    <div class="widget-head">
                        전기생산량
                        <div class="widget-head-gadget">
                            <div class="d-inline-block pe-1">
                                <div class="d-inline-block" id="toggle-switch-1-day">금일</div>
                                <div class="toggle-switch d-inline-block align-middle">
                                    <input type="checkbox" id="toggle-switch-1">
                                    <label for="toggle-switch-1"></label>
                                </div>
                                <div class="d-inline-block" id="toggle-switch-1-month">금월</div>
                            </div>
                            <span class="icon-arrow-right2"></span>
                        </div>
                    </div>
                    <div class="widget-body">
                        <div class="myChartDiv position-relative" style="bottom: 8px;">
                            <canvas id="eProduction-bar"></canvas>
                        </div>
                    </div>
                </div>
              </div>
              <div class="col-xxl-12">
                <div class="widget day-month-heat" id="h_production">
                    <div class="widget-head">
                        열생산량
                        <div class="widget-head-gadget">
                            <div class="d-inline-block pe-1">
                                <div class="d-inline-block">금일</div>
                                <div class="toggle-switch d-inline-block align-middle">
                                    <input type="checkbox" id="toggle-switch-2">
                                    <label for="toggle-switch-2"></label>
                                </div>
                                <div class="d-inline-block">금월</div>
                            </div>
                            <span class="icon-arrow-right2"></span>
                        </div>
                    </div>
                    <div class="widget-body">
                        <div class="myChartDiv position-relative" style="bottom: 8px;">
                            <canvas id="tProduction-bar"></canvas>
                        </div>
                    </div>
                </div>
              </div>
              <div class="col-xxl-12">
                <div class="widget FDU-ctrl">
                  <div class="widget-head">
                    FDU 제어판
                    <div class="widget-head-gadget">
                      <span class="icon-arrow-right2"></span>
                    </div>
                  </div>
                  <div class="widget-body">
                      <div class="">
                          <table class="table table-striped">
                              <tbody>
                                  <tr>
                                      <td colspan="2" class="text-start">
                                          <div class="row">
                                              <div class="col-6">
                                                  <button class="box">
                                                    <div class="icon-h2s-pause-2"></div>
                                                    재시작
                                                  </button>
                                                    <button class="box">
                                                    <div class="icon-h2s-stop-2"></div>
                                                    중지
                                                  </button>
                                              </div>
                                              <div class="col-6 progress-section">
                                                  <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100">
                                                      <div class="progress-bar" style="width: 80%"></div>
                                                    </div>
                                                    <div class="text-end">80%</div>
                                              </div>
                                          </div>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td>통신상태</td>
                                      <td>양호</td>
                                  </tr>
                                  <tr>
                                      <td>최근접속시간</td>
                                      <td>11:30</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                </div>
              </div>
              <div class="col-xxl-12">
                <div class="widget operating-info">
                  <div class="widget-head">
                    운전 정보
                    <div class="widget-head-gadget">
                      <span class="icon-arrow-right2"></span>
                    </div>
                  </div>
                  <div class="widget-body">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td>금일생산량</td>
                                <td>7 kWh</td>
                            </tr>
                            <tr>
                                <td>금월생산량</td>
                                <td>222 kWh</td>
                            </tr>
                            <tr>
                                <td>누적생산량</td>
                                <td>10660 kWh</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                </div>
              </div>
              <div class="col-xxl-12">
                <div class="widget system-info">
                  <div class="widget-head">
                    시스템 정보
                    <div class="widget-head-gadget">
                      <span class="icon-arrow-right2"></span>
                    </div>
                  </div>
                  <div class="widget-body">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td>연료전지 타입</td>
                                <td id="type"><!--type--></td>
                            </tr>
                            <tr>
                                <td>연료전지 용량</td>
                                <td id="capacity"><!--capacity--></td>
                            </tr>
                            <tr>
                                <td>설치위치</td>
                                <td id="place"><!--place--></td>
                            </tr>
                            <tr>
                                <td>설치일자</td>
                                <td id="date"><!--date--></td>
                            </tr>
                        </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
<!-- <script>
    includeHTML();
</script> -->
<script src="js/main.js?type=1&graph=.BOP-graph>.widget-body>div"></script>
<script src="js/imp.js?folder=정상_데이터_폴더&el=.widget.stack-status>.widget-body>.row>.left-side>div"></script>
<script src="js/bode.js?folder=최근_데이터_폴더&el=.widget.stack-status>.widget-body>.row>.right-side>div"></script>


