import { Component } from '@angular/core';

import { DecompositionService } from './decomposition.service';
import { DecompositionMap } from './decomposition-map';

@Component({
  selector: 'app',
  template: require('./app.component.html')
})

export class AppComponent {
    hanzi = '阿';
    graphHanzi = '';
    buttonLabel = 'Loading...';
    history: string[] = [];
    data: DecompositionMap = {};
    decompositionDepth = 2;

    constructor(private decompositionService: DecompositionService) {}

    dataLoaded(): boolean {
        return this.data !== {};
    }

    ngOnInit(): void {
      this.decompositionService.getDecomposition()
        .subscribe(decomposition => {
          this.buttonLabel = 'Show';
          this.data = decomposition;
        })
    }

    update(hanzi: string, skipLog: boolean): void {
        this.graphHanzi = hanzi;
        let lastHanzi = this.history.length > 0 ? this.history[this.history.length-1] : '';
        if(!skipLog && hanzi != lastHanzi) {
            this.history.push(hanzi);
            if(this.history.length > 10) {
                this.history.shift();
            }
        }
    }
}
