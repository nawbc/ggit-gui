const { login } = require('./loginGitHub');

login('sewerganger', 'outlook9423').then((obj)=>{
    obj.pickGitHubRepo().then((data)=>{
        console.log(data);
    })
})

