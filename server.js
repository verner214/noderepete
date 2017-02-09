//lognew finns i olapp, använd den istället
/* node server.js
  webbserver som till�ter uppladdning av filer till azure storage för olapp
  dessa environment variabler m�ste s�ttas innan servern startas:
set AZURE_STORAGE_ACCOUNT=portalvhdsgfh152bhy290k
set AZURE_STORAGE_ACCESS_KEY=[key from azure] ---se appsettings.bat, checkas inte in i git
  
obs! env.PORT används också

obs! bra l�nk som �r r�tt och inte fel!, http://azure.microsoft.com/sv-se/develop/nodejs/
obs! om hur man laddar upp och skapar fil innan, http://stackoverflow.com/questions/18317904/stream-uploaded-file-to-azure-blob-storage-with-node
ocks� en l�nk som har r�tt information, http://azure.microsoft.com/sv-se/documentation/articles/storage-nodejs-how-to-use-table-storage/
*/
var express = require("express");
var azure = require("azure-storage");
var bodyParser = require('body-parser'); //connects bodyParsing middleware
var formidable = require('formidable');
var path = require('path');     //used for file path
var fs = require('fs-extra');    //File System-needed for renaming file etc
var uuid = require('node-uuid');
var async = require("async");

var app = express();
var AZURE_CONTAINER = "cntolapp";
var AZURE_TABLE = "tblrepete";
var AZURE_STORAGE_ACCOUNT = "portalvhdsgfh152bhy290k";
var AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
var hostName = "https://" + AZURE_STORAGE_ACCOUNT + ".blob.core.windows.net";
var partitionKey = "photos";

//s� h�r ska det se ut numer. det bortkommenterade �r gammalt.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(bodyParser({ defer: true }));

var uploadDir = "upload";

//statiska html-filer ligger i public/
app.use(express.static(path.join(__dirname, 'public')));
console.log("public=" + path.join(__dirname, 'public'));

//sparar images om det finns, params = fields.id, imgtype, files.image
//image skickas alltid från app och mergeas alltid.
app.post('/image', function(req, res, next) {
    var form = new formidable.IncomingForm();
    console.log("post image, enter1");
    form.uploadDir = uploadDir;       //set upload directory, Formidable uploads to operating systems tmp dir by default
    console.log("post image, enter2");
    form.keepExtensions = true;     //keep file extension
    console.log("post image, enter3");

    form.parse(req, function(err, fields, files) {
        console.log("form.parse");
        var blobService = azure.createBlobService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
        var filePath = files.image.path;
        console.log("filePath = " + filePath);

//sparar en BLOB som ligger p� disk. callback(err, url) meddelas urlen som bloben fick.
        blobService.createBlockBlobFromLocalFile(AZURE_CONTAINER, filePath, filePath, function (err, result) {
            console.log("blobService.createBlockBlobFromLocalFile");
            if (err) throw err;
            console.log('fil SPARAD till BLOB, fil=' + filePath);
            var imgUrl = blobService.getUrl(AZURE_CONTAINER, filePath, null, hostName);

            var tableSvc = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
            tableSvc.createTableIfNotExists(AZURE_TABLE, function (err, result, response) {
                if (err) throw err;
                var entGen = azure.TableUtilities.entityGenerator;
                var task = {
                    PartitionKey: entGen.String(partitionKey),//obligatorisk
                    RowKey: entGen.String(fields.id),//obligatorisk
                };
//spara antingen question eller answer image
                if (fields.imgtype === "question") {
                    task.questionimg = entGen.String(imgUrl); 
                }
                else if (fields.imgtype === "answer") {
                    task.answerimg = entGen.String(imgUrl); 
                }

                tableSvc.mergeEntity(AZURE_TABLE, task, function (err, result, response) {
                    if (err) throw err;
                    console.log("mergeEntity");
                    res.send('OK');
                });
                fs.unlink(filePath, function (err) {
                    if (err) throw err;
                    console.log('fil RADERAD efter sparad till BLOB, fil=' + filePath);
                });
            });//tableSvc.createTableIfNotExists
        });//blobService
    });//form.parse;
});//post /images


//gör både new och edit
app.post('/newedit', function (req, res, next) {
    console.log("newedit, enter");
    var form = new formidable.IncomingForm();
    console.log("newedit, enter2");
    form.uploadDir = uploadDir;       //set upload directory, Formidable uploads to operating systems tmp dir by default
    console.log("newedit, enter3");
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {

//debug
        console.log("newedit, id = "  + fields.id);
        
        var bNew = fields.id === null || fields.id === undefined || fields.id === ""; 
        var rowId = bNew ? String(uuid()) : fields.id;

//nytt: spara ev. bilder till blob, hantera skapade urler
        var tableSvc = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
        tableSvc.createTableIfNotExists(AZURE_TABLE, function (err, result, response) {
            if (err) throw err;
            var entGen = azure.TableUtilities.entityGenerator;
            var task = {
                PartitionKey: entGen.String(partitionKey),//obligatorisk
                RowKey: entGen.String(rowId),//obligatorisk
                area1: entGen.String(fields.area1),
                area2: entGen.String(fields.area2),
                question: entGen.String(fields.question),
                answer: entGen.String(fields.answer),
                comments: entGen.String(fields.comments),
                showlevel: entGen.String(fields.showlevel),
                hide: entGen.String((fields.hide === null || fields.hide === undefined) ? "" : "on")
            };
            if (bNew) {
                tableSvc.insertEntity(AZURE_TABLE, task, function (err, result, response) {
                    if (err) throw err;
                    console.log("insert");
                    var fullUrl = req.protocol + '://' + req.get('host');
                    res.redirect(fullUrl + "/new.html?area1=" + fields.area1 + "&area2=" + fields.area2);
                    //res.send('OK');
                });
            } else {
                tableSvc.mergeEntity(AZURE_TABLE, task, function (err, result, response) {
                    if (err) throw err;
                    console.log("update");
                    //efter post, visa list.html   
                    if (fields.area1) {//appen skickar inte area1
                        var fullUrl = req.protocol + '://' + req.get('host');
                        res.redirect(fullUrl + "/list.html?area1=" + fields.area1 + "&area2=" + fields.area2);
                    }
                    else {
                        res.send('OK');
                    }
                });
            }//else
        });//tableSvc.createTableIfNotExists
    });//form.parse
});//app.post('/newedit'

app.get('/sas', function (req, res) {
	var startDate = new Date();
	var expiryDate = new Date();//Code klagar, NYTT:testa att skriva om denna rad efter test att det fungerar som det är
	expiryDate.setMinutes(startDate.getMinutes() + 10000000);//obs! öka gärna en nolla här!
	startDate.setMinutes(startDate.getMinutes() - 100);

	var sharedAccessPolicy = {
		AccessPolicy: {
			Permissions: azure.TableUtilities.SharedAccessPermissions.QUERY,
			Start: startDate,
			Expiry: expiryDate
		},
	};
	var tableSvc = azure.createTableService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);
	var tableSAS = tableSvc.generateSharedAccessSignature(AZURE_TABLE, sharedAccessPolicy);
	var html = "<b>SAS</b>" + tableSAS + "<br>" + "<b>host</b><br>" + JSON.stringify(tableSvc.host) + "<br>";
	res.send(html);
	//https://portalvhdsgfh152bhy290k.table.core.windows.net/photos?st=2015-03-28T20%3A41%3A10Z&se=2015-03-29T00%3A01%3A10Z&sp=r&sv=2014-02-14&tn=photos&sig=yf8MoYRO8kAO4NF89krvZDLjLycVgOBHA%2FC%2FCIc0vV0%3D
});

app.listen(process.env.PORT || 1337);
//app.listen(8080);
