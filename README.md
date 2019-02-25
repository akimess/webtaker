# webtaker
Web Screenshot Microservice

### Requirements: <br/>
Docker   
AWS S3 account

### How to run:
```console
foo@bar:~$ docker-compose pull
foo@bar:~$ docker-compose up --build -d
foo@bar:~$ docker-compose up
```
To scale workers:
```console
foo@bar:~$ docker-compose scale screenshot=n
```
where n is the number of workers

**You need to add your AWS S3 credentials, bucket name and bucket region to both containers configs (frontend/config/config.json // screenshot_service/config/config.json)**

### Stack:
**Frontend container:** HTML/CSS/JS + jQuery. NodeJS + Express   
Didn't use frontend frameworks, because decided to create a lightweight interface to easily control the service.   

**Screenshot Service container:** NodeJS + Express   
Opted for NodeJS, because of the fast development and [Puppeteer](https://github.com/GoogleChrome/puppeteer) library for web screenshots.   

**RabbitMQ:**   
Messaging queue for realiability with scalability.   
Used to send tasks to the service backend.

**Redis:**   
Used for caching requests. Specifically request for retrieving earlier made screenshots. This will allow to ease the load on the requests.

**AWS S3:**   
I saw that Detectify stack uses AWS S3 and decided to use it also to store screenshots. The images are stored with session ID prefix, which allows to easily retrieve them afterwards. You will need to add your credentials to the config.json file stated above.    

### Puppeteer:   
The library used to take screenshots with DevTools Protocol. When docker is building, it will download the chrome driver for the library to work, which will take a few seconds depending on your connection.   
If the need arises, you will be able to change the viewport of the browser that takes the screenshots. In screenshot-service/functions.js replace 1920,1080 on lines 17 and 22-23.    

**Warning!** Current setup of Puppeteer in this project is not equipped for production. Current setup is for development sake, which runs in not a sandbox enviornment. To use in production, sandbox envioronment needs to be used. To set it up you need to remove arguments ('--no-sandbox', '--disable-setuid-sandbox') in screenshot-service/functions.js line 17. Then run the docker container with a non-priviliged user. [LINK](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)

### API endpoints:
#### Generate screenshots
* **URL**

  localhost:5000/

* **Method:**

  `POST`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ id : "f7sfasd7fd9sjkl4234s", urls : [{hostname: "hostname", url: "http://aws.region.amazonaws.com/bucketname/id/hostname.png}] }`
 
* **Error Response:**

  * **Code:** 400 <br />
    **Content:** `{ error : true, message : "One of the URLs is not valid" }`

  OR

  * **Code:** 400 <br />
    **Content:** `{ error : true, message : "No URLs added" }`
  
  OR

  * **Code:** 500 <br />
    
#### Retrieve screenshots by session ID
* **URL**

  localhost:5000/:id

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `id=[string]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ urls : [{hostname: "hostname", url: "http://aws.region.amazonaws.com/bucketname/id/hostname.png}] }`
 
* **Error Response:**

  * **Code:** 400 <br />
    **Content:** `{ error : true, message : "No images found for that session ID" }`

  OR

  * **Code:** 500 <br />
  
  
### UI:
**Index Page**
![alt text](https://raw.githubusercontent.com/akimess/webtaker/master/images/indexpage.png "Index Page")

**Add URL**
![alt text](https://raw.githubusercontent.com/akimess/webtaker/master/images/addurl.png "Add URL")

**URL list**
![alt text](https://raw.githubusercontent.com/akimess/webtaker/master/images/urladded.png "URL list")

**Generated / Retrieved**
![alt text](https://raw.githubusercontent.com/akimess/webtaker/master/images/generated.png "Generate/Retrieved")

#### P.S. After the images are generated, save the session ID to retrieve them later.


### Million screenshots per day challenge:
To tackle this I used rabbitmq and redis. Redis will be used to retrieve screenshots each time the user requests for them later and rabbitmq is to spread screenshotting request between workers. As I stated above, docker allows to scale the number of screenshot service workers.    

Million screenshots per day is almost 12 screenshots made per second. This doesn't mean that there will be 12 requests per second as user is able to send several screenshots. However, this project currently accepts unlimited amount of URLs sent to the service. There are several ways of scalling this and it depends on the number of screenshot_service workers and the limit for the number of screenshots per request.    

As the screenshot generation takes somewhere near a second, I suggest setting the limit to 10 screenshots per request and scaling up to 10 or 11 workers. 11 being the safest bet.   

Problems will arise when there will be a need to slow down the screenshot generation to correctly snapshot websites that take time to fully finish loading. To tackle this, the workers will need to be scaled up to around 20, but it highly depends on the websites being fed to the service, which will need some monitoring (addition of loggers will help).
