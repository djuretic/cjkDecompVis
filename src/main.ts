import 'babel-polyfill';
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/http';
// RxJS
import 'reflect-metadata';
import 'zone.js';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';


if(process.env.NODE_ENV === 'production'){
  enableProdMode();
}

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);