import express from "express";
import cors from "cors";
import getWinningRestaurant from "./decision.js";
import { findFlockByCode, createFlock, addChickToFlock, createEgg } from "./flock-services.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const port = 8000;

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	socket.on("join-flock", (code) => {
		socket.join(code);
	});
	socket.on("leave-flock", (code) => {
		socket.leave(code);
	});
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/flocks", async (req, res) => {
	try {
		const flock = await createFlock();
		res.status(201).send(flock);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to create flock");
	}
});

app.get("/flocks/:code", (req, res) => {
	console.log(`GET /flocks/${req.params.code}`);
	findFlockByCode(req.params.code).then((flock) => {
		res.send(flock);
	});
});

app.post("/flocks/:coopName/chicks", async (req, res) => {
	const chick = await addChickToFlock(req.params.coopName, req.body.name);

	if (!chick) {
		res.status(400).send({ message: "Chick already exists" });
		return;
	}

	io.to(req.params.coopName).emit("message", { type: "chick-added", chick: chick });
	res.send({ name: chick });
});

app.delete("/flocks/:code", (req, res) => {
	res.send(`Flock ${req.params.code} deleted`);
});

app.get("/flocks/:code/chicks", (req, res) => {
	res.send(`Chicks of flock ${req.params.code}`);
});

app.post("/flocks/:code/votes", (req, res) => {
	// body should contain the relevant info
	// (member, egg, vote direction)
	res.send(`Vote added to flock ${req.params.code}`);
});

app.post("/flocks/:coopName/basket/:title", async (req, res) => {
	try {
		const egg = await createEgg(req.params.coopName, req.params.title);
		res.status(201).send(egg);
	} catch (e) {
		console.error(e);
		res.status(500).send("Failed to create egg");
	}
});

app.get("/flocks/:code/basket", (req, res) => {
	res.send(`Options of flock ${req.params.code}`);
});

app.get("/flocks/:coopName/decision", async (req, res) => {
	console.log(`GET /flocks/${req.params.coopName}/decision`);
	const restaurantName = await getWinningRestaurant(req.params.coopName);
	if (!restaurantName) {
		res.status(404).send({ message: "Decision not available" });
		return;
	}
	res.send({ winner: restaurantName });
});

server.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
