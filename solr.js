import fetch from "node-fetch";
const fs = require("fs");

export const TITLE_FIELD = "title_t";
export const TEXT_FIELD = "text_t";

export default class Solr {
    constructor(solrUrl = "http://localhost:8983/solr/simplewiki") {
        this.solrUrl = solrUrl;
    }

    async import(filenames) {
        for (const filename of filenames) {
            const id = filename;
            let title = filename.replace(/_/g, " ").split(".")[0];
            while (title.indexOf("/") !== -1) {
                title = title.split("/")[1];
            }
            const text = fs.readFileSync(filename, "utf-8");

            await this.addDocument(id, this.buildDocument(title, text));
        }

        await this.commit();
    }

    buildDocument(title, text) {
        const document = {};
        document[TITLE_FIELD] = title;
        document[TEXT_FIELD] = text;
        return document;
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
