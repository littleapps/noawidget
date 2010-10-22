
/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::
:::
:::
:::     Now On Air for Dashboard 1.2.1 :::
:::
:::     code + design ::: atsushi nagase ::: http://ngsdev.org/
:::     Copyright 2005-2010 atsushi nagase. All rights  reserved.
:::
:::
:::
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-200187-20']);
_gaq.push(['_setDomainName', 'none']);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_trackPageview', '/load']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var xmlloc = "http://www.j-wave.co.jp/top/xml/now_on_air_song.xml";
var cdloc = "http://ax.search.itunes.apple.com/WebObjects/MZSearch.woa/wa/search?entity=album&restrict=true&submit=seeAllLockups&term=";
var affConvert = "http://feed.linksynergy.com/createcustomlink.shtml?token=fafab0b82dd76fc58c5bf929a42147961f871c911297c98217949be9b68b123f&mid=13894&murl=";
var cdURL;
var query;
var statusDiv;
var noaDiv;
var interval_engine;
var interval;
var flip
var flip2
var interval_array = [0,0.1,0.5,1,1.5,2,5,10];
var reloadButton;
var _backmode = false;
function setup() {
    if (setup.called) return;
    setup.called = true;
    CreateGlassButton('doneButton', { text: '完了' });
    flip2 = new Flip("flip2","fliprollie2");
    flip = new Flip("flip","fliprollie");
    if (window.widget) {
        widget.onhide = onhide;
        widget.onshow = onshow;
        interval = parseInt(widget.preferenceForKey("interval"));
    }
    if(isNaN(interval)) changeInterval(1);
    getNoa();
}

function onshow() {
    activeInterval()
    getNoa()
}

function activeInterval() {
    removeInterval()
    if(interval) interval_engine = setInterval("getNoa();", interval);
}

function showFlips() {
    flip2.button.style.backgroundImage = "url(images/rotate.png)";
    flip.show()
    flip2.show()
}

function hideFlips() {
    flip.hide()
    flip2.hide()
}

function removeInterval() {
    clearInterval(interval_engine);
    delete interval_engine;
}

function onhide() {
    removeInterval()
}

function doRequest(url,callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(xhttp.readyState == 4){
            flip2.button.style.backgroundImage = "url(images/rotate.gif)";
            if(! flip2.isOver()) flip2.opacityTo(0)
            if(xhttp.responseText) {
                callback.apply(xhttp,[xhttp.responseText]);
            }
        }
    }    
    xhttp.setRequestHeader('Content-Type', 'text/xml;charset=utf-8');
    xhttp.open('GET',url,true)
    xhttp.send(null);
}

function getNoa() {
    noaDiv = document.getElementById("noa");
    flip2.setOpacity(100)
    var rnd = Math.ceil(Math.random()*100000);
    doRequest(xmlloc+"?rnd="+rnd,function(){
        showStatus();
        changeNoa(this.responseXML);
    });
}
var song, artist;
function changeNoa(param) {
    var fc = param.firstChild.childNodes
    var len = fc.length
    for(var i=0;i<len;i++) {
        if(fc[i].nodeName=="data") {
            var info = fc[i].getAttribute("information");
            var lar = fc[i].getAttribute("cd_url").split("?noa=");
            //cdloc = lar[0];
            var info_ar = info.split("」")
            song = info_ar[0].split("「").join('');
            song = song.replace(/[（\(]live[）|\)]/ig,"")
            artist = info_ar[1]
            noaDiv.innerHTML = "<div id=\"song\">"+song+"</div>";
            noaDiv.innerHTML += "<div id=\"artist\">"+artist+ "</div>";
            query = song+" "+artist.replace(/(:?\s*)(\d{1,2}\:\d{1,2})(:?\s*)/,"");
            doRequest(affConvert+encodeURI(cdloc+encodeURIComponent(query)),function(res) {
                res = (res||"").replace(/[\s\n\r]/g);
                if(!res) return;
                res = res.replace(/^([^\?]+)\?([^\?]+)\?(.*)$/,"$1?$2&$3");
                cdURL = res;
            });
            break;
        }
    }
    _gaq.push(['_trackPageview', '/'+artist+'/'+song]);
}
function showStatus(param) {
    if(!param) param = "";
    statusDiv = document.getElementById("status");
    statusDiv.innerHTML = param;
}
function getCD() {
    _gaq.push(['_trackPageview', '/getCD/'+query]);
    _gaq.push(['_trackEvent', 'getCD', query]);
    if(!flip.isOver()&&!flip2.isOver()&&!_backmode) {
        if (window.widget) widget.openURL(cdURL);
        else window.location.href = cdURL;
    }
}

function changeInterval(t) {
    t = interval_array[t];
    t*=60000;
    if(t) {
        activeInterval()
    } else {
        t = 0;
        removeInterval()
    }
    interval = t;
    if(window.widget) widget.setPreferenceForKey(t,"interval");
}

function attachSelect() {
    var sel = document.getElementById("selectInterval");
    var len = interval_array.length;
    if(window.widget) interval = parseInt(widget.preferenceForKey("interval"));
    for(var i=0; i<len; i++) {
        var opt = document.createElement("option");
        opt.value = i.toString();
        opt.selected = interval_array[i]*60000 == interval;
        var m = Math.floor(interval_array[i]);
        var s = interval_array[i] - m
        if(s>0) s*=60;
        var t = "";
        if(m) t+= m.toString()+"分";
        if(s) t+= s.toString()+"秒";
        if(!t) t= "しない";
        var tx = document.createTextNode(t)
        opt.appendChild(tx)
        sel.appendChild(opt)
    }
}

function removeSelect() {
    document.getElementById("selectInterval").innerHTML = "";
}


/*------------------------------------------------------------------------

functions from

[ Dashboard Programming Guide: Displaying a Reverse Side ]
http://developer.apple.com/ja/documentation/AppleApplications/Conceptual/Dashboard_Tutorial/Preferences/chapter_5_section_3.html

------------------------------------------------------------------------*/
function showBack()
{
    _backmode = true;
    attachSelect();
    var front = document.getElementById("front");
    var back = document.getElementById("back");
    if (window.widget) widget.prepareForTransition("ToBack");
    front.style.display="none";
    back.style.display="block";
    if (window.widget) setTimeout ('widget.performTransition();', 0);  
    _gaq.push(['_trackPageview', '/back']);
}


function hideBack()
{
    _backmode = false;
    changeInterval(document.getElementById("selectInterval").value);
    flip.out(event);
    flip2.out(event);
    removeSelect();
    activeInterval()
    var front = document.getElementById("front");
    var back = document.getElementById("back");
    if (window.widget) widget.prepareForTransition("ToFront");
    back.style.display="none";
    front.style.display="block";
    if (window.widget) setTimeout ('widget.performTransition();', 0);
    _gaq.push(['_trackPageview', '/front']);
}


/*------------------------------------------------------------------------*/

window.addEventListener('load', setup, false);
window.addEventListener('mousedown', getCD, false);
