import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect(
  
      "mongodb://localhost:27017/sreedugg"
  ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log('Connected to mongodb')
})

// Create Mongoose schema
const formSchema = new mongoose.Schema({


    walletaddress:String,
    contractaddress: String,
    nftContract: String,
    ChainlinkFee: String,
    Price: String,
    _numSlotsAvailable: Number,
    tokenID: Number

}
);

// Create Mongoose model
module.exports= mongoose.models.sreedugg || mongoose.model('sreedugg', formSchema)