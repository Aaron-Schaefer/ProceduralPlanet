'use strict';

// Global variables that are set and used
// across the application
let gl,
  program,
  points,
  bary,
  texture,
  indices;

// VAO stuff
var myVAO = null;
var myVertexBuffer = null;
var myBaryBuffer = null;
var myIndexBuffer = null;
var myTexBuffer = null;
  
// Other globals with default values;
var division1 = 3;
var division2 = 1;
var updateDisplay = true;
var anglesReset = [90.0, 0.0, 0.0];
var angles = [90.0, 0.0, 0.0];
var angleInc = 5.0;
var offset, offset2;
var length1;
var length2;
var length3;
var Tx = 0.0, Ty = 0.0;
var scale = 1.0;


// var cameraPosition = [-gridWidth / 8, 10, -gridDepth / 8];
// var target = [gridWidth / 2, -10, gridDepth / 2];
// var up = [0, 1, 0];
// var camera = m4.lookAt(cameraPosition, target, up);
// var view = m4.inverse(camera);

//Camera globals

// Shapes we can draw
var CUBE = 1;
var CYLINDER = 2;
var CONE = 3;
var SPHERE = 4;
var curShape = CUBE;

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  // Assign shader depending on the type of shader
  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  // Compile the shader using the supplied shader code
  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

// Create a program with the appropriate vertex and fragment shaders
function initProgram() {
  const vertexShader = getShader('vertex-shader');
  const fragmentShader = getShader('fragment-shader');

  // Create a program
  program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
  }

  // Use this program instance
  gl.useProgram(program);
  // We attach the location of these shader values to the program instance
  // for easy access later in the code
  program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
  // program.aNoise = gl.getAttribLocation(program, 'a_noise')
  program.aBary = gl.getAttribLocation(program, 'bary');
  program.uTheta = gl.getUniformLocation (program, 'theta');
  program.uTranslation = gl.getUniformLocation(program, 'translation');
  program.uColor = gl.getUniformLocation(program, 'a_color');
  program.aTex = gl.getAttribLocation(program, 'texture');
  program.uPlanet = gl.getUniformLocation(program, 'moon');
  program.uScale = gl.getUniformLocation(program, 'scale');
  program.uStars = gl.getUniformLocation(program, 'stars');

  texture = [];

}

// general call to make and bind a new object based on current
// settings..Basically a call to shape specfic calls in cgIshape.js
function createScene(recall) {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // clear your points and elements
    if (!recall) points = [];
    if (!recall) indices = [];
    if (!recall) bary = [];

    //stars
    gl.depthMask(false);
    if(!recall) {
      // makeSphere(0.5, 0.5, 0, 0.07, 50, 30, true);
      drawStars();
      offset = indices.length;
      length1 = indices.length;
    }
    let vao1 = gl.createVertexArray();
    bindWebGl(vao1, 0, 1)
    drawPoints(vao1, 0, length1);
    gl.depthMask(true);


    // Main Planet
    if (!recall) {
      makeSphere(0, 0, 0, 0.5, 100, 80, false);
      offset2 = indices.length;
      length2 = indices.length - offset;
    }
    let vao2 = gl.createVertexArray();
    bindWebGl(vao2, 0, 0)
    draw(vao2, offset * 2, length2);

    // Moon
    if (!recall) {
      makeSphere(0.8, 0.8, 0, 0.1, 50, 30, true);
      length3 = indices.length - offset2;

    }
    let vao3 = gl.createVertexArray();
    bindWebGl(vao3, 1, 0);
    draw(vao3, offset2 * 2, length3);
}

function createBackground() {

}

function bindWebGl(vao, isMoon, isStars) {

    //create and bind VAO
    // if (myVAO == null) myVAO = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    // create and bind vertex buffer
    if (myVertexBuffer == null) myVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, 4, gl.FLOAT, false, 0, 0);

    
    // create and bind bary buffer
    if (myBaryBuffer == null) myBaryBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myBaryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bary), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.aBary);
    gl.vertexAttribPointer(program.aBary, 3, gl.FLOAT, false, 0, 0);

    // create and bind noise texture array
    if(myTexBuffer == null) myTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(program.aTex);
    gl.vertexAttribPointer(program.aTex, 1, gl.FLOAT, false, 0, 0);
    
    // uniform values
    gl.uniform3fv(program.uTheta, new Float32Array(angles));
    gl.uniform1f(program.uPlanet, isMoon);
    gl.uniform1f(program.uStars, isStars);
    gl.uniform1f(program.uScale, scale);
    gl.uniform4f(program.uTranslation, Tx, Ty, 0.0, 0.0);
    
    // Setting up the IBO
    if (myIndexBuffer == null) myIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
    // indicate a redraw is required.
    updateDisplay = true;
}

// We call draw to render to our canvas
function draw(vao, offset, length) {

  // Bind the VAO
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);

  // Draw to the scene using triangle primitives
  gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, offset);

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

function drawPoints(vao, offset, length) {
    // Bind the VAO
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
  
    // Draw to the scene using triangle primitives
    gl.drawElements(gl.POINTS, length, gl.UNSIGNED_SHORT, offset);
  
    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  
}

// Entry point to our application
function init() {
  // Retrieve the canvas
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
    return null;
  }

  // deal with keypress
  window.addEventListener('keydown', gotKey ,false);

  // Retrieve a WebGL context
  gl = canvas.getContext('webgl2');
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);
    
  // some GL initialization
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  
  gl.cullFace(gl.BACK);
  gl.frontFace(gl.CCW);
  gl.clearColor(0.0,0.0,0.0,1.0)
  gl.depthFunc(gl.LEQUAL)
  gl.clearDepth(1.0)

  noise.seed(Math.random());

  // Read, compile, and link your shaders
  initProgram();
  
  // create and bind your current object
  createScene(false);
  
}
