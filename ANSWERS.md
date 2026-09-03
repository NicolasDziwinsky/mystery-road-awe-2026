Demo 1 — Split the app into JS modules

What is the difference between a classic `<script>` and a `<script type="module">`? Name at
least two behavioral differences that are relevant to this app.

    a classic script shares the pages global environment with other classic scripts which creates a wide shared surface.
    

Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in `app.js`. After splitting into modules, what has to happen for a different module to read or change that value? What error do you get if you forget, and why is that error actually useful?

    My data.js module, which contains the state, was not able to be overwritten, the error told me that the variables where read only. This prevents modules from breaking the state of other modules.
    So i had to encapsulate the entire state into its own object. When i import the object its properties can be changed, making everthing a bit more deliberate.

What's the difference between a named export and a default export? Point to one place in your refactor where you chose one over the other, and explain why.

    Using named exports allows a deliberate selection of functions and variables to be imported via {}, while a default export allows import without {}. 
    The default export is useful if a module only has one main function that is has to share.
    In my case i used it inside the dataLoading function, because only app.js needs the loadAllData() function, while all other functions of the module are only used internally.


Why won't `type="module"` scripts run at all if you open `index.html` directly from disk(`file://...`) instead of through a local HTTP server? (You already need a server for`fetch()` — is this the same reason, a different one, or both?)

    Fetch needs a Server structure to prevent the browser from accessing files on the users pc
    ES Modules are also restricted by the browser when loaded in a file:// context for security reasons.
    So it would be technically possible to run ES modules locally without a Server, but for security reasons it is restricted, because the browser neets to run it with browser security rules and mime type rules

