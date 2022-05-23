const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const port = 3000;
const server = http.createServer();
const {CLIENT_ID, CLIENT_SECRET} = require("./auth.json");
const { parse } = require("path");
const REDIRECT_URI = "http://localhost:3000/calllback"; 
const all_sessions = [];

server.on("listening", listen_handler);
server.listen(port);
function listen_handler(){
    console.log(`Now Listening on Port ${port}`);
}

server.on("request", request_handler);
function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === "/"){
        const form = fs.createReadStream("html/index.html");
		res.writeHead(200, {"Content-Type": "text/html"})
		form.pipe(res);
    }

	else if (req.url.startsWith("/test")){
		getCivilizationData(4, res);
	}
	else if (req.url.startsWith("/get_civilization")){
		const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;
		const id = user_input.get('id');
		all_sessions.push({id});
		const state = crypto.randomBytes(20).toString("hex");

		redirect(state, res);
		let payload = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify`;
            console.log(payload);
            res.writeHead(302, {'Location': payload + req.url});
            res.end();
	}

	else if (req.url.includes("/autherize")){
		res.end("test");
		//  // extract auth response
        //     const queryObject = url.parse(req.url, true).query;
        //     const _code = queryObject.code;
        //     // build token check params
        //     const params = new URLSearchParams({
        //         client_id: CLIENT_ID,
        //         client_secret: CLIENT_SECRET,
        //         code: _code,
        //         grant_type: 'authorization_code',
        //         redirect_uri: REDIRECT_URI
        //     });
		// 	try {
        //         // check token if valid x`
                
        //         res.writeHead(302, {'Location': `http://localhost:3000/`})
        //         res.end();
        //         s
        //     } catch (error) {
        //         console.log(error);
        //         // error handling if any step above fail send 404 page
        //         const form = fs.createReadStream("html/404.html");
        //         res.writeHead(500, {"Content-Type": "text/html"})
        //         form.pipe(res);
        //     }
	}


}

function redirect(state, res){
	const endpoint = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify`;
	console.log(endpoint);
	res.writeHead(302, {Location: `${endpoint}`})
	   .end();
}

function process_stream(stream, callback, ...args) {
	let body = "";
	stream.on("data", chunk => body += chunk);
	stream.on("end", () => callback(body, ...args));
}


function getCivilizationData(id, res){
	//let options = { tasks_completed: 0 }; 
	const apiURL= `https://age-of-empires-2-api.herokuapp.com/api/v1/civilization/${id}`;
	const civrequest = https.request(apiURL, function (res) {
		// let data = "";
		const chunks = [];
		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			// let url = JSON.parse(data);
			// console.log("url");
			// parse_civilization(url, res);
			const body = Buffer.concat(chunks);
            console.log(body.toString());
		});
	});
	civrequest.end();

	
	// https.request(
	// 	apiURL,
	// 	{ method: "GET" },
	// 	(token_stream) => process_stream(token_stream, parse_civilization, options, res)
	// ).end();

}

function parse_civilization(data, res){
	const civ_data = JSON.parse(data);
	console.log(civ_data);
	if (civ_data.length == 0){
		res.writeHead(404, { "Content-Type": "text/html" });
		res.end(`<h1>404 Not Found</h1>`);
		return;
	}
	let results = "<h1>No Results Found</h1>";
	results = `<h1>${civ_data[0]?.name}</h1><br/><dl>${civ_data[0]?.army_type}</dl>`;
	console.log(results);
	

// function getAccessTokenRequest(code, user_input, res){

}