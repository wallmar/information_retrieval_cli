#!/usr/bin/env babel-node
import Solr from "./solr";
import glob from "glob";

const [, , ...args] = process.argv;

const solr = new Solr();
switch (args[0]) {
    case "import":
        importData();
        break;
    case "delete-all":
        deleteAll();
        break;
    default:
        console.log("Unknown command");
}

async function importData() {
    try {
        console.log("Importing data ...");
        await solr.import(glob.sync("corpus/*.xml"));
        console.log("Finished");
    } catch (e) {
        console.error(e);
    }
}

async function deleteAll() {
    try {
        console.log("Deleting data ...");
        await solr.deleteAll();
        console.log("Finished");
    } catch (e) {
        console.error(e);
    }
}
