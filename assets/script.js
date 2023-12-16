// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('animation-container').appendChild(renderer.domElement);

function onWindowResize() {
    //debugtest:
    console.log("Window resize event triggered");
    const container = document.getElementById('animation-container');
    const aspectRatio = 16 / 10; // Adjust as needed
    const height = container.clientWidth / aspectRatio;

    camera.aspect = container.clientWidth / height;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, height);
}

window.addEventListener('resize', onWindowResize);
onWindowResize(); // Initial size adjustment

//debugtests:
console.log("Container width:", container.clientWidth);


// Load your logo
const logoTexture = new THREE.TextureLoader().load('assets/images/urgentseas_white.png', () => {
    console.log("Logo Loaded Successfully");
}, undefined, (error) => {
    console.error("Error loading logo:", error);
});
const logoMaterial = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
const logoGeometry = new THREE.PlaneGeometry(5, 1);
const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
logoMesh.position.z = 1;
// logoMesh.position.y += 1;
logoMesh.scale.set(0.1, 0.1, 0.1);
scene.add(logoMesh);


logoTexture.minFilter = THREE.LinearFilter; // Helps with handling transparency

scene.background = new THREE.Color(0x000000); // Set to black

// Wave geometry with tighter grid
const geometry = new THREE.PlaneBufferGeometry(8, 8, 120, 120); // Increased segments for tighter grid
const material = new THREE.MeshBasicMaterial({ color: 0x123456, wireframe: true });
const wave = new THREE.Mesh(geometry, material);
wave.position.z = 0
scene.add(wave);


// Add the full-screen plane and shader
const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
const fullScreenMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5); // Center of the screen
            float radius = 0.125; // Radius of the visible area
            float edgeSoftness = 0.06; // Softness of the gradient edge

            float dist = distance(vUv, center);
            float alpha = smoothstep(radius, radius + edgeSoftness, dist);

            gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
    `
});
const fullScreenMesh = new THREE.Mesh(fullScreenGeometry, fullScreenMaterial);
fullScreenMesh.renderOrder = 999; // Render last
fullScreenMesh.position.z = -0.5; // Positioning the plane slightly in front of the camera
// fullScreenMesh.position.y += 1;
// console.log("Shader position after adjustment: ", fullScreenMesh.position.y);

fullScreenMaterial.transparent = true;

scene.add(fullScreenMesh);
renderer.autoClear = false;



// Camera position
camera.position.z = 2;

// Mouse position
let mouseX = 0;
let mouseY = 0;

// Update mouse position
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Wave animation and interaction with larger wave pattern
function animate() {
    requestAnimationFrame(animate);

    // Adjust wave based on cursor position
    const positionAttribute = geometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);

        // Wave pattern amplitude and mouse-reactive
        const waveX = 0.4 * Math.sin(x * 2 + Date.now() * 0.001 + mouseX * 5);
        const waveY = 0.2 * Math.sin(y * 3 + Date.now() * 0.0015 + mouseY * 5);
        // USE ONE ONLY ... non-responsive option:
        // const waveX = 0.4 * Math.sin(x * 2 + Date.now() * 0.001 * 1);
        // const waveY = 0.2 * Math.sin(y * 3 + Date.now() * 0.0015 * 1);

        positionAttribute.setZ(i, waveX + waveY);
    }
    positionAttribute.needsUpdate = true;

    renderer.render(scene, camera);
}

// Start the animation
animate();

