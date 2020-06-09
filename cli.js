import Solr, { TITLE_FIELD } from "./solr";

const readline = require("readline");

const solr = new Solr();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Enter query, empty to quit: ",
});

rl.prompt();
rl.on("line", async (line) => {
    if (line === "") {
        process.exit(0);
    }

    const results = await solr.search(line.trim());
    console.log(`Found ${results.numFound} results, showing top 5\n`);

    for (const result of results.docs.slice(0, 5)) {
        console.log(`${result[TITLE_FIELD]}: ${result.score}`);
    }

    rl.prompt();
});
