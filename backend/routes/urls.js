const express = require('express');

const router = express.Router();

router.post('/shorten',(req,res)=>{
    res.status(200).json({success:true,message:'Route is working! The controller logic is next.'});
});

module.exports = router;