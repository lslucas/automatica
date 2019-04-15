import * as glob from 'glob-promise';
import { getManager, createQueryBuilder } from 'typeorm';
import { File } from '../entity/File';
import * as moment from 'moment';
import * as rp from 'request-promise';
import * as fs from 'fs';
import * as path from 'path';
import { sortBy, groupBy, head, mapValues } from 'lodash';

export type FileGroup = 'product' | 'block' | 'position' | 'boe';

export class FileService {

  listProductFiles(): Promise<String> {
    return glob('imports/sbk_param*.txt')
      .then((files) => {
        let stout = [];
        sortBy(files).map((file) => {
          this.store(file, 'product');
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
    return glob('imports/sbk_position-*.txt')
      .then((files) => {
        let stout = [];
        sortBy(files).map((file) => {
          this.store(file, 'position');
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
          this.store(file, 'block');
          stout.push(file);
        });
        return stout;
      })
      .catch((err) => {
        console.log(err);
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
    const groupedFiles = groupBy(allFilesQry, 'name');

    // pega o primeiro item de cada grupo (produto, parametro, bloqueio, etc) pois é o item mais recente
    const result = mapValues(groupedFiles, (el) => head(el));

    // ordena por nome pois são os arquivos que queremos processar do mais antigo ao mais recente
    return sortBy(result, 'name') as [];
  }

  sendRequest(file: string, group: FileGroup, retries: number = 0) {
    return rp(this.requestUri(group), this.requestOptions(file))
      .catch(er => {
        if (retries < 2) {
          setTimeout(() => { this.sendRequest(file, group, retries); }, 500);
          retries++;
        } else {
          throw Error(er);
        }
      });
  }

  protected async store(name, group): Promise<void> {
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

  protected requestOptions(file: string): rp.RequestPromiseOptions {
    return {
      method: 'POST',
      baseUrl: 'http://localhost/',
      json: true,
      formData: {
        file: {
          value: fs.createReadStream(file),
          options: {
            filename: path.basename(file)
          },
        },
      },
    };
  }

  protected requestUri(group: FileGroup): string {
    return group === 'product' ? 'products' : 'other';
  }

}
