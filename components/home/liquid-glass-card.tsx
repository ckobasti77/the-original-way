"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const VERTEX_SHADER_SOURCE = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse; // x, y: mouse position in card coordinates
  uniform sampler2D iChannel0; // background frame player canvas texture
  uniform vec4 uCardRect; // x: left, y: top, z: width, w: height (screen pixels)
  uniform vec2 uViewport; // width, height of screen viewport
  uniform float uDarkenFactor;

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
    // 1. Screen-space coordinates for the background texture alignment
    float cardBottomOnScreen = uViewport.y - (uCardRect.y + uCardRect.w);
    vec2 screenCoord = vec2(uCardRect.x + fragCoord.x, cardBottomOnScreen + fragCoord.y);
    vec2 screenUV = screenCoord / uViewport;
    screenUV = clamp(screenUV, 0.0, 1.0);
    
    // 2. Local coordinates relative to card
    vec2 localUV = fragCoord / iResolution.xy;
    
    // Mouse coordinates relative to card
    vec2 localMouse = iMouse.xy / iResolution.xy;
    vec2 delta = localUV - localMouse;
    float aspect = iResolution.x / iResolution.y;
    float dist = length(delta * vec2(aspect, 1.0));
    
    // 3. Refraction distortion
    // Localized lens bulge at the mouse position
    float ripple = smoothstep(0.32, 0.0, dist);
    vec2 distortion = normalize(delta + 0.0001) * ripple * 0.014;
    
    // Global continuous liquid ripple wave
    vec2 wave = vec2(
      sin(localUV.y * 6.28 + iTime * 1.2) * 0.003,
      cos(localUV.x * 6.28 + iTime * 1.2) * 0.003
    );
    
    vec2 lensUV = screenUV - distortion - wave;
    lensUV = clamp(lensUV, 0.0, 1.0);
    
    // 4. Multi-sample blur across the entire card background
    vec4 blurredColor = vec4(0.0);
    float total = 0.0;
    const float SAMPLE_RANGE = 2.0;
    const float SAMPLE_OFFSET = 1.6;
    for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
      for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
        vec2 offset = vec2(x, y) * SAMPLE_OFFSET / uViewport;
        blurredColor += texture2D(iChannel0, lensUV + offset);
        total += 1.0;
      }
    }
    blurredColor /= total;
    
    // 5. Specular glossy highlight and rim lighting
    // Specular light at mouse pointer
    float specular = smoothstep(0.12, 0.0, dist) * 0.12;
    
    // Rim highlight on borders of the card
    float rimX = smoothstep(0.0, 0.03, localUV.x) * smoothstep(1.0, 0.97, localUV.x);
    float rimY = smoothstep(0.0, 0.03, localUV.y) * smoothstep(1.0, 0.97, localUV.y);
    float rim = 1.0 - (rimX * rimY);
    
    // Combine blurred background with specular hotspot and rim lighting
    vec3 darkenedColor = blurredColor.rgb * uDarkenFactor;
    vec4 lighting = clamp(vec4(darkenedColor, blurredColor.a) + vec4(specular * 0.8) + vec4(rim * 0.04), 0.0, 1.0);
    
    gl_FragColor = lighting;
  }
`;

type LiquidGlassCardProps = {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  darkenFactor?: number;
};

export function LiquidGlassCard({
  children,
  className = "",
  active = true,
  darkenFactor = 1.0,
}: LiquidGlassCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Global mouse coordinates relative to viewport [clientX, window.innerHeight - clientY]
  const mouseRef = useRef<[number, number]>([0, 0]);
  const mouseActiveRef = useRef<boolean>(false);
  const lastActiveTimeRef = useRef<number>(0);

  // Smooth tracking position
  const currentMouseXRef = useRef<number>(0);
  const currentMouseYRef = useRef<number>(0);

  const darkenFactorRef = useRef(darkenFactor);
  useEffect(() => {
    darkenFactorRef.current = darkenFactor;
  }, [darkenFactor]);

  // Cache refs to prevent redundant GPU texture uploads and eliminate flickering
  const lastUploadedFrameRef = useRef<string>("");
  const lastUploadedWidthRef = useRef<number>(0);
  const lastUploadedHeightRef = useRef<number>(0);
  const hasUploadedRef = useRef<boolean>(false);

  const [hasWebGL, setHasWebGL] = useState(false);

  // Initialize listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = [e.clientX, window.innerHeight - e.clientY];
      mouseActiveRef.current = true;
      lastActiveTimeRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = [touch.clientX, window.innerHeight - touch.clientY];
        mouseActiveRef.current = true;
        lastActiveTimeRef.current = performance.now();
      }
    };

    const handleTouchStart = () => {
      mouseActiveRef.current = true;
      lastActiveTimeRef.current = performance.now();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  // WebGL Render Loop
  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
      console.warn("WebGL not supported in LiquidGlassCard fallback active.");
      return;
    }
    setHasWebGL(true);

    // Helper to compile shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Setup buffer covering the clip space
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uniforms = {
      resolution: gl.getUniformLocation(program, "iResolution"),
      time: gl.getUniformLocation(program, "iTime"),
      mouse: gl.getUniformLocation(program, "iMouse"),
      texture: gl.getUniformLocation(program, "iChannel0"),
      cardRect: gl.getUniformLocation(program, "uCardRect"),
      viewport: gl.getUniformLocation(program, "uViewport"),
      darkenFactor: gl.getUniformLocation(program, "uDarkenFactor"),
    };

    // Setup background texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Initial sizing
    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const newWidth = Math.round(rect.width);
      const newHeight = Math.round(rect.height);
      if (newWidth > 0 && newHeight > 0 && (newWidth !== width || newHeight !== height)) {
        width = newWidth;
        height = newHeight;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    const startTime = performance.now();

    // Reset cache refs on new context creation
    hasUploadedRef.current = false;
    lastUploadedFrameRef.current = "";

    // Render loop
    const render = () => {
      const now = performance.now();
      const time = (now - startTime) / 1000;

      // Locate frame player canvas in the DOM
      const frameCanvas = document.getElementById("hero-frame-canvas") as HTMLCanvasElement | null;
      const rect = container.getBoundingClientRect();

      if (frameCanvas && width > 0 && height > 0) {
        // Calculate physics/positioning of the glass lens
        const timeSinceActive = now - lastActiveTimeRef.current;
        let activeFactor = 1.0;
        if (timeSinceActive > 1500) {
          activeFactor = Math.max(0.0, 1.0 - (timeSinceActive - 1500) / 1000);
        }

        // Circular floating path when mouse/touch is idle
        const orbitTime = time * 0.9;
        const radiusX = width * 0.16;
        const radiusY = height * 0.16;
        const orbitX = width / 2 + Math.cos(orbitTime) * radiusX;
        const orbitY = height / 2 + Math.sin(orbitTime * 0.8) * radiusY;

        let targetX = orbitX;
        let targetY = orbitY;

        if (activeFactor > 0.0) {
          const [mx, my] = mouseRef.current;
          const cardLeft = rect.left;
          const cardBottom = window.innerHeight - (rect.top + rect.height);
          const localMouseX = mx - cardLeft;
          const localMouseY = my - cardBottom;

          targetX = orbitX + (localMouseX - orbitX) * activeFactor;
          targetY = orbitY + (localMouseY - orbitY) * activeFactor;
        }

        // Ease to target position for organic lag/inertia
        currentMouseXRef.current += (targetX - currentMouseXRef.current) * 0.08;
        currentMouseYRef.current += (targetY - currentMouseYRef.current) * 0.08;

        // Render WebGL
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Upload frame player canvas content to GPU as texture ONLY when frame index or dimensions change
        const currentFrameStr = frameCanvas.getAttribute("data-frame") || "";
        const canvasWidth = frameCanvas.width;
        const canvasHeight = frameCanvas.height;

        const needsUpload =
          currentFrameStr !== lastUploadedFrameRef.current ||
          canvasWidth !== lastUploadedWidthRef.current ||
          canvasHeight !== lastUploadedHeightRef.current ||
          !hasUploadedRef.current;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (needsUpload) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frameCanvas);
          lastUploadedFrameRef.current = currentFrameStr;
          lastUploadedWidthRef.current = canvasWidth;
          lastUploadedHeightRef.current = canvasHeight;
          hasUploadedRef.current = true;
        }

        gl.uniform1i(uniforms.texture, 0);

        // Uniform values
        gl.uniform3f(uniforms.resolution, width, height, 1.0);
        gl.uniform1f(uniforms.time, time);
        gl.uniform1f(uniforms.darkenFactor, darkenFactorRef.current);
        gl.uniform4f(
          uniforms.mouse,
          currentMouseXRef.current,
          currentMouseYRef.current,
          0.0,
          0.0
        );
        gl.uniform4f(uniforms.cardRect, rect.left, rect.top, width, height);
        gl.uniform2f(uniforms.viewport, window.innerWidth, window.innerHeight);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [active]);

  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = containerRef.current;
    const inner = innerRef.current;
    if (!card || !inner) return;

    const maxTilt = 8;
    const maxParallax = 12;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const width = rect.width;
      const height = rect.height;

      const px = (x / width) - 0.5;
      const py = (y / height) - 0.5;

      const rx = -py * maxTilt;
      const ry = px * maxTilt;

      const tx = -px * maxParallax;
      const ty = -py * maxParallax;

      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1000,
        boxShadow: `${-px * 15}px ${-py * 15}px 40px rgba(var(--shadow-rgb), 0.22)`,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(inner, {
        x: tx,
        y: ty,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        boxShadow: "0 24px 50px rgba(var(--shadow-rgb), 0.1)",
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf([card, inner]);
    };
  }, []);

  const cardStyleClass = `relative overflow-hidden rounded-3xl border border-[var(--border-soft)] shadow-[0_24px_50px_rgba(var(--shadow-rgb),0.1)] ${
    hasWebGL 
      ? "bg-transparent" 
      : "bg-[var(--surface)] backdrop-blur-md"
  } ${className}`;

  return (
    <div 
      ref={containerRef} 
      className={cardStyleClass}
      style={{
        transition: "background-color 450ms ease, border-color 450ms ease",
        transformStyle: "preserve-3d",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none rounded-[inherit]"
        style={{ mixBlendMode: "normal" }}
      />
      {!hasWebGL && darkenFactor < 1.0 && (
        <div 
          className="absolute inset-0 -z-5 pointer-events-none rounded-[inherit]" 
          style={{
            backgroundColor: `rgba(0, 0, 0, ${1.0 - darkenFactor})`,
          }}
        />
      )}
      <div 
        ref={innerRef}
        className="relative z-10 w-full h-full flex flex-col justify-center items-center"
      >
        {children}
      </div>
    </div>
  );
}
