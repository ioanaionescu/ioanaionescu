(function () {
  let scene,
  renderer,
  camera,
  model, 
  neck, 
  waist, 
  possibleAnims, 
  mixer,
  idle, 
  clock = new THREE.Clock(),  
  currentlyAnimating = false, 
  raycaster = new THREE.Raycaster(), 
  loaderAnim = document.getElementById('js-loader');

  init();

  function init() {

    const MODEL_PATH = 'https://www.ioanaionescu.ro/contact/res/model.glb';
    const canvas = document.querySelector('#c');
    const backgroundColor = 0x136a;

    // Init the scene
    scene = new THREE.Scene();
   
    // Init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;

    let stacy_txt = new THREE.TextureLoader().load('https://www.ioanaionescu.ro/contact/res/texture.jpg');
    stacy_txt.flipY = false;

    const stacy_mtl = new THREE.MeshPhongMaterial({
      map: stacy_txt,
      color: 0xffffff,
      skinning: true });



    var loader = new THREE.GLTFLoader();

    loader.load(
    MODEL_PATH,
    function (gltf) {
      model = gltf.scene;
      let fileAnimations = gltf.animations;

      model.traverse(o => {

        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.material = stacy_mtl;
        }
        // Reference the neck and waist bones
        if (o.isBone && o.name === 'mixamorigNeck') {
          neck = o;
        }
        if (o.isBone && o.name === 'mixamorigSpine') {
          waist = o;
        }
      });

      model.scale.set(7, 7, 7);
      model.position.y = -11;

      scene.add(model);


    },
    undefined, 
    function (error) {
      console.error(error);
    });


    // Add lights
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);


   
  var texture = new THREE.TextureLoader().load( 'https://www.ioanaionescu.ro/contact/res/bg.jpg' );
    
  var geometry = new THREE.PlaneGeometry(44, 33);
  var material = new THREE.MeshPhongMaterial({map: texture, color: 0xFFFFFF});
 // material.emissive.set(0x333333);
 
  material.transparent=true;
      
  var ldp = new THREE.Mesh(geometry, material);
  ldp.position.z=-6;
  ldp.position.y=-4;
  ldp.position.x=-1.6;
  scene.add(ldp);


  var texture = new THREE.TextureLoader().load( 'https://www.ioanaionescu.ro/contact/res/table-final.png' );
    
  var geometry = new THREE.PlaneGeometry(36, 27);
  var material = new THREE.MeshPhongMaterial({map: texture, color: 0xFFFFFF});
 // material.emissive.set(0x333333);
  material.shininess = 0;
  material.transparent=true;
      
  var ldp = new THREE.Mesh(geometry, material);
  ldp.position.z=3;
  ldp.position.y=-4;
  ldp.position.x=-1.6;
  scene.add(ldp);
  }


  function update() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  update();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  window.addEventListener('click', e => raycast(e));
  window.addEventListener('touchend', e => raycast(e, true));

  function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
      var object = intersects[0].object;

      if (object.name === 'stacy') {

        if (!currentlyAnimating) {
          currentlyAnimating = true;
          playOnClick();
        }
      }
    }
  }

  // Get a random animation, and play it 
  function playOnClick() {
    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
  }


  function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function () {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      currentlyAnimating = false;
    }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
  }

  document.addEventListener('mousemove', function (e) {
    var mousecoords = getMousePos(e);
    if (neck && waist) {

      moveJoint(mousecoords, neck, 50);
      moveJoint(mousecoords, waist, 30);
    }
  });

  function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
  }

  function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
    console.log(joint.rotation.x);
  }

  function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = xdiff / (w.x / 2) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = degreeLimit * xPercentage / 100 * -1;
    }

    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = xdiff / (w.x / 2) * 100;
      dx = degreeLimit * xPercentage / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = ydiff / (w.y / 2) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = degreeLimit * 0.5 * yPercentage / 100 * -1;
    }
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = ydiff / (w.y / 2) * 100;
      dy = degreeLimit * yPercentage / 100;
    }
    return { x: dx, y: dy };
  }

})();