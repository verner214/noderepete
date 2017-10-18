function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function last4(str) {
    return (str.substring(str.length - 4, str.length));
}
function getJSON(filter, processJSON, progress) {
    $.support.cors = true;
    //signaturdelen (st=2015 fram till slutet) är skapat mha att gå till adressen /sas. koden finns i server.js.
    //jQuery.support.cors = true;
    $.ajax({//tableSAS:st=2015-03-29T18%3A35%3A25Z&se=2015-04-05T18%3A55%3A25Z&sp=r&sv=2014-02-14&tn=photos&sig=7t9DkALrw9QLsG4B%2BPUFodyDJHFCpvbwZsEfYoSuHpI%3D
        url: "https://portalvhdsgfh152bhy290k.table.core.windows.net/tblrepete?" + filter + 
        "st=2017-02-08T20%3A34%3A21Z&se=2036-02-14T08%3A54%3A21Z&sp=r&sv=2014-02-14&tn=tblrepete&sig=HMFUBRLCbQbegxPB3X%2FC5O2%2FbbKe2P%2Fp9GNShPvIRvw%3D",
        type: 'GET',
        success: function (data) {
            if (progress) {
                progress("success");
            }
            processJSON(data);
        },
        beforeSend: function (xhr) {
            if (progress) {
                progress("beforeSend");
            }
            xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
        },
        error: function (rcvData) {
            alert(JSON.stringify(rcvData));
            console.log(rcvData);
        }
    });
};//getJSON
//returnerar index i arrayen av det element som har minst order dock högre än val
function getLowest(arr, val, startindex) {
    var lowest = 9999999;
    var index = -1;
    for (var r = startindex; r < arr.length; r++) {
        if (arr[r].order !== undefined && arr[r].order.length !== 0 && parseInt(arr[r].order) < lowest && parseInt(arr[r].order) >= val) {
            lowest = parseInt(arr[r].order);
            index = r;            
        }
    }
    return index;
}

//returnerar en array med "pekare" ordningen i arr
function orderArray(arr) {
    var orderArr = [];
    var low = getLowest(arr, 0, 0);
    while (low !== -1) {
        orderArr.push(low);
        var low2 = getLowest(arr, parseInt(arr[low].order), low + 1);
        if (low2 !== -1 && parseInt(arr[low].order) === parseInt(arr[low2].order)) {
            orderArr.push(low2);
        }
        low = getLowest(arr, parseInt(arr[low].order) + 1, 0);
    }
    //lägg alla items som inte har order satt till nummer sist.
    for (var r = 0; r < arr.length; r++) {
        if (arr[r].order === undefined || arr[r].order.length === 0 ) {
            orderArr.push(r);
        }
    }
    return orderArr;
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

