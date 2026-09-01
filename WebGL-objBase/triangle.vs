attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vColor;

void main(void) {
	vColor = aVertexColor;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
