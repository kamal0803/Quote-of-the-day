import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

let quote = {};
let quotes = "";
let currentQuote = {};

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
      
await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/get_quote", async (req, res) => {

    quote = await nextQuote();

    res.render("index.ejs", {
        currentQuote: quote
    });
    
});

app.post("/submit_quote", (req, res) => {
    res.render("new.ejs");
});

app.post("/submit_new_quote", async (req, res) => {

    await db.query("INSERT INTO quotes (quote, author) VALUES ($1, $2)", [req.body.quoteText, req.body.quoteAuthor]);

    res.redirect("/");
})

async function nextQuote(){

    const res = await db.query("SELECT * FROM quotes");
    quotes = res.rows;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];

    return currentQuote;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});