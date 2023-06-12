const Form = require ('../../models/models_listings')
export default async (req, res) => {
  try {
    // Save form data to the database
   
    if(req.method === 'POST'){
      const data = await Form.find({address: req.body.address})
      console.log(data)
      res.status(200).json({ message: "success", data });
    }

    if(req.method === 'DELETE') {
      await Form.deleteOne({_id: req.body.id})
      res.status(202).json({message: 'deletion completed'})
    }



      // Process a POST request
 


  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Error: ' + err });
  }
};