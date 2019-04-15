import {createQueryBuilder} from "typeorm";
import {NextFunction, Request, Response} from "express";
import { FileService, FileGroup } from "../service/FileService";
import { File } from "../entity/File";
import { groupBy, head, mapValues } from 'lodash';

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
    const productList = await this.fileService.history('product');
    const positionList = await this.fileService.history('position');
    const blockList = await this.fileService.history('block');

    productList.forEach(el => {
      console.log('Posting product #', el['name']);
      this.fileService.sendRequest(el['name'], 'product')
        .then(res => {
          positionList.forEach(el => {
            console.log('Posting position #', el['name']);
            this.fileService.sendRequest(el['name'], 'position')
              .then(res => {
                blockList.forEach(el => {
                  console.log('Posting block #', el['name']);
                  this.fileService.sendRequest(el['name'], 'block')
                    .then(res => {
                      console.log('OK!');
                    })
                    .catch(err => {
                      console.log(err);
                    })
                });
              });
          });
        });
    })
  }

  history() {
    return this.fileService.history();
  }

}
