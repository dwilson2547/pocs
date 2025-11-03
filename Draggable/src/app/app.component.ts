import { Component, OnInit } from '@angular/core';
import { OutputService } from './OutputsService';
import { FunctionService } from './FunctionService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  os: OutputService;

  outputs: Array<any>;

  fs: FunctionService;

  functions: Array<any>;

  kvp: Array<{fnId, opId}>;

  constructor() {
    this.os = new OutputService();
    this.fs = new FunctionService();
    this.kvp = new Array<{fnId, opId}>();
  }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    await this.os.getAll().then((data) => {
      this.outputs = data;
      console.log(this.outputs);
    }).catch((err) => {
      console.log("how'd you manage that?");
    });

    await this.fs.getAll().then((data) => {
      this.functions = data;
    }).catch((err) => {
      console.log("how'd you mange that?");
    });
    console.log(this.functions);
  }

  drag(event) {
    event.dataTransfer.setData("text", event.target.id);
  }

  dropped(event) {
    console.log(event);
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const functionId = parseInt(event.target.id.slice(2), null);
    const outputId = parseInt(data.slice(2), null);
    let child = document.getElementById(data);
    event.target.appendChild(child);
    this.kvp.push({fnId: functionId, opId: outputId});
    console.log(this.kvp);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  poolDrop(event) {
    console.log(event);
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    let child = document.getElementById(data);
    const childId = parseInt(data.slice(2), null);
    console.log(child);
    this.kvp.splice(this.kvp.indexOf(this.kvp.find(x => x.opId == childId)), 1);
    let pool = document.getElementById('pool');
    pool.appendChild(child);
    console.log(this.kvp);
  }
}
