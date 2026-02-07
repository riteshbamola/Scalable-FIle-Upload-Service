const express= require('express');
const app = express();
const PORT= 5000;


app.use('/',(req,res)=>{
    return res.json({msg:"Hello"});
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});