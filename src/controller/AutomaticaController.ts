import { FileService, FileGroup } from "../service/FileService";
import * as _ from 'lodash';

export class AutomaticaController {

  fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  all(): Promise<[String, String, String]> {
    return Promise.all([
      this.fileService.listProductFiles(),
      this.fileService.listPositionFiles(),
      this.fileService.listBlockFiles(),
    ]);
  }

  async process() {
    console.log(await this.fileService.filesGroupedByDate());
    this.fileService.filesGroupedByDate()
      .then(grp => {
        _.each(grp, async (f, baseDate) => {
          // console.info(`Processando ${baseDate}`);
          // importa produto
          const file = this.fileService.filterNameByGroup(f, 'product');
          return await this.fileService.sendRequest(file, 'product')
            .then(async res => {
              if (res.return.code === 500) {
                console.log(' - ' + res.return.message);
                return;
              }
              console.info(` - ${baseDate} - produto: ${res.return.message}`);
              // importa posição
              const file = this.fileService.filterNameByGroup(f, 'position');
              return await this.fileService.sendRequest(file, 'position')
                .then(async res => {
                  if (!res || res.return.code === 500 || res.return.code === 400) {
                    if (!res) {
                      return;
                    }
                    console.log(' - ' + res.return.message);
                  }
                  console.info(` - ${baseDate} - posição: ${res.return.message}`);
                  // importa bloqueio
                  const file = this.fileService.filterNameByGroup(f, 'block');
                  return await this.fileService.sendRequest(file, 'block')
                    .then(res => {
                      if (!res || res.return.code === 500 || res.return.code === 400) {
                        if (!res) {
                          return;
                        }
                        console.log(' - ' + res.return.message);
                      }
                      console.info(` - ${baseDate} - bloqueio: ${res.return.message}`);
                    })
                    .catch(err => {
                      console.info(` - ${baseDate} - bloqueio: ${err.message}`);
                    });
                })
                .catch(err => {
                  console.info(` - ${baseDate} - posição: ${err.message}`);
                });
            })
            .catch(err => {
              console.error(' - houve algum erro na importação:', err);
            });
        });
      });

    return 'Importing...<br/>See <console> for detailed information s2';
  }

  filesGroupedByDate() {
    return this.fileService.filesGroupedByDate();
  }

  history() {
    return this.fileService.history();
  }

}
