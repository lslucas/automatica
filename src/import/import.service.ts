import * as glob from 'glob-promise';

export default class ImportService {

  readFiles(): Promise<String> {
    return glob('imports/*/*.txt')
      .then((files) => {
        let stout = [];
        files.map((file) => {
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        return err;
      });
  }

}
