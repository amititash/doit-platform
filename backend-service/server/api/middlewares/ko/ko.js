import  KoService from '../../services/kos.service';
const crypto = require('crypto');
const slugify = require('slugify');

const ideaNameSlugGenerator = async (req, res, next) => {
    /**
     * This middleware will do anything only if ideaName present in request. That is, we intend to update Idea name. 
     */
    if(!req.body.ideaName){
        next();
    }
    else {
        let randomString = crypto.randomBytes(6).toString('hex');
        console.log("yyyyyyyyyyyyyyy");
        let count = 0;
        let ideaOwner = req.body.ideaOwner ;
        let criteria = {};

        let ideaName = req.body.ideaName ;
        let idea_slug = slugify(ideaName, '-');
        console.log("slugified idea name", idea_slug);

        criteria = {
            "ideaNameSlug" : idea_slug,
            "ideaOwner" : ideaOwner
        }
        try {
            count = await KoService.countKo(criteria);
        }
        catch(e){
            console.log(e);
            next(e);
        }
        if(count){
            idea_slug += `_${randomString}`;
            idea_slug += `_${count}`   
        }
        
       
        req.body.ideaNameSlug = idea_slug;
        console.log("idea name slug to be saved", idea_slug);
        next()
    }
    
}


module.exports = {
    ideaNameSlugGenerator
}