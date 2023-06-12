const sreedugg = require ('../../models/models_listings')
export default async (req, res) => {
  try {
    // Save form data to the database
    if (req.method === 'GET') {
      const data = await sreedugg.find({address: req.body.address})
      console.log(data)
      res.status(200).json(data);


      // Process a POST request
    }
    else if (req.method==='POST'){
      const form = new sreedugg(req.body);
      await form.save();
      const dd = await  sreedugg.find({})
      console.log(dd)
      res.status(200).json({ message: 'Form data saved to the database', dd });


    }


  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Error: ' + err });
  }
};