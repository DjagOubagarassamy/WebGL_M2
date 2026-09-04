#version 300 es

in vec3 aVertexPosition;
in vec2 aTexCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform sampler2D uSampler;
uniform float uHauteur;
uniform vec2 uControlSize;
uniform vec2 uTextureSize;
uniform float uInterpolation;

out vec2 texCoords;

vec4 catmullRomWeights(float t) {
	float t2 = t * t;
	float t3 = t2 * t;
	return vec4(
		-0.5 * t3 +       t2 - 0.5 * t,
		 1.5 * t3 - 2.5 * t2 + 1.0,
		-1.5 * t3 + 2.0 * t2 + 0.5 * t,
		 0.5 * t3 - 0.5 * t2
	);
}

float sampleControl(vec2 index) {
	vec2 last = max(uControlSize - vec2(1.0), vec2(1.0));
	vec2 uv = clamp(index / last, 0.0, 1.0);
	float lod = log2(max(uTextureSize.x / max(uControlSize.x, 1.0), 1.0));
	return textureLod(uSampler, uv, lod).r;
}

float bicubicHeight(vec2 uv) {
	vec2 last = max(uControlSize - vec2(1.0), vec2(1.0));
	vec2 coord = uv * last;
	vec2 base = floor(coord);
	vec2 st = fract(coord);

	vec4 wx = catmullRomWeights(st.x);
	vec4 wy = catmullRomWeights(st.y);

	vec2 i00 = clamp(base + vec2(-1.0, -1.0), vec2(0.0), last);
	vec2 i10 = clamp(base + vec2( 0.0, -1.0), vec2(0.0), last);
	vec2 i20 = clamp(base + vec2( 1.0, -1.0), vec2(0.0), last);
	vec2 i30 = clamp(base + vec2( 2.0, -1.0), vec2(0.0), last);

	vec2 i01 = clamp(base + vec2(-1.0,  0.0), vec2(0.0), last);
	vec2 i11 = clamp(base + vec2( 0.0,  0.0), vec2(0.0), last);
	vec2 i21 = clamp(base + vec2( 1.0,  0.0), vec2(0.0), last);
	vec2 i31 = clamp(base + vec2( 2.0,  0.0), vec2(0.0), last);

	vec2 i02 = clamp(base + vec2(-1.0,  1.0), vec2(0.0), last);
	vec2 i12 = clamp(base + vec2( 0.0,  1.0), vec2(0.0), last);
	vec2 i22 = clamp(base + vec2( 1.0,  1.0), vec2(0.0), last);
	vec2 i32 = clamp(base + vec2( 2.0,  1.0), vec2(0.0), last);

	vec2 i03 = clamp(base + vec2(-1.0,  2.0), vec2(0.0), last);
	vec2 i13 = clamp(base + vec2( 0.0,  2.0), vec2(0.0), last);
	vec2 i23 = clamp(base + vec2( 1.0,  2.0), vec2(0.0), last);
	vec2 i33 = clamp(base + vec2( 2.0,  2.0), vec2(0.0), last);

	float row0 = dot(wx, vec4(sampleControl(i00), sampleControl(i10), sampleControl(i20), sampleControl(i30)));
	float row1 = dot(wx, vec4(sampleControl(i01), sampleControl(i11), sampleControl(i21), sampleControl(i31)));
	float row2 = dot(wx, vec4(sampleControl(i02), sampleControl(i12), sampleControl(i22), sampleControl(i32)));
	float row3 = dot(wx, vec4(sampleControl(i03), sampleControl(i13), sampleControl(i23), sampleControl(i33)));

	return dot(wy, vec4(row0, row1, row2, row3));
}

void main(void) {
	texCoords = aTexCoords;
	float red = texture(uSampler, texCoords).r;
	if (uInterpolation > 0.5) {
		red = bicubicHeight(texCoords);
	}
	vec3 modified = aVertexPosition;
	modified.z += red * uHauteur / 100.0;
	gl_Position = uPMatrix * uMVMatrix * vec4(modified, 1.0);
}
