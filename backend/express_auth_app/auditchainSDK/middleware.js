const auditLogger = require("./auditLogger")

function middleware(){

    return async function(req,res,next){

        res.on("finish",async ()=>{

            try{

                const userId = req.session?.userId || null

                const action = req.method + " " + req.path

                await auditLogger.log({
                    userId,
                    action,
                    attribute:null,
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
