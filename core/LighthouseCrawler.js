const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const Crawler = require("node-webcrawler");

const SitePage = require("./SitePage.js");

class LighthouseCrawler {

    constructor(crawlLimit = 5) {
        this.crawler = null;
        this.linksQueued = false;
        this.crawledPages = {};
        this.crawledCount = 0;
        this.crawlLimit = crawlLimit;
    }

    crawl(startUrl) {
        this.crawler = new Crawler({
            maxConnections: 2,
            callback: (error, result, $) => {
                this.crawlLoadedPage(error, result, $);
            },
            onDrain: (pool) => {
                this.drainHasBegin(pool);
            }
        });

        this.addCrawledPage(startUrl);

        console.log("Beginning site crawl...");
    }

    crawlLoadedPage(error, result, $) {

        this.pageWasFound(result.request);

        const links = $("a");

        this.queueLinks(links);
    }

    pageWasFound(request) {
        const url = request.uri.href;
        
        this.registerPage(url);
    }

    queueLinks(links) {
        for(let x = 0; x < links.length; x++) {
            const link = links[x];
            const url = link.attribs.href;

            this.addCrawledPage(url);
        }
    }

    addCrawledPage(url) {
        if(this.crawledCount >= this.crawlLimit) {
            return;
        }

        const newPage = this.registerPage(url);

        if(newPage) {
            this.crawler.queue(url);
        }

        this.crawledCount += 1;
    }

    hasPage(url) {
        const truncatedUrl = this.truncateUrl(url);

        return !!this.crawledPages[truncatedUrl];
    }

    registerPage(url) {
        if(this.hasPage(url)) {
            return false;
        }

        const truncatedUrl = this.truncateUrl(url);
        const page = new SitePage(truncatedUrl, url);

        this.crawledPages[truncatedUrl] = page;

        return page;
    }

    truncateUrl(url) {
        const shortened = url.replace(/^http[s]?\:\/\//i, "")
            .replace(/[\/]?(?:#(?:[a-z]|[A-Z]|[0-9]|[-])*)*(?:\?.*)*$/i, "");

        return shortened;
    }

    drainHasBegin(pool) {
        console.log(`Crawl Complete. ${this.crawledCount} page(s) crawled.`);

        this.testAllPages();
    }

    async testAllPages() {
        console.log("Preparing to run tests on all crawled pages. Do not close or tamper with the Chrome window that will appear.");

        let testNumber = 1;
        let pageScoreSum = 0;

        for(const index in this.crawledPages) {
            const page = this.crawledPages[index];

            console.log(`Testing page (${testNumber}/${this.crawledCount})`);
            await this.testPage(page);

            pageScoreSum += page.loadScore;
            testNumber += 1;
        }

        const average = pageScoreSum / this.crawledCount;

        console.log(`\nAverage Score: ${average}`);

        // clean up
        fs.unlinkSync("./temp.json");
    }

    async testPage(page) {
        const score = await this.scorePage(page);

        page.didRecieveScore(score);

        console.log(`${page.url}: ${page.loadScore}`);
    }

    async scorePage(page) {
        const command = `lighthouse ${page.fullUrl} --output json --output-path ./temp.json`;

        await exec(command);
    
        const fileData = fs.readFileSync("./temp.json").toString();
        const data = JSON.parse(fileData);

        return data;
    }

}

module.exports = LighthouseCrawler;