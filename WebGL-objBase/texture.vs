attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform sampler2D uSampler;

uniform float uHauteur;

varying vec2 texCoords;

void main(void) {
	texCoords = aTexCoords;
	vec4 col = texture2D(uSampler, texCoords);
	float red = col.r;
	vec3 modified = aVertexPosition;
	modified.z += red * uHauteur / 100.0;
	gl_Position = uPMatrix * uMVMatrix * vec4(modified, 1.0);
}
