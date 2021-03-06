import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { GraphComponent } from './graph.component';
import { DecompositionService } from './decomposition.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    GraphComponent
  ],
  providers: [ DecompositionService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}