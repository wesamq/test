module.exports = {
     apps: [{
       name: 'profhelp', 
       script: 'pnpm', 
       args: 'start', 
       cwd: '/test', 
       watch: false, 
       env: {
         NODE_ENV: 'production' 
       }
     }]
   };
