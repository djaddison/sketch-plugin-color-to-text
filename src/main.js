/*
 *  Copyright 2018 David Addison
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import chroma from "chroma-js";

export function changeLayerName(context) {
  const document = context.document;
  const page = document.currentPage()

  context.selection.forEach(layer => {
    const selectedColor = layer.style().fills().firstObject().color();
    const color = sketchToChromaColor(selectedColor);
    layer.name = color.hex() + ' - ' + templateString(color.lch(), ['lightness', 'chroma', 'hue']);
  });
}

function createColorText(context, templateCallback, updateLayerName = false) {
  const document = context.document;
  const page = document.currentPage()

  context.selection.forEach(layer => {
    const selectedColor = layer.style().fills().firstObject().color();
    const color = sketchToChromaColor(selectedColor);

    // Update layer name
    if(updateLayerName) {
      layer.name = color.hex() + ' - ' + templateString(color.lch(), ['lightness', 'chroma', 'hue']);
    }

    // Create Text Layer
    var textLayer = MSTextLayer.new();
    textLayer.stringValue = templateCallback(color);
    textLayer.setFontPostscriptName('OpenSans-Light');
    textLayer.setFontSize(11);

    textLayer.name = layer.name() + ' - label';
    textLayer.frame().midX = layer.frame().midX();
    textLayer.frame().midY = layer.frame().midY();
    page.addLayers([textLayer]);;
  });
}

function sketchToChromaColor(sketchColor, mode = 'gl') {
  var r = sketchColor.red();
  var g = sketchColor.green();
  var b = sketchColor.blue();
  return chroma(r, g, b, mode);
}

function round(input){
  return Math.round(input * 1000) / 1000;
}

function templateString(color, labels = []){
  let values = color.map(v => {
    return (isNaN(round(v)) || v == '') ? v : round(v);
  });

  return values.map( (v,i) => {
    let label = typeof labels[i] === 'undefined' ? '' : `${labels[i]}: `;
    return label + v;
  }).join('\n');
}

export function templateCSS(context) {
  createColorText(context, (color) => {
    let values = [
      color.hex(),
      color.css(),
      color.css('hsl')
    ];
    return templateString(values);
  });
}

export function templateHex(context) {
  createColorText(context, (color) => {
    return color.hex();
  });
}

export function templateHexUpperCase(context) {
  createColorText(context, (color) => {
    return color.hex().toUpperCase();
  });
}

export function templateRGB(context) {
  createColorText(context, (color) => {
    return templateString(color.rgb(), ['red', 'green', 'blue']);
  });
}

export function templateLCH(context) {
  createColorText(context, (color) => {
    return templateString(color.lch(), ['lightness', 'chroma', 'hue']);
  });
}

export function templateLAB(context) {
  createColorText(context, (color) => {
    return templateString(color.lab(), ['lightness', 'a', 'b']);
  });
}

export function templateHSL(context) {
  createColorText(context, (color) => {
    return templateString(color.hsl(), ['hue', 'saturation', 'lightness']);
  });
}

export function templateHSV(context) {
  createColorText(context, (color) => {
    return templateString(color.hsv(), ['hue', 'saturation', 'value']);
  });
}

export function changeLayerName_CSS_LCH(context) {
  changeLayerName(context);
  createColorText(context, (color) => {
    let values = [
      color.hex(),
      color.css(),
      color.css('hsl'),
      '',
      ...color.lch()
    ];
    let labels = [
      undefined,
      undefined,
      undefined,
      undefined,
      'lightness',
      'chroma',
      'hue'
    ];
    return templateString(values, labels);
  });
}

export function templateCSS_LCH_LAB_SS(context) {
  createColorText(context, (color) => {
    let values = [
      color.hex(),
      color.css(),
      color.css('hsl'),
      '',
      ...color.lch(),
      ...color.lab().slice(1,3),
      color.hsl()[1],
      color.hsv()[1]
    ];
    let labels = [
      undefined,
      undefined,
      undefined,
      undefined,
      'lightness',
      'chroma',
      'hue',
      'a',
      'b',
      'hsl saturation',
      'hsv saturation'
    ];
    return templateString(values, labels);
  });
}
