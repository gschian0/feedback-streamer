uniform float time;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec4 color = texture2D(uTexture, vUv);
	gl_FragColor = vec4(color);
}