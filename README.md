# express-mvc
MVC Structure for Express based apps

## Structure
Understanding the structure of the application
```
    -- app
        -- controllers  # Contain controllers
            - controller.js     # Parent controller
        -- models   # Mongoose models
        -- views    # Views/templates to be rendered
            -- layouts
                - standard.ejs  # Default Layout for app
        -- routes   # Contain express routes
        -- scripts # Contains misc scripts
        -- config   # Main config files
        
    -- public   # Contains all the static files
        -- css
        -- js
        -- img
        
    -- bin
        - www   # Express server file
        
    -- app.js   # Main express app configuration
```

## Understanding Application
After downloading install the dependencies and start the application
```bash
npm install
npm start
```

### Approach
- We follows the MVC Pattern by matching the controller and their methods from the URL
- Eg: if url is => "/users/login" then accordingly it should look for "users" controller and execute the "login" method

### Flow
- Visit [Main Page](http://localhost:3000/)
- '/' routes are executed from the routes/home.js
- In this request current URL => "/", controller => ***"home"***, method => ***"index"***
- Layout => ***"views/layouts/standard.ejs"***, template => ***"views/home/index.ejs"***
- Notice the template is rendered automatically from the ***views/{controller}/{method}***
- All the data set by controller "view" property will be available to the views

### Working with this application
This can be divided into 3 steps. Let's say you want to create a controller for login and registration, let's call it ***"auth"***.
#### Controller
Create "auth.js" in controllers folder
```js
var Shared = require('./controller');
var Utils = require('../scripts/utils');

var Auth = (function () {
    var auth = Utils.inherit(Shared, 'Auth');

    auth._initView = function () {
        this.parent._initView.call(this);
        
        // change the layoutView
        // this.defaultLayout = "layouts/someother"; // will change the layout for all the functions
    };
    
    // login function
    auth.login = function (req, res, next) {
        this.view.message = "Some message"; // any property set on "this.view" will be available to the templates
        this.seo.title = "Login Page";  // SEO object available to views

        // this.willRenderLayoutView = false;  // don't render the layout just template
        // this.defaultLayout = "layouts/someother"; // this will change layout only for this function
        next();
    };
    
    // similarly other functions with same signature
    
    return auth;
}());
module.exports = Auth;
```

#### Views
- Views can be divided in two parts - layoutView (***"layouts/standard.ejs"*** [Default]) + actionView
- Layout: will include the actionView
- Create "auth" folder in views directory
- Create a template for login function => ***"auth/login.ejs"*** (actionView)
```html
<p><%= message %></p>
```

#### Routes
- Create routes/auth.js
```js
var express = require('express');
var router = express.Router();
var Auth = require('../controllers/auth');

var urlRegex = Auth._public();  // this will render all the public methods of the controller
// i.e not starting with "_"
router.get(urlRegex, function (req, res, next) {
    Auth._init(req, res, next);
});

module.exports = router;

```
- Mouting the routes in "app.js"
- Add these lines below the homeRoutes
```js
var authRoutes = require('./app/routes/auth');
app.use('/auth', authRoutes);
```
