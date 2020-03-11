const {createUrls, isURL} = require('../functions');
require('../config/config');

describe('The URL', () => {
    it('is valid', () => {
        expect(isURL('http://www.google.com')).toBeTruthy();
    });

    it('is not valid', () => {
        expect(isURL('google.com')).toBeFalsy();
    })
});

describe('The AWS link generator', () => {
    it('produces 1 link', () => {
        const id = 1;
        const list = [
            'http://www.google.com'
        ];
        const result = [
            {
                hostname: 'www.google.com',
                url: `https://s3.eu-north-1.amazonaws.com/webtaker/${id}/www.google.com.png`
            }
        ];
        expect(createUrls(id, list)).toStrictEqual(result);
    });

    it('produces more than 1 link', () => {
        const id = 1;
        const list = [
            'https://www.google.com',
            'https://www.amazon.com'
        ];
        const result = [
            {
                hostname: 'www.google.com',
                url: `https://s3.eu-north-1.amazonaws.com/webtaker/${id}/www.google.com.png`
            },
            {
                hostname: 'www.amazon.com',
                url: `https://s3.eu-north-1.amazonaws.com/webtaker/${id}/www.amazon.com.png`
            }
        ];
        expect(createUrls(id, list)).toStrictEqual(result);
    });

    it('produces a valid link', () => {
        const id = 1;
        const list = [
            'http://www.google.com'
        ];
        const linkObject = createUrls(id, list);

        expect(isURL(linkObject[0].url)).toBeTruthy();
    })
})