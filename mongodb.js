const mongoose=require("mongoose")


const uri="mongodb+srv://vigilaakennedy:authentication@cluster0.abkgcyc.mongodb.net/"

async function connect(){
    try{
        await mongoose.connect(uri);
        console.log("Connected to mongoDB");
    }catch(error){
        console.log(error)
    }
    
}
connect();

const dataSchema = new mongoose.Schema({
  name:
       { type:String,
        required:true
},
email:
{
type:String,
required:true

},
password:
    {type:String,
    required:true
},

dates: [
    {
      date: String,
      content: String
    }
]
  

  });
  
  

  
const Collection = mongoose.model('Data', dataSchema);


  module.exports = Collection;