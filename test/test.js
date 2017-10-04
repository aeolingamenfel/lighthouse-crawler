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

    describe(".isBadUrl()", function() {
        let crawler = new LighthouseCrawler();

        it("should detect telephone links", function() {
            const urls = {
                "tel:nice": true,
                "tel:+1123423": true,
                "tel:43204902": true,
                "tel:(123) 456-7890": true,
                "tel:+18886946735": true
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.isBadUrl(index),
                    `did not correctly return ${correctAnswer} for ${index}`);
            }
        });

        it("should detect email links", function() {
            const urls = {
                "mailto:": true,
                "mailto:test@test.com": true,
                "mailto:foobar": true,
                "mailto:foo.bar@gmail.com": true
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.isBadUrl(index),
                    `did not correctly return ${correctAnswer} for ${index}`);
            }
        });

        it("should not detect normal urls", function() {
            const urls = {
                "http://test.com": false,
                "https://test.com": false
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.isBadUrl(index),
                    `did not correctly return ${correctAnswer} for ${index}`);
            }
        });

        it("should detect hashes (#) as the URL base", function() {
            const urls = {
                "#": true
            };

            for(const index in urls) {
                const correctAnswer = urls[index];

                assert.equal(correctAnswer, crawler.isBadUrl(index),
                    `did not correctly return ${correctAnswer} for ${index}`);
            }
        });
    });
});