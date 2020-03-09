/*
hjälpfunktioner till azure table storage.
Delete finns inte. Använd istället en kolumn som är en flagga och betyder disabled. fördelar. 1, mindre kod, 2, undviker att radera av misstag.

//så här kan ett globalt object se ut i en användande modul.
//sig sätts vid inloggning
var globalObject8562 = { 
    "tableInfo" : {
        "url": "https://gnaget.table.core.windows.net/wiki",
        "query" : "sv=2018-03-28&ss=bfqt&srt=sco&sp=rwdlacup&se=2030-06-29T04:18:05Z&st=2019-05-26T20:18:05Z&spr=https",
        "sig" : ""
    },
    "public-sig" : "groQL7Yts7ydErhC5ir3YCSjqCec1RBq4JySXbLRv0r%3D" 
};

gör exempel på hur funktionerna används

sammanfatta eller länka till vad man gör på azure-ändan.

*/ 
//
function getItem(guid, dbgid, table, signature, processJSON) {
    jQuery(function($) {
        $.support.cors = true;
        $.ajax({
            url: table.url + "(PartitionKey='',RowKey='" + 
                encodeURIComponent(guid) + "')?" + table.query + "&sig=" + 
                signature,
            type: 'GET',
            success: function (data) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("success:" + JSON.stringify(data));
                }
                processJSON(data);
            },
            beforeSend: function (xhr) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("beforeSend ");
                }
                xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
            },
            error: function (data) {
                $(dbgid).append("error:" + JSON.stringify(data));
                console.log(JSON.stringify(data));
            }
        });
    });
}

function upsert(item, dbgid, guid, table, signature, next) {
    jQuery(function($) {
        $.support.cors = true;
        guid = guid || uuidv4();
        $.ajax({
            url: table.url + "(PartitionKey='',RowKey='" + 
                encodeURIComponent(guid) + "')?" + table.query + "&sig=" + 
                signature,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(item),
            success: function (data) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("success ");
                }
                next(encodeURIComponent(guid));
            },
            beforeSend: function (xhr) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("before send ");
                }
                xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
            },
            error: function (data) {
                console.log("error:" + JSON.stringify(data));
                $(dbgid).append("error:" + JSON.stringify(data));
            }
        });
    });
};//getJSON

function getList(filter, dbgid, table, signature, processJSON) {
    jQuery(function($) {
        $.support.cors = true;
        $.ajax({
            url: table.url + "()?" + (filter ? filter + "&" : "") +
                table.query + "&sig=" + 
                signature,
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("success:" + JSON.stringify(data));
                }
                processJSON(data.value);
            },
            beforeSend: function (xhr) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("before send ");
                }
                xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
            },
            error: function (data) {
                $(dbgid).append("error:" + JSON.stringify(data));
                console.log(JSON.stringify(data));
            }
        });
    });
};//getList

function search(body, dbgid, url, apiKey, processJSON) {
    jQuery(function($) {
        $.support.cors = true;
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(body),
            success: function (data) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("success:" + JSON.stringify(data));
                }
                processJSON(data.value);
            },
            beforeSend: function (xhr) {
                if (typeof glblDEBUG !== 'undefined' && glblDEBUG) {
                    console.log("before send ");
                }
                xhr.setRequestHeader('Accept', 'application/json');//;odata=nometadata
                xhr.setRequestHeader('api-key', apiKey);//
            },
            error: function (data) {
                $(dbgid).append("error:" + JSON.stringify(data));
                console.log(JSON.stringify(data));
            }
        });
    });
};
