edit.html ------------------------------------------------------------
hämtar data (en post) direkt från storage-tabelllen, nycklar är rowkey, partitionkey
ett formulär ifylls med hämtat data. action är /edit
/edit används inte av appen utan bara här. 
2d0? ändra action till /newedit. /edit är ju redundant.

index.html -------------------------------------------------------------
startsida. länkar till alla sidor som är användbara utan kontext.

list.html -------------------------------------------------------------
ajaxanrop görs vid onReady. man väljer area1 och valfritt area2 sen hämtas lista med rader med data från tabellen samt en länk till edit.html

new.html ---------------------------------------------------------------
enkel form som skapar en ny rad i listan. action = /new

server.js --------------------------------


###############################################################################
2d0 ---------------------------------------------------------------------------
(kanske):komma på ett sätt att använda sajten på virtuell maskin, typ ersätta azure med dummymodul (dependency injection). 
