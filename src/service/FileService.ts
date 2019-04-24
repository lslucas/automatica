import * as glob from 'glob-promise';
import { getManager, createQueryBuilder } from 'typeorm';
import { File } from '../entity/File';
import * as moment from 'moment';
import * as rp from 'request-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

export type FileGroup = 'product' | 'block' | 'position' | 'boe';

export class FileService {

  listProductFiles(): Promise<String> {
    return glob('imports/cpt_parametros_*.txt')
      .then((files) => {
        let stout = [];
        _.sortBy(files).map((file) => {
          this.store(file, 'product');
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        // console.log(err);
        return null;
      });
  }

  listPositionFiles(): Promise<String> {
    return glob('imports/sbk_posi_*.txt')
      .then((files) => {
        let stout = [];
        _.sortBy(files).map((file) => {
          this.store(file, 'position');
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        // console.log(err);
        return null;
      });
  }

  listBlockFiles(): Promise<String> {
    return glob('imports/VR_bloqueios_*.txt')
      .then((files) => {
        let stout = [];
        _.sortBy(files).map((file) => {
          this.store(file, 'block');
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        // console.log(err);
        return null;
      });
  }

  async history(group?: FileGroup): Promise<[]> {
    const allFiles = createQueryBuilder(File, 'f');

    if (group) {
      allFiles.where('f.group = :value', {value: group});
    }

    const allFilesQry = await allFiles
      .orderBy('f.createdAt', 'DESC')
      .getMany();

    if (!allFilesQry) {
      return [];
    }

    // agrupa por nome de arquivo
    const groupedFiles = _.groupBy(allFilesQry, 'name');

    // pega o primeiro item de cada grupo (produto, parametro, bloqueio, etc) pois é o item mais recente
    const result = _.mapValues(groupedFiles, (el) => _.head(el));

    // ordena por nome pois são os arquivos que queremos processar do mais antigo ao mais recente
    return _.sortBy(result, 'name') as [];
  }

  async filesGroupedByDate(baseDate?: Date): Promise<any> {
    const history = await this.history();
    const grouped = {};

    // mapeia o array de history e agrupa os arquivos por data mantendo a ordem
    history.map(file => {
      const name = file['name'];
      const baseDate = (_.replace(name, /(imports\/)([\w]+)_/g, '')).replace(/\.txt/ig, '');
      // not a valid date
      if (baseDate.length !== 8 || !moment(baseDate, 'YYYYMMDD').isValid()) {
        return;
      }
      if (typeof grouped[baseDate] === 'undefined') {
        grouped[baseDate] = [];
      }
      grouped[baseDate].push(file);
    });

    return grouped;
  }

  sendRequest(file: string, group: FileGroup, retries: number = 0) {
    const url = this.requestUri(group);
    if (!url) {
      throw Error('Grupo informado não possui url cadastrada');
    }
    return rp(this.requestOptions(file, url));
    /*
      .catch(er => {
        if (retries < 1) {
          setTimeout(() => { this.sendRequest(file, group, retries); }, 1000);
          retries++;
        } else {
          return Promise.resolve(er);
        }
      });
      */
  }

  filterNameByGroup(file: any, group: string): any {
    return _.map(file, o => { if (o.group === group) { return o.name } }).filter(Boolean)[0];
  }

  protected requestOptions(file: string, url: string): any {
    return {
      method: 'POST',
      uri: url,
      formData: {
        file: {
          value: fs.createReadStream(file),
          options: {
            filename: path.basename(file)
          },
        },
      },
      json: true,
    };
  }

  protected async store(name: string, group: FileGroup): Promise<void> {
    if (!name) {
      return;
    }
    const fileRepo = getManager().getRepository(File);
    await getManager().save(fileRepo.create({
        group: group,
        name: name,
        createdAt: moment().format()
    }));
  }

  protected requestUri(group: FileGroup): string | false {
    const host = group === 'product' ? 'http://localhost:8089' : 'http://localhost:8080';
    let uri = '';

    if (group === 'product') {
      uri += '/gest-posicao/treasury-product-position/v1/import';
    } else if (group === 'position') {
      uri += '/gest-bloqueios/treasury-block-manager/v1/import/20';
    } else if (group === 'block') {
      uri += '/gest-posicao/treasury-product-position/v1/import';
    } else {
      return false;
    }

    return host + uri;
  }

}
