#! /usr/bin/env node

const args = require("really-simple-args")();
const LighthouseCrawler = require("./core/LighthouseCrawler");

if(args.getAmountOfArguments() < 1) {
    console.log("No URL specified.");

    process.exit(1);
}

const startURL = args.getArgumentByIndex(0);

let crawler = new LighthouseCrawler();

crawler.crawl(startURL);