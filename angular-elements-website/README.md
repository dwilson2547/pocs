## Re-creation steps:
Compile your angular project with ng build, once built open up the compilation director (usually dist) and any subfolders therein until you reach the root of the website (folder that contains index.html). Copy all of the javascript files over into your other application and import them as seen in this project's index.html. then you can call your component with its tag name as set in angular (app-root in this case) and spin up a webserver to host the application. If you have docker installed, this can be done using the default nginx image and the following command: 

docker run -v /path/to/site/folder:/usr/share/nginx/html -p 8080:80 nginx

the site can then be accessed from any web browser by navigating to http://localhost:8080


Link to article that i followed: https://medium.com/@mohamed_larbi.chouaiar/how-to-build-your-angular-components-and-use-it-everywhere-72dea7ecc0d6\
Scroll down to: <ins>Use the Angular Custom element with plain Javascript</ins> for more information on how this works

link to github angular project used here: https://github.com/MChouaiar/angular-element-example


## To install docker on ubuntu:

sudo apt install docker.io\
sudo groupadd docker\
sudo usermod -aG docker $USER\
docker pull nginx