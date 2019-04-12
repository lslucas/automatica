import * as express from 'express';
import ImportService from './import/import.service';

const importService = new ImportService();

const server = express();


server.get("/import", (_, res) => {
  const out = importService.readFiles();
  out
    .then((resp) => {
      res.send(resp);
    })
    .catch((err) => {
      console.log(err);
    });
});

export default server;
