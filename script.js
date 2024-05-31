//server.js
//registration function 
//we wrap the function in an event listene
//cors middleware
const port = 3000;
const whitelist = ["http://127.0.0.1:5500/index.html"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
document.addEventListener("DOMContentLoaded", () => {
    //we define a variable for our form and map it in our form in the html file 
    const registerForm = document.getElementById('registration-form');
    //we define a vriable for our log in form 
    //acccess the redistration form using the variable at the top, add an eent listener to listen to the submit event on the form 
    registerForm.addEventListener('submit', async (e) => {
        //prevent default behaviour on our form 
        e.preventDefault();
     //decklaring thwe variables to use 
        const formData = new FormData(registerForm);
        //we fetch theparameters from the form
        const username = formData.get('username');
        const password = formData.get('password');
        const email= formData.get('email');
        const full_name = formData.get('full_name');
        
        //we push the parameters to our route that handles the registeration 
        //to minimise the errors we wrap the erro in  a try catch block
        try {
            //instructions
            //we defien a variable called response and map it to the fetch
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username,password,email,full_name}),
                
            });
        //fettch the respoonse and check whether it was successfull or not
        if (response.ok){
            alert('Registration was successful');
        } else {
            alert('Registration was not successful');
        }
     } catch (error){
            console.error('Error:', error);
            alert("An Error occurred");
        }
    });
});
export default script;