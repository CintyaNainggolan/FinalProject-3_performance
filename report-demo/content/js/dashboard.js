/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.70370370370371, "KoPercent": 1.2962962962962963};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8231481481481482, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9833333333333333, 500, 1500, "PATCH User"], "isController": false}, {"data": [0.9944444444444445, 500, 1500, "GET Contact List"], "isController": false}, {"data": [0.49166666666666664, 500, 1500, "POST Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 540, 7, 1.2962962962962963, 614.5759259259254, 261, 1867, 364.5, 1174.0, 1212.0, 1346.2100000000005, 8.777918657953771, 9.125108073043663, 3.7803341095289182], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["PATCH User", 180, 3, 1.6666666666666667, 366.5444444444444, 298, 785, 355.5, 417.0, 434.0, 571.1599999999994, 2.9985507004947607, 2.5356884797347945, 1.4846339894051208], "isController": false}, {"data": ["GET Contact List", 180, 1, 0.5555555555555556, 307.65000000000015, 261, 814, 294.0, 362.6, 384.4499999999999, 507.81999999999914, 3.0016509079994, 3.1187726166058, 1.055267897343539], "isController": false}, {"data": ["POST Login", 180, 3, 1.6666666666666667, 1169.533333333333, 1068, 1867, 1154.5, 1226.9, 1278.6999999999998, 1827.31, 2.9600394671928956, 3.6526906296250616, 1.3181425752343363], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,867 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 814 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 785 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["401/Unauthorized", 1, 14.285714285714286, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 1,818 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 14.285714285714286, 0.18518518518518517], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 540, 7, "The operation lasted too long: It took 1,867 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 814 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 785 milliseconds, but should not have lasted longer than 500 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["PATCH User", 180, 3, "The operation lasted too long: It took 516 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 521 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "The operation lasted too long: It took 785 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["GET Contact List", 180, 1, "The operation lasted too long: It took 814 milliseconds, but should not have lasted longer than 500 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST Login", 180, 3, "The operation lasted too long: It took 1,867 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "401/Unauthorized", 1, "The operation lasted too long: It took 1,818 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
