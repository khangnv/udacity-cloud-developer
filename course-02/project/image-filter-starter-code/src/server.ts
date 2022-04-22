import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Filter an image from a public url.
  // Sample URL: https://i.pinimg.com/736x/c9/8f/e1/c98fe17dc7de72bb29c34a0c79ef5762.jpg
  app.get(
    '/filteredimage',
    async (req: express.Request, res: express.Response) => {
      try {
        // image_url: URL of a publicly accessible image
        const image_url: string = req.query?.image_url as string;

        // 1. validate the image_url query
        if (!image_url) {
          return res.status(400).send({ message: 'image_url is required' });
        }

        //2. call filterImageFromURL(image_url) to filter the image
        const filteredpath: string = await filterImageFromURL(image_url);
        if (filteredpath) {
          // 3. send the resulting file in the response
          res.status(200).sendFile(filteredpath, async () => {
            // 4. deletes any files on the server on finish of the response
            await deleteLocalFiles([filteredpath]);
          });
        }
      } catch (error) {
        return res
          .status(422)
          .send({ message: 'Cannot filter image from your url' });
      }
    }
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get('/', async (req, res) => {
    res.send('try GET /filteredimage?image_url={{}}');
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
