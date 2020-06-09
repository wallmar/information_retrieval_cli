import glob from "glob";
import Solr, { TITLE_FIELD } from "./solr";

const SOLR_URL = process.env.SOLR_URL || "http://localhost:8983/solr/simplewiki";

describe("Search", () => {
    function expectResults(actualResults) {
        const titles = actualResults.docs.map((doc) => doc[TITLE_FIELD]);
        return expect(titles);
    }

    let solr;

    beforeAll(async () => {
        solr = new Solr(SOLR_URL);
        await solr.import(glob.sync("corpus-test/*.txt"), true);
    });

    test("searches both title and text", async () => {
        expectResults(await solr.search("salzburg", 0, 100)).toContain("Salzburg Austria");
        expectResults(await solr.search("salzburg", 0, 100)).toContain("Wolfgang Amadeus Mozart");
    });

    test("is case-insensitive", () => {
        expect(solr.search("salzburg")).toEqual(solr.search("Salzburg"));
    });

    test("ignores stop words", async () => {
        expectResults(await solr.search("sound music")).toContain("The Sound of Music");
        expectResults(await solr.search("a sound of this music")).toContain("The Sound of Music");
    });

    test("search multiple words in the same field", async () => {
        expectResults(await solr.search("the sound of music")).toContain("The Sound of Music");
    });

    test("search multiple words in different fields", async () => {
        expectResults(await solr.search("herbert salzburg")).toContain("Herbert von Karajan");
    });

    test("requires all words to be found", async () => {
        expectResults(await solr.search("salzburg blubb")).toEqual([]);
    });

    test("title matches are ranked higher than text matches", async () => {
        const results = await solr.search("salzburg", 0, 100);
        const titleMatchIndex = results.docs.findIndex((doc) => doc[TITLE_FIELD] === "Salzburg Austria");
        const textMatchIndex = results.docs.findIndex((doc) => doc[TITLE_FIELD] === "Herbert von Karajan");
        expect(titleMatchIndex).toBeLessThan(textMatchIndex);
    });
});
