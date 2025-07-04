
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 200);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
const ambient = new THREE.AmbientLight(0x202020);
scene.add(ambient);

// Camera setup
camera.position.set(0, 25, 55);
camera.lookAt(0, 0, 0);

// Planet data
const planetsData = [
    { name: 'Mercury', radius: 0.5, distance: 6, speed: 0.02, color: 0xa9a9a9 },
    { name: 'Venus', radius: 0.9, distance: 9, speed: 0.015, color: 0xffcc99 },
    { name: 'Earth', radius: 1, distance: 12, speed: 0.01, color: 0x3399ff },
    { name: 'Mars', radius: 0.8, distance: 15, speed: 0.008, color: 0xff5533 },
    { name: 'Jupiter', radius: 2, distance: 22, speed: 0.005, color: 0xffaa77 },
    { name: 'Saturn', radius: 1.8, distance: 28, speed: 0.004, color: 0xffcc00 },
    { name: 'Uranus', radius: 1.5, distance: 34, speed: 0.003, color: 0x66ffff },
    { name: 'Neptune', radius: 1.3, distance: 40, speed: 0.002, color: 0x3366ff }
];

// Sun with glow effect
const sunGeo = new THREE.SphereGeometry(3, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planets
const planetObjects = [];
planetsData.forEach(p => {
    const geo = new THREE.SphereGeometry(p.radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = p.distance;
    mesh.userData = { ...p };
    scene.add(mesh);
    planetObjects.push({ mesh, angle: 0, ...p });
});

// Orbit rings
planetObjects.forEach(p => {
    const ringGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
});

// Background stars
const starsGeo = new THREE.BufferGeometry();
const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
const stars = [];
for (let i = 0; i < 1200; i++) {
    stars.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
}
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
scene.add(new THREE.Points(starsGeo, starsMat));

// UI controls
const slidersDiv = document.getElementById('sliders');
planetObjects.forEach((planet, idx) => {
    const container = document.createElement('div');
    container.className = 'slider-container';
    container.innerHTML = `
        <label>${planet.name} Speed</label>
        <input type="range" min="0" max="0.05" step="0.001" value="${planet.speed}">
    `;
    slidersDiv.appendChild(container);
    container.querySelector('input').addEventListener('input', (e) => {
        planetObjects[idx].speed = parseFloat(e.target.value);
    });
});

// Pause/resume
let isPaused = false;
document.getElementById('pauseResume').onclick = () => {
    isPaused = !isPaused;
    pauseResume.textContent = isPaused ? 'Resume' : 'Pause';
};

// Day/Night toggle
let isNight = true;
document.getElementById('toggleMode').addEventListener('click', () => {
    isNight = !isNight;
    document.body.style.background = isNight
        ? 'radial-gradient(ellipse at center, #000011 0%, #000000 100%)'
        : 'radial-gradient(ellipse at center, #87CEEB 0%, #f0f8ff 100%)';

    ambient.intensity = isNight ? 0.2 : 0.6;
    sunLight.intensity = isNight ? 1.5 : 2.5;
});

// Planet hover + click info
const tooltip = document.getElementById('tooltip');
const info = document.getElementById('planetInfo');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetObjects.map(p => p.mesh));
    if (intersects.length > 0) {
        tooltip.style.display = 'block';
        tooltip.textContent = intersects[0].object.userData.name;
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
    } else {
        tooltip.style.display = 'none';
    }
});
window.addEventListener('click', (e) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetObjects.map(p => p.mesh));
    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        info.style.display = 'block';
        info.innerHTML = `<strong>${data.name}</strong><br>Speed: ${data.speed}<br>Distance: ${data.distance}`;
    }
});

// Animate
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    if (!isPaused) {
        const delta = clock.getDelta();
        planetObjects.forEach(p => {
            p.angle += p.speed * delta;
            p.mesh.position.x = p.distance * Math.cos(p.angle);
            p.mesh.position.z = p.distance * Math.sin(p.angle);
            p.mesh.rotation.y += 0.01;
        });
    }
    renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
