import * as glob from 'glob-promise';
import {sortBy} from 'lodash';

export default class FilesService {

  start(): Promise<[String, String, String]> {
    return Promise.all([
      this.listProductFiles(),
      this.listPositionFiles(),
      this.listPositionFiles(),
    ]);
  }

  listProductFiles(): Promise<String> {
    return glob('imports/sbk_param-*.txt')
      .then((files) => {
        let stout = [];
        sortBy(files).map((file) => {
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }

  listPositionFiles(): Promise<String> {
    return glob('imports/sbk_posi_*.txt')
      .then((files) => {
        let stout = [];
        sortBy(files).map((file) => {
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }

  listBlockFiles(): Promise<String> {
    return glob('imports/VR_bloqueios-*.txt')
      .then((files) => {
        let stout = [];
        sortBy(files).map((file) => {
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }
}
