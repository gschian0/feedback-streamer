uniform float time;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

void main()	{
	//  vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec2 newUV = vUv; 
	float aspect = resolution.x / resolution.y;
	newUV.y *= aspect;
	vec4 disp = texture2D(uDisplacement, vUv);
	float theta = disp.r*2.*PI;
	vec2 dir = vec2(cos(theta), sin(theta));
	newUV = vUv + dir*disp.g*time;
	//newUV.x += sin(24.*newUV.y*PI +time)*0.01;
	//newUV.y += sin(2.*newUV.x*PI +time + cos(20.*newUV.x*PI +time))*newUV.x * 0.1;
	newUV = rotate(newUV, disp.b*time);
	vec4 color = texture2D(uTexture, newUV);
	vec4 prevDisp = disp - vec4(dir, 0.0, 0.0);
	prevDisp *= 20.;
	newUV *= .98;

	
	
	
	gl_FragColor = vec4(color-prevDisp*disp);
}