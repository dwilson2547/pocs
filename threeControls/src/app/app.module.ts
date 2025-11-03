import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ThreeSceneComponent } from './three-scene/three-scene.component';
import { DocComponent } from './doc-component/doc.component';

const appRoutes: Routes = [
  { path: 'documentation', component: DocComponent },
  { path: 'three', component: ThreeSceneComponent },
  { path: '**', redirectTo: 'three' }
];

@NgModule({
  declarations: [
    AppComponent,
    ThreeSceneComponent,
    DocComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
