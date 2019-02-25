const puppeteer = require('puppeteer');
const aws = require('aws-sdk');
const url = require('url');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_BUCKET_REGION
});

const takeScreenshot = async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const id = data.id;

    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width  : 1920,
        height : 1080
    });

    const s3 = new aws.S3();

    for (let i = 0; i < data.list.length; i++) {
        const urlLink = data.list[i];
        await page.goto(urlLink);

        const screenshot = await page.screenshot();

        const hostname = url.parse(urlLink).hostname;
        const params = {
            ACL: 'public-read',
            Body: screenshot,
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${id}/${hostname}.png`,
        }
        const imageUrl = await s3.putObject(params).promise();
    }
    await browser.close();
}


module.exports = takeScreenshot;