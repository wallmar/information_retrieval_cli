import glob from "glob";
import Solr, { TITLE_FIELD } from "./solr";

require("@babel/register");

const solrUrl = process.env.SOLR_URL || "http://localhost:8983/solr/simplewiki";

(async () => {
    const solr = new Solr(solrUrl);

    try {
        await solr.import(glob.sync("corpus/*.txt"), false);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    try {
        const results = await solr.search("bonnie");
        console.log(`Found ${results["numFound"]} results`);
        for (const [i, doc] of results["docs"].slice(0, 10).entries()) {
            console.log(`\t${i + 1}: ${doc[TITLE_FIELD]}`);
        }
    } catch (e) {
        console.error(e);
    }
})();
