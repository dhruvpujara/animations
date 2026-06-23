(function () {
    const canvas = document.getElementById('shader-canvas');

    function syncSize() {
        const w = canvas.clientWidth || 1280;
        const h = canvas.clientHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
    }

    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (uv - 0.5) * u_resolution.xy / min(u_resolution.x, u_resolution.y);
    
    float t = u_time * 0.8;
    vec2 pulse_uv = p;
    pulse_uv.x += sin(p.y * 10.0 + t) * 0.05;
    pulse_uv.y += cos(p.x * 10.0 + t) * 0.05;
    
    float dist = length(pulse_uv);
    float glow = 0.02 / abs(dist - 0.3 * sin(t * 0.5) - 0.4);
    
    float ring = smoothstep(0.02, 0.0, abs(length(p) - 0.25 - 0.1 * sin(t * 2.0)));
    
    vec2 m = (u_mouse / u_resolution - 0.5) * u_resolution.xy / min(u_resolution.x, u_resolution.y);
    float m_dist = length(p - m);
    float m_glow = 0.1 / (m_dist + 0.1);

    vec3 neonCyan = vec3(0.0, 1.0, 1.0);
    vec3 neonMagenta = vec3(1.0, 0.0, 1.0);
    vec3 base = vec3(0.02, 0.02, 0.05);
    
    vec3 color = base;
    color += mix(neonCyan, neonMagenta, sin(t) * 0.5 + 0.5) * glow;
    color += neonCyan * ring * 0.5;
    color += neonCyan * m_glow * 0.3;
    
    color *= 0.9 + 0.1 * sin(v_texCoord.y * 800.0);
    
    gl_FragColor = vec4(color, 1.0);
}`;

    function createShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
            const nx = (event.clientX - rect.left) / rect.width;
            const ny = 1.0 - (event.clientY - rect.top) / rect.height;
            mouse.x = nx * canvas.width;
            mouse.y = ny * canvas.height;
        }
    });

    function render(t) {
        if (typeof ResizeObserver === 'undefined') syncSize();
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render(0);
})();