import express from "express";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/", (_req, res) => {
	res.send("Hello, TypeScript Backend!");
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
