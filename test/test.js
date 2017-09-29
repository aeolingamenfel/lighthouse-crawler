const assert = require('assert');
const LighthouseCrawler = require("./../core/LighthouseCrawler.js");

describe('LighthouseCrawler', function() {
    describe(".truncateUrl()", function() {
        let crawler = new LighthouseCrawler();

        it("should take off the https:// from a URL", function() {
            const urls = {
                "https://test.com": "test.com",
                "https://test.com/testing": "test.com/testing",
                "HTTPS://test.com": "test.com"
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.truncateUrl(index),
                    `Did not take the https:// off of ${index}`);
            }
        });

        it("should take the http:// from a URL", function() {
            const urls = {
                "http://test.com": "test.com",
                "http://test.com/testing": "test.com/testing",
                "HTTP://test.com": "test.com"
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.truncateUrl(index),
                    `Did not take the http:// off of ${index}`);
            }
        });

        it("should remove the trailing slash from a URL", function() {
            const urls = {
                "http://test.com": "test.com",
                "https://test.com/": "test.com",
                "HTTP://test.com/test/": "test.com/test"
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.truncateUrl(index),
                    `Did not take the trailing slash off of ${index}`);
            }
        });

        it("should remove the anchor link from an URL", function() {
            const urls = {
                "http://test.com#test": "test.com",
                "http://test.com/#test": "test.com",
                "https://test.com/nice/awesome/#test": "test.com/nice/awesome",
                "https://test.com/nice/awesome#test": "test.com/nice/awesome"
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.truncateUrl(index),
                    `Did not take the anchor link off of ${index}`);
            }
        });

        it("should remove the GET variables from the URL", function() {
            const urls = {
                "http://test.com?": "test.com",
                "http://test.com/?": "test.com",
                "http://test.com?foo=bar": "test.com",
                "http://test.com/?foo=bar": "test.com",
                "http://test.com/foobar?": "test.com/foobar",
                "http://test.com/foobar/?": "test.com/foobar",
                "http://test.com/foobar?foo=bar": "test.com/foobar",
                "http://test.com/foobar/?foo=bar": "test.com/foobar"
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.truncateUrl(index),
                    `Did not take the GET variables off of ${index}`);
            }
        });
    });
});