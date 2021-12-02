import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import dat from "../node_modules/three/examples/jsm/libs/dat.gui.module";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls";
import brush from "../assets/ParticleSystem_64x.png"
import stripes from "../assets/stripes.jpeg";
export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.bufferScene = new THREE.Scene();
    this.mouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();
    this.currentWave = 0;
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x00000, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);
    this.textureLoader = new THREE.TextureLoader();
    this.stripesPattern = this.textureLoader.load(stripes);
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.baseTexture = new THREE.WebGLRenderTarget(
      this.width, this.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    })

    var frustumSize = this.height;
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    this.mouseEvents();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    let that = this; //eslint-disable-line
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  mouseEvents(){
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX - this.width / 2;
      this.mouse.y = this.height/2 - e.clientY;
    });
  }

  addObjects() {
    let that = this; //eslint-disable-line
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uDisplacement: {value: null },
        uTexture: { value: this.stripesPattern },

      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.max = 50;
  
    this.geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    this.geometryFullScreen = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
    this.meshGroup = new THREE.Group();

    for ( let i = 0; i < this.max; i++ ) {
    this.material2 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, 
      wireframe: false, 
      map: new THREE.TextureLoader().load(brush), 
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: false,
      visible: true});
      this.mesh = new THREE.Mesh(this.geometry, this.material2);
      this.mesh.position.set(this.mouse.x+ Math.random()*100, this.mouse.y*Math.random()*100, Math.random() * 500 - 250);
      this.mesh.rotation.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 - 250);
      this.mesh.scale.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      this.meshGroup.add(this.mesh);

    }
    
    this.scene.add(this.meshGroup);
    this.plane = new THREE.Mesh(this.geometryFullScreen, this.material);
    this.bufferScene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  setNewWave(x,y,index) {
    let m = this.meshGroup.children[index];
    m.visible = true;
    m.position.x = x;
    m.position.y = y;
    m.material.opacity = 1;
    m.scale.set(Math.random() * 10 - 1, Math.random() * 10 - 1, Math.random() * 10 - 1);
   // console.log('party')
    
  }
  
  trackMousePosition() {
    if(Math.abs(this.mouse.x - this.prevMouse.x) < 4 && Math.abs(this.mouse.y - this.prevMouse.y) < 4) {
     //do nothing
    }else {
      this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave);
      this.currentWave = (this.currentWave + 1)%this.max;
      console.log(this.currentWave);
    }
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.trackMousePosition();
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.bufferScene, this.camera);
    this.meshGroup.children.forEach(mesh => {
      mesh.rotation.z += 0.02;
      mesh.material.opacity *= 0.96;
      mesh.scale.x = 0.98*mesh.scale.x;
      mesh.scale.y = 0.98*mesh.scale.y;
      mesh.scale.z = 0.98*mesh.scale.z;
      //mesh.scale.set(Math.cos(this.time)*5*0.98.mesh.scale.x, Math.sin(this.time)*5*0.98.mesh.scale.y, Math.sin(-this.time)*5);
     // mesh.position.set(this.mouse.x, this.mouse.y, this.mesh.position.z);
    })
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
