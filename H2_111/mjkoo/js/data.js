//      
                                                                                         
                                                   
                                      
                      
                            
                        
                      
                                     
                         
                   
                            
                            
                            
                           
                               
                                   
                                  
                                   
                                   
                                   
                                    
                                  
                                   
                                  
                                   
                        
                                
                               
                                
                                
                               
                                 
                                 
                                 
                                
                                
                       
                                
                               
                                
                   
                       
                            
                            
                            
  
                   
                   
                  
                
                   
  

// AbortController
const controller = new AbortController();
const controller2 = new AbortController();
const signal = controller.signal;
const signal2 = controller2.signal;
var abort_once1 = true;
var abort_once2 = true;
const ASYNC_WAIT_TIMEOUT = 50;

// 웹 워커 코드
self.onmessage = function(argv) {
    // console.log("data.js / argv.ports : ", argv.ports);
    const port1 = argv.ports[0];
    // console.log("data.js / worker msg : ", argv.data.msg);
    switch(argv.data.msg) {
        case "INIT_CHANNEL1":
            port1.onmessage = (e) => { channel1_handler(e, port1); }
        break;
        case "INIT_CHANNEL2":
            port1.onmessage = (e) => { channel2_handler(e, port1); }
        break;
        case "INIT_CHANNEL3":
            port1.onmessage = (e) => { channel3_handler(e, port1); }
        break;
    }
    // console.log("data.js / port : ", port1);
}

function channel1_handler(argv, port1) {
    console.log("data.js / channel1_handler / argv : ", argv);
    var path_obj, base_url, call_once, downloaded_url;
    switch(argv.data.msg) {

        case "CH1/(1)DASHBOARD_INIT":
            base_url = argv.data.url;
            console.log("data.js / base_url : ", base_url);
            call_once = true;
            downloaded_url = [];
            path_obj = { history:[], map:{}, map_full:{} };
            // 백트래킹 시작
            dfs_with_backtracking(base_url, path_obj, 0, (url, path) => {
                downloaded_url.push(url);
                // 비동기 요청 정렬
                if(call_once) { call_once = false;
                    setTimeout(() => {
                        var sorted_url = downloaded_url.sort().reverse();
                        // 가져온 데이터를 메인 스레드로 전송
							port1.postMessage({msg: "CH1/(a)DASHBOARD_DATA", url : sorted_url[0], history: path});
                    }, ASYNC_WAIT_TIMEOUT);
                }
            });
        break;

        case "CH1/(2)GET_DIR":
            const response = argv.data.response;
            var url = argv.data.url;
            url = url.replaceAll("//", "/");
            fetch(url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then(include => {
                // console.log("data.js / url :", url);
                if(url == "/ALL/data" || url == "/ALL/data/") 
                    return include.filter((d       ) => /^[0-9]{4}\//.exec(d) );
                else 
                    return include.filter((d       ) => (d.includes(".csv") && !d.includes(".gz") && !d.includes(".bak")) || /[0-9]+.*\//.exec(d));
            })
            .then(list => { port1.postMessage({msg: response, list: list}); });
        break;

        case "CH1/(3)BOP_INIT":
            base_url = argv.data.url;
            call_once = true;
            downloaded_url = [];
            path_obj = {history:[], map:{}, map_full:{}};
            // 백트래킹 시작
            dfs_with_backtracking___bop(base_url, path_obj, 0, (url, path) => {
                downloaded_url.push(url);
                // 비동기 요청 정렬
                if(call_once) { call_once = false;
                    setTimeout(() => {
                        var sorted_url = downloaded_url.sort().reverse();
                        // 가져온 데이터를 메인 스레드로 전송
                        port1.postMessage({msg: "CH1/(f)BOP_DATA", url : sorted_url[0], history: path});
                    }, 1000);
                }
            });
        break;
        case "CH1/(4)BOP_DATA_FETCH":
            fetch(argv.data.url)
            .then( d => d.text())
            // 1.CSV를 mapped JSON으로 파싱
            // .then( d => { console.log("data.js / Δ1 : ", d); return d;})
            .then( (txt       ) => fn_parse_csv_into_mapped_json(txt))
            // .then( d => { console.log("data.js / Δ2 : ", d); return d;})
            // 2.mapped JSON을 flot_data로 전처리
            .then( (json                ) => fn_parse_mapped_json_to_flotdata(json)) 
            .then( (flotdata             ) => {
                console.log("data.js / flotdata : ", flotdata);
                // 3. flot_data를 필터링 (R_ == 소프트 센서 데이터)
                var soft_flotdata = flotdata.filter( (d) => d.label.includes("R_") );
                port1.postMessage({msg: "CH1/(g)BOP_SOFT_FLOTDATA", flotdata: soft_flotdata});
                // 4. flot_data를 필터링 (하드 센서 데이터)
                var hard_flotdata = flotdata.filter( (d) => 
                !d.label.includes("R_") 
                && !d.label.includes("Result") 
                && !d.label.includes("deltaP")
                && !d.label.includes("UA")
                && !d.label.includes("Ms")
                && !d.label.includes("Mr"));
                port1.postMessage({msg: "CH1/(h)BOP_HARD_FLOTDATA", flotdata: hard_flotdata});
                // 5. flot_dtat를 필터링 (BOP 바차트 데이터)
                const x = 0;
                console.log("data.js / flotdata : ", flotdata);
                const len =   flotdata[0].data.length;
                const stime = flotdata[0].data[0][x];
                const etime = flotdata[0].data[len-1][x];
                var time_flag = {};
                const WINDOW_SIZE = 30*60*1000;
                var bop_bardata = flotdata.filter( (d) => d.label.includes("Result") )
                .map(d => {
                    // >>> 240228 hjkim - RUN LENGTH 알고리즘
                    for(var i = 0; i < d.data.length; i++) {
                        for(var j = 0; j < WINDOW_SIZE; j++) {
                            if(i+j >= d.data.length) break;
                            if( fn_get_group(d.data[i][1]) != fn_get_group(d.data[i+j][1]) ) {
                                time_flag[ d.data[i+j][0] ] = d.data[i+j][1];
                                i += j;
                                break;
                            }
                        }
                    }
                    // <<< 240228 hjkim - RUN LENGTH 알고리즘 
                    return d.data.map(d => [d[0]/*timestamp*/, d[1]/*result*/]);
                });
                port1.postMessage({msg: "CH1/(i)BOP_BARDATA", bardata: bop_bardata[0], 
                stime: stime, etime: etime, len: len, time_flag: time_flag});
                
                // 6. flot_data를 필터링 (STACK_BARDATA)
                 // IMPEDANCE DATA FETCH
                const imp_url = argv.data.imp_url;
                fetch(imp_url)
                .then(res => res.text())
                // .then(d => {console.log("data.js / before:", d); return d; })
                .then(txt => _extract_url(txt))
                .then(arr => arr.filter(d => d.includes(".txt")))
                // .then(d => {console.log("data.js / after1 :", d); return d; })
                .then((url_list) => {
                    var result = [];
                    for (var i_1 = 0; i_1 < url_list.length; i_1++) {
                        let url = url_list[i_1];
                        if(url.includes(".txt") == false) continue;
                        // ex) "d2023-05-22-15-36_imp_Data_열_열교환기출구_부안.txt"
                        if(url == null) throw "url 요소가 없습니다.";
                        let _sp = url.split("_imp_Data_");
                        let _prefix = _sp[0].slice(1);
                        if(_sp[1] == undefined) continue;
                        let _postfix = _sp[1].slice(0, -4);
                        if(_prefix.length != 16) continue;
                        //console.log(_prefix, _postfix);
                        let _t = _prefix.split("-");
                        var _ymd_hms = [_t[0],_t[1],_t[2]].join("-")+" "+[_t[3],_t[4]].join(":");
                        let _ts = new Date(_ymd_hms).getTime();
                        if(isNaN(_ts)) continue;
                        if(_ts < stime  || etime < _ts) continue;
                        // >>> 240226 hjkim - Draw Nyquist Plot
                        // /ALL/data/impedance/imp_data/d2024-02-20-12-46_imp_Data_정상_부안_stk2_40A.txt
                        if(url_list[i_1] == null) throw "url_list[i_1] 가 없습니다.";
                        let _url = `${imp_url}/${url_list[i_1]}`; 
                        // <<< 240226 hjkim - Draw Nyquist Plot
    
                        // >>> 240223 hjkim - meta-data for stack bar 드로잉
                        let obj = { timestamp: _ts, time: _ymd_hms, label: _postfix, url: _url };
                        // console.log("data.js / obj : ", obj);
                        result.push(obj);
                        // <<< 240223 hjkim - meta-data for stack bar 드로잉
                    }
                    return result;
                })
                .then(bardata => {
                    // console.log("data.js / _bardata : ", bardata);
                    port1.postMessage({msg: "CH1/(j)STACK_BARDATA", bardata: bardata, range: (etime-stime), timestamp_s: stime});
                });
            });
        break;

    }
}

function channel2_handler(argv, port1) {
    const M_OHM = 1000; // 단위 변환 상수    
    switch(argv.data.msg) {
        case "GET_STACK__BULK":
            // >>> 240419 hjkim - 기간단위의 시각화 데이터(with min/max)

            // <<< 240419 hjkim - 기간단위의 시각화 데이터
            fetch()
        break;
        case "GET_STACK__STREAM":
            // >>> 240416 hjkim - 시계열 단위의 시각화 데이터
            fetch(argv.data.url_dir)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then(arr => arr.filter(d => d.includes(".txt")))
            .then(d => {
                // DRAW_IMPDATA (=> imp.js)
                d.map(_u => {
                    // _u ="post_d2024-03-28-12-55_imp_Data_정상_부안_stk2_40A_[ebeb23].txt";
                    var _color = "#00FF00";
                    //
                    const color_re = /[0-9A-Fa-f]{6}/gi;
                    var m = _u.match(color_re);
                    if(m != null) _color = `#${m[0]}`;
                    //
                    var _url = `${argv.data.url_dir}/${_u}`;
                    // >>> 240417 hjkim - 그래프와 DATA의 분리
                    fetch(_url).then(res => res.text())
                    // >>> 단위변환 및 y값 반전
                    .then(txt =>  _parse_imp_data(txt, (arr) => {
                        arr[1] *= M_OHM;        // x: Real Imp.
                        arr[2] *= M_OHM * -1;   // y: -Imag Imp.
                    }))
                    // <<< 단위변환 및 y값 반전
                    // >>> 240418 hjkim - y축이 0 이상인 것만 사용
                    .then(data => data.filter(d => d[2] > 0))
                    // <<< 240418 hjkim - y축이 0 이상인 것만 사용
                    .then(data => {
                        var initial_stats = { 
                            min_x: [null, null, null], min_y : [null, null, null], min_z: [null, null, null],
                            max_x: [null, null, null], max_y : [null, null, null], max_z: [null, null, null],
                            M: [null, null, null],  // z == 2.6
                            "1": [null, null, null], // max_y(0~mid_idx)
                            "2": [null, null, null], // max_y(mid_idx~len)
                            "H-M": 0, "M-L": 0,
                            total: [null, null, null], mean: [null, null, null], 
                            dvtn: [0, 0, 0], sigma: [0, 0, 0], z_score: [null, null, null],
                        };
                        var mid_idx = 0;
                        let len = data.length;
                        var desc_stats = data.map((d, idx) => { if(d[0] == 2.6) mid_idx = idx; return d; })
                        .reduce((acc, xyz, idx) => {
                            // CALC MIN
                            acc.min_z = ( acc.min_z[0] == undefined || xyz[0] < acc.min_z[0] ) ? xyz : acc.min_z;
                            acc.min_x = ( acc.min_x[1] == undefined || xyz[1] < acc.min_x[1] ) ? xyz : acc.min_x;
                            acc.min_y = ( acc.min_y[2] == undefined || xyz[2] < acc.min_y[2] ) ? xyz : acc.min_y;
                            // CALC MAX
                            acc.max_z = ( acc.max_z[0] == undefined || xyz[0] > acc.max_z[0] ) ? xyz : acc.max_z;
                            acc.max_x = ( acc.max_x[1] == undefined || xyz[1] > acc.max_x[1] ) ? xyz : acc.max_x;
                            acc.max_y = ( acc.max_y[2] == undefined || xyz[2] > acc.max_y[2] ) ? xyz : acc.max_y;
                            // CALC 1,2,M
                            if(idx == mid_idx) { acc.M = xyz; // CALC M
                            } else if(idx < mid_idx) { // max_y(0 ~ mid_idx)
                                acc["1"] = ( acc["1"] == undefined || xyz[2] > acc["1"][2] ) ? xyz : acc["1"];
                            } else if(idx < len) { // max_y (mid_idx ~ len)
                                acc["2"] = ( acc["2"] == undefined || xyz[2] > acc["2"][2] ) ? xyz : acc["2"];
                            }
                            // CALC TOTAL
                            acc.total[0] = (acc.total[0] == undefined) ? xyz[0] : acc.total[0] + xyz[0];
                            acc.total[1] = (acc.total[0] == undefined) ? xyz[1] : acc.total[1] + xyz[1];
                            acc.total[2] = (acc.total[0] == undefined) ? xyz[2] : acc.total[2] + xyz[2];
                            return acc;
                        }, initial_stats);
                        // 평균계산(mean)
                        initial_stats.mean[0] = (initial_stats.total[0] / len);
                        initial_stats.mean[1] = (initial_stats.total[1] / len);
                        initial_stats.mean[2] = (initial_stats.total[2] / len);
                        // 편차 계산
                        for(var i = 0; i < len; i++) {
                            initial_stats.dvtn[0]+= Math.pow(data[i][0] - initial_stats.mean[0], 2);
                            initial_stats.dvtn[1]+= Math.pow(data[i][1] - initial_stats.mean[1], 2);
                            initial_stats.dvtn[2]+= Math.pow(data[i][2] - initial_stats.mean[2], 2);
                        }
                        // 표준편차 계산
                        initial_stats.sigma[0] = Math.sqrt(initial_stats.dvtn[0]);
                        initial_stats.sigma[1] = Math.sqrt(initial_stats.dvtn[1]);
                        initial_stats.sigma[2] = Math.sqrt(initial_stats.dvtn[2]);
                        // let knee = desc_stats.knee;
                        // desc_stats.ml = [ Math.abs(_data[0][0] - knee[0]),   Math.abs(_data[0][1] - knee[1]),   Math.abs(_data[0][2] - knee[2]) ];
                        
                        desc_stats["H-M"] = Math.abs(data[len-1][1] - data[mid_idx][1]);
                        desc_stats["M-L"] = Math.abs(data[0][1] - data[mid_idx][1]);
                        console.table(desc_stats);
                        // <<< 240418 hjkim - y축이 0 이상인 것만 사용
                        port1.postMessage( { msg: argv.data.response_msg, data: data, color: _color, compact: argv.data.compact});
                    });
                    // <<< 240417 hjkim - 그래프와 DATA의 분리
                    // port1.postMessage( { msg: "DRAW_IMPDATA", url: _url, color: _color } );
                });
            });
            // <<< 240416 hjkim - 시계열 단위의 시각화 데이터
        break;
        case "STACK_INIT":
            // >>> 스택 상태 그래프 데이터
            const normal_url = argv.data.upper_url[0];
            const recent_url = argv.data.upper_url[1];
            // 최근 데이터
            fetch(recent_url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then(arr => arr.filter(d => d.includes(".txt")))
            .then(d => {
                // DRAW_IMPDATA (=> imp.js)
                d.map(_u => {
                    var _color = "#0000CC";
                    var _url = `${recent_url}/${_u}`;
                    // >>> 240417 hjkim - 그래프와 DATA의 분리
                    fetch(_url)
                    .then(res => res.text())
                    .then(txt => {
                        var data = _parse_imp_data(txt, (arr) => {
                            arr[1] *= M_OHM;        // x: Real Imp.
                            arr[2] *= M_OHM * -1;   // y: -Imag Imp.
                        });
                        // >>> 240418 hjkim - y축이 0 이상인 것만 사용
                        var _data = data.filter(d => d[2] > 0);
                        // <<< 240418 hjkim - y축이 0 이상인 것만 사용
                        port1.postMessage( { msg: "DRAW_NYQUIST", data: _data, color: _color});
                    });
                    // <<< 240417 hjkim - 그래프와 DATA의 분리
                    // port1.postMessage( { msg: "DRAW_IMPDATA", url: _url, color: _color } );
                });
            });
            // 정상 데이터
            fetch(normal_url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then(arr => arr.filter(d => d.includes(".txt")))
            .then(d => {
                // DRAW_IMPDATA (=> imp.js)
                d.map(_u => {
                    var _color = "#00FF00";
                    var _url = `${normal_url}/${_u}`;
                    // >>> 240417 hjkim - 그래프와 DATA의 분리
                    fetch(_url)
                    .then(res => res.text())
                    .then(txt => {
                        var data = _parse_imp_data(txt, (arr) => {
                            arr[1] *= M_OHM;        // x: Real Imp.
                            arr[2] *= M_OHM * -1;   // y: -Imag Imp.
                        });
                        // >>> 240418 hjkim - y축이 0 이상인 것만 사용
                        var _data = data.filter(d => d[2] > 0);
                        // <<< 240418 hjkim - y축이 0 이상인 것만 사용
                        port1.postMessage( { msg: "DRAW_NYQUIST", data: _data, color: _color});
                    });
                    // <<< 240417 hjkim - 그래프와 DATA의 분리
                    // port1.postMessage( { msg: "DRAW_IMPDATA", url: _url, color: _color } );
                });
            });
            // <<< 스택 상태 그래프 데이터
            
            // // >>> 스택 상태 그래프 (UPLOT)
            // fetch(recent_url)
            // .then(res => res.text())
            // .then(txt => _extract_url(txt))
            // .then(arr => arr.filter(d => d.includes(".txt")))
            // .then(d => {
            //     d.map(_u => {
            //         var _color = "#0000CC";
            //         var _url = `${recent_url}/${_u}`;
            //         fetch(_url)
            //         .then(res => res.text())
            //         .then((txt:string) => txt.trim().split("\n"))
            //         .then((row:string[]) => {
            //             var x_arr = row.reduce((acc, d, i) => {
            //                 var c = d.trim().split(" ");
            //                 acc.push(c[1]);
            //                 return acc;
            //             }, []);
            //             var y_arr = row.reduce((acc, d, i) => {
            //                 var c = d.trim().split(" ");
            //                 acc.push(-c[2]);
            //                 return acc;
            //             }, []);
            //             return [null, [x_arr, y_arr]];
            //         })
            //         .then(result => {
            //             console.log("data.js / result : ", result);
            //             const _opt = { stroke: "red", fill: "rgba(255,0,0,0.1)", paths: drawPoints.toString(), };
            //             port1.postMessage({msg: "UPLOT_IMPDATA", data: result, opt: _opt});
            //         });
            //     });
            // });
            // <<< 스택 상태 그래프 (UPLOT)
        break;
        case "GET_LIST":
            const word = argv.data.word;
            // 변수 선언부
            var filter_list1_stack = {}, filter_list2_amp = {};
            // FilterList
            fetch(argv.data.url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then((arr         ) => arr.filter(d => d.includes(word)) )
            .then((arr         ) => {
                if(word == "stk") port1.postMessage( { msg: "STACK_LIST", list:arr } );
                if(word == "A")   port1.postMessage( { msg: "AMP_LIST", list:arr } );
            });
        break;
        case "HZ_DATAFETCH":
            // >>> HZ 그래프 데이터
                                                            // (1) [x-values(timestamp)] : filename
                                                            // (2) [label(__HZ)] : [y-values(900~개)]
                                                                                                                                  // (3)
                                            // (4) [ [x-values(unixtime)],[y-values(real ohm)],[...] ]
            // 변수 선언부
            var x2filename                   = {}, label2y                = {};
            var output_opt             = [], output_data              = [];
            const re = /post_d([0-9-]+)_imp_Data_.*._(stk[0-9]+)_([0-9]+A).*.txt/gi;
            // Data Fetch
            const base_url = argv.data.url;
            fetch(base_url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then((arr         ) => arr.filter(d => d.includes("_imp_Data_") && d.includes(".txt")))
            .then((arr         ) => arr.sort())
            .then((arr         ) => {
                // (1) 제작
                arr.map((filename       ) => {
                    var matches = filename.matchAll(re);
                    // >>> MATCH GROUP n
                    var match_grp1 = "";
                    for(const match of matches) { 
                        if(match[1] != undefined) match_grp1 = match[1]; 
                    }
                    // <<< MATCH GROUP n
                    var tmp = match_grp1.split("-");
                    let ymd_hm = [tmp[0], tmp[1], tmp[2]].join("-")+" "+[tmp[3], tmp[4]].join(":");
                    let ts = new Date(ymd_hm).getTime().toString();
                    let unixtime = (ts/1000).toString();
                    if(x2filename[unixtime] == undefined) x2filename[unixtime] = [];
                    x2filename[unixtime].push(filename);
                });
                return arr.map((filename       ) => {
                    // console.log("data.js / filename : ", filename);
                    return fetch(`${base_url}/${filename}`)
                    .then(res => res.text())
                    .then((txt       ) => txt.trim().split('\n'))
                    .then((row         ) => { 
                        // >>> (2) 제작
                        row.map(r => {
                            var c = r.trim().split(" ");
                            const hz = c[0];
                            const yval = Number(c[1]);
                            if(hz == "") return;
                            // >>> label2y 생성
                            if(label2y[hz] == undefined) label2y[hz] = [];
                            label2y[hz].push(yval);
                            // <<< label2y 생성
                        });
                        // <<< (2) 제작
                        return row;
                    })
                    // .then(debug => { console.log("data.js / debug : ", debug); return debug;})
                    .then((row         ) => {
                        return row.reduce((acc, d, i) => {
                            var c = d.trim().split(" ");
                            acc.push(c);
                            return acc;
                        }, []);
                    });
                });
            })
            .then((done          ) => {
                Promise.all(done)
                .then((dim_arr            /* 1058 x 60 x 3 */) => {
                    // >>> (3)제작
                    output_opt = Object.keys(label2y).reduce((acc, real_ohm, i) => {
                        acc.push({
                            show: true,
                            spanGaps: false,
                            label: Number(real_ohm).toFixed(2) + " Hz",
                            scale: "y",
                            stroke: color_palette[i],
                            width: 1,
                        });
                        return acc;
                    }, [{}]);
                    // <<< (3)제작
                    port1.postMessage( { msg: "UPDATE_DEFAULT_UPLOTOPT", uplotopt_series: output_opt });
                    // >>> (4)제작
                    // >>> xval(timestamp)
                    var x_arr = Object.keys(x2filename);
                    for(var i = 0; i < x_arr.length; i++) x_arr[i] = Number(x_arr[i]);
                    // output_data.push(x_arr);
                    // <<< xval(timestamp)

                    // >>> xval(일련번호)
                    var serial_number = [];
                    for(var i = 0; i < dim_arr.length; i++) {
                        serial_number.push(i);
                    }
                    output_data.push(serial_number);
                    // <<< xval(일련번호)

                    var labels = Object.keys(label2y);
                    for(var i = 0; i < labels.length; i++) {
                        let d = label2y[labels[i]];
                        output_data.push(d);
                    }
                    // <<< (4)제작
                    port1.postMessage( { msg: "DRAW_HZDATA", uplotdata: output_data, tooltipdata: x2filename });
                });
            });
            // <<< HZ 그래프 데이터
        break;
        case "STACK_GET":
        break;
    }
}

function channel3_handler(argv, port1) {
    // console.log("data.js / channel3_handler / argv : ", argv);
    switch(argv.data.msg) {
        case "CH3/(1)GET_DIR":
            const response = argv.data.response;
            var url = argv.data.url;
            url = url.replaceAll("//", "/");
            fetch(url)
            .then(res => res.text())
            .then(txt => _extract_url(txt))
            .then(include => include.filter((d       ) => (d.includes(".csv") && !d.includes(".gz") && !d.includes(".bak")) || /[0-9]+.*\//.exec(d)))
            .then(list => { port1.postMessage({msg: response, list: list}); });
        break;
    }
}

/* -------------------------------------------------------------------------- */
/*                             UPLOT FUNCITON SET                             */
/* -------------------------------------------------------------------------- */
const drawPoints = (u, seriesIdx, idx0, idx1) => {
    const pxRatio = 1.5;
    const size = 5 * pxRatio;
    uPlot.orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc) => {
        let d = u.data[seriesIdx];
        u.ctx.fillStyle = series.stroke();
        let deg360 = 2 * Math.PI;
        console.time("points");
        let p = new Path2D();

        for (let i = 0; i < d[0].length; i++) {
            let xVal = d[0][i];
            let yVal = d[1][i];

            if (xVal >= scaleX.min && xVal <= scaleX.max && yVal >= scaleY.min && yVal <= scaleY.max) {
                let cx = valToPosX(xVal, scaleX, xDim, xOff);
                let cy = valToPosY(yVal, scaleY, yDim, yOff);

                p.moveTo(cx + size/2, cy);
                arc(p, cx, cy, size/2, 0, deg360);
            }
        }
        console.timeEnd("points");
        u.ctx.fill(p);
    });
    return null;
};

/* -------------------------------------------------------------------------- */
/*                              UTIL FUNCTION SET                             */
/* -------------------------------------------------------------------------- */

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

function _extract_url(txt        ) {
    var r = [];
    var re = /<a href="(.+)">(.+)<\/a>/g;
    var matches = txt.matchAll(re);
    for(const match of matches) {
        // if(match[1] != undefined) r.push(match[1]);
        if(match[2] != undefined) r.push(match[2]);
    }
    return r;
}

function _parse_imp_data(d, cb) {
    var r = [];
    var arr = d.split("\n");
    for (var i = 0; i < arr.length; i++) {
        var arr_arr = [];
        arr_arr = arr[i].split(" ");
        
        var z = Number(arr_arr[0]);
        var x = Number(arr_arr[1]);
        var y = Number(arr_arr[2]);
        var arr_arr_n = [z, x, y];
        
        cb(arr_arr_n);
        r.push(arr_arr_n);
    }
    return r;
}

function fetch_node_info(url       , lv       , map      , _signal            )           {
    // console.log("data.js / fetch_node_info:", url);
    return fetch(url, { signal: signal2 })
    .then(res => res.text())
    .then(txt => _extract_url(txt))
    // .then(include => include.filter((d:string) => (d.includes(".csv") && !d.includes(".gz")) || /[0-9]+\//.exec(d)))
    // .then(d => {console.log("data.js / before:", d); return d; })
    .then(include => {
        // console.log("data.js / url :", url);
        if(url == "/ALL/data" || url == "/ALL/data/") 
            return include.filter((d       ) => /^[0-9]{4}\//.exec(d) );
        else 
            return include.filter((d       ) => (d.includes(".csv") && !d.includes(".gz")) || /[0-9]+.*\//.exec(d));
    })
    // .then(d => {console.log("data.js / after:", d); return d; })
    // .then(exclude => exclude.filter((d:string) => (d != "Buan" || d != "Daejeon" || !d!= "impedance" || d != "raw")))
    // .then(d => {console.log("data.js / after :", d); return d; })
    .then(postfix_list => postfix_list.map(postfix => { 
        if(map[url] == undefined) map[url] = [];
        map[url].push(postfix); 
        return `${url}/${postfix}`; 
    }) )
    // .then(d => {console.log("data.js / after2 :", d); return d; })
    .then(declutter_list => declutter_list.map(d => d.replaceAll("//", "/")))
    // .then(d => {console.log("data.js / after3 :", d); return d; })
}

/* -------------------------------------------------------------------------- */
/*                          BOP_BARDATA FUNCTION SET                          */
/* -------------------------------------------------------------------------- */
function fn_get_group(n) {
    if(n == 0) return 1;
    else if(1 <= n && n < 6) return 2;
    else if(6 <= n && n < 9) return 3;
    else if(9 <= n && n < 15) return 4;
    else return 5;
}

/* -------------------------------------------------------------------------- */
/*                         BOP_DATA_FETCH FUNCTION SET                        */
/* -------------------------------------------------------------------------- */
var fn_parse_mapped_json_to_flotdata = (json                 ) => {
    // console.log("data.js / json : ", json);
    var flotdata              = [];
    var header = Object.keys(json[0]);
    var prev_t        = 0;
    // >>> 컬럼 순회
    for (var i = 2; i < header.length; i += 1) {
        var k = header[i];
        // series : { label : "sth", data : [ [x,y], ...]}
        // series : { label : "sth", data : [ [x,y], ...], yaxis: 2}
        // series : { label : "sth", data : [ [x,y], ...], yaxis: 2, color: "#EFEFEF" }
        var series             = { label: "sth", data: [], color: "#ebebeb" };
        let _color = color_palette[i];
        if (k.includes("kPa")) series = { label: k, data: [], color: _color, yaxis: 2 };
        else series = { label: k, data: [], color: _color };
        
        // >>> 행 순회
        for (var j = 0; j < json.length; j += 1) {
            var t;
            let _hms = json[j]["Time"].split("-").join(":");
            let _ymd_hms = json[j]["Date"]+" "+_hms;
            let _ts = new Date(_ymd_hms).getTime();
            series.data.push([_ts, json[j][k]]);
        }
        // <<< 행 순회

        flotdata.push(series);
    }
    // <<< 컬럼 순회
    return flotdata;
}


var fn_parse_csv_into_mapped_json = (txt        ) => {
    var header_name          ;
    var col          ;
    return txt.trim().split("\r\n")
    .map((row, i) => {
        var kv                     = {};
        col = row.split(",");
        if(i == 0) { header_name = col; }
        if(i != 0) { 
            col.map((c, j) => kv[header_name[j]] = c); 
        }
        // console.log("data.js / kv : ", kv);
        return kv;
    })
    .reduce((acc, d, i) => {
        if(i == 0) { return acc; }
        else { acc.push(d); return acc; }
    }, []);
}

/* -------------------------------------------------------------------------- */
/*                           DASHBOARD FUNCTION SET                           */
/* -------------------------------------------------------------------------- */

function dfs_with_backtracking(url       , path       , lv       , cb_done          ) {
    // console.log("data.js / url: ", url);
    lv++;
    path.history.push(url); // 방문한 노드 표시
    return fetch_node_info(url, lv, path.map, signal) // 현재 노드 정보를 비동기적으로 가져옴
    .then((url_list) => {
        url_list = url_list.sort().reverse();
        path.map_full[url] = url_list;
        // console.log("data.js / Node:", url_list, "Lv:", lv);
        if(url_list == null) return "취소";
        for(var i = url_list.length-1; 0 <= i; i--) {
            if(`${url_list[i]}`.includes(".csv") == true) { // 종료 조건
                if(abort_once1) { 
                    abort_once1 = false; 
                    setTimeout(() => { controller.abort(); }, 1); 
                }
                // console.log(`data.js / TODO: ${url_list[i]}로 그래프 로딩 할 것.`, path);
                cb_done(url_list[i], path);
                return "그래프 로딩"; 
            }
            dfs_with_backtracking(url_list[i], path, lv, cb_done);
        }
    })
    .catch(err => {
        if(err.name == "AbortError") { console.log(`${url}의 fetch를 취소했습니다.`); }
        else { console.error('Fetch 오류:', err); }
    });
}

/* -------------------------------------------------------------------------- */
/*                              BOP FUNCTION SET                              */
/* -------------------------------------------------------------------------- */
const YEARLY_TIMESLOT = 1000;
const MONTHLY_TIMESLOT = 12/YEARLY_TIMESLOT;
const DAILY_TIMESLOT = 31/MONTHLY_TIMESLOT;
const RTT = 1000;
function dfs_with_backtracking___bop(url       , path       , lv       , cb_done          ) {
    console.log("data.js / url: ", url);
    lv++;
    path.history.push(url); // 방문한 노드 표시
    return fetch_node_info(url, lv, path.map, signal2) // 현재 노드 정보를 비동기적으로 가져옴
    .then((url_list         ) => {
        url_list = url_list.sort().reverse();
        // console.log("data.js / url_list(sorted) : ", url_list);
        var i = 0;
        url_list.map((_url) => {
            // console.log("data.js / _url : ", _url);
            // 종료 조건1: .csv 파일인가?
            if( _url.includes(".csv") == true ) {
                const _controller = new AbortController();
                const _signal = _controller.signal;
                fetch( _url, { signal: _signal } )
                .then( res => res.body.getReader().read() ) // 스트림리더
                .then( read => {
                    const header = new TextDecoder().decode(read.value).split('\n')[0];
                    _controller.abort(); // 첫째줄만 읽고 중지!!!
                    if(header.includes("R_")) { // 종료조건2 : 컬렴명에 'R_'가 있는가?
                        // console.log("data.js / R_이 있는 url: ", {header : header, url : _url});
                        controller2.abort(); // fetch 일괄취소
                        cb_done(_url, path);
                        return "그래프 로딩"; 
                    } else {
                        // console.log("data.js / R_이 없는 url: ", {header : header, url : _url});
                    }
                    return header;
                 }); // 첫째줄(컬럼헤더)
            }
            // >>> TIME SLICE SORTING
            var priority = 0;
            const YEARLY_TIMESLOT   = 365;
            const MONTHLY_TIMESLOT  = (YEARLY_TIMESLOT/12);
            const DAILY_TIMESLOT    = (MONTHLY_TIMESLOT/30);
            if(lv == 1)         /* yearly */        priority = i * YEARLY_TIMESLOT;
            else if(lv == 2)    /* monthly (0~12) */priority = i * MONTHLY_TIMESLOT;
            else if(lv == 3)    /* daily (0~31) */  priority = i * DAILY_TIMESLOT;
            else                /* .csv */          priority = i;
            // console.log("data.js / priority : ", priority);
            setTimeout(() => { dfs_with_backtracking___bop(_url, path, lv, cb_done); }, priority);
            i++;
            // >>> TIME SLICE SORTING
        });
    })
    .catch(err => {
        if(err.name == "AbortError") { console.log(`${url}의 fetch를 취소했습니다.`); }
        else { console.error('Fetch 오류:', err); }
    });
}

// signal2.addEventListener('abort', () => {
//     console.log('data.js / signal2 Aborted? ', signal2.aborted);
// });

/* -------------------------------------------------------------------------- */
/*                              COLOR PALETTE SET                             */
/* -------------------------------------------------------------------------- */
var color_palette = ["#3ca7b9", "#388d9e", "#347483", "#305766", "#be4643", "#d35f47", "#e67549", "#e58e52", "#e3a65c", "#b0bc83", "#1395ba", "#117899", "#0f5b78", "#0d3c55", "#c02e1d", "#d94e1f", "#f16c20", "#ef8b2c", "#ecaa38", "#a2b86c", "#00cef1", "#00b0d2", "#008fb3", "#006b92", "#ff0600", "#ff3f17", "#ff682e", "#ff8837", "#ffa83e", "#cceb51", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666", "#88C3FF", "#4471A5", "#A84542", "#87A34D", "#D9823C", "#70578D", "#EACC00", "#91A7CD", "#76616A", "#337687", "#B04871", "#B46D3D", "#339999", "#CC9900", "#5B1A51", "#E76B08", "#2B5556", "#4677CD", "#3B2A31", "#243444", "#6085B0", "#B3615F", "#97AE67", "#DB935A", "#846F9C", "#E8CD29", "#A2B4D2", "#88777F", "#528896", "#B96485", "#BB815A", "#52A5A5", "#CEA328", "#703B67", "#E57F2E", "#4A6C6D", "#638BD1", "#55484E", "#8AB9C5", "#42505D", "#666666"];