// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var distCENTER;
// =====================================================

var OBJ1 = null;
var PLANE = null;
var TRIANGLE = null;

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================

class objmesh {
  // --------------------------------------------
  constructor(objFname) {
    this.objName = objFname;
    this.shaderName = "plane";
    this.loaded = -1;
    this.shader = null;
    this.mesh = null;

    loadObjFile(this);
    loadShaders(this);

    this.texture = initTexture("bebe.jpg");
  }

  // --------------------------------------------
  setShadersParams() {
    gl.useProgram(this.shader);

    this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
    gl.enableVertexAttribArray(this.shader.vAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
    gl.vertexAttribPointer(
      this.shader.vAttrib,
      this.mesh.vertexBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.nAttrib = gl.getAttribLocation(this.shader, "aVertexNormal");
    gl.enableVertexAttribArray(this.shader.nAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
    gl.vertexAttribPointer(
      this.shader.nAttrib,
      this.mesh.vertexBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.rMatrixUniform = gl.getUniformLocation(this.shader, "uRMatrix");
    this.shader.mvMatrixUniform = gl.getUniformLocation(
      this.shader,
      "uMVMatrix",
    );
    this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
  }

  // --------------------------------------------
  setMatrixUniforms() {
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, distCENTER);
    mat4.multiply(mvMatrix, rotMatrix);
    gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
  }

  // --------------------------------------------
  draw() {
    if (this.shader && this.loaded == 4 && this.mesh != null) {
      this.setShadersParams();
      this.setMatrixUniforms();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        this.mesh.indexBuffer.numItems,
        gl.UNSIGNED_INT,
        0,
      );
    }
  }
}

// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

class plane {
  // --------------------------------------------
  constructor() {
    this.shaderName = "plane";
    this.loaded = -1;
    this.shader = null;
    this.initAll();
  }

  // --------------------------------------------
  initAll() {
    var size = 1.0;
    var vertices = [
      -size,
      -size,
      0.1,
      size,
      -size,
      0.1,
      size,
      size,
      0.1,
      -size,
      size,
      0.1,
    ];

    var texcoords = [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0];

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vBuffer.itemSize = 3;
    this.vBuffer.numItems = 4;

    this.tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    this.tBuffer.itemSize = 2;
    this.tBuffer.numItems = 4;

    loadShaders(this);

    this.texture1 = initTexture("bebe.jpg");
    this.texture2 = initTexture("bebe-2.jpg");
    this.currentTexture = this.texture1;
  }

  // --------------------------------------------
  updateTexture() {
    if (gui.texture_serie.value === 1) {
      this.currentTexture = this.texture1;
    } else if (gui.texture_serie.value === 2) {
      this.currentTexture = this.texture2;
    }
  }

  // --------------------------------------------
  setShadersParams() {
    gl.useProgram(this.shader);

    this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
    gl.enableVertexAttribArray(this.shader.vAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(
      this.shader.vAttrib,
      this.vBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
    gl.enableVertexAttribArray(this.shader.tAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.vertexAttribPointer(
      this.shader.tAttrib,
      this.tBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
    this.shader.mvMatrixUniform = gl.getUniformLocation(
      this.shader,
      "uMVMatrix",
    );

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, distCENTER);
    mat4.multiply(mvMatrix, rotMatrix);

    gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

    this.shader.samplerUniform = gl.getUniformLocation(this.shader, "uSampler");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);
    gl.uniform1i(this.shader.samplerUniform, 0);
  }

  // --------------------------------------------
  draw() {
    if (this.shader && this.loaded == 4) {
      this.setShadersParams();

      gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
      gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
    }
  }
}

// =====================================================
// TRIANGLE 3D
// =====================================================

class triangle {
  // --------------------------------------------
  constructor() {
    this.shaderName = "triangle";
    this.loaded = -1;
    this.shader = null;
    this.initAll();
  }

  // --------------------------------------------
  initAll() {
    var vertices = [-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.5, 0.0];

    var colors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vBuffer.itemSize = 3;
    this.vBuffer.numItems = 3;

    this.cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    this.cBuffer.itemSize = 3;
    this.cBuffer.numItems = 3;

    loadShaders(this);
  }

  // --------------------------------------------
  setShadersParams() {
    gl.useProgram(this.shader);

    this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
    gl.enableVertexAttribArray(this.shader.vAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(
      this.shader.vAttrib,
      this.vBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.cAttrib = gl.getAttribLocation(this.shader, "aVertexColor");
    gl.enableVertexAttribArray(this.shader.cAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.vertexAttribPointer(
      this.shader.cAttrib,
      this.cBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0,
    );

    this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
    this.shader.mvMatrixUniform = gl.getUniformLocation(
      this.shader,
      "uMVMatrix",
    );

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, distCENTER);
    mat4.multiply(mvMatrix, rotMatrix);

    gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
  }

  // --------------------------------------------
  draw() {
    if (this.shader && this.loaded == 4) {
      this.setShadersParams();
      gl.drawArrays(gl.TRIANGLES, 0, this.vBuffer.numItems);
    }
  }
}

// =====================================================
// Classe Texture, lecture fichier image
// =====================================================

class texture {
  // --------------------------------------------
  constructor() {
    this.texture1 = initTexture("bebe.jpg");
    this.texture2 = initTexture("bebe-2.jpg");
	  this.currentTexture = this.texture1;
	  this.shaderName = "plane";
	this.loaded = -1;
	  this.shader = null;

	  this.divx = 100;
	  this.divy = 100;
	  this.initAll();
  }
	
	initAll() {
    let vertices = [];
    let indices = [];

    // 1. Génération de la grille de points (Coordonnées U, V)
    for (let y = 0; y <= this.divy; y++) {
      for (let x = 0; x <= this.divx; x++) {
        let u = x / this.divx;
        let v = y / this.divy;
        vertices.push(u, v); 
      }
	}
		
		for (let y = 0; y < this.divy; y++) {
			for (let x = 0; x < this.divx; x++) {
				p0 
	}

  updateTexture() {
    if (gui.texture_serie.value === 1) {
      this.currentTexture = this.texture1;
    } else if (gui.texture_serie.value === 2) {
      this.currentTexture = this.texture2;
    }
  }
}

// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================

// =====================================================
function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  } catch (e) {}
  if (!gl) {
    console.log("Could not initialise WebGL");
  }
}

// =====================================================
loadObjFile = function (OBJ3D) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var tmpMesh = new OBJ.Mesh(xhttp.responseText);
      OBJ.initMeshBuffers(gl, tmpMesh);
      OBJ3D.mesh = tmpMesh;
    }
  };

  xhttp.open("GET", OBJ3D.objName, true);
  xhttp.overrideMimeType("text/plain");
  xhttp.send();
};

// =====================================================
function loadShaders(Obj3D) {
  loadShaderText(Obj3D, ".vs");
  loadShaderText(Obj3D, ".fs");
}

// =====================================================
function loadShaderText(Obj3D, ext) {
  // lecture asynchrone...
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      if (ext == ".vs") {
        Obj3D.vsTxt = xhttp.responseText;
        Obj3D.loaded++;
      }
      if (ext == ".fs") {
        Obj3D.fsTxt = xhttp.responseText;
        Obj3D.loaded++;
      }
      if (Obj3D.loaded == 2) {
        Obj3D.loaded++;
        compileShaders(Obj3D);
        Obj3D.loaded++;
      }
    }
  };

  Obj3D.loaded = 0;
  xhttp.open("GET", Obj3D.shaderName + ext, true);
  xhttp.overrideMimeType("text/plain");
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D) {
  Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
  gl.compileShader(Obj3D.vshader);
  if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
    console.log("Vertex Shader FAILED... " + Obj3D.shaderName + ".vs");
    console.log(gl.getShaderInfoLog(Obj3D.vshader));
  }

  Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
  gl.compileShader(Obj3D.fshader);
  if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
    console.log("Fragment Shader FAILED... " + Obj3D.shaderName + ".fs");
    console.log(gl.getShaderInfoLog(Obj3D.fshader));
  }

  Obj3D.shader = gl.createProgram();
  gl.attachShader(Obj3D.shader, Obj3D.vshader);
  gl.attachShader(Obj3D.shader, Obj3D.fshader);
  gl.linkProgram(Obj3D.shader);
  if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
    console.log("Could not initialise shaders");
    console.log(gl.getShaderInfoLog(Obj3D.shader));
  }
}

// =====================================================
function initTexture(imgName) {
  var texImage = new Image();
  texImage.src = imgName;

  var texture = gl.createTexture();
  texture.image = texImage;

  texImage.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      texture.image,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  return texture;
}

// =====================================================
function webGLStart() {
  var canvas = document.getElementById("WebGL-test");

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;
  canvas.onwheel = handleMouseWheel;

  initGL(canvas);
  initGui();

  mat4.perspective(
    45,
    gl.viewportWidth / gl.viewportHeight,
    0.1,
    100.0,
    pMatrix,
  );
  mat4.identity(rotMatrix);
  mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
  mat4.rotate(rotMatrix, rotY, [0, 0, 1]);

  distCENTER = vec3.create([0, -0.2, -3]);

  PLANE = new plane();
  TRIANGLE = new triangle();
  OBJ1 = new objmesh("bunny.obj");

  //OBJ2 = new objmesh('porsche.obj');

  tick();
}

// =====================================================
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (gui.plane_checkbox.value) {
    PLANE.draw();
  }
  if (gui.triangle_checkbox.value) {
    TRIANGLE.draw();
  }

  if (gui.bunny_checkbox.value) {
    OBJ1.draw();
  }
  //OBJ2.draw();
}
