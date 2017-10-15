# hypertube
Hypertube - Final 42 School's Web Project

USER:
- Structure:

email

username

profile picture

name

first name

password (little secure)

- register/login via Omniauth: at least 42 and something else (fb for example)

- login with username and password. Reset forgotten password via email.

- ability to change email, profile picture and info

- see profile of other users: profile picture, info. Email is private.


LIBRARY:

only after login

- search field

The search engine will have to interview at least two external sources of your choice 1 and return all the results in the form of thumbnails.

You must limit the results to only videos.

- list of thumbnails (miniatures)

if something was found, the result should be displayed as miniatures, sorted by name

if nothing was found, you have to show most popular external sources of your media, sorted according to the criteria of your choice (downloads, peers, seeders, etc.)

In addition to the name of the video, a thumbnail must be made, if available, its production year, its IMDb rating and a cover image.

You will differentiate the video views of non-viewed videos, as you want.

The list will be expanded, with each end of the page, the following should be automatically loaded asynchronously. In other words, it should not be a link to each page.

The list will be sortable and filterable according to criteria such as name, gender, an IMDb rating interval, an interval year of production, etc...


VIDEO:

only after login

online player

(if available)

summary

the cast (at least producer, director, principal actors)

year of production

duration

IMDb rating

cover image

something else?)

comments

play video after it is downloaded completely to the server if it is downloaded for the first time. If it already exists on the server, just play it. Delete a video a month after the last view.

If the video is not natively readable for the browser, convert it on the fly in an acceptable format. The support of mkv is a minimum.


BONUS:

Some ideas:

• Add additional Omniauth strategies.

• Manage different video resolutions.

• Develop a RESTful API.

• Streamer MediaStream video via the API.
