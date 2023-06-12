const Form = require ('../../models/models_listings')
export default async (req, res) => {
  try {
    // Save form data to the database
    const read = await Form.find({});
    console.log(req)
    res.status(200).json({ message: 'Form data saved to the database', data: read })
    ;
  } catch (err) {
    console.log(err)
   
  }
};