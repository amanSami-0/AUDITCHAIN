const auditLogger = require("./auditLogger")

function middleware(){

    return async function(req,res,next){

        res.on("finish",async ()=>{

            try{
                // We're using JWT now, so read ID from req.user if decoded by authMiddleware, 
                // or fallback since session could be gone
                const userId = req.user?.id || req.session?.userId || null;
                const path = req.path;
                const method = req.method;
                
                let action = method + " " + path;

                // Create Descriptive Actions
                if (method === 'POST') {
                    if (path === '/login') action = 'User Signed In';
                    if (path === '/signup') action = 'Account Registered';
                    if (path === '/update') action = 'Profile Updated';
                    if (path === '/delete') action = 'Account Deleted';
                    if (path === '/forgot') action = 'Password Reset Requested';
                    if (path === '/logout') action = 'User Logged Out';
                    if (path === '/settings') action = 'System Configuration Updated';
                }

                let attribute = null;
                if (path === '/settings' && method === 'POST') {
                    if (req.body && Object.keys(req.body).length > 0) {
                        attribute = JSON.stringify(req.body);
                    }
                }

                await auditLogger.log({
                    userId,
                    action,
                    attribute,
                    req
                })

            }catch(err){

                console.error("Audit Error:",err)

            }

        })

        next()
    }
}

module.exports = middleware
