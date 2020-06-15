import fetch from "node-fetch";
const fs = require("fs");
const convert = require("xml-js");

export default class Solr {
    constructor(solrUrl = "http://localhost:8983/solr/movie-club") {
        this.solrUrl = solrUrl;
    }

    getValues(field) {
        if (field === undefined) return [];
        if (Array.isArray(field)) return field.map((obj) => Object.values(obj)).flat();
        return [field.value];
    }

    getCast(field) {
        if (field === undefined) return [];
        if (Array.isArray(field)) return field.map((obj) => obj.actor?.value).flat();
        return [field.actor.value];
    }

    getRunningtime(field) {
        if (field === undefined) return [];
        if (Array.isArray(field)) return field.map((obj) => obj.value).flat();
        return [field.value];
    }

    async import(filenames) {
        for (const filename of filenames) {
            const xml = fs.readFileSync(filename, "utf-8");
            const js = convert.xml2js(xml, { compact: true, spaces: 4, textKey: "value" }).doc;
            const document = {};
            const id = js._attributes?.id;
            document.title_txt_en = js.title?.value;
            document.year_i = js.year?.value;
            document.type_txt_en = js.type?.value;
            document.colorinfos = this.getValues(js.colorinfos?.colorinfo);
            document.genres = this.getValues(js.genres?.genre);
            document.keywords = this.getValues(js.keywords?.keyword);
            document.languages = this.getValues(js.languages?.language);
            document.soundmixes = this.getValues(js.soundmixes?.soundmix);
            document.countries = this.getValues(js.countries?.country);
            document.runningtime_t = this.getRunningtime(js.runningtimes?.runningtime)[0];
            document.directors = this.getValues(js.directors?.director);
            document.producers = this.getValues(js.producers?.producer);
            document.cast = this.getCast(js.cast?.credit);
            document.plot_txt_en = this.getValues(js.plot)[0];

            try {
                await this.addDocument(id, document);
            } catch {
                console.log(`Oops, there was a problem with document ${id}`);
            }
        }
        await this.commit();
    }

    async commit() {
        await this.postSolrRequest("update?commit=true");
    }

    async addDocument(uniqueId, fields) {
        await this.postSolrRequest("update?overwrite=true&commitWithin=1000", [{ id: uniqueId, ...fields }]);
    }

    async deleteAll() {
        await this.postSolrRequest("update?commit=true", {
            delete: {
                query: "*:*",
            },
        });
    }

    /*async search(query, start = 0, rows = 10) {
        return await this.postSolrRequest("select", {
            params: {
                fl: "*,score",
                start,
                rows,
            },
            query: {
                edismax: {
                    query,
                    qf: `${TITLE_FIELD}^10 ${TEXT_FIELD}^5`,
                    mm: "100%",
                },
            },
        });
    }*/

    async postSolrRequest(url, body) {
        const jsonResponse = await fetch(`${this.solrUrl}/${url}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        });

        if (!jsonResponse.ok) {
            throw new Error(jsonResponse.statusText);
        }

        const response = await jsonResponse.json();
        return response.response;
    }
}
