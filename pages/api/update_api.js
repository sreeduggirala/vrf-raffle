const sreedugg = require('../../models/models_listings');

export default async (req, res) => {
  try {
    console.log(req.body)
    const { documentId, subtractBy } = req.body;

    if (!documentId || !subtractBy) {
      res.status(400).json({ message: 'Missing required parameters' });
      return;
    }

  
    try {
      // Connect to MongoDB

      // Update the document
      const filter = { _id: documentId };
      const update = { $inc: { _numSlotsAvailable: -subtractBy } };
      const result = await sreedugg.updateOne(filter, update);

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Document updated successfully' });
      } else {
        res.status(500).json({ message: 'No document found or no changes made' });
      }
    } catch (err) {
      console.error('Error updating document:', err);
      res.status(500).json({ message: 'Error updating document' });
    } finally {
      // Close the client connection
      await client.close();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error: ' + err });
  }
};