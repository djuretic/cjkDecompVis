import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { DecompositionMap, Decomposition } from './decomposition-map';

@Injectable()
export class DecompositionService {
  private url = "data/cjk-decomp-0.4.0.txt";

  constructor(private http: Http) {}

  getDecomposition(): Observable<DecompositionMap> {
    return this.http.get(this.url)
      .map(this.parseDecompositionData);
      // .catch(this.handleError);
  }

  private parseDecompositionData(res: Response): DecompositionMap {
    let data = res.text();
    let lines = data.split('\r\n');
    let decomp: DecompositionMap = {};

    const cleanLine = function(line: string): string{
      line = line.replace(":", ",");
      line = line.replace("(", ",");
      line = line.replace(")", "");
      return line;
    }

    for(let line of lines){
      if(line.length === 0)
        continue;

      let rowData = cleanLine(line).split(",");
      let character = rowData[0];
      let decompositionType = rowData[1];
      let components: string[] = [];
      for(let j=2; j<rowData.length; j++){
        if(rowData[j] !== ""){ // "c" decomposition
          components.push(rowData[j]);
        }
      }
      decomp[character] = {
       character: character,
       type: decompositionType[0],
       typeFull: decompositionType,
       components: components
      };
    }
    return decomp;
  }

  //TODO use it
  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
