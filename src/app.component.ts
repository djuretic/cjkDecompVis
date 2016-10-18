import { Component } from '@angular/core';

import { DecompositionService } from './decomposition.service';
import { DecompositionMap } from './decomposition-map';

@Component({
  selector: 'app',
  template: require('./app.component.html')
})

export class AppComponent {
    hanzi = '阿';
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
          console.log(decomposition);
          this.data = decomposition;
        })
    }

    update(hanzi: string, skipLog: boolean): void {
        // $scope.$broadcast('updateHanzi', hanzi, this.decompositionDepth);
        if(!skipLog) {
            this.history.push(hanzi);
            if(this.history.length > 10) {
                this.history.shift();
            }
        }
    }
}
