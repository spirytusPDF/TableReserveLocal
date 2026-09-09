**Part 1. What actually was going on?**



*I've got Node.js program:*

&#x09;const http = require("http");



&#x09;const server = http.createServer((req, res) => {

&#x20;   	res.end("Hello!");

&#x09;});



&#x09;server.listen(3000);

(simplified)



When I run node server.js - it starts listening on port 3000.

What does it mean?

Computer has IP, and there are "doors" - ports.

So my Node.js sits behind the 127.0.0.1:3000 door.





*2. Nginx role*

proxy\_pass http://127.0.0.1:3000; means "when I received the request, pass it to the program, that works on this computer on port 3000".



Nginx

&#x20;  ↓

127.0.0.1:3000

&#x20;  ↓

Node.js



Why do we need it?



Yes, we could simply address Node.js straightforward, but it's not how it's done.



Node.js - controls the logic of the app(routes, data.json, API...).

Nginx - receives HTTP/HTTPS, works with ports 80/443, uses SSL-certificate, sends requests to Node.js.





NTERNET / RADMIN

&#x20;                    ↓

&#x20;                 Nginx

&#x20;               /       \\

&#x20;         HTTPS :443    HTTP :80

&#x20;               ↓

&#x20;         Node.js :3000







*3. Domain*

DNS converts IPs into domains 

spirytusdomen.pp.ua

&#x20;       ↓

26.95.162.44



We used https://nic.ua/uk/domains/.pp.ua to create a domain, and there we can manage DNS thingys.





*4. Radmin(additionally)*



Radmin VPN creates virtual network between computers.



&#x20;  Computer1

&#x20;      ↓

26.95.162.44

&#x20;      ↓

&#x20;  Computer2





*5. What "Let's Encrypt" is?*



It's a centre of certification.

It simply proves that our site is safe(https).



Port 80 - http

Port 443 - https





*6. So what did Nginx do at the end?*

server {

&#x20;   listen 80;

&#x20;   server\_name spirytusdomen.pp.ua;



&#x20;   location / {

&#x20;       return 301 https://$host$request\_uri;

&#x20;   }

}



\-This means "if someone came by HTTP on my domain - send him on HTTPS".





server {

&#x20;   listen 443 ssl;

&#x20;   server\_name spirytusdomen.pp.ua;



&#x20;   ssl\_certificate C:/nginx/certs/spirytusdomen.pp.ua-chain.pem;

&#x20;   ssl\_certificate\_key C:/nginx/certs/spirytusdomen.pp.ua-key.pem;



&#x20;   location / {

&#x20;       proxy\_pass http://127.0.0.1:3000;

&#x20;   }

}



\-This one means "I accept HTTPS on 443, use this certificate, and then send the request on Node.js 3000".





**So the story is:**



&#x20;                      User

&#x20;                        │

&#x20;                        │ https://spirytusdomen.pp.ua

&#x20;                        ↓

&#x20;                 ┌──────────────┐

&#x20;                 │      DNS     │

&#x20;                 │ domain → IP  │

&#x20;                 └───────┬──────┘

&#x20;                         ↓

&#x20;                   26.95.162.44

&#x20;                   (Radmin VPN)

&#x20;                         │

&#x20;                         ↓

&#x20;                 ┌──────────────┐

&#x20;                 │    NGINX     │

&#x20;                 │              │

&#x20;                 │ :443 HTTPS   │

&#x20;                 └───────┬──────┘

&#x20;                         │

&#x20;                   proxy\_pass

&#x20;                         ↓

&#x20;                 ┌──────────────┐

&#x20;                 │   Node.js    │

&#x20;                 │   :3000      │

&#x20;                 └───────┬──────┘

&#x20;                         ↓

&#x20;                   MYSITE/API

Important: this site is available only on Radmin network. To make it public I need replace Radmin IP with IPv4.





















**2. Part 2. Step by step help.**



**Step 0:**

We need to have:



1\. Node.js

2\. Nginx

3\. Domain

4\. DNS

5\. Certification Let's Encrypt

6\. win-acme (wacs)





**Step 1:**

Start your Node.js (cd => node server.js)

Check in PowerShell: curl http://127.0.0.1:3000



Remember:

Node.js = app; port 3000 = the door;





**Step 2:**

Check the IP





**Step 3:**

Adjust DNS.



spirytusdomen.pp.ua

&#x20;       ↓

26.95.162.44



**Step 4:**

Load Nginx.



Main executable: C:\\nginx-1.30.4\\nginx.exe





**Step 5:**

Realise the nginx.config structure:

events {

}



http {



&#x20;   server {

&#x20;       ...

&#x20;   }



&#x20;   server {

&#x20;       ...

&#x20;   }



}



server is a separate virtual site/host.



Example: 

server {

&#x20;   listen 80;

&#x20;   server\_name spirytusdomen.pp.ua;

}



This block processes requests for spirytusdomen.pp.ua on port 80.





**Step 6.**

Adjust HTTP.



For a simple Node.js app:

server {

&#x20;   listen 80;

&#x20;   server\_name spirytusdomen.pp.ua;



&#x20;   location / {

&#x20;       proxy\_pass http://127.0.0.1:3000; #Nginx → Node.js

&#x20;   }

}





**Step 7.**

Check configuration.

Use PowerShell:

&#x09;cd C:\\nginx-1.30.4

then

&#x09;.\\nginx.exe -t



if syntax is ok

test is successful - youre doing great. Otherwise check on your nginx.config.





**Step 8.**

Set the configuration.

Use PowerShell: .\\nginx.exe -s reload

Probably youll get no output - which is normal.





**Step 9.**

Why will we not use HTTP-01?

Because of Radmin. Let's Encrypt can't access it.



That's why we use DNS-01

Let's Encrypt asks for proofs that we control the domain.

It gives us Name:

\_acme-challenge and TXT:

\_PxJSaATzUKOGJ2QpULDukzifmX1jFbm2xohCRaTuDg



We add it to DNS(at out DNS configuring site/program)



This way DNS doesn't care if our Node.js is in global network.

So Radmin VPN + DNS-01





**Step 10.**

How to use wacs.



Wacs is win-acme, ACME-client for Windows.

It talks with Let's Encrypt.

(I used Chocolatey to install it)

Create C:\\nginx\\certs(for certification) and C:\\nginx\\acme(for test)



When you open wacs in PowerShell:



Choose M

2:Manual input

Enter domain

4:Single certificate

6:\[dns] Create verification records manually

2:RSA key

2:PEM encoded files

Paths: C:\\nginx\\certs or C:\\nginx\\acme, depends on what they ask you



When it'll ask you to add and then delete TXT files, do it on your DNS configuring program





As a result we'll have 

spirytusdomen.pp.ua-chain-only.pem

spirytusdomen.pp.ua-chain.pem  --certificate

spirytusdomen.pp.ua-crt.pem

spirytusdomen.pp.ua-key.pem  --private key





**Step 11.**

Add HTTPS to Nginx



server {

&#x20;   listen 80;

&#x20;   server\_name spirytusdomen.pp.ua;



&#x20;   location / {

&#x20;       return 301 https://$host$request\_uri;

&#x20;   }

}



server {

&#x20;   listen 443 ssl;

&#x20;   server\_name spirytusdomen.pp.ua;



&#x20;   ssl\_certificate C:/nginx/certs/spirytusdomen.pp.ua-chain.pem;

&#x20;   ssl\_certificate\_key C:/nginx/certs/spirytusdomen.pp.ua-key.pem;



&#x20;   location / {

&#x20;       proxy\_pass http://127.0.0.1:3000;

&#x20;   }

}



This is an example





**Step 12.**

After any Nginx change:

Use PowerShell:



.\\nginx.exe -t

if everything's good:

.\\nginx.exe -s reload

then check up:

curl https://spirytusdomen.pp.ua







The general algorithm:



┌─────────────────────────────┐

│ 1. Start Node.js            │

│    :3000                    │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 2. Check                    │

│    localhost:3000           │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 3. Adjust DNS                │

│    domain → IP               │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 4. Adjust Nginx             │

│    :80 → Node.js :3000      │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 5. nginx -t                 │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 6. nginx -s reload          │

└──────────────┬──────────────┘

&#x20;              ↓

&#x20;        Need HTTPS?

&#x20;              ↓

┌─────────────────────────────┐

│ 7. win-acme (wacs)          │

│    M → Manual input         │

│    → Single certificate     │

│    → DNS-01                 │

│    → RSA                    │

│    → PEM → C:\\nginx\\certs  │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 8. Add TXT в DNS       	   │

│    \_acme-challenge           │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 9. Get certificate           │

└──────────────┬──────────────┘

&#x20;              ↓

┌─────────────────────────────┐

│ 10. Nginx :443 ssl          │

│     + certificate           │

│     + private key           │

│     → Node.js :3000         │

└──────────────┬──────────────┘

&#x20;              ↓

&#x20;         HTTPS SITE



















