/*
util.js - blandade funktioner som ska kunna användas i andra applikationer.
 */
/* cryptofunctions. START ************************************************************  
key får innehålla vissa tecken, se nedan. 
detta är sant: key är samma som decryptKey(encryptKey(key, pwd), pwd);
*/
//'a' - 97 - 122. 
//'A' - 65 - 90
//'0' - 48 - 57
// L = lösen
// K = key
function encChar(base, mod, L, K) {
//    return (mod - (L-base) % mod + K % mod) % mod + base;
    return ((K - base) + mod - L % mod) % mod + base;
}
function decChar(base, mod, L, E) {
    //    return (mod - (L-base) % mod + K % mod) % mod + base;
    return ((E - base) + L % mod) % mod + base;
}

function encryptKey(key, pwd) {
    var elong = "";
    for (var i = 0; i < key.length-3; i++) {
        var c = key.charCodeAt(i);
        if (c >= 48 && c <= 57) {
            var e = encChar(48, 10, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else if (c >= 65 && c <= 90) {
            var e = encChar(65, 26, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else if (c >= 97 && c <= 122) {
            var e = encChar(97, 26, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else {
            elong = elong.concat(String.fromCharCode(c));
        }
    }
    elong = elong.concat(key.substring(key.length - 3));
    return elong;
} 

function decryptKey(key, pwd) {
    var elong = "";
    for (var i = 0; i < key.length - 3; i++) {
        var c = key.charCodeAt(i);
        if (c >= 48 && c <= 57) {
            var e = decChar(48, 10, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else if (c >= 65 && c <= 90) {
            var e = decChar(65, 26, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else if (c >= 97 && c <= 122) {
            var e = decChar(97, 26, pwd.charCodeAt( i % pwd.length), c);
            elong = elong.concat(String.fromCharCode(e));
        }
        else {
            elong = elong.concat(String.fromCharCode(c));
        }
    }
    elong = elong.concat(key.substring(key.length - 3));
    return elong;
} 
/* cryptofunctions. SLUT ************************************************************/  

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

//returnerar värdet på en queryparameter i URL
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//function som skapar en GUID
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

//longlived === true ? expire om 1år : session
function createCookie(name, value, longlived) {
    var expires = "";
    if (longlived) {
        var date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
}

//hämtar värdet på en cookie
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
