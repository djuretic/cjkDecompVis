import { Component, Input } from '@angular/core';

import { DecompositionMap, Decomposition } from './decomposition-map';

var d3 = require('exports?d3!./../js/d3.v3.min.js');

interface DecompositionNode {
  id: number,
  maxId: number,
  character: string,
  hasChar: boolean,
  type?: string,
  typeFull?: string,
  typeDescription?: string,
  children?: DecompositionNode[]
}


@Component({
  selector: 'graph',
  template: '<div id="svg"></div>'
})

export class GraphComponent {
  @Input() data: DecompositionMap = {};
  @Input() hanzi: string;
  width = 900;
  height = 500;
  nodeRadius = 16;
  fontSize = 18;
  animationDelay = 250;

  private scale = d3.scale.category10();
  private svg: any;
  private force: any;
  private nodeSel: any;
  private linkSel: any;

  ngOnInit(): void {
    this.svg = d3.select("#svg").append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");
  }

  ngOnChanges(inputChanges: any): void {
    if(this.svg && inputChanges.hanzi){
      // TODO get the depth from the UI
      this.updateGraph(this.hanzi, 30);
    }
  }

  getDecomposition(character: string, baseId: number, maxDepth: number): DecompositionNode{
    let getDecompositionDescription = function(type: string): string {
      // Texts taken from http://cjkdecomp.codeplex.com/wikipage?title=cjk-decomp&referringTitle=Home
      let desc = {
        c : "Component",
        m : "Modified",
        w : "Second constituent contained within first",
        b : "Second between first",
        l : "Components locked together",
        s : "First component surrounds second",
        a : "Flows across",
        d : "Flows downwards",
        r : "Repeats and/or reflects"
      };
      return desc[type] || '';
    }

    let characterDecomp: Decomposition = this.data[character];
    if(!characterDecomp || maxDepth <= 0){
      // character doesn't have a decomposition
      return {
        id: baseId,
        maxId: baseId,
        character: character,
        hasChar: true
      };
    }
    let children: DecompositionNode[] = [],
      maxId = baseId;
    if(characterDecomp.components){
      characterDecomp.components.forEach((component: string) => {
        maxId++;
        let childDecomp: DecompositionNode = this.getDecomposition(component, maxId, maxDepth - 1);
        maxId = childDecomp.maxId;
        children.push(childDecomp);
      });
    }
    return {
      id: baseId,
      maxId: maxId,
      character: character,
      type: characterDecomp.type,
      typeFull: characterDecomp.typeFull,
      typeDescription: getDecompositionDescription(characterDecomp.type),
      hasChar: character.length <= 1,
      children: children
    };
  }

  updateGraph(character: string, depth: number){
    // TODO global?
    var baseId: number = typeof baseId !== 'undefined' ? baseId : 1;

    var characterDecomp = this.getDecomposition(character, baseId, depth);
    var depth = this.getDepth(characterDecomp);

    var tree = d3.layout.tree();
    var nodes = tree.nodes(characterDecomp);
    nodes.forEach((n: any) => { delete n.x; delete n.y; delete n.px; delete n.py; });
    var links = tree.links(nodes);

    this.force = d3.layout.force()
      .size([this.width, this.height])
      .charge(-400)
      .friction(0.85)
      .nodes(nodes)
      .links(links)
      .linkDistance((d: any) => (20 - 2*d.source.depth))
      .on("tick", this.tick.bind(this))
      .start();
    for (var i = 0; i < 100; i++) this.force.tick();

    this.drawLinks(links);
    this.drawNodes(nodes);
  }

  drawLinks(links: any): void{
    this.linkSel = this.svg.selectAll(".link")
        .data(links, (d: any) => { return d.source.id + "-" + d.target.id; });
    this.linkSel.enter()
      .insert("line", ":first-child")  //to avoid overlap with nodes
      .attr("class", "link");
    this.linkSel.exit().remove();
  }

  drawNodes(nodes: any): void{
    this.nodeSel = this.svg.selectAll(".node")
      .data(nodes, (d: any) => d.id );

    var node = this.nodeSel.enter()
      .append("g")
      .attr("class", "node")
      .call(this.force.drag);

    node.append("circle")
      .attr("class", "circle");

    node.append("text")
      .attr("class", "text")
      .attr("dy", ".3em");

    this.nodeSel.select(".text")
      .style("font-size", (d: any) => { return (this.fontSize - d.depth) + "px"; })
      .text((d: any) => { return d.hasChar ? d.character : "?"; })
      .each((d: any) => {
        // TODO enable tooltip
        // $(this).tooltip({
        //   container: "body",
        //   trigger: "hover",
        //   title: d.typeDescription + " (" + d.typeFull + ")"
        // });
      });
    this.nodeSel.select(".circle")
      .attr("stroke", (d: any) => { return this.scale(d.type); })
      .attr("r", (d: any) => { return this.nodeRadius - d.depth; })
      .style("stroke-width", (d: any) => { return d.depth === 0 ? "2px" : "1.2px"; });

    this.nodeSel.exit()
      .transition()
      .duration(this.animationDelay)
      .style("opacity", 0.1)
      .remove();
  }

  tick(): void{
    if(!this.linkSel || !this.nodeSel) return;
    this.linkSel.attr("x1", (d: any) => { return d.source.x; })
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);
    this.nodeSel.attr("transform", (d: any) => { return "translate(" + d.x + "," + d.y + ")"; });
  }

  getDepth(data: DecompositionNode): number{
    if(!data.children || data.children.length === 0){
      return 1;
    }
    return Math.max.apply(null, data.children.map((c) => this.getDepth(c) )) + 1;
  }
}