Seoun Broadcast System (SUBS)
=============

Welcome to the README for the School Broadcast Website (SUBS), the online platform for Seoun Broadcasting System at 서운중학교.
-------------

# routes
#### ```/```
he mainpage of the website. It includes FAQ.
### ```/song-request```
Song Request Page of the website. You can request a song by filling the form made out of zod:

- Inputing name and student number.
- Verifing email. It only works on seoun middle school gmail account.
    - You'll see the verify button. If you click that, website(client) sends a get request to /email-verification. Server will generate random 6-digit number. Then it will send it to an email to user using Gmail SMTP and also a client. Client will request user to input 6-digit, and compare with the number that recived from server.
- Search the song and select.
    - If you hit the search button, website(client) will reqeust an access token with client id and secret key to Spotify API. If client gets an access token, it will request the search data with the access token.
- Check if you read the precaution and submit.

Then, client will send request to /api/song-request to add song request to DB.

#### ```/suggestion-request```
Suggestion Request Page. You can request a song by filling the form made out of zod:

- Inputing name and student number.
- Verifing email.
    - Same algorithm with /song-request
- Inputing suggestion.

Then, client will send request to /api/suggestion-request to add song request to DB.
#### ```/new-crew```
A page for hiring new crewmates. Uses uploadthing to manage application files.

- Inputing name and student number.
- Upload application.
   - It uses uploadthing's ```<UploadButton />``` component.

Then, client will send request to /api/submit-application to add application data to DB.

#### ```/api```
Uses MongoDB Atlas
- ```/song-request```
- ```/suggestion-request```
- ```/submit-application```
- ```/uploadthing```
   - Endpoint for uploadthing
- ```/email-verification```