To start the server I use cmd.
I open the folder with server and then use "start node.js".


Prompts that I planned to use, but used only some of them:

1.Scan the project:
Check all the front- and backend files.
Explain the current structure of the project.
Find the places where frontend uses Cookie or any local storages.
Decide which data should be put onto the server.
Make a plan about the join of the two project parts.

2.The join:
Frontend must send the requests on Node.js-server with fetch().
Main data must be saved in JSON server file.
There must be implemented:
-the receive of all the elements
-the creation of a new element
-the deletion
-filtration and search
-the checking and reservation systems, respectively;

3. Processing states:
   Interface must show user "Loading...." while the request is ongoing.
   If the operation is successful - show the message of a success.
   If there's an error - show the error text;
   If the list is empty - show the respective message, not an empty blank;
   The sending button should be sometimes blocked to evite double request send.

4. Data check
   Double check:
1. User-friendly frontend;
2. Safe backend;

Server must return:
400 - wrong data
404 - no element
201 - successful creation
500 - an inside problem
502 - outer API problem;



5. New feature
   Add the ability to change the reservations: date, time, amount of people, and resave after.
   Then, add the history of changes and new reservations: the ability to get the time when the change/addition happened, date and so on. You must use both backend and frontend for these new features, with proper requests.

8.Project Structure

project/
public/
index.html
script.js
style.css
data/
data.json
routes/
routes.js
services/
service.js
utils/
validation.js
server.js
package.json

this is an example. It's not necessary to have it identical.


Route explanation:
First thing to startr with when creating a route is to choose
which HTTP method you need: GET, POST, PUT or DELETE.
For example, i used GET and specified a path: /api/tables.
Like this, server understands that i need to take some info:
in our case see the table list.
Then, in try-catch block we make the backend operations like
reading data from JSON and processing it to have 
an accurate result. In case of an error we get sent
to 404 page.


Working with AI is indeed impressive, and it is an amazing
tool for optimizing your work. But since im just learning,
i believe i would have understood the subject much better
if i did it all by myself. I will later on.