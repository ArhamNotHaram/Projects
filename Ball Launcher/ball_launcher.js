    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Cannon base position (pivot where the nozzle attaches)
    const cannonX = 80;
    const cannonY = canvas.height - 60;

    // Physics
    const gravity = 9.8; // pixels/s^2 (kept simple & small on purpose)
    let aimAngleDeg = 45; // follows cursor for drawing ONLY

    // Projectile state (locked at launch)
    const projectile = {
      active: false,
      t: 0,
      x: cannonX,
      y: cannonY,
      vx: 0,
      vy: 0
    };

    // Track mouse for aiming
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // Angle in degrees: up is positive (screen y grows downward, so invert dy)
      aimAngleDeg = Math.atan2(cannonY - my, mx - cannonX) * 180 / Math.PI;
    });

    // Fire on Enter anywhere on the page
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") launchBall();
    });

    function launchBall() {
      const v = parseFloat(document.getElementById("velocity").value);
      if (!Number.isFinite(v) || v <= 0) return;

      // Lock launch parameters at this instant
      const rad = aimAngleDeg * Math.PI / 180;
      projectile.vx = v * Math.cos(rad);
      projectile.vy = v * Math.sin(rad);
      projectile.t = 0;
      projectile.x = cannonX;
      projectile.y = cannonY;
      projectile.active = true;
    }

    function drawCannon() {
      // Square base
      ctx.fillStyle = "gray";
      ctx.fillRect(cannonX - 25, cannonY, 50, 30);

      // Cylindrical nozzle (rotates to follow cursor)
      ctx.save();
      ctx.translate(cannonX, cannonY);
      ctx.rotate(-aimAngleDeg * Math.PI / 180);
      ctx.fillStyle = "black";
      ctx.fillRect(0, -7, 50, 14); // rectangle as a simple cylinder
      ctx.restore();
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "blue"; // blue cannonballs
      ctx.fill();
    }

    function updateBall(dt) {
      if (!projectile.active) return;

      projectile.t += dt;

      // Kinematics using LOCKED vx, vy at launch
      const t = projectile.t;
      projectile.x = cannonX + projectile.vx * t;
      projectile.y = cannonY - (projectile.vy * t - 0.5 * gravity * t * t);

      // Ground collision
      if (projectile.y >= cannonY) {
        projectile.y = cannonY;
        projectile.active = false;
      }
    }

    // Simple fixed timestep for stability
    const FIXED_DT = 0.05; // seconds
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCannon();
      drawBall();
      updateBall(FIXED_DT);
      requestAnimationFrame(loop);
    }
    loop();
